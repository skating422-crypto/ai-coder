import React, { useState } from 'react'

interface Quest {
  id: string
  title: string
  daysAgo: number
}

interface Project {
  name: string
  quests: Quest[]
}

interface SidebarProps {
  projects: Project[]
}

const Sidebar: React.FC<SidebarProps> = ({ projects }) => {
  const [selectedQuest, setSelectedQuest] = useState<string | null>(null)

  return (
    <div style={{
      width: 'var(--sidebar-width)',
      minWidth: 240,
      backgroundColor: 'var(--sidebar-bg)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    }}>
      {/* Top toolbar */}
      <div style={{
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <button style={{
          color: 'var(--text-tertiary)',
          padding: 4,
          borderRadius: 4,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
          </svg>
        </button>
        <button style={{
          color: 'var(--text-tertiary)',
          padding: 4,
          borderRadius: 4,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
        </button>
      </div>

      {/* Create Quest button */}
      <div style={{ padding: '0 12px 12px' }}>
        <button style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          borderRadius: 8,
          border: '1px solid var(--border-color)',
          backgroundColor: '#fff',
          fontSize: 14,
          color: 'var(--text-primary)',
          transition: 'background-color 0.15s',
        }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--hover-bg)')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#fff')}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 16 }}>+</span>
            创建 Quest
          </span>
          <span style={{
            fontSize: 12,
            color: 'var(--text-tertiary)',
            fontFamily: 'monospace',
          }}>
            Ctrl N
          </span>
        </button>
      </div>

      {/* Quests header */}
      <div style={{
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{
          fontSize: 12,
          fontWeight: 500,
          color: 'var(--text-tertiary)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          Quests
        </span>
        <div style={{ display: 'flex', gap: 4 }}>
          <button style={{ color: 'var(--text-tertiary)', padding: 2 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <button style={{ color: 'var(--text-tertiary)', padding: 2 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>
        </div>
      </div>

      {/* Quest list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px' }}>
        {projects.map(project => (
          <div key={project.name}>
            {/* Project folder */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 8px',
              fontSize: 13,
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              borderRadius: 6,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
              </svg>
              {project.name}
            </div>

            {/* Quest items */}
            {project.quests.map(quest => (
              <div
                key={quest.id}
                onClick={() => setSelectedQuest(quest.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px 8px 32px',
                  fontSize: 13,
                  color: selectedQuest === quest.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                  backgroundColor: selectedQuest === quest.id ? 'var(--hover-bg)' : 'transparent',
                  borderRadius: 6,
                  cursor: 'pointer',
                  transition: 'background-color 0.1s',
                }}
                onMouseEnter={e => {
                  if (selectedQuest !== quest.id) {
                    e.currentTarget.style.backgroundColor = 'var(--hover-bg)'
                  }
                }}
                onMouseLeave={e => {
                  if (selectedQuest !== quest.id) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: '#d0d0d0',
                  }} />
                  <span>{quest.title}</span>
                </div>
                <span style={{
                  fontSize: 12,
                  color: 'var(--text-tertiary)',
                  whiteSpace: 'nowrap',
                }}>
                  {quest.daysAgo}天
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Bottom section */}
      <div style={{
        borderTop: '1px solid var(--border-color)',
        padding: '8px 12px',
      }}>
        <button style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 8px',
          width: '100%',
          fontSize: 13,
          color: 'var(--text-secondary)',
          borderRadius: 6,
          transition: 'background-color 0.15s',
        }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--hover-bg)')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="9" y1="21" x2="9" y2="9" />
          </svg>
          知识中心
        </button>
        <button style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 8px',
          width: '100%',
          fontSize: 13,
          color: 'var(--text-secondary)',
          borderRadius: 6,
          transition: 'background-color 0.15s',
        }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--hover-bg)')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
          </svg>
          插件市场
        </button>
      </div>

      {/* User area */}
      <div style={{
        borderTop: '1px solid var(--border-color)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: '#e0e0e0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--text-secondary)',
          }}>
            S
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>skating</div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Community</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button style={{ color: 'var(--text-tertiary)', padding: 4 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" /><path d="M12 8h.01" />
            </svg>
          </button>
          <button style={{ color: 'var(--text-tertiary)', padding: 4 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
