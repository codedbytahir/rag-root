import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-[#10b981] mb-4">404</h1>
        <p className="text-xl text-gray-400 mb-8">Page not found</p>
        <Link
          href="/"
          className="px-6 py-3 bg-[#10b981] text-black font-bold rounded-lg hover:bg-[#059669] transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
