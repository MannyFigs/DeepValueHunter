// API service for Deep Value Hunter

// Use relative paths for proxy in development
const DVH_API_BASE = '/api/dvh'
const BACKEND_API_BASE = '/api/price'
const YAHOO_FINANCE_BASE = '/api/yahoo'

// Cache for market index data to prevent rate limiting (429 errors)
// Using sessionStorage with in-memory fallback for Safari ITP
const CACHE_KEY_PREFIX = 'dvh_index_cache_'
const CACHE_DURATION = 60000 // 1 minute cache

// In-memory cache fallback for when sessionStorage is blocked (Safari ITP)
const memoryCache = new Map()
let storageAvailable = null

// Check if sessionStorage is available
function isStorageAvailable() {
    if (storageAvailable !== null) return storageAvailable
    try {
        const testKey = '__storage_test__'
        sessionStorage.setItem(testKey, testKey)
        sessionStorage.removeItem(testKey)
        storageAvailable = true
    } catch (e) {
        storageAvailable = false
        console.log('[API] sessionStorage blocked, using in-memory cache')
    }
    return storageAvailable
}

// Helper functions for cache (with in-memory fallback)
function getCachedData(key) {
    try {
        if (isStorageAvailable()) {
            const cached = sessionStorage.getItem(CACHE_KEY_PREFIX + key)
            if (cached) {
                return JSON.parse(cached)
            }
        } else {
            // Use in-memory cache
            return memoryCache.get(key) || null
        }
    } catch (e) {
        // Fallback to memory cache
        return memoryCache.get(key) || null
    }
    return null
}

function setCachedData(key, data) {
    const cacheEntry = {
        data,
        timestamp: Date.now()
    }

    // Always store in memory cache as backup
    memoryCache.set(key, cacheEntry)

    // Try sessionStorage if available
    if (isStorageAvailable()) {
        try {
            sessionStorage.setItem(CACHE_KEY_PREFIX + key, JSON.stringify(cacheEntry))
        } catch (e) {
            // Storage failed, but memory cache is set
        }
    }
}

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

// Debug helper - exposed for debugging Safari issues
export function getDebugInfo() {
    const cacheKeys = []
    const usingMemory = !isStorageAvailable()

    if (usingMemory) {
        // Report from memory cache
        memoryCache.forEach((value, key) => {
            cacheKeys.push({
                key: key,
                age: value ? Math.round((Date.now() - value.timestamp) / 1000) + 's' : 'invalid',
                hasData: value?.data ? 'yes' : 'no'
            })
        })
    } else {
        // Report from sessionStorage
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i)
            if (key && key.startsWith(CACHE_KEY_PREFIX)) {
                const cached = getCachedData(key.replace(CACHE_KEY_PREFIX, ''))
                cacheKeys.push({
                    key: key.replace(CACHE_KEY_PREFIX, ''),
                    age: cached ? Math.round((Date.now() - cached.timestamp) / 1000) + 's' : 'invalid',
                    hasData: cached?.data ? 'yes' : 'no'
                })
            }
        }
    }

    return {
        cacheCount: cacheKeys.length,
        cacheKeys,
        sessionStorageAvailable: isStorageAvailable(),
        usingMemoryCache: usingMemory,
        memoryCacheSize: memoryCache.size,
        cacheDuration: CACHE_DURATION / 1000 + 's'
    }
}

// Helper: delay function for retry logic
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

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

    // Check cache first to prevent rate limiting
    const cacheKey = `${indexName}-${range}`
    const cached = getCachedData(cacheKey)
    console.log(`[API] fetchMarketIndex called for ${indexName}, cache exists: ${!!cached}, viewport: ${window.innerWidth}x${window.innerHeight}`)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log(`[API] Returning cached data for ${indexName}`)
        return cached.data
    }
    console.log(`[API] Cache miss or expired for ${indexName}, fetching from API...`)

    // Retry logic for 429 errors
    const maxRetries = 3
    let lastError = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            // Add small delay between retries (exponential backoff)
            if (attempt > 1) {
                const waitTime = Math.pow(2, attempt - 1) * 1000 // 1s, 2s, 4s
                console.log(`[API] Retry ${attempt}/${maxRetries} for ${indexName}, waiting ${waitTime}ms...`)
                await delay(waitTime)
            }

            const response = await fetch(`${YAHOO_FINANCE_BASE}/chart/${symbol}?interval=1d&range=${range}`)

            if (response.status === 429) {
                console.warn(`[API] Rate limited (429) for ${indexName}, attempt ${attempt}/${maxRetries}`)
                lastError = new Error(`HTTP error! status: 429`)
                // If we have cached data and this is rate limiting, return it
                if (cached) {
                    console.log(`[API] Using stale cache for ${indexName} due to rate limit`)
                    return cached.data
                }
                continue // Try again
            }

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

            const indexData = {
                name: indexName,
                symbol: meta.symbol,
                price: lastPrice,
                currency: meta.currency,
                change: change,
                changePercent: changePercent,
                chartData: chartData
            }

            // Store in cache
            setCachedData(cacheKey, indexData)

            return indexData

        } catch (error) {
            lastError = error
            console.warn(`[API] Attempt ${attempt}/${maxRetries} failed for ${indexName}:`, error.message)
        }
    }

    // All retries exhausted
    if (cached) {
        console.warn(`[API] All retries failed for ${indexName}, using stale cache`)
        return cached.data
    }
    console.error(`[API] All retries failed for ${indexName}:`, lastError)
    throw lastError || new Error(`Failed to fetch ${indexName}`)
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
