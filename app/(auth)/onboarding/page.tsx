import { completeOnboardingAction } from '@/app/actions/onboarding'
import { BRAND } from '@/lib/data'
import { ArrowRight } from 'lucide-react'

export default function OnboardingPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 font-sans p-6 selection:bg-emerald-500/30">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden">
        
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-32 bg-emerald-500/10 blur-[60px] pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-8">
            <div
              className="flex items-center justify-center w-8 h-8 rounded-lg shadow-sm"
              style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L4 6v12l8 4 8-4V6L12 2z" fill="white" />
                <path d="M12 2v18M4 6l8 4 8-4" stroke="white" strokeWidth="1.5" strokeOpacity="0.5" />
              </svg>
            </div>
            <span className="font-bold text-gray-900 tracking-tight">{BRAND.name}</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome aboard!</h1>
          <p className="text-sm text-gray-500 mb-8">
            Let's set up your first trading account. You can add more later.
          </p>

          <form action={completeOnboardingAction} className="flex flex-col gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 tracking-wide uppercase" htmlFor="accountName">
                Account Name
              </label>
              <input
                id="accountName"
                name="accountName"
                type="text"
                required
                placeholder="e.g. Apex 50k, Personal Cash"
                className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm placeholder:text-gray-400 shadow-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 tracking-wide uppercase" htmlFor="startingBalance">
                Starting Balance ($)
              </label>
              <input
                id="startingBalance"
                name="startingBalance"
                type="number"
                step="0.01"
                required
                placeholder="50000"
                className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm placeholder:text-gray-400 shadow-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 tracking-wide uppercase" htmlFor="tradingStyle">
                Primary Trading Style
              </label>
              <select
                id="tradingStyle"
                name="tradingStyle"
                required
                className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm shadow-sm"
              >
                <option value="Day Trading">Day Trading</option>
                <option value="Swing Trading">Swing Trading</option>
                <option value="Scalping">Scalping</option>
                <option value="Position Trading">Position Trading</option>
              </select>
            </div>

            <button
              type="submit"
              className="mt-4 w-full h-11 rounded-xl text-sm font-semibold text-white shadow-lg flex items-center justify-center gap-2 hover:-translate-y-[1px] transition-all duration-200"
              style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}
            >
              Complete Setup <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
