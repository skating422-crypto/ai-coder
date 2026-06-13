import React from 'react'

interface NotificationCardProps {
  onClose: () => void
}

const NotificationCard: React.FC<NotificationCardProps> = ({ onClose }) => {
  return (
    <div style={{
      border: '1px solid var(--border-color)',
      borderRadius: 12,
      backgroundColor: '#fff',
      padding: '20px 24px',
      display: 'flex',
      gap: 16,
      alignItems: 'flex-start',
      position: 'relative',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    }}>
      {/* Thumbnail */}
      <div style={{
        width: 100,
        height: 72,
        borderRadius: 8,
        backgroundColor: '#e8f5e9',
        backgroundImage: 'linear-gradient(135deg, #c8e6c9 0%, #a5d6a7 50%, #81c784 100%)',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}>
        <div style={{
          width: 70,
          height: 50,
          borderRadius: 4,
          backgroundColor: 'rgba(255,255,255,0.7)',
          display: 'flex',
          flexDirection: 'column',
          padding: 6,
          gap: 3,
        }}>
          <div style={{ height: 3, width: '80%', backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: 2 }} />
          <div style={{ height: 3, width: '60%', backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 2 }} />
          <div style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 2, marginTop: 2 }} />
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1 }}>
        <h3 style={{
          fontSize: 15,
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: 6,
        }}>
          全新 Quest 视窗
        </h3>
        <p style={{
          fontSize: 13,
          color: 'var(--text-secondary)',
          lineHeight: '1.6',
          marginBottom: 4,
        }}>
          你的 Agent-First 开发工作台 — 委派任务、追踪状态、审查产物。
        </p>
        <p style={{
          fontSize: 13,
          color: 'var(--text-secondary)',
          lineHeight: '1.6',
        }}>
          <strong style={{ color: 'var(--text-primary)' }}>智能体模式：</strong>
          智能体自主执行，端到端交付任务。
        </p>
        <p style={{
          fontSize: 13,
          color: 'var(--text-secondary)',
          lineHeight: '1.6',
        }}>
          <strong style={{ color: 'var(--text-primary)' }}>专家团模式：</strong>
          多智能体协同并行，适合全栈开发、技术调研与疑难修复。
        </p>
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          width: 24,
          height: 24,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-tertiary)',
          transition: 'background-color 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--hover-bg)')}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  )
}

export default NotificationCard
