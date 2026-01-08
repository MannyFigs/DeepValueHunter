import React, { useState } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import HotStocks from './components/HotStocks'
import { Search, AlertCircle, User, Menu, X } from 'lucide-react'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('overview')
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Dashboard />
      case 'hot':
        return <HotStocks />
      default:
        return <Dashboard />
    }
  }

  // Auto-collapse sidebar when hovering outside of it
  const handleContentHover = () => {
    if (!isCollapsed) {
      setIsCollapsed(true)
    }
  }

  // Handle mobile menu tab selection
  const handleMobileTabSelect = (tab) => {
    setActiveTab(tab)
    setIsMobileMenuOpen(false)
  }

  return (
    <div className="layout-root">
      {/* Desktop Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-overlay" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Mobile Drawer */}
      <div className={`mobile-drawer ${isMobileMenuOpen ? 'open' : ''}`}>
        <Sidebar
          activeTab={activeTab}
          setActiveTab={handleMobileTabSelect}
          isCollapsed={false}
          setIsCollapsed={() => setIsMobileMenuOpen(false)}
          isMobile={true}
        />
      </div>

      <main className="content-area" onMouseEnter={handleContentHover}>
        {/* Header matching DVH style */}
        <header className="top-header">
          {/* Mobile hamburger menu */}
          <button
            className="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="header-left">
            <div className="logo-header">
              <span className="header-logo-text">Deep<span className="accent-text">Value</span>Hunter</span>
            </div>
          </div>

          <div className="search-container">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search stocks by symbol or name..."
              className="search-input"
            />
          </div>

          <div className="header-actions">
            <button className="btn-icon" title="Report an issue">
              <AlertCircle size={20} />
            </button>
            <button className="btn-signin">
              <User size={18} />
              <span>Sign In</span>
            </button>
          </div>
        </header>

        <div className="page-container">
          {renderContent()}
        </div>
      </main>
    </div>
  )
}

export default App
