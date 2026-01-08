# Safari Chart Loading Issues - Troubleshooting Guide

**Date:** January 2026
**Issue:** Charts fail to load on Safari/iOS while working on Chrome/Brave

---

## Summary

We discovered two separate issues causing charts to fail on Safari:

1. **Recharts ResponsiveContainer** - Safari has a known bug with ResponsiveContainer
2. **Yahoo Finance API rate limiting** - Yahoo applies stricter rate limits to Safari/mobile User-Agents

---

## Issue 1: ResponsiveContainer Safari Bug

### Symptoms
- Chart container renders with `width(-1) height(-1)` warnings
- Chart appears blank or doesn't render at all
- Works fine on Chrome/Brave but fails on Safari

### Root Cause
Safari has issues with Recharts `ResponsiveContainer` component, especially:
- When parent uses `flex-grow: 1`
- When dimensions aren't explicitly set
- On iOS Safari specifically

### Solution
**Remove ResponsiveContainer entirely** and use a ref-based approach to measure container width:

```jsx
const ChartWithDimensions = ({ data }) => {
    const containerRef = useRef(null)
    const [dimensions, setDimensions] = useState({ width: 400, height: 250 })

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const width = containerRef.current.offsetWidth
                setDimensions({ width: width > 0 ? width : 400, height: 250 })
            }
        }

        updateDimensions()
        window.addEventListener('resize', updateDimensions)
        const timer = setTimeout(updateDimensions, 100) // Catch layout shifts

        return () => {
            window.removeEventListener('resize', updateDimensions)
            clearTimeout(timer)
        }
    }, [])

    return (
        <div ref={containerRef} style={{ minHeight: '250px' }}>
            <AreaChart
                width={dimensions.width}
                height={dimensions.height}
                data={data}
            >
                {/* Chart contents */}
            </AreaChart>
        </div>
    )
}
```

### Key Points
- Use explicit `width` and `height` props on the chart component
- Measure container width with a ref
- Add resize listener for responsiveness
- Use `setTimeout` to catch layout shifts after initial render

---

## Issue 2: Yahoo Finance API Rate Limiting Safari

### Symptoms
- API returns HTTP 429 (Too Many Requests) on Safari
- Same requests work fine on Chrome/Brave
- Error: `HTTP error! status: 429`

### Root Cause
Yahoo Finance API applies different rate limits based on User-Agent header. Safari and mobile browsers are rate-limited more aggressively than desktop Chrome.

The Vite proxy forwards the original browser's User-Agent by default, so Yahoo sees:
- Safari: `Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15...`
- Chrome: `Mozilla/5.0 (Linux; Android...) Chrome/...`

### Solution
**Override the User-Agent header in the Vite proxy configuration:**

```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api/yahoo': {
        target: 'https://query1.finance.yahoo.com/v8/finance',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/yahoo/, ''),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      },
    },
  },
})
```

### Key Points
- The `headers` option overrides request headers sent to the target
- Use a desktop Chrome User-Agent to bypass mobile rate limiting
- This fix requires a **server restart** to take effect
- `changeOrigin: true` changes the Origin header but not User-Agent

---

## Issue 3: Safari Blocking sessionStorage (Cloudflare Tunnel)

### Symptoms
- Debug shows `Storage: BLOCKED`
- Cache items always show 0
- Every request hits the API (no caching)

### Root Cause
Safari's Intelligent Tracking Prevention (ITP) can block sessionStorage when:
- Accessing site through a tunnel/proxy (Cloudflare)
- Site is considered "third-party" context
- Private browsing mode

### Solution
**Implement an in-memory cache fallback:**

