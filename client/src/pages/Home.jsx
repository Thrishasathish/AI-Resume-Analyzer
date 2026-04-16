import { Link } from 'react-router-dom'
import { ArrowRight, Zap, Target, TrendingUp, Shield } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const features = [
  { icon: Zap, title: 'Dual ATS Scoring', desc: 'Get both an ATS compatibility score AND a role-fit score — two metrics that matter.' },
  { icon: Target, title: 'Role-Based Analysis', desc: 'Pick your target role. Our engine scores your resume against 15+ job profiles with weighted keywords.' },
  { icon: TrendingUp, title: 'AI Suggestions', desc: 'GPT-powered tips tailored to your role — not generic advice. Know exactly what to fix.' },
  { icon: Shield, title: 'Keyword Gap View', desc: 'See exactly which must-have keywords for your role are missing from your resume.' },
]

export default function Home() {
  const { isAuth } = useAuth()

  return (
    <div className="max-w-5xl mx-auto px-4 pt-20 pb-32">
      {/* Hero */}
      <div className="text-center mb-20 animate-fade-up">
        <div className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-sm text-brand-300 mb-8">
          <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-pulse-slow" />
          AI-powered · Role-aware · Free to start
        </div>

        <h1 className="text-5xl sm:text-6xl font-semibold text-white leading-tight mb-6">
          Know exactly why your<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-400">
            resume gets rejected
          </span>
        </h1>

        <p className="text-lg text-white/50 max-w-xl mx-auto mb-10 leading-relaxed">
          Upload your resume, pick your target role, and get an ATS score + role fit score
          with AI-powered suggestions — specific to <em>your</em> role.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Link to={isAuth ? '/upload' : '/register'} className="btn-primary flex items-center gap-2 text-base px-6 py-3">
            Analyze My Resume
            <ArrowRight size={16} />
          </Link>
          {!isAuth && (
            <Link to="/login" className="btn-ghost text-base px-6 py-3">
              Sign in
            </Link>
          )}
        </div>
      </div>

      {/* Mock score preview */}
      <div className="glass rounded-3xl p-8 mb-20 animate-stagger-2">
        <div className="flex flex-col sm:flex-row items-center gap-8">
          <div className="flex gap-6">
            {/* ATS Score ring */}
            <div className="text-center">
              <div
                className="score-ring w-24 h-24 flex items-center justify-center mb-2"
                style={{ '--ring-color': '#6058e0', '--pct': 78 }}
              >
                <div className="w-16 h-16 bg-[#0f0e17] rounded-full flex flex-col items-center justify-center">
                  <span className="text-xl font-semibold text-white">78</span>
                </div>
              </div>
              <p className="text-xs text-white/40 font-medium uppercase tracking-wider">ATS Score</p>
            </div>
            {/* Role Fit ring */}
            <div className="text-center">
              <div
                className="score-ring w-24 h-24 flex items-center justify-center mb-2"
                style={{ '--ring-color': '#BA7517', '--pct': 61 }}
              >
                <div className="w-16 h-16 bg-[#0f0e17] rounded-full flex flex-col items-center justify-center">
                  <span className="text-xl font-semibold text-white">61</span>
                </div>
              </div>
              <p className="text-xs text-white/40 font-medium uppercase tracking-wider">Role Fit</p>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm text-white/60">Target role:</span>
              <span className="glass-light text-brand-300 text-sm px-3 py-1 rounded-full">💻 Software Engineer</span>
            </div>
            <div className="space-y-2">
              {[['Keyword match', 82], ['Section completeness', 75], ['Format & parse', 90], ['Role-specific fit', 61]].map(([label, val]) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-xs text-white/40 w-36">{label}</span>
                  <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${val}%` }} />
                  </div>
                  <span className="text-xs text-white/50 w-8 text-right">{val}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1">
            <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Missing for this role</p>
            <div className="flex flex-wrap gap-1.5">
              {['TypeScript', 'Docker', 'CI/CD', 'Jest', 'AWS'].map(kw => (
                <span key={kw} className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-1 rounded-full">{kw}</span>
              ))}
              {['React', 'Node.js', 'Git'].map(kw => (
                <span key={kw} className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2.5 py-1 rounded-full">{kw}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="grid sm:grid-cols-2 gap-4">
        {features.map(({ icon: Icon, title, desc }, i) => (
          <div key={title} className={`card animate-stagger-${i + 2}`}>
            <div className="w-10 h-10 bg-brand-600/20 rounded-xl flex items-center justify-center mb-4">
              <Icon size={18} className="text-brand-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">{title}</h3>
            <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
