import React, { useState, useEffect, useRef } from 'react'
import { ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid
} from 'recharts'
import { fetchMarketIndex, getDebugInfo } from '../services/api'

// Static test data - no API calls needed
const STATIC_CHART_DATA = [
    { date: 'Jan 1', value: 5800 },
    { date: 'Jan 8', value: 5850 },
    { date: 'Jan 15', value: 5920 },
    { date: 'Jan 22', value: 5880 },
    { date: 'Jan 29', value: 5950 },
    { date: 'Feb 5', value: 6020 },
    { date: 'Feb 12', value: 6100 },
    { date: 'Feb 19', value: 6050 },
    { date: 'Feb 26', value: 6180 },
    { date: 'Mar 5', value: 6250 },
]

// Index tabs configuration
const INDEX_TABS = ['S&P 500', 'Nasdaq 100', 'Dow Jones', 'US Dollar']
const INDEX_BADGES = {
    'S&P 500': '500',
    'Nasdaq 100': '100',
    'Dow Jones': 'DJI',
    'US Dollar': 'DXY'
}
const TIME_RANGES = [
    { label: '1D', value: '1d' },
    { label: '1M', value: '1mo' },
    { label: '3M', value: '3mo' },
    { label: '1Y', value: '1y' },
    { label: '5Y', value: '5y' },
    { label: 'All', value: 'max' }
]

