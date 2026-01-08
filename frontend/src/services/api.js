// API service for Deep Value Hunter

// Use relative paths for proxy in development
const DVH_API_BASE = '/api/dvh'
const BACKEND_API_BASE = '/api/price'
const YAHOO_FINANCE_BASE = '/api/yahoo'

// Market indices symbols
const INDICES = {
    'S&P 500': '%5EGSPC',
    'Nasdaq 100': '%5ENDX',
    'Dow Jones': '%5EDJI',
    'US Dollar': 'DX-Y.NYB'
}

/**
 * Fetch trending stocks list
 * @returns {Promise<{stocks: Array, cached: boolean, lastUpdated: string}>}
 */
export async function fetchTrendingStocks() {
    try {
        const response = await fetch(`${DVH_API_BASE}/trending`)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        return data
    } catch (error) {
        console.error('Error fetching trending stocks:', error)
        throw error
    }
}

/**
 * Fetch price data for a single stock
 * @param {string} symbol - Stock ticker symbol
 * @returns {Promise<{price: number, change: number, changePercent: number, symbol: string}>}
 */
export async function fetchStockPrice(symbol) {
    try {
        const response = await fetch(`${BACKEND_API_BASE}/${symbol}`)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        return data
    } catch (error) {
        console.error(`Error fetching price for ${symbol}:`, error)
        throw error
    }
}

/**
 * Fetch trending stocks with their prices
 * @param {number} limit - Number of stocks to return (default 6)
 * @returns {Promise<Array<{symbol: string, name: string, price: number, change: number, changePercent: number, icon: string}>>}
 */
export async function fetchTrendingStocksWithPrices(limit = 6) {
    try {
        // First get the trending stocks list
        const trendingData = await fetchTrendingStocks()
        const stocks = trendingData.stocks.slice(0, limit)

        // Fetch prices for all stocks in parallel
        const stocksWithPrices = await Promise.all(
            stocks.map(async (stock) => {
                try {
                    const priceData = await fetchStockPrice(stock.symbol)
                    return {
                        symbol: stock.symbol,
                        name: stock.name,
                        price: priceData.price,
                        change: priceData.change,
                        changePercent: priceData.changePercent,
                        icon: stock.icon,
                        exchange: stock.exchange
                    }
                } catch (error) {
                    // Return stock without price data if price fetch fails
                    return {
                        symbol: stock.symbol,
                        name: stock.name,
                        price: null,
                        change: null,
                        changePercent: null,
                        icon: stock.icon,
                        exchange: stock.exchange
                    }
                }
            })
        )

        return stocksWithPrices
    } catch (error) {
        console.error('Error fetching trending stocks with prices:', error)
        throw error
    }
}

/**
 * Fetch market index data (price and chart)
 * @param {string} indexName - Name of the index (e.g., 'S&P 500', 'Nasdaq 100')
 * @param {string} range - Time range (e.g., '1d', '1mo', '3mo', '1y')
 * @returns {Promise<{name: string, price: number, change: number, changePercent: number, chartData: Array}>}
 */
export async function fetchMarketIndex(indexName, range = '1mo') {
    const symbol = INDICES[indexName]
    if (!symbol) {
        throw new Error(`Unknown index: ${indexName}`)
    }

    try {
        const response = await fetch(`${YAHOO_FINANCE_BASE}/chart/${symbol}?interval=1d&range=${range}`)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        const result = data.chart.result[0]
        const meta = result.meta
        const quotes = result.indicators.quote[0]
        const timestamps = result.timestamp

        // Format chart data for Recharts
        const chartData = timestamps.map((timestamp, index) => {
            const date = new Date(timestamp * 1000)
            return {
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                value: quotes.close[index]
            }
        }).filter(item => item.value !== null)

        // Calculate change from first to last
        const firstPrice = chartData[0]?.value || 0
        const lastPrice = meta.regularMarketPrice
        const change = lastPrice - firstPrice
        const changePercent = (change / firstPrice) * 100

        return {
            name: indexName,
            symbol: meta.symbol,
            price: lastPrice,
            currency: meta.currency,
            change: change,
            changePercent: changePercent,
            chartData: chartData
        }
    } catch (error) {
        console.error(`Error fetching index ${indexName}:`, error)
        throw error
    }
}

/**
 * Fetch all market indices
 * @param {string} range - Time range
 * @returns {Promise<Object>} - Object with index names as keys
 */
export async function fetchAllMarketIndices(range = '1mo') {
    const indexNames = Object.keys(INDICES)
    const results = {}

    await Promise.all(
        indexNames.map(async (name) => {
            try {
                results[name] = await fetchMarketIndex(name, range)
            } catch (error) {
                results[name] = null
            }
        })
    )

    return results
}
