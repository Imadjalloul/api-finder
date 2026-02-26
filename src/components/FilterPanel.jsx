import React from 'react'

export default function FilterPanel({
    categories,
    authTypes,
    corsTypes,
    selectedCategory,
    selectedAuth,
    selectedCors,
    onCategoryChange,
    onAuthChange,
    onCorsChange,
    hasFilters,
    onClear,
}) {
    const authLabels = {
        none: '🔓 No Auth',
        apiKey: '🔑 API Key',
        OAuth: '🔐 OAuth',
    }

    const corsLabels = {
        yes: '✅ Yes',
        no: '❌ No',
        unknown: '❓ Unknown',
    }

    return (
        <div className="filters-section">
            <div className="filter-row">
                <span className="filter-label">Category</span>
                {categories.map(([cat, count]) => (
                    <button
                        key={cat}
                        className={`filter-pill ${selectedCategory === cat ? 'active' : ''}`}
                        onClick={() => onCategoryChange(selectedCategory === cat ? null : cat)}
                    >
                        {cat}
                        <span className="pill-count">({count})</span>
                    </button>
                ))}
            </div>

            <div className="filter-row">
                <span className="filter-label">Auth</span>
                {authTypes.map(([auth, count]) => (
                    <button
                        key={auth}
                        className={`filter-pill ${selectedAuth === auth ? 'active' : ''}`}
                        onClick={() => onAuthChange(selectedAuth === auth ? null : auth)}
                    >
                        {authLabels[auth] || auth}
                        <span className="pill-count">({count})</span>
                    </button>
                ))}
            </div>

            <div className="filter-row">
                <span className="filter-label">CORS</span>
                {corsTypes.map(([cors, count]) => (
                    <button
                        key={cors}
                        className={`filter-pill ${selectedCors === cors ? 'active' : ''}`}
                        onClick={() => onCorsChange(selectedCors === cors ? null : cors)}
                    >
                        {corsLabels[cors] || cors}
                        <span className="pill-count">({count})</span>
                    </button>
                ))}
                {hasFilters && (
                    <button className="filter-clear" onClick={onClear}>
                        ✕ Clear all
                    </button>
                )}
            </div>
        </div>
    )
}
