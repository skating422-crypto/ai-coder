import React, { useState } from 'react'
import ChatInput from './ChatInput'
import NotificationCard from './NotificationCard'

interface MainContentProps {
  projectName: string
  branch: string
}

const MainContent: React.FC<MainContentProps> = ({ projectName, branch }) => {
  const [showNotification, setShowNotification] = useState(true)

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 60px',
      position: 'relative',
      overflow: 'auto',
    }}>
      {/* Center content */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        maxWidth: 680,
        gap: 24,
      }}>
        {/* Logo icon */}
        <div style={{
          width: 80,
          height: 80,
          borderRadius: 20,
          backgroundColor: '#f5f5f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 8,
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#c0c0c0" strokeWidth="1.5">
            <path d="M22 2L11 13" />
            <path d="M22 2L15 22L11 13L2 9L22 2Z" />
          </svg>
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: 28,
          fontWeight: 600,
          color: 'var(--text-primary)',
          letterSpacing: '-0.5px',
        }}>
          Quest on, hands off
        </h1>

        {/* Project info bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          fontSize: 13,
          color: 'var(--text-secondary)',
        }}>
          <span>运行于</span>
          <ProjectSelector icon="folder" label={projectName} />
          <ProjectSelector icon="monitor" label="本地模式" />
          <ProjectSelector icon="branch" label={branch} />
        </div>

        {/* Chat input */}
        <ChatInput />
      </div>

      {/* Notification card at bottom */}
      {showNotification && (
        <div style={{
          position: 'absolute',
          bottom: 40,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: 680,
        }}>
          <NotificationCard onClose={() => setShowNotification(false)} />
        </div>
      )}
    </div>
  )
}

interface ProjectSelectorProps {
  icon: 'folder' | 'monitor' | 'branch'
  label: string
}

const ProjectSelector: React.FC<ProjectSelectorProps> = ({ icon, label }) => {
  const icons = {
    folder: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
      </svg>
    ),
    monitor: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    branch: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="6" y1="3" x2="6" y2="15" />
        <circle cx="18" cy="6" r="3" />
        <circle cx="6" cy="18" r="3" />
        <path d="M18 9a9 9 0 01-9 9" />
      </svg>
    ),
  }

  return (
    <button style={{
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      padding: '4px 8px',
      borderRadius: 6,
      fontSize: 13,
      color: 'var(--text-secondary)',
      transition: 'background-color 0.15s',
    }}
      onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--hover-bg)')}
      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      {icons[icon]}
      {label}
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>
  )
}

export default MainContent
