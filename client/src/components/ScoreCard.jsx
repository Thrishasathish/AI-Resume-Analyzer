export default function ScoreRing({ score, label, size = 'md', color }) {
  const sizes = {
    sm: { outer: 80, inner: 58, font: 'text-lg' },
    md: { outer: 110, inner: 82, font: 'text-2xl' },
    lg: { outer: 140, inner: 106, font: 'text-3xl' },
  }
  const s = sizes[size]

  const getColor = (val) => {
    if (color) return color
    if (val >= 80) return '#22c55e'
    if (val >= 60) return '#f59e0b'
    return '#ef4444'
  }

  const getLabel = (val) => {
    if (val >= 80) return { text: 'Excellent', cls: 'text-green-400' }
    if (val >= 60) return { text: 'Good', cls: 'text-amber-400' }
    if (val >= 40) return { text: 'Fair', cls: 'text-orange-400' }
    return { text: 'Weak', cls: 'text-red-400' }
  }

  const ringColor = getColor(score)
  const status = getLabel(score)

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="score-ring flex items-center justify-center"
        style={{
          width: s.outer,
          height: s.outer,
          '--ring-color': ringColor,
          '--pct': score,
        }}
      >
        <div
          className="bg-[#0f0e17] rounded-full flex flex-col items-center justify-center"
          style={{ width: s.inner, height: s.inner }}
        >
          <span className={`${s.font} font-semibold text-white leading-none`}>{score}</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs text-white/40 uppercase tracking-wider font-medium">{label}</p>
        <p className={`text-xs font-medium ${status.cls}`}>{status.text}</p>
      </div>
    </div>
  )
}