const ChartTest = () => {
    const [activeIndex, setActiveIndex] = useState('S&P 500')
    const [activeTimeRange, setActiveTimeRange] = useState('1mo')
    const [indexData, setIndexData] = useState(null)
    const [indexLoading, setIndexLoading] = useState(false) // Start as false, don't auto-fetch
    const [apiError, setApiError] = useState(null)
    const [chartWidth, setChartWidth] = useState(350)
    const [requestCount, setRequestCount] = useState(0)
    const [cacheDebug, setCacheDebug] = useState(null)
    const [autoFetch, setAutoFetch] = useState(false) // Manual trigger for debugging
    const [testResult, setTestResult] = useState(null)
    const chartContainerRef = useRef(null)

    // Test fetch to public API to check if ANY fetch works
    const testSimpleFetch = async () => {
        setTestResult('Testing...')
        try {
            const response = await fetch('https://jsonplaceholder.typicode.com/posts/1')
            if (response.ok) {
                const data = await response.json()
                setTestResult(`OK! Got post: "${data.title.slice(0, 30)}..."`)
            } else {
                setTestResult(`Failed: HTTP ${response.status}`)
            }
        } catch (err) {
            setTestResult(`Error: ${err.message}`)
        }
    }

    // Test direct Yahoo Finance fetch (will fail with CORS but shows if it's reachable)
    const testYahooDirectFetch = async () => {
        setTestResult('Testing Yahoo direct...')
        try {
            const response = await fetch('/api/yahoo/chart/%5EGSPC?interval=1d&range=5d')
            if (response.ok) {
                setTestResult(`Yahoo OK! Status ${response.status}`)
            } else {
                setTestResult(`Yahoo failed: HTTP ${response.status}`)
            }
        } catch (err) {
            setTestResult(`Yahoo error: ${err.message}`)
        }
    }

    // Measure container width for chart sizing (Safari fix - no ResponsiveContainer)
    useEffect(() => {
        const updateWidth = () => {
            if (chartContainerRef.current) {
                const width = chartContainerRef.current.offsetWidth
                if (width > 0) {
                    setChartWidth(width - 20) // Small padding
                }
            }
        }
        updateWidth()
        window.addEventListener('resize', updateWidth)
        // Delayed update to catch layout shifts
        const timer = setTimeout(updateWidth, 200)
        return () => {
            window.removeEventListener('resize', updateWidth)
            clearTimeout(timer)
        }
    }, [])

    // Manual fetch function for debugging
    const doFetch = async () => {
        try {
            setIndexLoading(true)
            setApiError(null)
            setRequestCount(prev => prev + 1)
            console.log(`[ChartTest] Fetching ${activeIndex} - request #${requestCount + 1}`)
            const data = await fetchMarketIndex(activeIndex, activeTimeRange)
            setIndexData(data)
            setCacheDebug(getDebugInfo())
        } catch (err) {
            console.error('Failed to load index data:', err)
            setIndexData(null)
            setApiError(err.message || 'Unknown error')
            setCacheDebug(getDebugInfo())
        } finally {
            setIndexLoading(false)
        }
    }

    // Auto-fetch on mount or when autoFetch changes
    useEffect(() => {
        if (autoFetch) {
            doFetch()
        }
    }, [autoFetch, activeIndex, activeTimeRange])

    const formatPrice = (price) => {
        if (!price) return '--'
        return price.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
    }

    const getTimeRangeLabel = () => {
        const range = TIME_RANGES.find(r => r.value === activeTimeRange)
        if (!range) return ''
        switch (range.value) {
            case '1d': return 'Today'
            case '1mo': return 'Past month'
            case '3mo': return 'Past 3 months'
            case '1y': return 'Past year'
            case '5y': return 'Past 5 years'
            case 'max': return 'All time'
            default: return ''
        }
    }

    return (
        <div className="dashboard">
            <div className="hero-section">
                <h1 className="hero-title">Chart <span className="accent-text">Test</span> Page</h1>
                <p className="hero-subtitle">Testing Safari-compatible chart with initialDimension fix</p>
            </div>

            <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
                <h3 className="card-title">Market Indices (Safari Fix Test)</h3>
                <div className="indices-tabs-centered">
                    {INDEX_TABS.map((tab) => (
                        <button
                            key={tab}
                            className={`tab-btn ${activeIndex === tab ? 'active' : ''}`}
                            onClick={() => setActiveIndex(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <div className="index-header-row">
                    <div className="index-info">
                        <div className="index-badge">{INDEX_BADGES[activeIndex]}</div>
                        <span className="index-name">{activeIndex} Index</span>
                    </div>
                    <div className="index-price-section">
                        <div className="index-price">
                            <span className="price-large">
                                {indexLoading ? '...' : formatPrice(indexData?.price)}
                            </span>
                            <span className="price-currency">{indexData?.currency || 'USD'}</span>
                        </div>
                        <div className={`index-change ${indexData?.change >= 0 ? 'positive' : 'negative'}`}>
                            {indexData?.change >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                            {indexLoading ? '...' : (
                                <>
                                    {indexData?.change >= 0 ? '+' : ''}{indexData?.change?.toFixed(1) || '0'} {indexData?.change >= 0 ? '+' : ''}{indexData?.changePercent?.toFixed(2) || '0'}%
                                </>
                            )}
                            <span className="change-period">{getTimeRangeLabel()}</span>
                        </div>
                    </div>
                </div>
                <div className="time-filters">
                    {TIME_RANGES.map((range) => (
                        <button
                            key={range.value}
                            className={`time-btn ${activeTimeRange === range.value ? 'active' : ''}`}
                            onClick={() => setActiveTimeRange(range.value)}
                        >
                            {range.label}
                        </button>
                    ))}
                </div>

                {/* Debug info */}
                <div style={{ color: '#888', fontSize: '11px', marginBottom: '8px', padding: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', lineHeight: '1.6' }}>
                    <div style={{ marginBottom: '8px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        <button
                            onClick={doFetch}
                            disabled={indexLoading}
                            style={{
                                background: '#CCFF00',
                                color: '#000',
                                border: 'none',
                                padding: '8px 12px',
                                borderRadius: '4px',
                                fontWeight: 'bold',
                                cursor: indexLoading ? 'wait' : 'pointer',
                                fontSize: '11px'
                            }}
                        >
                            {indexLoading ? 'Loading...' : 'Fetch Yahoo'}
                        </button>
                        <button
                            onClick={testSimpleFetch}
                            style={{
                                background: '#4488ff',
                                color: '#fff',
                                border: 'none',
                                padding: '8px 12px',
                                borderRadius: '4px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                fontSize: '11px'
                            }}
                        >
                            Test Public API
                        </button>
                        <button
                            onClick={testYahooDirectFetch}
                            style={{
                                background: '#ff8844',
                                color: '#fff',
                                border: 'none',
                                padding: '8px 12px',
                                borderRadius: '4px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                fontSize: '11px'
                            }}
                        >
                            Test Yahoo Simple
                        </button>
                    </div>
                    {testResult && <div style={{ color: '#4488ff', marginBottom: '4px' }}>Test: {testResult}</div>}
                    <div>Loading: {indexLoading ? 'YES' : 'NO'} | Has Data: {indexData?.chartData ? 'YES' : 'NO'} | Width: {chartWidth}px</div>
                    <div>
                        Requests: {requestCount} |
                        Storage: {cacheDebug?.sessionStorageAvailable ? 'OK' : <span style={{color: '#ff6b6b'}}>BLOCKED</span>} |
                        {cacheDebug?.usingMemoryCache && <span style={{color: '#CCFF00'}}> Using Memory Cache</span>}
                    </div>
                    <div>Cache items: {cacheDebug?.cacheCount || 0} (memory: {cacheDebug?.memoryCacheSize || 0})</div>
                    {cacheDebug?.cacheKeys?.length > 0 && (
                        <div style={{color: '#CCFF00'}}>Cached: {cacheDebug.cacheKeys.map(c => `${c.key}(${c.age})`).join(', ')}</div>
                    )}
                    {apiError && <div style={{ color: '#ff6b6b' }}>Error: {apiError}</div>}
                    <div style={{ color: '#666', marginTop: '4px' }}>UA: {navigator.userAgent.slice(0, 60)}...</div>
                </div>

                {/* Chart container - NO ResponsiveContainer for Safari compatibility */}
                <div className="chart-container-full" ref={chartContainerRef} style={{ minHeight: '250px', height: '250px' }}>
                    {indexLoading ? (
                        <div className="loading-state">
                            <Loader2 className="spinner" size={24} />
                        </div>
                    ) : indexData?.chartData ? (
                        <AreaChart
                            width={chartWidth}
                            height={250}
                            data={indexData.chartData}
                            margin={{ top: 5, right: 0, left: 5, bottom: 5 }}
                        >
                            <defs>
                                <linearGradient id="chartGradientTest" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#CCFF00" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#CCFF00" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="date" stroke="#666" fontSize={11} />
                            <YAxis stroke="#666" fontSize={11} domain={['dataMin - 50', 'dataMax + 50']} orientation="right" tickFormatter={(value) => value.toLocaleString('en-US', { maximumFractionDigits: 0 })} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                itemStyle={{ color: '#CCFF00' }}
                                formatter={(value) => [value?.toLocaleString('en-US', { minimumFractionDigits: 2 }), 'Value']}
                            />
                            <Area type="monotone" dataKey="value" stroke="#CCFF00" strokeWidth={2} fill="url(#chartGradientTest)" />
                        </AreaChart>
                    ) : apiError ? (
                        <div>
                            <div style={{ color: '#ff6b6b', marginBottom: '12px' }}>API Failed - showing fallback static data:</div>
                            <AreaChart
                                width={chartWidth}
                                height={220}
                                data={STATIC_CHART_DATA}
                                margin={{ top: 5, right: 0, left: 5, bottom: 5 }}
                            >
                                <defs>
                                    <linearGradient id="fallbackGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ff6b6b" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#ff6b6b" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="date" stroke="#666" fontSize={11} />
                                <YAxis stroke="#666" fontSize={11} orientation="right" />
                                <Area type="monotone" dataKey="value" stroke="#ff6b6b" strokeWidth={2} fill="url(#fallbackGradient)" />
                            </AreaChart>
                        </div>
                    ) : (
                        <div className="error-state">
                            <span>Failed to load chart data</span>
                        </div>
                    )}
                </div>
            </div>

            {/* STATIC CHART - No API calls, pure rendering test */}
            <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
                <h3 className="card-title">Static Chart Test (No API)</h3>
                <p style={{ color: '#aaa', marginBottom: '16px' }}>This chart uses hardcoded data - if this doesn't show on Safari, it's a rendering issue.</p>
                <div style={{ width: '100%', height: '250px', minHeight: '250px' }}>
                    <AreaChart
                        width={350}
                        height={250}
                        data={STATIC_CHART_DATA}
                        margin={{ top: 5, right: 0, left: 5, bottom: 5 }}
                    >
                        <defs>
                            <linearGradient id="staticGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#00FFAA" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#00FFAA" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="date" stroke="#666" fontSize={11} />
                        <YAxis stroke="#666" fontSize={11} orientation="right" />
                        <Area type="monotone" dataKey="value" stroke="#00FFAA" strokeWidth={2} fill="url(#staticGradient)" />
                    </AreaChart>
                </div>
            </div>

            <div className="glass-card" style={{ padding: '24px' }}>
                <h4 style={{ color: '#fff', marginBottom: '12px' }}>What's different here:</h4>
                <ul style={{ color: '#aaa', lineHeight: '1.8' }}>
                    <li>Using <code style={{ color: '#CCFF00' }}>initialDimension</code> prop on ResponsiveContainer</li>
                    <li>Explicit <code style={{ color: '#CCFF00' }}>minHeight: 250px</code> on the container div</li>
                    <li>Static chart at bottom uses hardcoded data with fixed width/height</li>
                </ul>
            </div>
        </div>
    )
}

export default ChartTest
