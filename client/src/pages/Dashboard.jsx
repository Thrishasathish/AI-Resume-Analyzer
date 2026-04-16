import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Trash2, ExternalLink, Loader2, Upload } from 'lucide-react'

function ScoreBadge({ score }) {
  if (score >= 80) return <span className="text-xs font-semibold text-green-400 bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-full">{score}</span>
  if (score >= 60) return <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">{score}</span>
  return <span className="text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-full">{score}</span>
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-xl px-4 py-3 text-sm">
      <p className="text-white/50 text-xs mb-1">{label}</p>
      <p className="text-brand-300 font-medium">ATS: {payload[0]?.value}</p>
      {payload[1] && <p className="text-amber-300 font-medium">Role Fit: {payload[1]?.value}</p>}
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [analyses, setAnalyses] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    api.get('/analyze/history')
      .then(res => setAnalyses(res.data.analyses))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this analysis?')) return
    setDeletingId(id)
    try {
      await api.delete(`/analyze/${id}`)
      setAnalyses(prev => prev.filter(a => a._id !== id))
    } catch (err) {
      console.error(err)
    } finally {
      setDeletingId(null)
    }
  }

  // Chart data — last 10 analyses reversed (oldest first)
  const chartData = [...analyses].reverse().slice(-10).map((a, i) => ({
    name: `v${i + 1}`,
    ATS: a.atsScore,
    RoleFit: a.roleFitScore,
    role: a.targetRole,
  }))

  const avgATS = analyses.length
    ? Math.round(analyses.reduce((s, a) => s + a.atsScore, 0) / analyses.length)
    : 0
  const avgFit = analyses.length
    ? Math.round(analyses.reduce((s, a) => s + a.roleFitScore, 0) / analyses.length)
    : 0
  const best = analyses.reduce((m, a) => a.atsScore > (m?.atsScore || 0) ? a : m, null)

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-fade-up">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            {user?.name?.split(' ')[0]}'s dashboard
          </h1>
          <p className="text-white/40 text-sm mt-0.5">{analyses.length} analyses · track your progress</p>
        </div>
        <Link to="/upload" className="btn-primary flex items-center gap-2 text-sm">
          <Upload size={14} /> New analysis
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={28} className="animate-spin text-brand-400" />
        </div>
      ) : analyses.length === 0 ? (
        <div className="card text-center py-20">
          <p className="text-white/30 mb-4">No analyses yet</p>
          <Link to="/upload" className="btn-primary inline-flex items-center gap-2">
            <Upload size={15} /> Analyze your first resume
          </Link>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6 animate-stagger-1">
            {[
              { label: 'Analyses', value: analyses.length },
              { label: 'Avg ATS Score', value: avgATS },
              { label: 'Avg Role Fit', value: avgFit },
            ].map(({ label, value }) => (
              <div key={label} className="card text-center py-5">
                <div className="text-3xl font-semibold text-white mb-1">{value}</div>
                <p className="text-xs text-white/40 uppercase tracking-wider">{label}</p>
              </div>
            ))}
          </div>

          {/* Progress chart */}
          {chartData.length >= 2 && (
            <div className="card mb-6 animate-stagger-2">
              <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-5">Score progress</h3>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={chartData}>
                  <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="ATS" stroke="#7c77ee" strokeWidth={2} dot={{ fill: '#7c77ee', r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="RoleFit" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 4 }} activeDot={{ r: 6 }} strokeDasharray="4 2" />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-3 justify-center">
                <div className="flex items-center gap-1.5 text-xs text-white/40">
                  <div className="w-4 h-0.5 bg-brand-400 rounded" /> ATS Score
                </div>
                <div className="flex items-center gap-1.5 text-xs text-white/40">
                  <div className="w-4 h-0.5 bg-amber-400 rounded" style={{ backgroundImage: 'repeating-linear-gradient(to right, #f59e0b 0, #f59e0b 4px, transparent 4px, transparent 6px)' }} /> Role Fit
                </div>
              </div>
            </div>
          )}

          {/* History list */}
          <div className="card animate-stagger-3">
            <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-5">Analysis history</h3>
            <div className="space-y-3">
              {analyses.map((a) => (
                <div key={a._id} className="flex items-center gap-4 glass-light rounded-xl px-4 py-3.5 hover:bg-white/5 transition-colors group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-medium text-white truncate">{a.resumeFileName || 'Resume'}</p>
                      <span className="text-xs text-white/30 shrink-0 glass px-2 py-0.5 rounded">{a.targetRole}</span>
                    </div>
                    <p className="text-xs text-white/30">
                      {new Date(a.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {' · '}{a.missingKeywords?.length || 0} missing keywords
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <ScoreBadge score={a.atsScore} />
                      <p className="text-xs text-white/30 mt-1">ATS</p>
                    </div>
                    <div className="text-right">
                      <ScoreBadge score={a.roleFitScore} />
                      <p className="text-xs text-white/30 mt-1">Role</p>
                    </div>
                    <Link
                      to={`/result/${a._id}`}
                      className="p-2 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded-lg transition-all"
                    >
                      <ExternalLink size={14} className="text-white/50" />
                    </Link>
                    <button
                      onClick={() => handleDelete(a._id)}
                      disabled={deletingId === a._id}
                      className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 rounded-lg transition-all"
                    >
                      {deletingId === a._id
                        ? <Loader2 size={14} className="animate-spin text-white/30" />
                        : <Trash2 size={14} className="text-red-400/60 hover:text-red-400" />
                      }
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
