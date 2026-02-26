import React, { useState, useEffect } from 'react'

export default function DetailModal({ api, onClose }) {
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', handleEsc)
        document.body.style.overflow = 'hidden'
        return () => {
            document.removeEventListener('keydown', handleEsc)
            document.body.style.overflow = ''
        }
    }, [onClose])

    const copyUrl = () => {
        navigator.clipboard.writeText(api.url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const authColor =
        api.auth === 'none' ? 'var(--green)' :
            api.auth === 'apiKey' ? 'var(--yellow)' :
                'var(--orange)'

    const corsColor =
        api.cors === 'yes' ? 'var(--green)' :
            api.cors === 'no' ? 'var(--red)' :
                'var(--text-muted)'

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>✕</button>

                <h2 className="modal-name">{api.name}</h2>
                <p className="modal-desc">{api.description}</p>

                <div className="modal-meta">
                    <div className="modal-meta-item">
                        <div className="modal-meta-label">Category</div>
                        <div className="modal-meta-value">{api.category}</div>
                    </div>
                    <div className="modal-meta-item">
                        <div className="modal-meta-label">Auth</div>
                        <div className="modal-meta-value" style={{ color: authColor }}>
                            {api.auth === 'none' ? '🔓 No Auth Required' :
                                api.auth === 'apiKey' ? '🔑 API Key' :
                                    '🔐 OAuth 2.0'}
                        </div>
                    </div>
                    <div className="modal-meta-item">
                        <div className="modal-meta-label">HTTPS</div>
                        <div className="modal-meta-value" style={{ color: api.https ? 'var(--green)' : 'var(--red)' }}>
                            {api.https ? '✅ Yes' : '❌ No'}
                        </div>
                    </div>
                    <div className="modal-meta-item">
                        <div className="modal-meta-label">CORS</div>
                        <div className="modal-meta-value" style={{ color: corsColor }}>
                            {api.cors === 'yes' ? '✅ Enabled' :
                                api.cors === 'no' ? '❌ Disabled' :
                                    '❓ Unknown'}
                        </div>
                    </div>
                </div>

                <a
                    className="modal-url-btn"
                    href={api.url}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Open API Documentation →
                </a>

                <button
                    className={`modal-copy-btn ${copied ? 'copied' : ''}`}
                    onClick={copyUrl}
                >
                    {copied ? '✓ URL Copied!' : '📋 Copy API URL'}
                </button>
            </div>
        </div>
    )
}
