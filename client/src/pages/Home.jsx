import { Link } from 'react-router-dom'
import LandingNav from '../components/landing/LandingNav'
import demandPredictionImg from '../assets/demandPrediction.png'
import spendImg from '../assets/menu/spend.png'
import trackingImg from '../assets/menu/tracking.png'
import nutritionImg from '../assets/menu/neutritionTrack.png'

const FEATURES = [
  { icon: '📍', title: 'Real-time Tracking', desc: 'Know exactly where your order is. Track your meal by the minute, from kitchen to your hands.', img: trackingImg, imgFit: 'contain' },
  { icon: '🔮', title: 'Demand Prediction', desc: 'Our smart system predicts peak hours to help you plan your order helping you avoid the campus rush.', img: demandPredictionImg, imgFit: 'contain' },
  { icon: '💳', title: 'Spending Insights', desc: 'Know exactly how your food habits, with monthly and weekly spending summaries and personalised tips.', img: spendImg, imgFit: 'contain' },
  { icon: '🥗', title: 'Nutrition Tracking', desc: 'Confident nutrition tracking to you can make decisions about your meals that meet your fitness goals.', img: nutritionImg, imgFit: 'contain' },
]

const HOW = [
  { icon: '🍽️', step: 'Browse', desc: 'Explore our curated campus menu, filter by diet, and find exactly what you crave.' },
  { icon: '📲', step: 'Order',  desc: 'Pay instantly with your student digital wallet. A click is all your time.' },
  { icon: '🎯', step: 'Pick up', desc: 'Head to the designated "QLess Zone", skip your order is ready, to pick up.' },
]

export default function Home() {
  return (
    <div className="bg-brand-bg min-h-screen">
      <LandingNav />

      {/* ── Hero ── */}
      <section className="max-w-[1100px] mx-auto px-8 py-20 flex flex-col md:flex-row items-center gap-[60px]">
        <div className="flex-1 animate-fade-up">
          <span className="inline-block bg-brand-green-light text-brand-green border border-brand-green-border rounded-full px-3.5 py-1 text-xs font-bold mb-5 tracking-wider">🌿 AI Powered</span>
          <h1 className="font-serif-display text-4xl sm:text-5xl lg:text-[58px] leading-[1.1] text-brand-text mb-5">
            Skip the Queue,<br />
            <em className="text-brand-green not-italic">Enjoy the Food</em>
          </h1>
          <p className="text-sm sm:text-base text-brand-text-muted leading-[1.7] max-w-[440px] mb-8">
            QLess transforms your campus food experience with smart demand-forecasting and seamless mobile ordering. Save time, spend it savouring your body and soul.
          </p>
          <div className="flex gap-3.5 items-center">
            <Link to="/register" className="bg-brand-green text-white px-7 py-3 rounded-full font-bold text-sm transition-all hover:bg-brand-green-dark hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(26,107,58,0.3)]">Get Started</Link>
            <a href="#how" className="bg-white text-brand-text px-7 py-3 rounded-full font-semibold text-sm border border-brand-border transition-colors hover:border-brand-green hover:text-brand-green">Learn More</a>
          </div>
        </div>
        <div className="flex-1 relative h-[380px] w-full max-w-[500px] md:max-w-none">
          <div className="absolute right-0 top-0 w-[260px] h-[260px] rounded-[20px] overflow-hidden shadow-lg animate-float">
            <img src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&q=80" alt="food" className="w-full h-full object-cover" />
          </div>
          <div className="absolute left-5 bottom-0 w-[220px] h-[180px] rounded-2xl overflow-hidden shadow-md">
            <img src="https://images.unsplash.com/photo-1567521464027-f127ff144326?w=500&q=80" alt="campus" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-20">
        <div className="max-w-[1100px] mx-auto px-8">
          <p className="text-2xl font-bold text-brand-text font-serif-display mb-1.5">Smart Campus Integration</p>
          <p className="text-sm text-brand-text-muted mb-10">Leveraging data in more ways than you can even imagine.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {FEATURES.map((f, i) => (
              <div key={i} className="bg-white border border-brand-border rounded-xl p-7 transition-shadow hover:shadow-md">
                <span className="text-2xl display-block mb-3">{f.icon}</span>
                <h3 className="font-serif-display text-lg text-brand-text mb-2">{f.title}</h3>
                <p className="text-xs text-brand-text-muted leading-relaxed">{f.desc}</p>
                {f.img && <img src={f.img} className={`w-full h-[140px] rounded-lg mt-4 ${f.imgFit === 'contain' ? 'object-contain object-center' : 'object-cover'}`} alt={f.title} />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how" className="bg-white py-20">
        <div className="max-w-[1100px] mx-auto px-8">
          <p className="text-2xl font-bold text-brand-text font-serif-display mb-10">How It Works</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW.map((h, i) => (
              <div key={i} className="text-center">
                <div className="w-[60px] h-[60px] rounded-full bg-brand-green-light border border-brand-green-border flex items-center justify-center text-2xl mx-auto mb-4">
                  {h.icon}
                </div>
                <h3 className="font-serif-display text-lg text-brand-text mb-2">{h.step}</h3>
                <p className="text-xs text-brand-text-muted leading-relaxed">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="px-8 pb-20">
        <div className="max-w-[1100px] mx-auto bg-brand-green rounded-[24px] py-[60px] px-8 text-center">
          <h2 className="font-serif-display text-3xl sm:text-4xl text-white mb-2.5">Start ordering smarter today</h2>
          <p className="text-sm text-white/75 mb-7">Join 40,000 students reclaiming their Lunch break with QLess.</p>
          <Link to="/register" className="bg-white text-brand-green px-8 py-3.5 rounded-full font-bold text-sm inline-block transition-all hover:bg-white/95 hover:-translate-y-0.5 hover:shadow-lg">Get Started</Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-brand-text p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="font-serif-display text-xl text-white">QLess</p>
        <p className="text-xs text-white/45">© {new Date().getFullYear()} QLess. All rights reserved.</p>
        <div className="flex gap-5">
          <a href="#" className="text-xs text-white/55 transition-colors hover:text-white">Privacy</a>
          <a href="#" className="text-xs text-white/55 transition-colors hover:text-white">Terms</a>
          <a href="#" className="text-xs text-white/55 transition-colors hover:text-white">Contact</a>
        </div>
      </footer>
    </div>
  )
}
