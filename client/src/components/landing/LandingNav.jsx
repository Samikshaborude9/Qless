import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function LandingNav() {
  return (
    <nav className="sticky top-0 z-50 bg-brand-bg/92 backdrop-blur-md border-b border-brand-border">
      <div className="max-w-[1100px] mx-auto px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 font-serif-display text-2xl text-brand-green font-normal">
          <div className="w-9 h-9 bg-gradient-to-br from-brand-green to-brand-green-mid rounded-xl flex items-center justify-center text-white text-lg font-bold font-serif-display">Q</div>
          <span>QLess</span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-8">
          <a href="#features" className="text-sm text-brand-text-muted font-medium transition-colors hover:text-brand-green">Features</a>
          <a href="#how" className="text-sm text-brand-text-muted font-medium transition-colors hover:text-brand-green">How it Works</a>
          <Link to="/login" className="text-sm text-brand-green font-semibold transition-colors hover:text-brand-green-dark">Login</Link>
          <Link to="/register" className="bg-brand-green text-white px-5 py-2.5 rounded-full font-semibold text-sm transition-all hover:bg-brand-green-dark hover:-translate-y-0.5">Get Started</Link>
        </div>
      </div>
    </nav>
  )
}