```javascript
const memoryCache = new Map()
let storageAvailable = null

function isStorageAvailable() {
    if (storageAvailable !== null) return storageAvailable
    try {
        const testKey = '__storage_test__'
        sessionStorage.setItem(testKey, testKey)
        sessionStorage.removeItem(testKey)
        storageAvailable = true
    } catch (e) {
        storageAvailable = false
        console.log('sessionStorage blocked, using in-memory cache')
    }
    return storageAvailable
}

function getCachedData(key) {
    if (isStorageAvailable()) {
        const cached = sessionStorage.getItem(key)
        return cached ? JSON.parse(cached) : null
    }
    return memoryCache.get(key) || null
}

function setCachedData(key, data) {
    const entry = { data, timestamp: Date.now() }
    memoryCache.set(key, entry) // Always set memory cache as backup

    if (isStorageAvailable()) {
        sessionStorage.setItem(key, JSON.stringify(entry))
    }
}
```

---

## Issue 4: iOS 26 Safari Liquid Glass Background Gap

### Symptoms
- A visible gap/line appears between the page content and Safari's bottom toolbar
- The dotted background doesn't extend into the iOS safe areas
- Status bar and toolbar areas show solid color instead of page background

### Root Cause
iOS 26 introduced the "Liquid Glass" design where Safari's toolbar is translucent and shows webpage content behind it. The issue was that `.layout-root` had `overflow: hidden` which was clipping the `body::before` pseudo-element that renders the dotted background.

### Solution
**Remove `overflow: hidden` from `.layout-root` and use `min-height` instead of `height`:**

```css
/* BEFORE (broken) */
.layout-root {
  display: flex;
  height: 100vh;
  background-color: transparent;
  overflow: hidden;  /* This clips the background! */
}

/* AFTER (fixed) */
.layout-root {
  display: flex;
  min-height: 100vh;
  background-color: transparent;
  /* No overflow: hidden */
}
```

### Key Points
- `overflow: hidden` on parent containers can clip `position: fixed` pseudo-elements
- The `body::before` pseudo-element extends to `-50px` top and bottom to cover safe areas
- iOS 26's Liquid Glass requires the background to extend beyond the viewport bounds
- Using `min-height` instead of `height` allows content to flow naturally

### Related CSS (index.css)
```css
/* html must be transparent to let body::before show through */
html {
  background: transparent;
}

/* body::before provides the dotted background */
body::before {
  content: "";
  position: fixed;
  top: -50px;
  left: 0;
  right: 0;
  bottom: -50px;
  background-color: var(--bg-dark);
  background-image: radial-gradient(circle, rgba(204, 255, 0, 0.05) 1px, transparent 1px);
  background-size: 40px 40px;
  z-index: -1;
  pointer-events: none;
}
```

---

## Debugging Tips

### Add Debug Panel
When troubleshooting, add a debug panel showing:
- Loading state
- Data availability
- Storage status
- Cache item count
- User Agent string
- API errors

### Test Buttons
Add separate test buttons for:
1. **Public API test** - fetch from jsonplaceholder.com to verify basic fetch works
2. **Simple Yahoo test** - minimal fetch to proxy to isolate the issue
3. **Full fetch** - complete API call with retry logic

### Check Server Logs
The Vite dev server logs show:
- HMR updates
- Proxy requests
- Any transform errors

---

## Files Modified

| File | Change |
|------|--------|
| `vite.config.js` | Added User-Agent header to Yahoo proxy |
| `src/services/api.js` | Added in-memory cache fallback, retry logic |
| `src/components/Dashboard.jsx` | Replaced ResponsiveContainer with ref-based sizing |
| `src/App.css` | Removed `overflow: hidden` from `.layout-root` for iOS 26 Liquid Glass |

---

## Testing Checklist

- [ ] Test on Safari iOS
- [ ] Test on Chrome iOS
- [ ] Test on Brave iOS
- [ ] Test on desktop Safari
- [ ] Test on desktop Chrome
- [ ] Test through Cloudflare tunnel
- [ ] Test on localhost directly

---

## Related Resources

- [Recharts ResponsiveContainer issues](https://github.com/recharts/recharts/issues/135)
- [Recharts Safari bug #2251](https://github.com/recharts/recharts/issues/2251)
- [shadcn/ui chart PR #8486](https://github.com/shadcn-ui/ui/pull/8486) - initialDimension fix
- [Safari ITP documentation](https://webkit.org/blog/category/privacy/)
