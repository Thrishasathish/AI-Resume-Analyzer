import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../utils/api'
import ScoreRing from '../components/ScoreCard'
import { ArrowLeft, CheckCircle, AlertCircle, XCircle, Loader2, Sparkles, Copy, Check } from 'lucide-react'

const TYPE_CONFIG = {
  critical: { icon: XCircle, cls: 'text-red-400', bg: 'bg-red-500/8 border-red-500/15', label: 'Critical' },
  warning:  { icon: AlertCircle, cls: 'text-amber-400', bg: 'bg-amber-500/8 border-amber-500/15', label: 'Improve' },
  good:     { icon: CheckCircle, cls: 'text-green-400', bg: 'bg-green-500/8 border-green-500/15', label: 'Good' },
}

function BarRow({ label, value }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-white/40 w-36 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-brand-500 transition-all duration-700"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs text-white/50 w-8 text-right">{value}%</span>
    </div>
  )
}

function RewriteModal({ section, resumeId, targetRole, onClose }) {
  const [text, setText] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const rewrite = async () => {
    if (!text.trim()) return
    setLoading(true)
    try {
      const res = await api.post('/analyze/rewrite', { sectionText: text, sectionName: section, targetRole })
      setResult(res.data.rewritten)
    } catch (err) {
      setResult('Error: ' + (err.response?.data?.message || 'Rewrite failed'))
    } finally {
      setLoading(false)
    }
  }

  const copy = () => {
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass w-full max-w-lg rounded-2xl p-6 animate-fade-up">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Sparkles size={16} className="text-brand-400" />
            AI Rewrite — {section}
          </h3>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">✕</button>
        </div>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={4}
          placeholder={`Paste your current ${section} section here...`}
          className="input-field resize-none mb-4"
        />
        {result && (
          <div className="glass-light rounded-xl p-4 mb-4 relative">
            <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">{result}</p>
            <button onClick={copy} className="absolute top-3 right-3 p-1.5 hover:bg-white/10 rounded-lg transition-colors">
              {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} className="text-white/40" />}
            </button>
          </div>
        )}
        <button onClick={rewrite} disabled={loading || !text.trim()} className="btn-primary w-full flex items-center justify-center gap-2">
          {loading ? <><Loader2 size={15} className="animate-spin" />Rewriting...</> : <><Sparkles size={15} />Rewrite with AI</>}
        </button>
      </div>
    </div>
  )
}

