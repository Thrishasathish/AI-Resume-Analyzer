import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { Upload as UploadIcon, FileText, X, ChevronDown, Loader2, Sparkles } from 'lucide-react'

export default function Upload() {
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [roles, setRoles] = useState([])
  const [targetRole, setTargetRole] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/analyze/roles').then(res => {
      setRoles(res.data.roles)
      if (res.data.roles.length) setTargetRole(res.data.roles[0].value)
    })
  }, [])

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer?.files[0] || e.target.files[0]
    if (!dropped) return
    const ext = dropped.name.split('.').pop().toLowerCase()
    if (!['pdf', 'docx'].includes(ext)) { setError('Only PDF and DOCX files allowed'); return }
    setError('')
    setFile(dropped)
  }, [])

  const handleSubmit = async () => {
    if (!file || !targetRole) { setError('Please select a file and target role'); return }
    setError('')
    setLoading(true)
    try {
      // Step 1: Upload file
      setStep('Uploading resume...')
      const formData = new FormData()
      formData.append('resume', file)
      const uploadRes = await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      // Step 2: Analyze
      setStep('Calculating ATS & Role Fit scores...')
      const analyzeRes = await api.post('/analyze', {
        resumeId: uploadRes.data.resume._id,
        targetRole,
        jobDescription,
      })

      navigate(`/result/${analyzeRes.data.analysis._id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed. Please try again.')
      setLoading(false)
      setStep('')
    }
  }

  // Group roles by category
  const grouped = roles.reduce((acc, r) => {
    if (!acc[r.category]) acc[r.category] = []
    acc[r.category].push(r)
    return acc
  }, {})

  const selectedRole = roles.find(r => r.value === targetRole)

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-10 animate-fade-up">
        <h1 className="text-3xl font-semibold text-white mb-2">Analyze your resume</h1>
        <p className="text-white/40">Upload your resume, pick your target role, and get scored in seconds.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      {/* File Drop Zone */}
      <div className="card mb-5 animate-stagger-1">
        <label className="block text-sm text-white/60 mb-3">Resume file</label>
        {!file ? (
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
              dragging ? 'border-brand-500 bg-brand-600/10' : 'border-white/10 hover:border-white/20 hover:bg-white/3'
            }`}
          >
            <input type="file" accept=".pdf,.docx" onChange={onDrop} className="hidden" id="file-input" />
            <label htmlFor="file-input" className="cursor-pointer">
              <UploadIcon size={32} className="text-white/20 mx-auto mb-3" />
              <p className="text-white/60 font-medium mb-1">Drop your resume here</p>
              <p className="text-white/30 text-sm">PDF or DOCX · max 5MB</p>
            </label>
          </div>
        ) : (
          <div className="flex items-center gap-3 glass-light rounded-xl px-4 py-3">
            <div className="w-10 h-10 bg-brand-600/20 rounded-lg flex items-center justify-center">
              <FileText size={18} className="text-brand-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{file.name}</p>
              <p className="text-white/40 text-xs">{(file.size / 1024).toFixed(0)} KB</p>
            </div>
            <button onClick={() => setFile(null)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
              <X size={16} className="text-white/40" />
            </button>
          </div>
        )}
      </div>

      {/* Role Selector */}
      <div className="card mb-5 animate-stagger-2">
        <label className="block text-sm text-white/60 mb-3">
          Target role <span className="text-brand-400">★ affects your score</span>
        </label>
        <div className="relative">
          <select
            value={targetRole}
            onChange={e => setTargetRole(e.target.value)}
            className="input-field appearance-none pr-10 cursor-pointer"
          >
            {Object.entries(grouped).map(([cat, items]) => (
              <optgroup key={cat} label={cat}>
                {items.map(r => (
                  <option key={r.value} value={r.value}>{r.icon} {r.label}</option>
                ))}
              </optgroup>
            ))}
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
        </div>
        {selectedRole && (
          <p className="text-xs text-white/30 mt-2">
            Scoring against <span className="text-brand-400">{selectedRole.label}</span> keywords and requirements
          </p>
        )}
      </div>

      {/* Job Description */}
      <div className="card mb-8 animate-stagger-3">
        <label className="block text-sm text-white/60 mb-1.5">
          Job description
          <span className="text-white/30 text-xs ml-2">optional — boosts accuracy significantly</span>
        </label>
        <textarea
          value={jobDescription}
          onChange={e => setJobDescription(e.target.value)}
          rows={5}
          placeholder="Paste the full job description here for a precise match score..."
          className="input-field resize-none"
        />
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={loading || !file}
        className="btn-primary w-full flex items-center justify-center gap-2 text-base py-3.5 animate-stagger-4"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            {step}
          </>
        ) : (
          <>
            <Sparkles size={18} />
            Analyze for {selectedRole?.label || 'role'}
          </>
        )}
      </button>
    </div>
  )
}
