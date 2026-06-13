import React, { useState } from 'react'

const ChatInput: React.FC = () => {
  const [message, setMessage] = useState('')

  return (
    <div style={{
      width: '100%',
      border: '1px solid var(--border-color)',
      borderRadius: 12,
      backgroundColor: '#fff',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    }}>
      {/* Text area */}
      <div style={{ padding: '16px 16px 8px' }}>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="描述计划，@ 引用上下文，/ 使用命令"
          style={{
            width: '100%',
            minHeight: 48,
            resize: 'none',
            fontSize: 14,
            lineHeight: '1.5',
            color: 'var(--text-primary)',
            border: 'none',
            outline: 'none',
            backgroundColor: 'transparent',
          }}
          rows={2}
        />
      </div>

      {/* Bottom toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 12px 12px',
      }}>
        {/* Left controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {/* Team selector */}
          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            borderRadius: 6,
            fontSize: 13,
            color: 'var(--text-secondary)',
            transition: 'background-color 0.15s',
          }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--hover-bg)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
            专家团
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {/* Auto selector */}
          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 10px',
            borderRadius: 6,
            fontSize: 13,
            color: 'var(--text-secondary)',
            transition: 'background-color 0.15s',
          }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--hover-bg)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            Auto
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {/* Divider */}
          <div style={{
            width: 1,
            height: 16,
            backgroundColor: 'var(--border-color)',
            margin: '0 4px',
          }} />

          {/* Settings button */}
          <button style={{
            color: 'var(--text-tertiary)',
            padding: 4,
            borderRadius: 4,
            transition: 'background-color 0.15s',
          }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--hover-bg)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="21" x2="4" y2="14" />
              <line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" />
              <line x1="20" y1="12" x2="20" y2="3" />
              <line x1="1" y1="14" x2="7" y2="14" />
              <line x1="9" y1="8" x2="15" y2="8" />
              <line x1="17" y1="16" x2="23" y2="16" />
            </svg>
          </button>
        </div>

        {/* Right controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {/* Sparkle / AI */}
          <button style={{
            color: 'var(--text-tertiary)',
            padding: 6,
            borderRadius: 6,
            transition: 'background-color 0.15s',
          }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--hover-bg)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z" />
            </svg>
          </button>

          {/* Microphone */}
          <button style={{
            color: 'var(--text-tertiary)',
            padding: 6,
            borderRadius: 6,
            transition: 'background-color 0.15s',
          }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--hover-bg)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
              <path d="M19 10v2a7 7 0 01-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </button>

          {/* Send button */}
          <button style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: message.trim() ? 'var(--text-primary)' : 'var(--tag-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.15s',
          }}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke={message.trim() ? '#fff' : 'var(--text-tertiary)'}
              strokeWidth="2"
            >
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatInput
