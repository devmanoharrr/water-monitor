import { useEffect, useMemo, useState } from 'react'
import { getMonthlyAverages } from '../api/waterQualityApi'

export default function DataView() {
  const [rows, setRows] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function run() {
      setIsLoading(true)
      setError('')
      try {
        const resp = await getMonthlyAverages()
        if (!cancelled) setRows(resp)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [])

  const hasData = useMemo(() => rows && rows.length > 0, [rows])

  return (
    <div className="container">
      {/* Page Header */}
      <div className="pageHeader">
        <div>
          <h1 className="pageTitle">Monthly Analytics</h1>
          <div className="muted" style={{ fontSize: 14, fontWeight: 500, marginTop: 4 }}>
            Aggregated averages dynamically calculated across sensor databases.
          </div>
        </div>
      </div>

      {/* Info Card explaining thresholds */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="cardBody" style={{ display: 'grid', gap: '14px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--text-h)' }}>Statistical Aggregation Criteria</h3>
            <p className="muted" style={{ fontSize: '13px', margin: '4px 0 0' }}>
              Sensory entries are grouped by calendar month and average parameters are computed in real-time. Below is a list of the regulatory thresholds:
            </p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', fontSize: '12px', fontWeight: 600 }}>
            <span className="pill" style={{ background: 'rgba(255, 255, 255, 0.02)' }}>pH: 6.5 - 8.5</span>
            <span className="pill" style={{ background: 'rgba(255, 255, 255, 0.02)' }}>Alkalinity: &le; 500 mg/L</span>
            <span className="pill" style={{ background: 'rgba(255, 255, 255, 0.02)' }}>Conductivity: &le; 2000 &mu;S</span>
            <span className="pill" style={{ background: 'rgba(255, 255, 255, 0.02)' }}>Nitrite: &lt; 1.0 mg/L</span>
            <span className="pill" style={{ background: 'rgba(255, 255, 255, 0.02)' }}>TDS: &le; 1000 mg/L</span>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="cardBody">
          {isLoading && <div className="muted" style={{ padding: '40px 0', textAlign: 'center' }}>Aggregating monthly reports...</div>}
          {error && (
            <div className="glassPanel" style={{ background: 'var(--danger-soft)', borderColor: 'rgba(244, 63, 94, 0.15)', color: 'var(--danger)', padding: '16px' }}>
              <strong>Error syncing averages:</strong> {error}
            </div>
          )}

          {!isLoading && !error && !hasData && (
            <div className="muted" style={{ padding: '40px 0', textAlign: 'center' }}>No monthly records found. Please populate the sensory database.</div>
          )}

          {!isLoading && !error && hasData && (
            <div className="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>River Station</th>
                    <th>Avg pH</th>
                    <th>Avg Alkalinity</th>
                    <th>Avg Conductivity</th>
                    <th>Avg Nitrite</th>
                    <th>Avg TDS</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, idx) => {
                    // Check if averages exceed limits for cell highlights
                    const isPhBad = r.averagePh < 6.5 || r.averagePh > 8.5
                    const isAlkBad = r.averageAlkalinity > 500
                    const isCondBad = r.averageConductivity > 2000
                    const isNo2Bad = r.averageNitrite >= 1.0
                    const isTdsBad = r.averageTds > 1000

                    return (
                      <tr key={`${r.month}-${r.river}-${idx}`}>
                        <td className="font-mono" style={{ fontWeight: 700, color: 'var(--text-h)' }}>{r.month}</td>
                        <td style={{ fontWeight: 600 }}>{r.river}</td>
                        
                        <td style={{ color: isPhBad ? 'var(--danger)' : 'var(--success)', fontWeight: isPhBad ? 700 : 'inherit' }}>
                          {Number(r.averagePh).toFixed(3)}
                          {isPhBad && <span style={{ fontSize: '10px', marginLeft: '4px' }}>⚠️</span>}
                        </td>
                        
                        <td style={{ color: isAlkBad ? 'var(--danger)' : 'var(--text-h)', fontWeight: isAlkBad ? 700 : 'inherit' }}>
                          {Number(r.averageAlkalinity).toFixed(2)} mg/L
                          {isAlkBad && <span style={{ fontSize: '10px', marginLeft: '4px' }}>⚠️</span>}
                        </td>
                        
                        <td style={{ color: isCondBad ? 'var(--danger)' : 'var(--text-h)', fontWeight: isCondBad ? 700 : 'inherit' }}>
                          {Number(r.averageConductivity).toFixed(1)} &mu;S
                          {isCondBad && <span style={{ fontSize: '10px', marginLeft: '4px' }}>⚠️</span>}
                        </td>
                        
                        <td style={{ color: isNo2Bad ? 'var(--danger)' : 'var(--text-h)', fontWeight: isNo2Bad ? 700 : 'inherit' }}>
                          {Number(r.averageNitrite).toFixed(5)} mg/L
                          {isNo2Bad && <span style={{ fontSize: '10px', marginLeft: '4px' }}>⚠️</span>}
                        </td>
                        
                        <td style={{ color: isTdsBad ? 'var(--danger)' : 'var(--success)', fontWeight: isTdsBad ? 700 : 700 }}>
                          {Number(r.averageTds).toFixed(4)} mg/L
                          {isTdsBad && <span style={{ fontSize: '10px', marginLeft: '4px' }}>⚠️</span>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
