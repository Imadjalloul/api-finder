import React from 'react'

export default function SearchBar({ value, onChange, count, total }) {
    return (
        <div className="search-section">
            <div className="search-wrapper">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search APIs by name, description, or category..."
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    autoFocus
                />
                <span className="search-icon">🔍</span>
            </div>
            {(value || count !== total) && (
                <p className="search-count">
                    Showing <span>{count}</span> of <span>{total}</span> APIs
                </p>
            )}
        </div>
    )
}
