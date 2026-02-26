import React from 'react'

export default function APICard({ api, onClick, style }) {
    const authClass =
        api.auth === 'none' ? 'auth-none' :
            api.auth === 'apiKey' ? 'auth-apikey' :
                'auth-oauth'

    const authLabel =
        api.auth === 'none' ? 'FREE' :
            api.auth === 'apiKey' ? 'API KEY' :
                'OAUTH'

    return (
        <div className="api-card" onClick={onClick} style={style}>
            <div className="api-card-header">
                <span className="api-card-name">{api.name}</span>
                <span className={`api-card-auth ${authClass}`}>{authLabel}</span>
            </div>
            <p className="api-card-desc">{api.description}</p>
            <div className="api-card-footer">
                <span className="api-card-category">{api.category}</span>
                <div className="api-card-badges">
                    {api.https && <span className="badge badge-https">HTTPS</span>}
                    <span className={`badge badge-cors-${api.cors}`}>
                        CORS {api.cors === 'yes' ? '✓' : api.cors === 'no' ? '✗' : '?'}
                    </span>
                </div>
            </div>
        </div>
    )
}
