import { useEffect, useState } from 'react'
import { getLatestFlag, getAllRecords, createRecord, updateRecord, deleteRecord } from '../api/waterQualityApi'
import { listUsers } from '../api/usersApi'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview')

  // Live flag & records state
  const [flagData, setFlagData] = useState(null)
  const [records, setRecords] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Service health checks
  const [waterServiceOnline, setWaterServiceOnline] = useState(null)
  const [authServiceOnline, setAuthServiceOnline] = useState(null)

  // API Explorer state
  const [explorerResult, setExplorerResult] = useState(null)
  const [selectedEndpoint, setSelectedEndpoint] = useState(null)
  const [explorerLoading, setExplorerLoading] = useState(false)

  // CRUD modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)

  // Form states for record additions/edits
  const [formObjectId, setFormObjectId] = useState('')
  const [formPh, setFormPh] = useState(7.0)
  const [formAlk, setFormAlk] = useState(100.0)
  const [formCond, setFormCond] = useState(500.0)
  const [formBod, setFormBod] = useState(2.0)
  const [formNo2, setFormNo2] = useState(0.05)
  const [formCu1, setFormCu1] = useState(0.1)
  const [formCu2, setFormCu2] = useState(10.0)
  const [formFe1, setFormFe1] = useState(50.0)
  const [formZn, setFormZn] = useState(15.0)
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0])

  // Endpoints list for the explorer
  const endpointsList = [
    {
      method: 'GET',
      url: 'http://localhost:8080/api/v1/waterquality/latest-flag',
      desc: 'Retrieves safety flags, calculated TDS, and failing metrics for River Tyne.',
      action: async () => getLatestFlag()
    },
    {
      method: 'GET',
      url: 'http://localhost:8080/api/v1/waterquality/records',
      desc: 'Retrieves all historical and active water quality database entries.',
      action: async () => getAllRecords()
    },
    {
      method: 'GET',
      url: 'http://localhost:8080/api/v1/waterquality/records/latest',
      desc: 'Retrieves the absolute latest raw record from the monitoring sensors.',
      action: async () => {
        const res = await fetch('http://localhost:8080/api/v1/waterquality/records/latest');
        if (!res.ok) throw new Error('Failed to load latest record');
        return res.json();
      }
    },
    {
      method: 'GET',
      url: 'http://localhost:8085/api/v1/users',
      desc: 'Lists all current registered usernames from the auth microservice (in-memory).',
      action: async () => listUsers()
    },
    {
      method: 'GET',
      url: 'http://localhost:8080/api/v1/monitoring/latest',
      desc: 'Gateway routing: Fetch latest sensor record via the unified gateway controller.',
      action: async () => {
        const res = await fetch('http://localhost:8080/api/v1/monitoring/latest');
        if (!res.ok) throw new Error('Gateway request failed');
        return res.json();
      }
    },
    {
      method: 'GET',
      url: 'http://localhost:8080/api/v1/monitoring/analyze',
      desc: 'Gateway routing: Performs real-time anomaly check on the latest metrics.',
      action: async () => {
        const res = await fetch('http://localhost:8080/api/v1/monitoring/analyze');
        if (!res.ok) throw new Error('Gateway analysis failed');
        return { analysis: await res.text() };
      }
    }
  ]

  async function loadData() {
    setIsLoading(true)
    setError('')
    try {
      // 1. Fetch latest safety flag
      const flag = await getLatestFlag()
      setFlagData(flag)

      // 2. Fetch all records
      const allRecs = await getAllRecords()
      // Sort records descending by objectId
      const sorted = [...allRecs].sort((a, b) => b.objectId - a.objectId)
      setRecords(sorted)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Connection failed to Water Quality microservice.')
    } finally {
      setIsLoading(false)
    }
  }

  // Ping services to check if they are online
  async function checkServicesHealth() {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 2000)
      await fetch('http://localhost:8080/api/v1/waterquality/latest-flag', { signal: controller.signal })
      clearTimeout(timeoutId)
      setWaterServiceOnline(true)
    } catch {
      setWaterServiceOnline(false)
    }

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 2000)
      await fetch('http://localhost:8085/api/v1/users', { signal: controller.signal })
      clearTimeout(timeoutId)
      setAuthServiceOnline(true)
    } catch {
      setAuthServiceOnline(false)
    }
  }

  useEffect(() => {
    loadData()
    checkServicesHealth()
  }, [])

  // Execute API Explorer calls
  async function handleTestEndpoint(endpoint) {
    setSelectedEndpoint(endpoint.url)
    setExplorerLoading(true)
    setExplorerResult(null)
    try {
      const res = await endpoint.action()
      setExplorerResult(res)
    } catch (err) {
      setExplorerResult({ error: err instanceof Error ? err.message : 'API request failed' })
    } finally {
      setExplorerLoading(false)
    }
  }

  // Prefill next logical objectId when opening Add modal
  function openAddModal() {
    const maxId = records.reduce((max, r) => (r.objectId > max ? r.objectId : max), 0)
    setFormObjectId(maxId + 1)
    setFormPh(7.2)
    setFormAlk(120.0)
    setFormCond(450.0)
    setFormBod(1.5)
    setFormNo2(0.04)
    setFormCu1(0.12)
    setFormCu2(8.5)
    setFormFe1(45.0)
    setFormZn(12.0)
    setFormDate(new Date().toISOString().split('T')[0])
    setIsAddModalOpen(true)
  }

  async function handleAddRecord(e) {
    e.preventDefault()
    try {
      const payload = {
        objectId: Number(formObjectId),
        ph: Number(formPh),
        alkMgl: Number(formAlk),
        condUscm: Number(formCond),
        bodMgl: Number(formBod),
        no2NMgl: Number(formNo2),
        cusol1Mgl: Number(formCu1),
        cusol2Ugl: Number(formCu2),
        fesol1Ugl: Number(formFe1),
        znSolUgl: Number(formZn),
        sampleDate: formDate
      }
      await createRecord(payload)
      setIsAddModalOpen(false)
      loadData()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add record')
    }
  }

  function openEditModal(record) {
    setEditingRecord(record)
    setFormPh(record.ph)
    setFormAlk(record.alkMgl)
    setFormCond(record.condUscm)
    setFormBod(record.bodMgl)
    setFormNo2(record.no2NMgl)
    setFormCu1(record.cusol1Mgl ?? 0)
    setFormCu2(record.cusol2Ugl)
    setFormFe1(record.fesol1Ugl)
    setFormZn(record.znSolUgl)
    setFormDate(record.sampleDate || new Date().toISOString().split('T')[0])
    setIsEditModalOpen(true)
  }

  async function handleEditRecord(e) {
    e.preventDefault()
    try {
      const payload = {
        ph: Number(formPh),
        alkMgl: Number(formAlk),
        condUscm: Number(formCond),
        bodMgl: Number(formBod),
        no2NMgl: Number(formNo2),
        cusol1Mgl: Number(formCu1),
        cusol2Ugl: Number(formCu2),
        fesol1Ugl: Number(formFe1),
        znSolUgl: Number(formZn),
        sampleDate: formDate
      }
      await updateRecord(editingRecord.objectId, payload)
      setIsEditModalOpen(false)
      loadData()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save changes')
    }
  }

  async function handleDeleteRecord(id) {
    if (!window.confirm(`Are you sure you want to delete water quality record #${id}?`)) return
    try {
      await deleteRecord(id)
      loadData()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete record')
    }
  }

  // Calculated TDS helper for rendering in table
  function calcTds(r) {
    return (
      (r.cusol1Mgl || 0.0) +
      (r.cusol2Ugl / 1000.0) +
      (r.fesol1Ugl / 1000.0) +
      (r.znSolUgl / 1000.0)
    )
  }

  // Latest record loaded for displaying sensor gauges
  const latestRawRecord = records.length > 0 ? records[0] : null
  const activeTds = flagData ? flagData.tds : (latestRawRecord ? calcTds(latestRawRecord) : 0)

  return (
    <div className="container">
      {/* Top Banner Status */}
      <div className="pageHeader" style={{ borderBottom: 'none', marginBottom: '14px' }}>
        <div>
          <h1 className="pageTitle">Environmental Command Center</h1>
          <div className="muted" style={{ fontSize: 14, fontWeight: 500, marginTop: 4 }}>
            Real-time sensory diagnostics and microservices integration gateway.
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn" onClick={() => { loadData(); checkServicesHealth(); }} title="Reload Sensors">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
            </svg>
            Sync Core
          </button>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="tabContainer">
        <button className={`tabButton ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
          Overview & Gauges
        </button>
        <button className={`tabButton ${activeTab === 'explorer' ? 'active' : ''}`} onClick={() => setActiveTab('explorer')}>
          API Explorer Playground
        </button>
        <button className={`tabButton ${activeTab === 'crud' ? 'active' : ''}`} onClick={() => setActiveTab('crud')}>
          Records CRUD Manager ({records.length})
        </button>
      </div>

      {/* ERROR MESSAGE IF ANY */}
      {error && (
        <div className="card" style={{ marginBottom: 24, borderColor: 'rgba(244, 63, 94, 0.2)', background: 'var(--danger-soft)' }}>
          <div className="cardBody" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: 'var(--danger)', fontSize: 18, display: 'grid' }}>⚠️</span>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text-h)', fontSize: 14 }}>System connection alert</div>
              <div style={{ fontSize: 13, color: 'var(--text)', marginTop: 2 }}>{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENTS */}

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gap: '24px' }}>
          {/* Top grid: Tyne Status and Health checks */}
          <div className="grid2">
            {/* River Tyne Status Card */}
            <div className="card" style={{ borderLeft: flagData?.flag === 'GREEN' ? '6px solid var(--success)' : flagData?.flag === 'RED' ? '6px solid var(--danger)' : '1px solid var(--border)' }}>
              <div className="cardBody" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span className="muted" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600 }}>Active River Station</span>
                    <h2 style={{ fontSize: '24px', margin: '4px 0 0' }}>River Tyne</h2>
                  </div>
                  <div>
                    {flagData ? (
                      <span className={`pill ${flagData.flag === 'GREEN' ? 'pillGreen' : 'pillRed'}`} style={{ fontSize: '15px', padding: '8px 16px' }}>
                        {flagData.flag}
                      </span>
                    ) : (
                      <span className="pill">—</span>
                    )}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '14px', display: 'grid', gap: '10px', fontSize: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="muted">Latest Sample Record ID</span>
                    <strong style={{ color: 'var(--text-h)' }}>#{flagData?.latestRecordId || latestRawRecord?.objectId || '—'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="muted">Total Dissolved Solids (TDS)</span>
                    <strong style={{ color: 'var(--text-h)' }}>{activeTds ? activeTds.toFixed(4) : '—'} mg/L</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="muted">Status Diagnostic Description</span>
                    <span style={{ color: flagData?.flag === 'GREEN' ? 'var(--success)' : flagData?.flag === 'RED' ? 'var(--danger)' : 'var(--text)' }}>
                      {flagData?.flag === 'GREEN' ? 'All sensory parameters within limits' : flagData?.flag === 'RED' ? 'Parametric thresholds exceeded' : 'Awaiting sensor sync...'}
                    </span>
                  </div>
                </div>

                {flagData?.failedParameters?.length > 0 && (
                  <div className="glassPanel" style={{ background: 'rgba(244, 63, 94, 0.05)', borderColor: 'rgba(244, 63, 94, 0.15)', borderRadius: '10px', padding: '12px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--danger)', fontSize: '13px', marginBottom: '4px' }}>Failed Parameters List</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-h)', fontWeight: 600 }}>
                      {flagData.failedParameters.join(', ')}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Health Monitor Card */}
            <div className="card">
              <div className="cardBody" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px' }}>Microservices Cluster Health</h3>
                  <p className="muted" style={{ fontSize: '13px', margin: '4px 0 0' }}>Dynamic status checks on local endpoints availability.</p>
                </div>

                <div style={{ display: 'grid', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="font-mono" style={{ fontSize: '13px', color: 'var(--text-h)', fontWeight: 600 }}>Water Quality Service</span>
                      <span className="muted" style={{ fontSize: '11px' }}>Port 8080</span>
                    </div>
                    <div>
                      {waterServiceOnline === true ? (
                        <span className="pill pillGreen" style={{ padding: '3px 8px', fontSize: '11px' }}>ONLINE</span>
                      ) : waterServiceOnline === false ? (
                        <span className="pill pillRed" style={{ padding: '3px 8px', fontSize: '11px' }}>OFFLINE</span>
                      ) : (
                        <span className="pill" style={{ padding: '3px 8px', fontSize: '11px' }}>PENDING</span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="font-mono" style={{ fontSize: '13px', color: 'var(--text-h)', fontWeight: 600 }}>Authentication Service</span>
                      <span className="muted" style={{ fontSize: '11px' }}>Port 8085</span>
                    </div>
                    <div>
                      {authServiceOnline === true ? (
                        <span className="pill pillGreen" style={{ padding: '3px 8px', fontSize: '11px' }}>ONLINE</span>
                      ) : authServiceOnline === false ? (
                        <span className="pill pillRed" style={{ padding: '3px 8px', fontSize: '11px' }}>OFFLINE</span>
                      ) : (
                        <span className="pill" style={{ padding: '3px 8px', fontSize: '11px' }}>PENDING</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="muted" style={{ fontSize: '12px', lineHeight: '1.4' }}>
                  💡 Running both services concurrently enables full system capabilities, including database updates and routing operations.
                </div>
              </div>
            </div>
          </div>

          {/* Sensory Parameter Gauges Panel */}
          {latestRawRecord && (
            <div className="card">
              <div className="cardBody">
                <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Sensory Parameter Gauges (Latest Record #{latestRawRecord.objectId})</h3>
                <div className="gridResponsive" style={{ gap: '20px' }}>
                  {/* Gauge 1: pH */}
                  <div className="glassPanel" style={{ background: 'rgba(255,255,255,0.01)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600 }}>
                      <span style={{ color: 'var(--text-h)' }}>pH (Potential Hydrogen)</span>
                      <span style={{ color: (latestRawRecord.ph < 6.5 || latestRawRecord.ph > 8.5) ? 'var(--danger)' : 'var(--success)' }}>
                        {latestRawRecord.ph.toFixed(2)} pH
                      </span>
                    </div>
                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', margin: '10px 0 6px', overflow: 'hidden', position: 'relative' }}>
                      <div style={{
                        position: 'absolute',
                        left: '0',
                        height: '100%',
                        width: `${Math.min((latestRawRecord.ph / 14) * 100, 100)}%`,
                        background: (latestRawRecord.ph < 6.5 || latestRawRecord.ph > 8.5) ? 'var(--danger)' : 'var(--success)',
                        boxShadow: (latestRawRecord.ph < 6.5 || latestRawRecord.ph > 8.5) ? '0 0 8px var(--danger)' : '0 0 8px var(--success)'
                      }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                      <span>Acidic (0)</span>
                      <span style={{ fontWeight: 600, color: 'var(--primary)' }}>Safe: 6.5 - 8.5</span>
                      <span>Alkaline (14)</span>
                    </div>
                  </div>

                  {/* Gauge 2: Alkalinity */}
                  <div className="glassPanel" style={{ background: 'rgba(255,255,255,0.01)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600 }}>
                      <span style={{ color: 'var(--text-h)' }}>Alkalinity</span>
                      <span style={{ color: latestRawRecord.alkMgl > 500 ? 'var(--danger)' : 'var(--success)' }}>
                        {latestRawRecord.alkMgl.toFixed(1)} mg/L
                      </span>
                    </div>
                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', margin: '10px 0 6px', overflow: 'hidden', position: 'relative' }}>
                      <div style={{
                        position: 'absolute',
                        left: '0',
                        height: '100%',
                        width: `${Math.min((latestRawRecord.alkMgl / 600) * 100, 100)}%`,
                        background: latestRawRecord.alkMgl > 500 ? 'var(--danger)' : 'var(--success)',
                        boxShadow: latestRawRecord.alkMgl > 500 ? '0 0 8px var(--danger)' : '0 0 8px var(--success)'
                      }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                      <span>0 mg/L</span>
                      <span style={{ fontWeight: 600, color: 'var(--primary)' }}>Safe: &le; 500</span>
                      <span>600 mg/L</span>
                    </div>
                  </div>

                  {/* Gauge 3: Conductivity */}
                  <div className="glassPanel" style={{ background: 'rgba(255,255,255,0.01)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600 }}>
                      <span style={{ color: 'var(--text-h)' }}>Conductivity</span>
                      <span style={{ color: latestRawRecord.condUscm > 2000 ? 'var(--danger)' : 'var(--success)' }}>
                        {latestRawRecord.condUscm.toFixed(0)} &mu;S/cm
                      </span>
                    </div>
                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', margin: '10px 0 6px', overflow: 'hidden', position: 'relative' }}>
                      <div style={{
                        position: 'absolute',
                        left: '0',
                        height: '100%',
                        width: `${Math.min((latestRawRecord.condUscm / 2500) * 100, 100)}%`,
                        background: latestRawRecord.condUscm > 2000 ? 'var(--danger)' : 'var(--success)',
                        boxShadow: latestRawRecord.condUscm > 2000 ? '0 0 8px var(--danger)' : '0 0 8px var(--success)'
                      }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                      <span>0 &mu;S/cm</span>
                      <span style={{ fontWeight: 600, color: 'var(--primary)' }}>Safe: &le; 2000</span>
                      <span>2500 &mu;S/cm</span>
                    </div>
                  </div>

                  {/* Gauge 4: Nitrite */}
                  <div className="glassPanel" style={{ background: 'rgba(255,255,255,0.01)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600 }}>
                      <span style={{ color: 'var(--text-h)' }}>Nitrite</span>
                      <span style={{ color: latestRawRecord.no2NMgl >= 1.0 ? 'var(--danger)' : 'var(--success)' }}>
                        {latestRawRecord.no2NMgl.toFixed(4)} mg/L
                      </span>
                    </div>
                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', margin: '10px 0 6px', overflow: 'hidden', position: 'relative' }}>
                      <div style={{
                        position: 'absolute',
                        left: '0',
                        height: '100%',
                        width: `${Math.min((latestRawRecord.no2NMgl / 1.5) * 100, 100)}%`,
                        background: latestRawRecord.no2NMgl >= 1.0 ? 'var(--danger)' : 'var(--success)',
                        boxShadow: latestRawRecord.no2NMgl >= 1.0 ? '0 0 8px var(--danger)' : '0 0 8px var(--success)'
                      }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                      <span>0 mg/L</span>
                      <span style={{ fontWeight: 600, color: 'var(--primary)' }}>Safe: &lt; 1.0</span>
                      <span>1.5 mg/L</span>
                    </div>
                  </div>

                  {/* Gauge 5: TDS */}
                  <div className="glassPanel" style={{ background: 'rgba(255,255,255,0.01)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600 }}>
                      <span style={{ color: 'var(--text-h)' }}>Total Dissolved Solids</span>
                      <span style={{ color: activeTds > 1000 ? 'var(--danger)' : 'var(--success)' }}>
                        {activeTds.toFixed(3)} mg/L
                      </span>
                    </div>
                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', margin: '10px 0 6px', overflow: 'hidden', position: 'relative' }}>
                      <div style={{
                        position: 'absolute',
                        left: '0',
                        height: '100%',
                        width: `${Math.min((activeTds / 1200) * 100, 100)}%`,
                        background: activeTds > 1000 ? 'var(--danger)' : 'var(--success)',
                        boxShadow: activeTds > 1000 ? '0 0 8px var(--danger)' : '0 0 8px var(--success)'
                      }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                      <span>0 mg/L</span>
                      <span style={{ fontWeight: 600, color: 'var(--primary)' }}>Safe: &le; 1000</span>
                      <span>1200 mg/L</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: API EXPLORER */}
      {activeTab === 'explorer' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }} className="explorer-grid">
          {/* Left panel: Endpoints Catalog */}
          <div className="card">
            <div className="cardBody" style={{ display: 'grid', gap: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px' }}>API Route Registry</h3>
                <p className="muted" style={{ fontSize: '13px', margin: '4px 0 0' }}>Select an endpoint to execute a query against the live cluster.</p>
              </div>

              <div style={{ display: 'grid', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                {endpointsList.map((ep, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleTestEndpoint(ep)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: '1px solid var(--border)',
                      cursor: 'pointer',
                      background: selectedEndpoint === ep.url ? 'rgba(20, 184, 166, 0.05)' : 'rgba(255, 255, 255, 0.01)',
                      borderColor: selectedEndpoint === ep.url ? 'var(--primary)' : 'var(--border)',
                      transition: 'all 0.2s ease',
                      display: 'grid',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="pill" style={{
                        padding: '2px 8px',
                        fontSize: '11px',
                        fontWeight: 800,
                        background: ep.method === 'GET' ? 'rgba(20, 184, 166, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                        borderColor: ep.method === 'GET' ? 'rgba(20, 184, 166, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                        color: ep.method === 'GET' ? 'var(--primary)' : 'var(--success)'
                      }}>
                        {ep.method}
                      </span>
                      <span className="font-mono" style={{ fontSize: '13px', color: 'var(--text-h)', fontWeight: 600, wordBreak: 'break-all' }}>
                        {ep.url.replace('http://localhost:8080', '').replace('http://localhost:8085', '')}
                      </span>
                    </div>
                    <div className="muted" style={{ fontSize: '12px', lineHeight: '1.4' }}>{ep.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right panel: Response Terminal Console */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="cardBody" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px' }}>Response Console Terminal</h3>
                  <p className="muted" style={{ fontSize: '13px', margin: '4px 0 0' }}>Active server response data.</p>
                </div>
                {selectedEndpoint && (
                  <button className="btn" onClick={() => {
                    const ep = endpointsList.find(e => e.url === selectedEndpoint);
                    if (ep) handleTestEndpoint(ep);
                  }} style={{ padding: '6px 12px', fontSize: '12px' }}>
                    Re-Execute
                  </button>
                )}
              </div>

              <div
                className="font-mono"
                style={{
                  flexGrow: 1,
                  background: '#040711',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '16px',
                  fontSize: '13px',
                  color: '#34d399', // Emerald console color
                  overflow: 'auto',
                  maxHeight: '520px',
                  minHeight: '300px',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {explorerLoading ? (
                  <div className="muted" style={{ margin: 'auto', textAlign: 'center' }}>
                    <div style={{ animation: 'spin 1s linear infinite', border: '2px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', width: '20px', height: '20px', margin: '0 auto 10px' }} />
                    Streaming query execution...
                  </div>
                ) : explorerResult ? (
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                    {JSON.stringify(explorerResult, null, 2)}
                  </pre>
                ) : (
                  <div className="muted" style={{ margin: 'auto', textAlign: 'center', maxWidth: '80%' }}>
                    ⚡ Select an endpoint from the register on the left and click to trigger a secure REST connection. Live JSON payloads will render here.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: RECORDS CRUD MANAGER */}
      {activeTab === 'crud' && (
        <div className="card">
          <div className="cardBody" style={{ display: 'grid', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px' }}>Water Quality Database</h3>
                <p className="muted" style={{ fontSize: '13px', margin: '4px 0 0' }}>Manage historical parameter entries in the SQLite database.</p>
              </div>
              <button className="btn btnPrimary" onClick={openAddModal}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Add Sensory Record
              </button>
            </div>

            {/* Records Data Table */}
            {isLoading ? (
              <div className="muted" style={{ padding: '40px 0', textAlign: 'center' }}>Synchronizing records list...</div>
            ) : records.length === 0 ? (
              <div className="muted" style={{ padding: '40px 0', textAlign: 'center' }}>No database records found. Click Add to insert one.</div>
            ) : (
              <div className="tableWrap">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Sample Date</th>
                      <th>pH</th>
                      <th>Alkalinity</th>
                      <th>Conductivity</th>
                      <th>Nitrite</th>
                      <th>TDS (mg/L)</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((r) => {
                      const tdsVal = calcTds(r)
                      const isFailing =
                        r.ph < 6.5 ||
                        r.ph > 8.5 ||
                        r.alkMgl > 500 ||
                        r.condUscm > 2000 ||
                        r.no2NMgl >= 1.0 ||
                        tdsVal > 1000

                      return (
                        <tr key={r.objectId}>
                          <td className="font-mono" style={{ fontWeight: 700, color: 'var(--text-h)' }}>#{r.objectId}</td>
                          <td>{r.sampleDate || '—'}</td>
                          <td style={{ color: (r.ph < 6.5 || r.ph > 8.5) ? 'var(--danger)' : 'var(--text-h)' }}>{r.ph.toFixed(2)}</td>
                          <td style={{ color: r.alkMgl > 500 ? 'var(--danger)' : 'var(--text)' }}>{r.alkMgl.toFixed(1)}</td>
                          <td style={{ color: r.condUscm > 2000 ? 'var(--danger)' : 'var(--text)' }}>{r.condUscm.toFixed(0)}</td>
                          <td style={{ color: r.no2NMgl >= 1.0 ? 'var(--danger)' : 'var(--text)' }}>{r.no2NMgl.toFixed(4)}</td>
                          <td style={{ color: tdsVal > 1000 ? 'var(--danger)' : 'var(--text)', fontWeight: 600 }}>{tdsVal.toFixed(3)}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button className="btn" onClick={() => openEditModal(r)} style={{ padding: '6px 12px', fontSize: '12px' }}>
                                Edit
                              </button>
                              <button className="btn btnDanger" onClick={() => handleDeleteRecord(r.objectId)} style={{ padding: '6px 12px', fontSize: '12px' }}>
                                Delete
                              </button>
                              {isFailing && (
                                <span className="pill pillRed" style={{ padding: '4px 8px', fontSize: '10px', fontWeight: 800 }}>ALERT</span>
                              )}
                            </div>
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
      )}

      {/* DIALOGS / MODALS OVERLAYS */}

      {/* 1. ADD SENSORY RECORD MODAL */}
      {isAddModalOpen && (
        <div className="modalOverlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modalContent card" onClick={(e) => e.stopPropagation()}>
            <div className="cardBody" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Sticky Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text-h)' }}>Add Sensory Record</h3>
                    <div className="muted" style={{ fontSize: '13px', marginTop: '2px' }}>Insert new measurements into the Tyne database registry.</div>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  style={{
                    background: 'var(--bg-soft)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-muted)',
                    transition: 'all 0.2s ease',
                    padding: 0
                  }}
                  title="Close Modal"
                  type="button"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              <form onSubmit={handleAddRecord} style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                {/* Scrollable Form Body Container */}
                <div style={{ maxHeight: '52vh', overflowY: 'auto', paddingRight: '8px', display: 'grid', gap: '20px', marginBottom: '4px' }}>
                  
                  {/* Section 1: Metadata */}
                  <div className="glassPanel" style={{ background: 'var(--bg-soft)', border: '1px solid var(--border)', display: 'grid', gap: '12px', padding: '16px' }}>
                    <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-h)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>1. Station Metadata</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <div className="field" style={{ marginBottom: 0 }}>
                        <span className="fieldLabel">Sensor Object ID</span>
                        <input className="input" type="number" value={formObjectId} onChange={(e) => setFormObjectId(e.target.value)} required />
                      </div>
                      <div className="field" style={{ marginBottom: 0 }}>
                        <span className="fieldLabel">Sample Date</span>
                        <input className="input" type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} required />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Chemical parameters */}
                  <div style={{ display: 'grid', gap: '12px' }}>
                    <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-h)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>2. Physical & Chemical Indicators</div>
                    
                    {/* Balanced 2-Column Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <div className="field" style={{ marginBottom: 0 }}>
                        <span className="fieldLabel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>pH Level</span>
                          <span className="pill" style={{ padding: '2px 8px', fontSize: '10px', fontWeight: 700, background: 'var(--primary-soft)', color: 'var(--primary)', borderColor: 'rgba(13, 148, 136, 0.12)', textTransform: 'uppercase', letterSpacing: '0.3px', margin: 0, height: 'auto', borderRadius: '4px' }}>
                            6.5 - 8.5
                          </span>
                        </span>
                        <input className="input" type="number" step="0.01" value={formPh} onChange={(e) => setFormPh(e.target.value)} required />
                      </div>
                      
                      <div className="field" style={{ marginBottom: 0 }}>
                        <span className="fieldLabel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>Alkalinity</span>
                          <span className="pill" style={{ padding: '2px 8px', fontSize: '10px', fontWeight: 700, background: 'var(--primary-soft)', color: 'var(--primary)', borderColor: 'rgba(13, 148, 136, 0.12)', textTransform: 'uppercase', letterSpacing: '0.3px', margin: 0, height: 'auto', borderRadius: '4px' }}>
                            &le; 500
                          </span>
                        </span>
                        <input className="input" type="number" step="0.1" value={formAlk} onChange={(e) => setFormAlk(e.target.value)} required />
                      </div>

                      <div className="field" style={{ marginBottom: 0 }}>
                        <span className="fieldLabel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>Conductivity</span>
                          <span className="pill" style={{ padding: '2px 8px', fontSize: '10px', fontWeight: 700, background: 'var(--primary-soft)', color: 'var(--primary)', borderColor: 'rgba(13, 148, 136, 0.12)', textTransform: 'uppercase', letterSpacing: '0.3px', margin: 0, height: 'auto', borderRadius: '4px' }}>
                            &le; 2000
                          </span>
                        </span>
                        <input className="input" type="number" step="0.1" value={formCond} onChange={(e) => setFormCond(e.target.value)} required />
                      </div>

                      <div className="field" style={{ marginBottom: 0 }}>
                        <span className="fieldLabel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>Nitrite</span>
                          <span className="pill" style={{ padding: '2px 8px', fontSize: '10px', fontWeight: 700, background: 'var(--primary-soft)', color: 'var(--primary)', borderColor: 'rgba(13, 148, 136, 0.12)', textTransform: 'uppercase', letterSpacing: '0.3px', margin: 0, height: 'auto', borderRadius: '4px' }}>
                            &lt; 1.0
                          </span>
                        </span>
                        <input className="input" type="number" step="0.0001" value={formNo2} onChange={(e) => setFormNo2(e.target.value)} required />
                      </div>
                    </div>

                    <div className="field" style={{ marginBottom: 0 }}>
                      <span className="fieldLabel">BOD (Oxygen Demand, mg/L)</span>
                      <input className="input" type="number" step="0.1" value={formBod} onChange={(e) => setFormBod(e.target.value)} required />
                    </div>
                  </div>

                  {/* Section 3: Soluble Elements */}
                  <div style={{ display: 'grid', gap: '12px' }}>
                    <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-h)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>3. Soluble Metal Elements (TDS components)</div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <div className="field" style={{ marginBottom: 0 }}>
                        <span className="fieldLabel">Copper (mg/L)</span>
                        <input className="input" type="number" step="0.01" value={formCu1} onChange={(e) => setFormCu1(e.target.value)} required />
                      </div>
                      <div className="field" style={{ marginBottom: 0 }}>
                        <span className="fieldLabel">Copper (&mu;g/L)</span>
                        <input className="input" type="number" step="0.1" value={formCu2} onChange={(e) => setFormCu2(e.target.value)} required />
                      </div>
                      <div className="field" style={{ marginBottom: 0 }}>
                        <span className="fieldLabel">Iron (&mu;g/L)</span>
                        <input className="input" type="number" step="0.1" value={formFe1} onChange={(e) => setFormFe1(e.target.value)} required />
                      </div>
                      <div className="field" style={{ marginBottom: 0 }}>
                        <span className="fieldLabel">Zinc (&mu;g/L)</span>
                        <input className="input" type="number" step="0.1" value={formZn} onChange={(e) => setFormZn(e.target.value)} required />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sticky Actions Footer */}
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '14px' }}>
                  <button className="btn" type="button" onClick={() => setIsAddModalOpen(false)}>Discard</button>
                  <button className="btn btnPrimary" type="submit">Submit Sensory Entry</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 2. EDIT SENSORY RECORD MODAL */}
      {isEditModalOpen && (
        <div className="modalOverlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="modalContent card" onClick={(e) => e.stopPropagation()}>
            <div className="cardBody" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Sticky Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(13, 148, 136, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text-h)' }}>Edit Sensory Record #{editingRecord?.objectId}</h3>
                    <div className="muted" style={{ fontSize: '13px', marginTop: '2px' }}>Modify the parameter values in the SQLite registry.</div>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  style={{
                    background: 'var(--bg-soft)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-muted)',
                    transition: 'all 0.2s ease',
                    padding: 0
                  }}
                  title="Close Modal"
                  type="button"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              <form onSubmit={handleEditRecord} style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                {/* Scrollable Form Body Container */}
                <div style={{ maxHeight: '52vh', overflowY: 'auto', paddingRight: '8px', display: 'grid', gap: '20px', marginBottom: '4px' }}>
                  
                  {/* Section 1: Metadata */}
                  <div className="glassPanel" style={{ background: 'var(--bg-soft)', border: '1px solid var(--border)', display: 'grid', gap: '12px', padding: '16px' }}>
                    <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-h)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>1. Station Metadata</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <div className="field" style={{ marginBottom: 0 }}>
                        <span className="fieldLabel">Record ID (Locked)</span>
                        <input className="input" type="number" value={editingRecord?.objectId} disabled style={{ opacity: 0.6, cursor: 'not-allowed', background: 'rgba(0,0,0,0.03)' }} />
                      </div>
                      <div className="field" style={{ marginBottom: 0 }}>
                        <span className="fieldLabel">Sample Date</span>
                        <input className="input" type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} required />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Chemical parameters */}
                  <div style={{ display: 'grid', gap: '12px' }}>
                    <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-h)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>2. Physical & Chemical Indicators</div>
                    
                    {/* Balanced 2-Column Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <div className="field" style={{ marginBottom: 0 }}>
                        <span className="fieldLabel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>pH Level</span>
                          <span className="pill" style={{ padding: '2px 8px', fontSize: '10px', fontWeight: 700, background: 'var(--primary-soft)', color: 'var(--primary)', borderColor: 'rgba(13, 148, 136, 0.12)', textTransform: 'uppercase', letterSpacing: '0.3px', margin: 0, height: 'auto', borderRadius: '4px' }}>
                            6.5 - 8.5
                          </span>
                        </span>
                        <input className="input" type="number" step="0.01" value={formPh} onChange={(e) => setFormPh(e.target.value)} required />
                      </div>
                      
                      <div className="field" style={{ marginBottom: 0 }}>
                        <span className="fieldLabel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>Alkalinity</span>
                          <span className="pill" style={{ padding: '2px 8px', fontSize: '10px', fontWeight: 700, background: 'var(--primary-soft)', color: 'var(--primary)', borderColor: 'rgba(13, 148, 136, 0.12)', textTransform: 'uppercase', letterSpacing: '0.3px', margin: 0, height: 'auto', borderRadius: '4px' }}>
                            &le; 500
                          </span>
                        </span>
                        <input className="input" type="number" step="0.1" value={formAlk} onChange={(e) => setFormAlk(e.target.value)} required />
                      </div>

                      <div className="field" style={{ marginBottom: 0 }}>
                        <span className="fieldLabel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>Conductivity</span>
                          <span className="pill" style={{ padding: '2px 8px', fontSize: '10px', fontWeight: 700, background: 'var(--primary-soft)', color: 'var(--primary)', borderColor: 'rgba(13, 148, 136, 0.12)', textTransform: 'uppercase', letterSpacing: '0.3px', margin: 0, height: 'auto', borderRadius: '4px' }}>
                            &le; 2000
                          </span>
                        </span>
                        <input className="input" type="number" step="0.1" value={formCond} onChange={(e) => setFormCond(e.target.value)} required />
                      </div>

                      <div className="field" style={{ marginBottom: 0 }}>
                        <span className="fieldLabel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>Nitrite</span>
                          <span className="pill" style={{ padding: '2px 8px', fontSize: '10px', fontWeight: 700, background: 'var(--primary-soft)', color: 'var(--primary)', borderColor: 'rgba(13, 148, 136, 0.12)', textTransform: 'uppercase', letterSpacing: '0.3px', margin: 0, height: 'auto', borderRadius: '4px' }}>
                            &lt; 1.0
                          </span>
                        </span>
                        <input className="input" type="number" step="0.0001" value={formNo2} onChange={(e) => setFormNo2(e.target.value)} required />
                      </div>
                    </div>

                    <div className="field" style={{ marginBottom: 0 }}>
                      <span className="fieldLabel">BOD (Oxygen Demand, mg/L)</span>
                      <input className="input" type="number" step="0.1" value={formBod} onChange={(e) => setFormBod(e.target.value)} required />
                    </div>
                  </div>

                  {/* Section 3: Soluble Elements */}
                  <div style={{ display: 'grid', gap: '12px' }}>
                    <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-h)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>3. Soluble Metal Elements (TDS components)</div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <div className="field" style={{ marginBottom: 0 }}>
                        <span className="fieldLabel">Copper (mg/L)</span>
                        <input className="input" type="number" step="0.01" value={formCu1} onChange={(e) => setFormCu1(e.target.value)} required />
                      </div>
                      <div className="field" style={{ marginBottom: 0 }}>
                        <span className="fieldLabel">Copper (&mu;g/L)</span>
                        <input className="input" type="number" step="0.1" value={formCu2} onChange={(e) => setFormCu2(e.target.value)} required />
                      </div>
                      <div className="field" style={{ marginBottom: 0 }}>
                        <span className="fieldLabel">Iron (&mu;g/L)</span>
                        <input className="input" type="number" step="0.1" value={formFe1} onChange={(e) => setFormFe1(e.target.value)} required />
                      </div>
                      <div className="field" style={{ marginBottom: 0 }}>
                        <span className="fieldLabel">Zinc (&mu;g/L)</span>
                        <input className="input" type="number" step="0.1" value={formZn} onChange={(e) => setFormZn(e.target.value)} required />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sticky Actions Footer */}
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '14px' }}>
                  <button className="btn" type="button" onClick={() => setIsEditModalOpen(false)}>Discard</button>
                  <button className="btn btnPrimary" type="submit">Save Parametric Changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
