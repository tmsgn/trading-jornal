import { login, signup } from './actions'
import { BRAND } from '@/lib/data'
import { Activity, ShieldCheck, Zap } from 'lucide-react'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <div className="min-h-screen w-full flex bg-white font-sans selection:bg-emerald-500/30">
      
      {/* Left Column: Form (Light & Clean) */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 sm:p-12 xl:p-24 relative z-10">
        
        {/* Mobile Logo Header */}
        <div className="lg:hidden absolute top-8 left-8 flex items-center gap-2">
           <div
              className="flex items-center justify-center w-8 h-8 rounded-lg shadow-sm"
              style={{ background: "linear-gradient(135deg, #10b981 0%, #34d399 100%)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L4 6v12l8 4 8-4V6L12 2z" fill="white" fillOpacity="0.9" />
              </svg>
            </div>
            <span className="font-bold text-gray-900 tracking-tight">{BRAND.name}</span>
        </div>

        <div className="w-full max-w-[420px] mx-auto">
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
              Welcome back
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              Enter your details to access your trading analytics.
            </p>
          </div>

          <form className="flex flex-col gap-5">
            <div className="flex gap-4">
              <div className="flex-1 space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 tracking-wide uppercase" htmlFor="firstName">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="John"
                  className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm shadow-sm"
                />
                <p className="text-[10px] text-gray-400 mt-1 italic font-medium">Required for sign up</p>
              </div>
              <div className="flex-1 space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 tracking-wide uppercase" htmlFor="lastName">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Doe"
                  className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 tracking-wide uppercase" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@company.com"
                className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm shadow-sm"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 tracking-wide uppercase flex justify-between" htmlFor="password">
                <span>Password</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm shadow-sm"
              />
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-50/80 border border-red-100 text-red-600 text-xs font-medium flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <div className="flex flex-col gap-3.5 mt-2">
              <button
                formAction={login}
                className="w-full h-11 rounded-xl text-sm font-semibold text-white shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)] hover:-translate-y-[1px] transition-all duration-200"
                style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}
              >
                Sign In
              </button>
              
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-gray-100"></div>
                <span className="flex-shrink-0 mx-4 text-[11px] font-medium text-gray-400 uppercase tracking-wider">or</span>
                <div className="flex-grow border-t border-gray-100"></div>
              </div>

              <button
                formAction={signup}
                className="w-full h-11 rounded-xl text-sm font-semibold text-gray-700 bg-white border border-gray-200 shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
              >
                Create new account
              </button>
            </div>
          </form>
          
          <p className="mt-10 text-center text-xs text-gray-400 font-medium">
            By signing in, you agree to our <a href="#" className="text-gray-600 hover:text-emerald-600 underline decoration-gray-300 underline-offset-2 transition-colors">Terms of Service</a> and <a href="#" className="text-gray-600 hover:text-emerald-600 underline decoration-gray-300 underline-offset-2 transition-colors">Privacy Policy</a>.
          </p>
        </div>
      </div>

      {/* Right Column: Visual Showcase (Light & Premium) */}
      <div className="hidden lg:flex w-1/2 relative bg-gray-50 overflow-hidden flex-col justify-between p-12 xl:p-24 border-l border-gray-100">
        {/* Dynamic Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-emerald-500/10 blur-[120px]"></div>
          <div className="absolute top-[40%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[100px]"></div>
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(#000000 1px, transparent 1px), linear-gradient(90deg, #000000 1px, transparent 1px)", backgroundSize: "32px 32px" }}></div>
        </div>

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl shadow-sm border border-emerald-500/20"
            style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L4 6v12l8 4 8-4V6L12 2z" fill="white" />
              <path d="M12 2v18M4 6l8 4 8-4" stroke="white" strokeWidth="1.5" strokeOpacity="0.5" />
            </svg>
          </div>
          <span className="text-2xl font-bold text-gray-900 tracking-tight">{BRAND.name}</span>
        </div>

        {/* Center Graphic / Metric Highlights */}
        <div className="relative z-10 flex flex-col gap-6 mt-16">
          <div className="space-y-4">
            <h2 className="text-4xl xl:text-5xl font-bold text-gray-900 leading-[1.1] tracking-tight">
              Elevate your trading edge.
            </h2>
            <p className="text-lg text-gray-500 max-w-md font-medium leading-relaxed">
              Institutional-grade analytics, dynamic playbooks, and AI insights built for the modern trader.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-8">
             <div className="bg-white border border-gray-100 shadow-sm p-5 rounded-2xl flex flex-col gap-3 transform transition hover:-translate-y-1 duration-300">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <Activity size={18} />
                </div>
                <div>
                  <h3 className="text-gray-900 font-semibold text-sm">Deep Analytics</h3>
                  <p className="text-gray-500 text-xs mt-1">Track win rates, P&L, and setups precisely.</p>
                </div>
             </div>
             <div className="bg-white border border-gray-100 shadow-sm p-5 rounded-2xl flex flex-col gap-3 transform transition hover:-translate-y-1 duration-300">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                  <Zap size={18} />
                </div>
                <div>
                  <h3 className="text-gray-900 font-semibold text-sm">AI Insights</h3>
                  <p className="text-gray-500 text-xs mt-1">Discover hidden patterns in your history.</p>
                </div>
             </div>
          </div>
        </div>

        {/* Testimonial */}
        <div className="relative z-10 mt-16 pt-10 border-t border-gray-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full border-2 border-white bg-emerald-500 flex items-center justify-center text-[10px] font-bold text-white">JS</div>
              <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-500 flex items-center justify-center text-[10px] font-bold text-white">MK</div>
              <div className="w-8 h-8 rounded-full border-2 border-white bg-purple-500 flex items-center justify-center text-[10px] font-bold text-white">AR</div>
            </div>
            <div className="text-xs text-gray-500 font-medium">Joined by 10,000+ top traders</div>
          </div>
          <p className="text-gray-700 text-sm font-medium leading-relaxed italic">
            "ApexTrade completely changed how I review my tape. The data granularity is unmatched, and the UI is incredibly snappy."
          </p>
        </div>

      </div>
    </div>
  )
}
