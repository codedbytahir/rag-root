import { createClient } from '@supabase/supabase-js';
import { chunkText } from './chunker';
import { embedBatch } from './embedder';
import { updateFileStatus } from '@/lib/db/queries/documents';
import { logger, createLogger } from '@/lib/logger';
import type { IngestionResult, ChunkingConfig } from './types';
import type { Brain } from '@/lib/db/schema';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

/**
 * Process document ingestion: download, parse, chunk, embed, and store.
 */
export async function processIngestion(params: {
  file_id: string;
  file_path: string;
  brain_id: string;
  file_name: string;
  user_id: string;
  brain?: Brain;
  chunkingConfig?: Partial<ChunkingConfig>;
}): Promise<IngestionResult> {
  const { file_id, file_path, brain_id, file_name, user_id, brain, chunkingConfig } = params;
  const log = createLogger({ fileId: file_id, brainId: brain_id });

  log.info({ fileName: file_name }, 'Starting ingestion');

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Update status to processing
  await updateFileStatus(file_id, 'processing');

  const tmpFilePath = path.join(os.tmpdir(), `${file_id}_${Date.now()}`);

  try {
    // 1. Download file from storage
    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from('docs')
      .download(file_path);

    if (downloadError || !fileData) {
      throw new Error(`Storage download failed: ${downloadError?.message}`);
    }

    const buffer = Buffer.from(await fileData.arrayBuffer());
    await fs.writeFile(tmpFilePath, buffer);

    // 2. Parse document based on file type
    const text = await parseDocument(tmpFilePath, file_name);

    if (!text || text.trim().length === 0) {
      throw new Error('Document parsing produced zero text content');
    }

    // 3. Chunk the text
    const chunks = chunkText(text, chunkingConfig);
    log.info({ chunkCount: chunks.length, textLength: text.length }, 'Text chunked');

    // 4. Embed all chunks
    const embeddingProvider = brain?.embedding_provider || 'google';
    const embeddingModel = brain?.embedding_model || 'text-embedding-004';
    
    const texts = chunks.map(c => c.content);
    const embeddings = await embedBatch(texts, embeddingProvider, embeddingModel);

    // 5. Store in document_sections
    const sections = chunks.map((chunk, i) => ({
      document_id: file_id,
      brain_id,
      content: chunk.content,
      embedding: embeddings[i] ? `[${embeddings[i].join(',')}]` : null,
      metadata: {
        file_id,
        file_name,
        chunk_index: chunk.metadata.chunk_index,
        page_label: chunk.metadata.start_char
          ? `char ${chunk.metadata.start_char}-${chunk.metadata.end_char}`
          : undefined,
      },
      token_count: Math.ceil(chunk.content.length / 4),
      enabled: true,
    }));

    // Insert in batches of 50
    const batchSize = 50;
    for (let i = 0; i < sections.length; i += batchSize) {
      const batch = sections.slice(i, i + batchSize);
      const { error: insertError } = await supabaseAdmin
        .from('document_sections')
        .insert(batch);

      if (insertError) {
        log.error({ error: insertError.message, batchIndex: i }, 'Failed to insert batch');
        throw new Error(`Failed to insert document sections: ${insertError.message}`);
      }
    }

    // 6. Update file status to ready
    await updateFileStatus(file_id, 'ready');

    log.info({ chunkCount: chunks.length }, 'Ingestion complete');
    return { success: true, chunkCount: chunks.length };
  } catch (error) {
    log.error({ error: (error as Error).message }, 'Ingestion failed');
    await updateFileStatus(file_id, 'error', (error as Error).message);
    return { success: false, chunkCount: 0, error: (error as Error).message };
  } finally {
    try {
      await fs.unlink(tmpFilePath);
    } catch {
      // Ignore cleanup errors
    }
  }
}

/**
 * Parse a document file into plain text based on its extension.
 */
async function parseDocument(filePath: string, fileName: string): Promise<string> {
  const ext = path.extname(fileName).toLowerCase();

  switch (ext) {
    case '.pdf':
      return parsePDF(filePath);
    case '.txt':
    case '.md':
      return fs.readFile(filePath, 'utf-8');
    case '.csv':
      return parseCSV(filePath);
    case '.docx':
      return parseDocx(filePath);
    case '.html':
      return parseHTML(filePath);
    default:
      // Try reading as plain text
      return fs.readFile(filePath, 'utf-8');
  }
}

async function parsePDF(filePath: string): Promise<string> {
  try {
    const { PDFReader } = await import('@llamaindex/readers/pdf');
    const reader = new PDFReader();
    const docs = await reader.loadData(filePath);
    return docs.map(d => d.text).join('\n\n');
  } catch (error) {
    logger.error({ error: (error as Error).message }, 'PDF parsing failed');
    throw new Error(`PDF parsing failed: ${(error as Error).message}`);
  }
}

async function parseCSV(filePath: string): Promise<string> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    // Simple CSV parsing: convert to formatted text
    const lines = content.split('\n');
    if (lines.length === 0) return content;
    
    const headers = lines[0].split(',');
    const rows = lines.slice(1).map(line => {
      const values = line.split(',');
      return headers.map((h, i) => `${h.trim()}: ${values[i]?.trim() || ''}`).join(', ');
    });
    
    return rows.join('\n');
  } catch (error) {
    logger.error({ error: (error as Error).message }, 'CSV parsing failed');
    throw new Error(`CSV parsing failed: ${(error as Error).message}`);
  }
}

async function parseDocx(filePath: string): Promise<string> {
  try {
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch (error) {
    logger.error({ error: (error as Error).message }, 'DOCX parsing failed');
    throw new Error(`DOCX parsing failed: ${(error as Error).message}`);
  }
}

async function parseHTML(filePath: string): Promise<string> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const cheerio = await import('cheerio');
    const $ = cheerio.load(content);
    // Remove scripts and styles
    $('script, style').remove();
    return $('body').text().replace(/\s+/g, ' ').trim();
  } catch (error) {
    logger.error({ error: (error as Error).message }, 'HTML parsing failed');
    throw new Error(`HTML parsing failed: ${(error as Error).message}`);
  }
}
