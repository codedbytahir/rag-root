import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-12 bg-[#0f1515]">
      <div className="flex justify-center">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 max-w-[1280px] w-full px-4 sm:px-10">
          
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 text-gray-600">
                {/* Reusing the SVG Logo but in grayscale/muted */}
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 9V5 M12 15V19 M9 12H5 M15 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="12" cy="4" r="2" />
                    <circle cx="12" cy="20" r="2" />
                    <circle cx="4" cy="12" r="2" />
                    <circle cx="20" cy="12" r="2" />
                </svg>
            </div>
            <span className="text-gray-500 font-semibold text-sm">RAG ROOT</span>
          </div>

          {/* Links */}
          <div className="flex gap-8 text-sm text-gray-500">
            <Link href="/dashboard/docs" className="hover:text-[#39E079] transition-colors">Documentation</Link>
            <Link href="/dashboard/docs" className="hover:text-[#39E079] transition-colors">API Reference</Link>
            <Link href="/#features" className="hover:text-[#39E079] transition-colors">Features</Link>
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