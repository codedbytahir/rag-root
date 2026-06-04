import pino from 'pino';

const isDev = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

export const logger = pino({
  level: isTest ? 'silent' : (isDev ? 'debug' : 'info'),
  transport: isDev
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined,
  base: { service: 'rag-root' },
  formatters: {
    level: (label) => ({ level: label }),
  },
});

/**
 * Create a child logger with additional context.
 * Usage: const log = createLogger({ brainId, userId });
 *        log.info('Chat request received');
 */
export function createLogger(context: Record<string, unknown>) {
  return logger.child(context);
}
