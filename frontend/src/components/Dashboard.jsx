import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, ArrowDownRight, Eye, Crown, Gem, Loader2 } from 'lucide-react'
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid
} from 'recharts'
import { fetchTrendingStocksWithPrices, fetchMarketIndex } from '../services/api'

// TradingView Widget Components
const TradingViewTimeline = () => {
    const containerRef = useRef(null)

    useEffect(() => {
        // Delay widget initialization to let card animations complete first
        const timer = setTimeout(() => {
            const container = containerRef.current
            if (!container) return

            const script = document.createElement('script')
            script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-timeline.js'
            script.async = true
            script.innerHTML = JSON.stringify({
                "feedMode": "all_symbols",
                "isTransparent": true,
                "displayMode": "regular",
                "width": "100%",
                "height": "100%",
                "colorTheme": "dark",
                "locale": "en"
            })

            container.innerHTML = ''
            const widgetContainer = document.createElement('div')
            widgetContainer.className = 'tradingview-widget-container__widget'
            container.appendChild(widgetContainer)
            container.appendChild(script)
        }, 1000)

        return () => {
            clearTimeout(timer)
            if (containerRef.current) {
                containerRef.current.innerHTML = ''
            }
        }
    }, [])

    return (
        <div ref={containerRef} className="tradingview-widget-container" style={{ height: '400px', width: '100%' }}>
            <div className="tradingview-widget-container__widget"></div>
        </div>
    )
}

const TradingViewHeatmap = () => {
    const containerRef = useRef(null)

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const script = document.createElement('script')
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-stock-heatmap.js'
        script.async = true
        script.innerHTML = JSON.stringify({
            "exchanges": [],
            "dataSource": "SPX500",
            "grouping": "sector",
            "blockSize": "market_cap_basic",
            "blockColor": "change|1M",
            "locale": "en",
            "symbolUrl": "",
            "colorTheme": "dark",
            "hasTopBar": false,
            "isDataSet498": false,
            "isZoomEnabled": true,
            "hasSymbolTooltip": true,
            "isMonoSize": false,
            "width": "100%",
            "height": "100%"
        })

        container.innerHTML = ''
        const widgetContainer = document.createElement('div')
        widgetContainer.className = 'tradingview-widget-container__widget'
        container.appendChild(widgetContainer)
        container.appendChild(script)

        return () => {
            if (containerRef.current) {
                containerRef.current.innerHTML = ''
            }
        }
    }, [])

    return (
        <div ref={containerRef} className="tradingview-widget-container" style={{ height: '600px', width: '100%' }}>
            <div className="tradingview-widget-container__widget"></div>
        </div>
    )
}

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

