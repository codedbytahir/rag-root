import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-12 bg-[#0f1515]">
      <div className="flex justify-center">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 max-w-[1280px] w-full px-4 sm:px-10">

          {/* Logo */}
          <div className="flex items-center gap-2">
            <div style={{ width: '24px', height: '24px', position: 'relative', overflow: 'hidden', borderRadius: '50%' }}>
              <Image
                src="https://file.garden/aQTok757O1Vcuyyw/ragroot%20logo.jfif"
                alt="RAG ROOT Logo"
                fill
                style={{ objectFit: 'cover', objectPosition: 'center' }}
              />
            </div>
            <span className="text-gray-500 font-semibold text-sm">RAG ROOT</span>
          </div>

          {/* Links */}
          <div className="flex gap-8 text-sm text-gray-500">
            <Link href="/dashboard/docs" className="hover:text-[#39E079] transition-colors">Documentation</Link>
            <Link href="/dashboard/docs" className="hover:text-[#39E079] transition-colors">API Reference</Link>
            <Link href="#features" className="hover:text-[#39E079] transition-colors">Features</Link>
          </div>

          {/* Copyright */}
          <div className="text-gray-600 text-xs">
            © {new Date().getFullYear()} RAG ROOT. All rights reserved.
          </div>

        </div>
      </div>
    </footer>
  );
}