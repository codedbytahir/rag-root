'use client';

import Image from 'next/image';
import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    // GLASS HEADER: Hardcoded colors matching your HTML exactly
    // bg-[#0f1515] with 85% opacity + backdrop-blur
    <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-[#0f1515]/85 backdrop-blur-[12px]">
      <div className="flex justify-center w-full">
        <div className="flex max-w-[1280px] w-full px-4 sm:px-10 py-4 items-center justify-between">

          {/* LOGO SECTION */}
          <Link href="/" className="flex items-center gap-3 cursor-pointer group">
            <div style={{ width: '32px', height: '32px', position: 'relative', overflow: 'hidden', borderRadius: '50%' }}>
              <Image
                src="https://file.garden/aQTok757O1Vcuyyw/ragroot%20logo.jfif"
                alt="RAG ROOT Logo"
                fill
                style={{ objectFit: 'cover', objectPosition: 'center' }}
              />
            </div>
            <h2 className="text-white text-lg font-bold tracking-tight font-sans">RAG ROOT</h2>
          </Link>

          {/* DESKTOP LINKS */}
          <div className="hidden md:flex flex-1 justify-center gap-8">
            <Link href="#features" className="text-gray-300 hover:text-[#39E079] transition-colors text-sm font-medium font-sans">Features</Link>
            <Link href="#use-cases" className="text-gray-300 hover:text-[#39E079] transition-colors text-sm font-medium font-sans">Use Cases</Link>
            <Link href="#pricing" className="text-gray-300 hover:text-[#39E079] transition-colors text-sm font-medium font-sans">Pricing</Link>
            <Link href="/dashboard/docs" className="text-gray-300 hover:text-[#39E079] transition-colors text-sm font-medium font-sans">Docs</Link>
          </div>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-4">
            <Link 
              href="/login"
              className="hidden sm:block text-sm font-medium text-gray-300 hover:text-white transition-colors font-sans"
            >
              Log in
            </Link>

            {/* CTA BUTTON */}
            {/* bg-[#39E079] -> hover:bg-[#0bcbcb] */}
            {/* Shadow: rgba(13,242,242,0.3) */}
            <Link href="/login" className="flex cursor-pointer items-center justify-center rounded-lg h-9 px-5 bg-[#39E079] hover:bg-[#0bcbcb] text-[#111818] text-sm font-bold transition-all shadow-[0_0_15px_rgba(13,242,242,0.3)] hover:shadow-[0_0_25px_rgba(13,242,242,0.5)] font-sans">
              Get Started
            </Link>

            {/* MOBILE TOGGLE */}
            <button 
              className="md:hidden text-gray-300 hover:text-white" 
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>

        </div>
      </div>

      {/* MOBILE MENU */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-[#0f1515] border-b border-white/5 p-6 flex flex-col gap-4 shadow-2xl">
           <Link href="#features" onClick={() => setIsOpen(false)} className="text-gray-300 text-lg font-sans hover:text-[#39E079]">Features</Link>
           <Link href="#use-cases" onClick={() => setIsOpen(false)} className="text-gray-300 text-lg font-sans hover:text-[#39E079]">Use Cases</Link>
           <Link href="#pricing" onClick={() => setIsOpen(false)} className="text-gray-300 text-lg font-sans hover:text-[#39E079]">Pricing</Link>
           <Link href="/dashboard/docs" onClick={() => setIsOpen(false)} className="text-gray-300 text-lg font-sans hover:text-[#39E079]">Documentation</Link>
           <div className="h-px bg-white/10 my-2"></div>
           <Link href="/login" onClick={() => setIsOpen(false)} className="text-gray-300 text-lg font-sans hover:text-[#39E079]">Log in</Link>
        </div>
      )}
    </nav>
  );
}