const Dashboard = () => {
    const [trendingStocks, setTrendingStocks] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Market indices state
    const [activeIndex, setActiveIndex] = useState('S&P 500')
    const [activeTimeRange, setActiveTimeRange] = useState('1mo')
    const [indexData, setIndexData] = useState(null)
    const [indexLoading, setIndexLoading] = useState(true)

    // Detect if mobile for animation direction
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    useEffect(() => {
        let isFirstLoad = trendingStocks.length === 0

        const loadTrendingStocks = async () => {
            try {
                // Only show loading spinner on initial load, not refreshes
                if (isFirstLoad) {
                    setLoading(true)
                }
                const stocks = await fetchTrendingStocksWithPrices(6)
                setTrendingStocks(stocks)
                setError(null)
            } catch (err) {
                console.error('Failed to load trending stocks:', err)
                setError('Failed to load trending stocks')
            } finally {
                setLoading(false)
            }
        }

        // Delay initial data fetch to let card animations complete first
        const initialDelay = setTimeout(() => {
            loadTrendingStocks()
        }, 1000)

        // Refresh data every 60 seconds
        const interval = setInterval(() => {
            isFirstLoad = false
            loadTrendingStocks()
        }, 60000)

        return () => {
            clearTimeout(initialDelay)
            clearInterval(interval)
        }
    }, [])

    // Track if this is the first load for index data
    const isFirstIndexLoad = useRef(true)

    // Fetch market index data when active index or time range changes
    useEffect(() => {
        const loadIndexData = async () => {
            try {
                // Only show loading on first load or when switching tabs/time ranges
                if (isFirstIndexLoad.current) {
                    setIndexLoading(true)
                }
                const data = await fetchMarketIndex(activeIndex, activeTimeRange)
                setIndexData(data)
                isFirstIndexLoad.current = false
            } catch (err) {
                console.error('Failed to load index data:', err)
                setIndexData(null)
            } finally {
                setIndexLoading(false)
            }
        }

        // Delay initial fetch to let card animations complete, but not subsequent fetches
        if (isFirstIndexLoad.current) {
            const timer = setTimeout(() => {
                loadIndexData()
            }, 1000)
            return () => clearTimeout(timer)
        } else {
            loadIndexData()
        }
    }, [activeIndex, activeTimeRange])

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
                <h1 className="hero-title">Discover <span className="accent-text">Undervalued</span> Stocks</h1>
                <p className="hero-subtitle">Tools to help you find hidden gems in the market</p>
            </div>

            <div className="dashboard-grid">
                <motion.div
                    className="glass-card trending-card"
                    initial={{ opacity: 0, x: isMobile ? 0 : -30, y: isMobile ? 20 : 0 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
                >
                    <h3 className="card-title">Trending Stocks</h3>
                    <div className="stock-list">
                        {loading ? (
                            <div className="loading-state">
                                <Loader2 className="spinner" size={24} />
                                <span>Loading stocks...</span>
                            </div>
                        ) : error ? (
                            <div className="error-state">
                                <span>{error}</span>
                            </div>
                        ) : (
                            trendingStocks.map((stock) => (
                                <a href={`https://dvh-frontend-newwebsite.vercel.app/stock/${stock.symbol}`} className="stock-item" key={stock.symbol} target="_blank" rel="noopener noreferrer">
                                    <div className="stock-left">
                                        {stock.icon ? (
                                            <img
                                                src={stock.icon}
                                                alt={stock.name}
                                                className="stock-icon-img"
                                                onError={(e) => {
                                                    e.target.style.display = 'none'
                                                    e.target.nextSibling.style.display = 'flex'
                                                }}
                                            />
                                        ) : null}
                                        <div className="stock-icon" style={{ display: stock.icon ? 'none' : 'flex' }}>
                                            <span>{stock.symbol[0]}</span>
                                        </div>
                                        <div className="stock-info">
                                            <span className="stock-symbol">{stock.symbol}</span>
                                            <span className="stock-name">{stock.name}</span>
                                        </div>
                                    </div>
                                    <div className="stock-right">
                                        {stock.price !== null ? (
                                            <>
                                                <span className="stock-price">${stock.price.toFixed(2)}</span>
                                                <span className={`stock-change ${stock.change >= 0 ? 'positive' : 'negative'}`}>
                                                    {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}({stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                                                </span>
                                            </>
                                        ) : (
                                            <span className="stock-price">--</span>
                                        )}
                                    </div>
                                </a>
                            ))
                        )}
                    </div>
                </motion.div>

                <motion.div
                    className="glass-card indices-card"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
                >
                    <h3 className="card-title">Market Indices</h3>
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
                    <div className="chart-container-full">
                        {indexLoading ? (
                            <div className="loading-state">
                                <Loader2 className="spinner" size={24} />
                            </div>
                        ) : indexData?.chartData ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={indexData.chartData} margin={{ top: 5, right: 0, left: 5, bottom: 5 }}>
                                    <defs>
                                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
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
                                    <Area type="monotone" dataKey="value" stroke="#CCFF00" strokeWidth={2} fill="url(#chartGradient)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="error-state">
                                <span>Failed to load chart data</span>
                            </div>
                        )}
                    </div>
                </motion.div>

                <motion.div
                    className="glass-card news-card"
                    initial={{ opacity: 0, x: isMobile ? 0 : 30, y: isMobile ? 20 : 0 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
                >
                    <h3 className="card-title">Market News</h3>
                    <TradingViewTimeline />
                </motion.div>
            </div>

            <div className="glass-card heatmap-section">
                <h3>S&P 500 - 1 Month Performance</h3>
                <TradingViewHeatmap />
            </div>

            <div className="feature-cards">
                <a href="#" className="feature-card glass-card">
                    <div className="feature-icon"><Eye size={24} color="#CCFF00" /></div>
                    <div className="feature-content"><h4>My Watchlist</h4><p>Track and monitor your favorite stocks</p></div>
                </a>
                <a href="#" className="feature-card glass-card">
                    <div className="feature-icon"><Crown size={24} color="#CCFF00" /></div>
                    <div className="feature-content"><h4>Super Investors</h4><p>See what stocks top investors are buying</p></div>
                </a>
                <a href="#" className="feature-card glass-card">
                    <div className="feature-icon"><Gem size={24} color="#CCFF00" /></div>
                    <div className="feature-content"><h4>Deep Value Hunter Picks</h4><p>Curated Deep Value Hunter stock picks</p></div>
                </a>
            </div>

            <footer className="dashboard-footer">
                <div className="footer-left">
                    <span>© 2024 DeepValueHunter</span>
                    <span className="footer-sep">•</span>
                    <span>Charts by <a href="https://www.tradingview.com/" target="_blank" rel="noopener noreferrer">TradingView</a></span>
                </div>
                <div className="footer-right">
                    <a href="#">Privacy</a>
                    <a href="#">Terms</a>
                    <a href="#">Google Sheets Add-On</a>
                </div>
            </footer>
        </div>
    )
}

export default Dashboard
