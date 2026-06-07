"use client";

import React from 'react'
import Link from 'next/link'
import { BRAND } from '@/lib/data'
import { Activity, Zap, LineChart, Target, Layers, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fafcff] font-sans overflow-x-hidden selection:bg-emerald-500/30">
      
      {/* Navbar */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="flex items-center justify-center w-8 h-8 rounded-lg shadow-sm"
              style={{ background: "linear-gradient(135deg, #10b981 0%, #34d399 100%)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L4 6v12l8 4 8-4V6L12 2z" fill="white" />
                <path d="M12 2v18M4 6l8 4 8-4" stroke="white" strokeWidth="1.5" strokeOpacity="0.5" />
              </svg>
            </div>
            <span className="font-bold text-gray-900 tracking-tight text-lg">{BRAND.name}</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">
              Sign In
            </Link>
            <Link 
              href="/login" 
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all"
              style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6">
        {/* Abstract Background Blurs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] opacity-30 pointer-events-none -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-[128px] animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-[128px] animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-[128px] animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            ApexTrade 2.0 is live
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 tracking-tight mb-8 leading-[1.1]"
          >
            Stop guessing.<br />
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #10b981 0%, #3b82f6 100%)" }}>
              Start optimizing.
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg sm:text-xl text-gray-500 mb-10 max-w-2xl mx-auto font-medium leading-relaxed"
          >
            The world's most advanced trading journal. Deep analytics, automatic AI insights, and playbook tracking built for elite traders.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link 
              href="/login" 
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/40 hover:-translate-y-1 transition-all"
              style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}
            >
              Get Started for Free <ArrowRight size={18} />
            </Link>
            <Link 
              href="#features" 
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-semibold text-gray-700 bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-all"
            >
              View Features
            </Link>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-20 relative mx-auto max-w-5xl"
          >
            <div className="rounded-2xl border border-gray-200/50 bg-white p-4 shadow-2xl backdrop-blur-3xl overflow-hidden transform transition-all hover:scale-[1.01] duration-500 h-[400px] flex gap-4">
              {/* CSS Mockup Dashboard */}
              <div className="w-64 bg-gray-50 rounded-xl border border-gray-100 hidden md:flex flex-col gap-2 p-4">
                <div className="w-full h-8 bg-gray-200 rounded-md animate-pulse mb-4"></div>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-full h-6 bg-gray-100 rounded-md animate-pulse"></div>
                ))}
              </div>
              <div className="flex-1 flex flex-col gap-4">
                <div className="w-full h-12 bg-gray-50 rounded-xl border border-gray-100 flex items-center px-4">
                  <div className="w-1/3 h-4 bg-gray-200 rounded-md animate-pulse"></div>
                </div>
                <div className="flex gap-4">
                  {[1, 2, 3].map((i) => (
                    <motion.div 
                      key={i} 
                      className="flex-1 h-24 bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 rounded-xl p-4 flex flex-col justify-between"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.8 + (i * 0.1) }}
                    >
                      <div className="w-1/2 h-3 bg-emerald-200 rounded animate-pulse"></div>
                      <div className="w-3/4 h-6 bg-emerald-300 rounded animate-pulse"></div>
                    </motion.div>
                  ))}
                </div>
                <div className="flex-1 bg-white border border-gray-100 rounded-xl shadow-sm p-4 flex items-end gap-2 overflow-hidden">
                  {/* Chart bars */}
                  {[10, 30, 20, 50, 40, 70, 60, 90, 80, 100].map((h, i) => (
                    <motion.div 
                      key={i} 
                      className="flex-1 bg-emerald-500 rounded-t-sm"
                      initial={{ height: "0%" }}
                      animate={{ height: `${h}%` }}
                      transition={{ duration: 1, delay: 1 + (i * 0.05), ease: "easeOut" }}
                    ></motion.div>
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute -z-10 inset-0 bg-gradient-to-t from-[#fafcff] via-transparent to-transparent pointer-events-none"></div>
          </motion.div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section id="features" className="py-24 bg-white border-t border-gray-100 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight mb-4">Everything you need to find your edge.</h2>
            <p className="text-gray-500 font-medium">Built by traders, for traders. No fluff, just actionable data.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <motion.div 
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              viewport={{ once: true }}
              className="md:col-span-2 bg-gray-50 rounded-3xl p-8 border border-gray-100 hover:shadow-lg transition-all duration-300 relative overflow-hidden group"
            >
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-emerald-500 mb-6">
                  <LineChart size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Deep P&L Analytics</h3>
                <p className="text-gray-500 font-medium max-w-sm">Track your cumulative P&L, daily net, and win rates with granular filtering by date, setup, and side.</p>
              </div>
              {/* Decorative Element */}
              <div className="absolute right-0 bottom-0 w-64 h-64 bg-emerald-500/5 rounded-tl-full -z-0 group-hover:scale-110 transition-transform duration-500"></div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div 
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              viewport={{ once: true }}
              className="bg-gray-50 rounded-3xl p-8 border border-gray-100 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-blue-500 mb-6">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">AI Insights</h3>
              <p className="text-gray-500 font-medium">Automatic pattern recognition to spot your best and worst habits instantly.</p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div 
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              viewport={{ once: true }}
              className="bg-gray-50 rounded-3xl p-8 border border-gray-100 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-purple-500 mb-6">
                <Layers size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Playbook Tracking</h3>
              <p className="text-gray-500 font-medium">Tag your trades by strategy (e.g. Breakout, VWAP Rejection) to see what actually works.</p>
            </motion.div>

            {/* Feature 4 */}
            <motion.div 
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              viewport={{ once: true }}
              className="md:col-span-2 bg-gray-50 rounded-3xl p-8 border border-gray-200 hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
            >
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-200 flex items-center justify-center text-emerald-500 mb-6">
                  <Target size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{BRAND.name} Score</h3>
                <p className="text-gray-500 font-medium max-w-sm">Our proprietary algorithm analyzes your consistency, risk-to-reward, and execution to give you a definitive rating of your trading performance.</p>
              </div>
              {/* Decorative Element */}
              <div className="absolute right-0 bottom-0 w-64 h-64 bg-emerald-500/10 rounded-tl-full -z-0 group-hover:scale-110 transition-transform duration-500"></div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-emerald-500 flex items-center justify-center">
               <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L4 6v12l8 4 8-4V6L12 2z" fill="white" />
              </svg>
            </div>
            <span className="font-bold text-gray-900">{BRAND.name}</span>
          </div>
          <p className="text-sm font-medium text-gray-400">© {new Date().getFullYear()} {BRAND.name} Inc. All rights reserved.</p>
        </div>
      </footer>

    </div>
  )
}
