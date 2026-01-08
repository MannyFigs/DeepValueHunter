import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ChevronLeft,
    ChevronRight,
    Globe,
    TrendingUp,
    Crown,
    Target,
    Eye,
    Wallet,
    FileSpreadsheet,
    LogIn,
} from 'lucide-react'
import logo from '../assets/logo.png'

const Sidebar = ({ activeTab, setActiveTab, isCollapsed, setIsCollapsed }) => {
    const menuItems = [
        { id: 'overview', label: 'Market Overview', Icon: Globe },
        { id: 'hot', label: 'Hot Stocks', Icon: TrendingUp },
        { id: 'investors', label: 'Super Investors', Icon: Crown, locked: true },
        { id: 'picks', label: 'DVH Picks', Icon: Target, locked: true },
        { id: 'watchlist', label: 'My Watchlist', Icon: Eye, locked: true },
        { id: 'portfolio', label: 'My Portfolio', Icon: Wallet, soon: true },
    ]

    const bottomItems = [
        { id: 'sheets', label: 'Google Sheets Add-On', Icon: FileSpreadsheet },
    ]

    const handleSidebarClick = (e) => {
        // Only expand if sidebar is collapsed and click is not on a button
        if (isCollapsed && !e.target.closest('button')) {
            setIsCollapsed(false)
        }
    }

    return (
        <motion.aside
            className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}
            initial={{ width: isCollapsed ? '80px' : '280px' }}
            animate={{ width: isCollapsed ? '80px' : '280px' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            onClick={handleSidebarClick}
            style={{ cursor: isCollapsed ? 'pointer' : 'default' }}
        >
            {/* Logo */}
            <div className="logo-container">
                <img src={logo} alt="DeepValueHunter Logo" className="logo-icon-img" />
                <span className={`logo-text ${isCollapsed ? 'hidden' : ''}`}>
                    Deep<span className="accent-text">Value</span>Hunter
                </span>
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                <div className="nav-group">
                    <span className={`nav-title ${isCollapsed ? 'nav-title-hidden' : ''}`}>NAVIGATION</span>
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            className={"nav-item " + (activeTab === item.id ? 'active' : '') + (item.locked || item.soon ? ' disabled' : '')}
                            onClick={() => !item.locked && !item.soon && setActiveTab(item.id)}
                            title={isCollapsed ? item.label : ''}
                        >
                            <span className="nav-icon">
                                <item.Icon size={20} />
                            </span>
                            <div className={`nav-label-container ${isCollapsed ? 'hidden' : ''}`}>
                                <span className="nav-label">{item.label}</span>
                                {item.locked && <span className="badge badge-signin">Sign in</span>}
                                {item.soon && <span className="badge badge-soon">Soon</span>}
                            </div>
                        </button>
                    ))}
                </div>
            </nav>

            {/* Footer */}
            <div className="sidebar-footer">
                {bottomItems.map((item) => (
                    <button
                        key={item.id}
                        className="nav-item"
                        onClick={() => setActiveTab(item.id)}
                        title={isCollapsed ? item.label : ''}
                    >
                        <span className="nav-icon">
                            <item.Icon size={20} />
                        </span>
                        <span className={`nav-label ${isCollapsed ? 'hidden' : ''}`}>
                            {item.label}
                        </span>
                    </button>
                ))}

                {/* Sign In Button */}
                <button className="signin-btn">
                    <span className="nav-icon">
                        <LogIn size={20} />
                    </span>
                    <div className={`signin-content ${isCollapsed ? 'hidden' : ''}`}>
                        <span className="signin-text">Sign In</span>
                        <span className="signin-subtext">For more features!</span>
                    </div>
                </button>

                {/* Collapse Button */}
                <button
                    className="collapse-btn-bottom"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    <span className="nav-icon">
                        {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    </span>
                    <span className={`nav-label ${isCollapsed ? 'hidden' : ''}`}>
                        {isCollapsed ? 'Expand' : 'Collapse'}
                    </span>
                </button>
            </div>
        </motion.aside>
    )
}

export default Sidebar
