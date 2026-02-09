import { Check, Lock, ShieldCheck } from 'lucide-react';

export default function Pricing() {
  return (
    <section className="py-24 bg-[#0c1212] relative" id="pricing">
      <div className="flex justify-center">
        <div className="flex flex-col max-w-[1280px] w-full px-4 sm:px-10">
          
          {/* Header */}
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-white text-3xl sm:text-4xl font-bold tracking-tight">Flexible Pricing</h2>
            <p className="text-gray-400">Scale your intelligence as your data grows.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            
            {/* === STARTER PLAN === */}
            <div className="bg-white/[0.03] backdrop-blur-sm p-8 rounded-2xl flex flex-col gap-6 border border-white/5 hover:border-white/20 transition-all">
              <div>
                <h3 className="text-xl font-semibold text-white">Starter</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">$49</span>
                  <span className="text-gray-500">/mo</span>
                </div>
                <p className="mt-2 text-sm text-gray-400">Perfect for individual analysts.</p>
              </div>
              <div className="h-px w-full bg-white/5"></div>
              <ul className="flex flex-col gap-3 text-sm text-gray-300">
                <li className="flex items-center gap-3"><Check size={16} className="text-[#39E079]" /> 1 Brain</li>
                <li className="flex items-center gap-3"><Check size={16} className="text-[#39E079]" /> Public Link Only</li>
                <li className="flex items-center gap-3"><Check size={16} className="text-[#39E079]" /> 500MB Data Storage</li>
                <li className="flex items-center gap-3"><Check size={16} className="text-[#39E079]" /> Basic PDF Support</li>
              </ul>
              <button className="mt-auto w-full py-3 rounded-lg border border-white/20 hover:bg-white/5 text-white font-medium transition-colors">
                Start Free Trial
              </button>
            </div>

            {/* === PRO PLAN (Highlighted) === */}
            <div className="bg-[#39E079]/5 backdrop-blur-sm p-8 rounded-2xl flex flex-col gap-6 border border-[#39E079]/50 relative shadow-[0_0_30px_-10px_rgba(57,224,121,0.15)] transform md:-translate-y-4">
              {/* Badge */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#39E079] text-[#111818] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                Most Popular
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white">Pro</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">$199</span>
                  <span className="text-gray-500">/mo</span>
                </div>
                <p className="mt-2 text-sm text-gray-400">For growing teams requiring power.</p>
              </div>
              <div className="h-px w-full bg-white/10"></div>
              <ul className="flex flex-col gap-3 text-sm text-white">
                <li className="flex items-center gap-3"><Check size={16} className="text-[#39E079]" /> Unlimited Brains</li>
                <li className="flex items-center gap-3"><Check size={16} className="text-[#39E079]" /> API Key Access</li>
                <li className="flex items-center gap-3"><Check size={16} className="text-[#39E079]" /> Multimodal (X-ray, Blueprint)</li>
                <li className="flex items-center gap-3"><Check size={16} className="text-[#39E079]" /> 10GB Data Storage</li>
                <li className="flex items-center gap-3"><Check size={16} className="text-[#39E079]" /> Priority Processing</li>
              </ul>
              <button className="mt-auto w-full py-3 rounded-lg bg-[#39E079] hover:bg-[#0bcbcb] text-[#111818] font-bold shadow-lg shadow-[#39E079]/20 transition-all">
                Get Started
              </button>
            </div>

            {/* === ENTERPRISE PLAN === */}
            <div className="bg-white/[0.03] backdrop-blur-sm p-8 rounded-2xl flex flex-col gap-6 border border-white/5 hover:border-white/20 transition-all">
              <div>
                <h3 className="text-xl font-semibold text-white">Enterprise</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">Custom</span>
                </div>
                <p className="mt-2 text-sm text-gray-400">Security & control for large orgs.</p>
              </div>
              <div className="h-px w-full bg-white/5"></div>
              <ul className="flex flex-col gap-3 text-sm text-gray-300">
                <li className="flex items-center gap-3"><Lock size={16} className="text-[#39E079]" /> Dedicated Supabase Instance</li>
                <li className="flex items-center gap-3"><ShieldCheck size={16} className="text-[#39E079]" /> HIPAA & SOC2 Compliance</li>
                <li className="flex items-center gap-3"><Check size={16} className="text-[#39E079]" /> 24/7 Dedicated Support</li>
                <li className="flex items-center gap-3"><Check size={16} className="text-[#39E079]" /> Custom SSA & SLA</li>
              </ul>
              <button className="mt-auto w-full py-3 rounded-lg border border-white/20 hover:bg-white/5 text-white font-medium transition-colors">
                Contact Sales
              </button>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}