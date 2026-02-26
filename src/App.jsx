import React, { useState, useMemo, useCallback } from 'react'
import apis from './data/apis.json'
import SearchBar from './components/SearchBar'
import FilterPanel from './components/FilterPanel'
import APICard from './components/APICard'
import DetailModal from './components/DetailModal'

const PAGE_SIZE = 60

function App() {
    const [search, setSearch] = useState('')
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [selectedAuth, setSelectedAuth] = useState(null)
    const [selectedCors, setSelectedCors] = useState(null)
    const [selectedAPI, setSelectedAPI] = useState(null)
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

    // Derive stats
    const categories = useMemo(() => {
        const cats = {}
        apis.forEach(api => {
            cats[api.category] = (cats[api.category] || 0) + 1
        })
        return Object.entries(cats).sort((a, b) => b[1] - a[1])
    }, [])

    const authTypes = useMemo(() => {
        const auths = {}
        apis.forEach(api => {
            auths[api.auth] = (auths[api.auth] || 0) + 1
        })
        return Object.entries(auths).sort((a, b) => b[1] - a[1])
    }, [])

    const corsTypes = useMemo(() => {
        const cors = {}
        apis.forEach(api => {
            cors[api.cors] = (cors[api.cors] || 0) + 1
        })
        return Object.entries(cors).sort((a, b) => b[1] - a[1])
    }, [])

    // Filter logic
    const filtered = useMemo(() => {
        let result = apis

        if (search) {
            const q = search.toLowerCase()
            result = result.filter(api =>
                api.name.toLowerCase().includes(q) ||
                api.description.toLowerCase().includes(q) ||
                api.category.toLowerCase().includes(q)
            )
        }

        if (selectedCategory) {
            result = result.filter(api => api.category === selectedCategory)
        }

        if (selectedAuth) {
            result = result.filter(api => api.auth === selectedAuth)
        }

        if (selectedCors) {
            result = result.filter(api => api.cors === selectedCors)
        }

        return result
    }, [search, selectedCategory, selectedAuth, selectedCors])

    // Reset visible count when filters change
    const handleSearchChange = useCallback((val) => {
        setSearch(val)
        setVisibleCount(PAGE_SIZE)
    }, [])

    const handleCategoryChange = useCallback((val) => {
        setSelectedCategory(val)
        setVisibleCount(PAGE_SIZE)
    }, [])

    const handleAuthChange = useCallback((val) => {
        setSelectedAuth(val)
        setVisibleCount(PAGE_SIZE)
    }, [])

    const handleCorsChange = useCallback((val) => {
        setSelectedCors(val)
        setVisibleCount(PAGE_SIZE)
    }, [])

    const hasFilters = selectedCategory || selectedAuth || selectedCors

    const clearFilters = () => {
        setSelectedCategory(null)
        setSelectedAuth(null)
        setSelectedCors(null)
        setVisibleCount(PAGE_SIZE)
    }

    const visibleApis = filtered.slice(0, visibleCount)
    const hasMore = visibleCount < filtered.length
    const remaining = filtered.length - visibleCount

    return (
        <div className="app">
            <header className="app-header">
                <div className="app-logo">
                    <div className="app-logo-icon">⚡</div>
                    <h1>API Finder</h1>
                </div>
                <p className="app-subtitle">
                    Discover {apis.length.toLocaleString()} free APIs across {categories.length} categories. Search, filter, build.
                </p>
            </header>

            <div className="stats-bar">
                <div className="stat-item">
                    <span className="stat-icon">📦</span>
                    <span className="stat-value">{apis.length.toLocaleString()}</span> APIs
                </div>
                <div className="stat-item">
                    <span className="stat-icon">🏷️</span>
                    <span className="stat-value">{categories.length}</span> Categories
                </div>
                <div className="stat-item">
                    <span className="stat-icon">🔓</span>
                    <span className="stat-value">{apis.filter(a => a.auth === 'none').length.toLocaleString()}</span> No Auth
                </div>
                <div className="stat-item">
                    <span className="stat-icon">🔒</span>
                    <span className="stat-value">{apis.filter(a => a.https).length.toLocaleString()}</span> HTTPS
                </div>
            </div>

            <SearchBar
                value={search}
                onChange={handleSearchChange}
                count={filtered.length}
                total={apis.length}
            />

            <FilterPanel
                categories={categories}
                authTypes={authTypes}
                corsTypes={corsTypes}
                selectedCategory={selectedCategory}
                selectedAuth={selectedAuth}
                selectedCors={selectedCors}
                onCategoryChange={handleCategoryChange}
                onAuthChange={handleAuthChange}
                onCorsChange={handleCorsChange}
                hasFilters={hasFilters}
                onClear={clearFilters}
            />

            {filtered.length > 0 ? (
                <>
                    <div className="api-grid" key={`${selectedCategory}-${selectedAuth}-${selectedCors}-${search}`}>
                        {visibleApis.map((api, i) => (
                            <APICard
                                key={api.name + api.url}
                                api={api}
                                onClick={() => setSelectedAPI(api)}
                                style={{ animationDelay: `${Math.min(i, 11) * 30}ms` }}
                            />
                        ))}
                    </div>
                    {hasMore && (
                        <div className="load-more-section">
                            <button
                                className="load-more-btn"
                                onClick={() => setVisibleCount(v => v + PAGE_SIZE)}
                            >
                                Load More ({Math.min(remaining, PAGE_SIZE)} of {remaining.toLocaleString()} remaining)
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="empty-state">
                    <div className="empty-state-icon">🔍</div>
                    <p className="empty-state-text">No APIs match your filters</p>
                    <p className="empty-state-sub">Try broadening your search or clearing filters</p>
                </div>
            )}

            {selectedAPI && (
                <DetailModal
                    api={selectedAPI}
                    onClose={() => setSelectedAPI(null)}
                />
            )}

            <footer className="app-footer">
                API Finder — Built with ⚡ by the community · Data sourced from{' '}
                <a href="https://github.com/public-apis/public-apis" target="_blank" rel="noopener">
                    public-apis
                </a>
                {' '}& <a href="https://apis.guru" target="_blank" rel="noopener">APIs.guru</a>
            </footer>
        </div>
    )
}

export default App
