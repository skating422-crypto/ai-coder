import React from 'react'

const TitleBar: React.FC = () => {
  return (
    <div className="titlebar-drag" style={{
      height: 32,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#fafafa',
      borderBottom: '1px solid var(--border-color)',
      paddingLeft: 12,
      paddingRight: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div className="titlebar-no-drag" style={{
          width: 12, height: 12, borderRadius: '50%',
          backgroundColor: '#ff5f57',
          cursor: 'pointer',
        }}
          onClick={() => window.electronAPI?.close()}
        />
        <div className="titlebar-no-drag" style={{
          width: 12, height: 12, borderRadius: '50%',
          backgroundColor: '#febc2e',
          cursor: 'pointer',
        }}
          onClick={() => window.electronAPI?.minimize()}
        />
        <div className="titlebar-no-drag" style={{
          width: 12, height: 12, borderRadius: '50%',
          backgroundColor: '#28c840',
          cursor: 'pointer',
        }}
          onClick={() => window.electronAPI?.maximize()}
        />
      </div>

      <div className="titlebar-no-drag" style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        paddingRight: 12,
      }}>
        <button style={{
          fontSize: 13,
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}>
          打开编辑器
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 17L17 7M17 7H7M17 7V17" />
          </svg>
        </button>
        <button style={{ color: 'var(--text-tertiary)', padding: 4 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default TitleBar
