import React, { useState } from 'react'
import { TrendingUp, TrendingDown, Activity, ChevronDown } from 'lucide-react'

const HotStocks = () => {
    // Track which categories are expanded on mobile (show all 20 stocks)
    const [expandedCategories, setExpandedCategories] = useState({})

    const toggleCategory = (idx) => {
        setExpandedCategories(prev => ({
            ...prev,
            [idx]: !prev[idx]
        }))
    }

    const categories = [
        {
            title: 'Trending',
            color: 'white-text',
            icon: 'up',
            stocks: [
                { symbol: 'NVDA', name: 'NVIDIA Corp', price: '721.33', change: '+4.5%' },
                { symbol: 'SOFI', name: 'SoFi Tech', price: '8.44', change: '+2.1%' },
                { symbol: 'TSLA', name: 'Tesla, Inc.', price: '193.31', change: '-1.2%' },
                { symbol: 'AAPL', name: 'Apple Inc.', price: '182.52', change: '+1.8%' },
                { symbol: 'MSFT', name: 'Microsoft Corp', price: '378.91', change: '+0.9%' },
                { symbol: 'AMZN', name: 'Amazon.com', price: '178.25', change: '+2.3%' },
                { symbol: 'META', name: 'Meta Platforms', price: '485.12', change: '+3.1%' },
                { symbol: 'GOOGL', name: 'Alphabet Inc.', price: '141.80', change: '+1.5%' },
                { symbol: 'AMD', name: 'AMD Inc.', price: '142.55', change: '+2.8%' },
                { symbol: 'INTC', name: 'Intel Corp', price: '42.63', change: '-0.5%' },
                { symbol: 'CRM', name: 'Salesforce', price: '267.45', change: '+1.9%' },
                { symbol: 'ORCL', name: 'Oracle Corp', price: '118.32', change: '+2.1%' },
                { symbol: 'ADBE', name: 'Adobe Inc.', price: '542.18', change: '+1.4%' },
                { symbol: 'NFLX', name: 'Netflix Inc.', price: '478.92', change: '+3.2%' },
                { symbol: 'DIS', name: 'Walt Disney', price: '95.44', change: '-0.8%' },
                { symbol: 'PYPL', name: 'PayPal Corp', price: '62.15', change: '-1.5%' },
                { symbol: 'SQ', name: 'Block Inc.', price: '71.33', change: '+2.7%' },
                { symbol: 'SHOP', name: 'Shopify Inc.', price: '68.21', change: '+4.1%' },
                { symbol: 'UBER', name: 'Uber Tech', price: '62.88', change: '+1.6%' },
                { symbol: 'ABNB', name: 'Airbnb Inc.', price: '142.55', change: '+0.9%' },
            ]
        },
        {
            title: 'Top Gainers',
            color: 'accent-text',
            icon: 'up',
            stocks: [
                { symbol: 'PLTR', name: 'Palantir Tech', price: '24.12', change: '+12.4%' },
                { symbol: 'ARM', name: 'Arm Holdings', price: '128.55', change: '+8.2%' },
                { symbol: 'SMCI', name: 'Super Micro', price: '822.10', change: '+6.8%' },
                { symbol: 'RIVN', name: 'Rivian Auto', price: '18.33', change: '+5.9%' },
                { symbol: 'COIN', name: 'Coinbase', price: '178.44', change: '+5.2%' },
                { symbol: 'MARA', name: 'Marathon Digital', price: '22.15', change: '+4.8%' },
                { symbol: 'RIOT', name: 'Riot Platforms', price: '12.87', change: '+4.5%' },
                { symbol: 'UPST', name: 'Upstart Holdings', price: '32.10', change: '+4.1%' },
                { symbol: 'SOUN', name: 'SoundHound AI', price: '4.85', change: '+3.9%' },
                { symbol: 'IONQ', name: 'IonQ Inc.', price: '12.33', change: '+3.7%' },
                { symbol: 'AFRM', name: 'Affirm Holdings', price: '42.18', change: '+3.5%' },
                { symbol: 'PATH', name: 'UiPath Inc.', price: '18.92', change: '+3.3%' },
                { symbol: 'DKNG', name: 'DraftKings', price: '38.44', change: '+3.1%' },
                { symbol: 'HOOD', name: 'Robinhood', price: '12.55', change: '+2.9%' },
                { symbol: 'RBLX', name: 'Roblox Corp', price: '42.21', change: '+2.7%' },
                { symbol: 'OPEN', name: 'Opendoor Tech', price: '3.88', change: '+2.5%' },
                { symbol: 'SOFI', name: 'SoFi Tech', price: '8.92', change: '+2.4%' },
                { symbol: 'NU', name: 'Nu Holdings', price: '11.33', change: '+2.2%' },
                { symbol: 'GRAB', name: 'Grab Holdings', price: '3.45', change: '+2.0%' },
                { symbol: 'SE', name: 'Sea Limited', price: '48.72', change: '+1.9%' },
            ]
        },
        {
            title: 'Bottom Losers',
            color: 'red-text',
            icon: 'down',
            stocks: [
                { symbol: 'SNAP', name: 'Snap Inc.', price: '11.02', change: '-34.5%' },
                { symbol: 'NYCB', name: 'NY Community', price: '4.21', change: '-12.0%' },
                { symbol: 'PARA', name: 'Paramount', price: '12.45', change: '-8.7%' },
                { symbol: 'WBD', name: 'Warner Bros', price: '8.92', change: '-6.3%' },
                { symbol: 'BABA', name: 'Alibaba Group', price: '73.21', change: '-5.1%' },
                { symbol: 'NIO', name: 'NIO Inc.', price: '5.44', change: '-4.8%' },
                { symbol: 'LCID', name: 'Lucid Group', price: '3.21', change: '-4.2%' },
                { symbol: 'PLUG', name: 'Plug Power', price: '2.87', change: '-3.9%' },
                { symbol: 'XPEV', name: 'XPeng Inc.', price: '8.33', change: '-3.5%' },
                { symbol: 'LI', name: 'Li Auto Inc.', price: '22.45', change: '-3.2%' },
                { symbol: 'PINS', name: 'Pinterest', price: '32.18', change: '-2.9%' },
                { symbol: 'ROKU', name: 'Roku Inc.', price: '58.44', change: '-2.7%' },
                { symbol: 'DOCU', name: 'DocuSign', price: '52.33', change: '-2.5%' },
                { symbol: 'ZM', name: 'Zoom Video', price: '62.15', change: '-2.3%' },
                { symbol: 'DASH', name: 'DoorDash', price: '98.72', change: '-2.1%' },
                { symbol: 'SPOT', name: 'Spotify', price: '182.55', change: '-1.9%' },
                { symbol: 'TWLO', name: 'Twilio Inc.', price: '58.21', change: '-1.7%' },
                { symbol: 'OKTA', name: 'Okta Inc.', price: '82.44', change: '-1.5%' },
                { symbol: 'CRWD', name: 'CrowdStrike', price: '215.33', change: '-1.3%' },
                { symbol: 'ZS', name: 'Zscaler Inc.', price: '178.92', change: '-1.1%' },
            ]
        }
    ]

    return (
        <div className="page-view animate-fade-in">
            <div className="dashboard-header">
                <h1 className="dashboard-title">Hot <span className="accent-text">Stocks</span></h1>
                <div className="glass-card status-pill">
                    <Activity size={16} className="emerald-text" />
                    <span>Live Market Data</span>
                </div>
            </div>

            <div className="hot-stocks-grid">
                {categories.map((cat, idx) => {
                    const isExpanded = expandedCategories[idx]
                    const MOBILE_LIMIT = 10
                    const hasMore = cat.stocks.length > MOBILE_LIMIT

                    return (
                        <div key={idx} className="glass-card stock-category">
                            <div className="cat-header">
                                <h3 className={cat.color}>{cat.title}</h3>
                                {cat.icon === 'down' ? (
                                    <TrendingDown size={18} className="text-muted" />
                                ) : (
                                    <TrendingUp size={18} className="text-muted" />
                                )}
                            </div>
                            <div className="stock-list-wide">
                                {cat.stocks.map((stock, stockIdx) => (
                                    <div
                                        key={`${stock.symbol}-${stockIdx}`}
                                        className={`stock-row ${!isExpanded && stockIdx >= MOBILE_LIMIT ? 'mobile-hidden' : ''}`}
                                    >
                                        <div className="stock-main">
                                            <div className="stock-avatar">{stock.symbol[0]}</div>
                                            <div className="stock-info">
                                                <span className="stock-ticker">{stock.symbol}</span>
                                                <span className="stock-full-name">{stock.name}</span>
                                            </div>
                                        </div>
                                        <div className="stock-price-group">
                                            <span className="stock-p">${stock.price}</span>
                                            <span className={`stock-c ${stock.change.startsWith('+') ? 'accent-text' : 'red-text'}`}>
                                                {stock.change}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {hasMore && (
                                <button
                                    className="view-more-btn mobile-only"
                                    onClick={() => toggleCategory(idx)}
                                >
                                    <span>{isExpanded ? 'Show Less' : `View ${cat.stocks.length - MOBILE_LIMIT} More`}</span>
                                    <ChevronDown size={16} className={isExpanded ? 'rotated' : ''} />
                                </button>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default HotStocks