export default function Result() {
  const { id } = useParams()
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [rewriteSection, setRewriteSection] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    api.get(`/analyze/${id}`)
      .then(res => setAnalysis(res.data.analysis))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
      <div className="text-center">
        <Loader2 size={32} className="animate-spin text-brand-400 mx-auto mb-3" />
        <p className="text-white/40 text-sm">Loading your analysis...</p>
      </div>
    </div>
  )

  if (!analysis) return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <p className="text-white/40 mb-4">Analysis not found.</p>
      <Link to="/upload" className="btn-primary">Analyze a resume</Link>
    </div>
  )

  const tabs = ['overview', 'keywords', 'suggestions']

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {rewriteSection && (
        <RewriteModal
          section={rewriteSection}
          targetRole={analysis.targetRole}
          onClose={() => setRewriteSection(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-8 animate-fade-up">
        <Link to="/upload" className="p-2 hover:bg-white/5 rounded-xl transition-colors">
          <ArrowLeft size={18} className="text-white/50" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-white">{analysis.resumeFileName}</h1>
          <p className="text-white/40 text-sm">
            {analysis.targetRole} · {new Date(analysis.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Dual Score */}
      <div className="card mb-6 animate-stagger-1">
        <div className="flex flex-wrap items-center justify-around gap-8 py-4">
          <ScoreRing score={analysis.atsScore} label="ATS Score" size="lg" />
          <div className="hidden sm:block h-20 w-px bg-white/8" />
          <ScoreRing score={analysis.roleFitScore} label="Role Fit Score" size="lg" />
          <div className="hidden sm:block h-20 w-px bg-white/8" />
          <div className="text-center">
            <div className="text-3xl font-semibold text-white mb-1">{analysis.foundKeywords?.length || 0}</div>
            <p className="text-xs text-white/40 uppercase tracking-wider">Keywords Found</p>
            <p className="text-xs text-red-400 mt-0.5">{analysis.missingKeywords?.length || 0} missing</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 glass-light rounded-xl p-1 animate-stagger-2">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              activeTab === tab
                ? 'bg-brand-600 text-white'
                : 'text-white/40 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-5 animate-fade-in">
          {/* Score breakdown */}
          <div className="card">
            <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-5">Score breakdown</h3>
            <div className="space-y-4">
              <BarRow label="Keyword match" value={analysis.breakdown.keywordMatch} />
              <BarRow label="Section completeness" value={analysis.breakdown.sectionScore} />
              <BarRow label="Format & parse" value={analysis.breakdown.formatScore} />
              <BarRow label="Readability" value={analysis.breakdown.readability} />
            </div>
          </div>

          {/* Section scores */}
          <div className="card">
            <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-5">Section scores</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Object.entries(analysis.sectionScores).map(([section, score]) => (
                <div key={section} className="glass-light rounded-xl p-4 text-center">
                  <div className="text-2xl font-semibold text-white mb-1">{score}</div>
                  <p className="text-xs text-white/40 capitalize">{section}</p>
                  <button
                    onClick={() => setRewriteSection(section)}
                    className="mt-2 text-xs text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1 mx-auto"
                  >
                    <Sparkles size={11} /> Rewrite
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Keywords */}
      {activeTab === 'keywords' && (
        <div className="space-y-5 animate-fade-in">
          <div className="card">
            <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-4">
              ✅ Found in your resume ({analysis.foundKeywords?.length || 0})
            </h3>
            <div className="flex flex-wrap gap-2">
              {analysis.foundKeywords?.map(kw => (
                <span key={kw} className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1.5 rounded-full">
                  {kw}
                </span>
              ))}
              {!analysis.foundKeywords?.length && <p className="text-white/30 text-sm">No keywords detected</p>}
            </div>
          </div>

          <div className="card">
            <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-2">
              ❌ Missing for {analysis.targetRole} ({analysis.missingKeywords?.length || 0})
            </h3>
            <p className="text-xs text-white/30 mb-4">Add these to your resume to boost your role fit score</p>
            <div className="flex flex-wrap gap-2">
              {analysis.missingKeywords?.map(kw => (
                <span key={kw} className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-full">
                  {kw}
                </span>
              ))}
              {!analysis.missingKeywords?.length && <p className="text-white/30 text-sm">No missing keywords — great!</p>}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Suggestions */}
      {activeTab === 'suggestions' && (
        <div className="card animate-fade-in">
          <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-5">
            AI Suggestions ({analysis.suggestions?.length || 0})
          </h3>
          <div className="space-y-3">
            {analysis.suggestions?.map((sug, i) => {
              const cfg = TYPE_CONFIG[sug.type] || TYPE_CONFIG.warning
              const Icon = cfg.icon
              return (
                <div key={i} className={`flex gap-3 p-4 rounded-xl border ${cfg.bg}`}>
                  <Icon size={16} className={`${cfg.cls} mt-0.5 shrink-0`} />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium ${cfg.cls}`}>{cfg.label}</span>
                      {sug.section && (
                        <span className="text-xs text-white/30 capitalize bg-white/5 px-2 py-0.5 rounded">{sug.section}</span>
                      )}
                    </div>
                    <p className="text-sm text-white/80 leading-relaxed">{sug.message}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="flex gap-3 mt-8 animate-stagger-5">
        <Link to="/upload" className="btn-primary flex items-center gap-2">
          <Sparkles size={15} /> Analyze another
        </Link>
        <Link to="/dashboard" className="btn-ghost">View history</Link>
      </div>
    </div>
  )
}
