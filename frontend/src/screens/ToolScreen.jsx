import React, { useState, useEffect } from 'react';
import { CATEGORY_TOOLS } from './CategoryScreen.jsx';

// ─── Hook: detect mobile ───
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < breakpoint);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [breakpoint]);
  return isMobile;
}

// Map tab IDs back to their category and tool info
// preferCategoryId: when a tab exists in multiple categories (e.g. i2v in both image & video),
// prefer the one matching this category so the user stays in the correct context.
function getToolInfo(tabId, preferCategoryId) {
  let fallback = null;
  for (const [catId, cat] of Object.entries(CATEGORY_TOOLS)) {
    for (const tool of cat.tools) {
      if (tool.tab === tabId) {
        // If this matches the preferred category, return immediately
        if (preferCategoryId && catId === preferCategoryId) {
          return { category: cat, categoryId: catId, tool };
        }
        // Otherwise store as fallback (first match)
        if (!fallback) {
          fallback = { category: cat, categoryId: catId, tool };
        }
      }
    }
  }
  return fallback;
}

// Get sibling tools in same category
function getSiblingTools(tabId, preferCategoryId) {
  const info = getToolInfo(tabId, preferCategoryId);
  if (!info) return [];
  return info.category.tools.filter(t => !t.comingSoon && t.tab);
}

// ─── Tool icon map (SVG-style emoji icons per tool) ───
const TOOL_ICONS = {
  'create-image': '🖼️',
  'edit-image': '✏️',
  'animate-image': '🎞️',
  'animate-image-v': '🎞️',
  'create-video': '🎬',
  'motion-sync': '🎭',
  'music-gen': '🎵',
  'transcribe-audio': '🎙️',
  'train-model': '🧪',
  'ai-chat': '💬',
  'face-swap': '🔄',
  'image-upscale': '🔍',
  'portrait-studio': '✨',
  'edit-video': '✂️',
  'video-face-swap': '🔄',
};

// ─── History Panel ───
function HistoryPanel({ results, onViewItem, onDeleteItem, onDeleteAll, isMobile }) {
  const items = results || [];
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 0 14px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        marginBottom: 14,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14, color: '#999' }}>🕐</span>
          <span style={{
            fontSize: 15, fontWeight: 600, color: '#ccc',
            fontFamily: "'Outfit', sans-serif",
          }}>Generation History</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {items.length > 0 && (
            <span style={{ fontSize: 12, color: '#555' }}>{items.length} results</span>
          )}
          {items.length > 0 && onDeleteAll && (
            confirmDeleteAll ? (
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: '#fca5a5' }}>Delete all?</span>
                <button onClick={() => { onDeleteAll(); setConfirmDeleteAll(false); }} style={{ padding: '3px 10px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, color: '#ef4444', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Yes</button>
                <button onClick={() => setConfirmDeleteAll(false)} style={{ padding: '3px 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#888', fontSize: 11, cursor: 'pointer' }}>No</button>
              </div>
            ) : (
              <button onClick={() => setConfirmDeleteAll(true)} style={{ padding: '4px 12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, color: '#ef4444', fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 4 }}>
                🗑 Delete All
              </button>
            )
          )}
        </div>
      </div>

      {/* Results grid or empty state */}
      {items.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: 10,
          overflowY: 'auto',
          alignItems: 'start',
          alignContent: 'start',
        }}>
          {items.map((item, i) => (
            <div
              key={i}
              style={{
                background: '#111827',
                borderRadius: 10,
                overflow: 'hidden',
                border: '1px solid #1f2937',
                cursor: 'pointer',
                transition: 'border-color 0.2s',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Delete button on each card */}
              {onDeleteItem && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDeleteItem(item); }}
                  style={{
                    position: 'absolute', top: 6, right: 6, zIndex: 5,
                    width: 26, height: 26, borderRadius: '50%',
                    background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    color: '#ef4444', fontSize: 13,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s',
                    opacity: 0.7,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'rgba(239,68,68,0.3)'; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '0.7'; e.currentTarget.style.background = 'rgba(0,0,0,0.65)'; }}
                  title="Delete"
                >✕</button>
              )}
              <div onClick={() => onViewItem && onViewItem(item)} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                {/* Fixed-height media container */}
                <div style={{ width: '100%', aspectRatio: '4/3', overflow: 'hidden', position: 'relative', background: '#0a0a18' }}>
                  {item.type === 'video' ? (
                    <video
                      src={item.url}
                      muted
                      playsInline
                      onMouseEnter={e => e.target?.play?.()}
                      onMouseLeave={e => { if(e.target?.pause) { e.target.pause(); e.target.currentTime = 0; }}}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  ) : item.type === 'audio' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '12px 10px' }}>
                      <div style={{ fontSize: 36, marginBottom: 10 }}>🎵</div>
                      <audio src={item.url} controls style={{ width: '100%', height: 32 }} onClick={e => e.stopPropagation()} />
                    </div>
                  ) : (
                    <img
                      src={item.url}
                      alt=''
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                  )}
                </div>
                <div style={{ padding: '6px 8px' }}>
                  <p style={{
                    fontSize: 11, color: '#777', margin: 0,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{item.prompt || 'Generated'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 12, opacity: 0.4,
        }}>
          <div style={{ fontSize: 40 }}>📂</div>
          <div style={{ fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 1.5 }}>
            Your generations will<br />appear here
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-Tool Card (OpenArt style) ───
function ToolCard({ tool, isActive, onClick, isMobile }) {
  const icon = TOOL_ICONS[tool.id] || '⚡';
  
  return (
    <div
      onClick={onClick}
      style={{
        flex: isMobile ? '1 1 0' : 'none',
        width: isMobile ? 'auto' : 160,
        padding: isMobile ? '12px 8px' : '14px 16px',
        borderRadius: 12,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        transition: 'all 0.25s ease',
        background: isActive
          ? 'linear-gradient(135deg, rgba(34,212,123,0.2) 0%, rgba(34,212,123,0.05) 100%)'
          : 'rgba(255,255,255,0.02)',
        border: isActive
          ? '1px solid rgba(34,212,123,0.35)'
          : '1px solid rgba(255,255,255,0.06)',
        boxShadow: isActive ? '0 0 20px rgba(34,212,123,0.08)' : 'none',
      }}
    >
      <span style={{
        fontSize: isMobile ? 22 : 26,
        filter: isActive ? 'none' : 'grayscale(0.5)',
        transition: 'filter 0.2s',
      }}>{icon}</span>
      <span style={{
        fontSize: isMobile ? 11 : 12,
        fontWeight: isActive ? 600 : 400,
        color: isActive ? '#fff' : '#888',
        textAlign: 'center',
        whiteSpace: 'nowrap',
        fontFamily: "'Outfit', sans-serif",
      }}>{tool.label}</span>
    </div>
  );
}

// ─── Tool Screen Layout ───
export default function ToolScreen({
  tabId,
  categoryId,
  onBack,
  onSwitchTool,
  results,
  onViewItem,
  onDeleteItem,
  onDeleteAll,
  children,
}) {
  const isMobile = useIsMobile();
  const toolInfo = getToolInfo(tabId, categoryId);
  const siblings = getSiblingTools(tabId, categoryId);

  if (!toolInfo) {
    return <>{children}</>;
  }

  const { category, tool } = toolInfo;

  // Shared header
  const Header = ({ padding }) => (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: padding || '18px 20px 0',
    }}>
      <div
        onClick={onBack}
        style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', fontSize: 16, color: '#999',
          transition: 'all 0.2s ease',
        }}
      >←</div>
      <span style={{
        fontSize: isMobile ? 18 : 20, fontWeight: 700, color: '#f0f0f5',
        fontFamily: "'Outfit', sans-serif",
      }}>{tool.label}</span>
    </div>
  );

  // Shared sub-tool cards (OpenArt style) — manual scroll only, no auto-scroll
  const SubToolCards = ({ padding }) => {
    if (siblings.length <= 1) return null;
    return (
      <div style={{
        display: 'flex',
        gap: 8,
        padding: padding || '14px 20px',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
      }}>
        {siblings.map(t => (
          <ToolCard
            key={t.id}
            tool={t}
            isActive={t.tab === tabId}
            onClick={() => onSwitchTool(t.tab)}
            isMobile={isMobile}
          />
        ))}
      </div>
    );
  };

  return (
    <div style={{ width: '100%', height: '100%', overflowX: 'hidden' }}>
      {isMobile ? (
        /* ── Mobile: stacked layout ── */
        <div style={{ padding: '0' }}>
          <Header padding='14px 14px 0' />
          <SubToolCards padding='12px 14px' />
          <div style={{ padding: '0 14px 16px' }}>
            {children}
          </div>
          <div style={{ padding: '0 14px 20px' }}>
            <HistoryPanel results={results} onViewItem={onViewItem} onDeleteItem={onDeleteItem} onDeleteAll={onDeleteAll} isMobile={isMobile} />
          </div>
        </div>
      ) : (
        /* ── Desktop: left form + right history ── */
        <div style={{
          display: 'flex', gap: 0, height: '100%',
          minHeight: 'calc(100vh - 120px)',
        }}>
          {/* Left panel */}
          <div style={{
            width: 520, minWidth: 420, maxWidth: 560,
            display: 'flex', flexDirection: 'column',
            borderRight: '1px solid rgba(255,255,255,0.06)',
            flexShrink: 0,
            overflowY: 'auto',
          }}>
            <Header />
            <SubToolCards />
            <div style={{ padding: '4px 20px 18px', flex: 1, overflowY: 'auto' }}>
              {children}
            </div>
          </div>
          {/* Right panel: history */}
          <div style={{ flex: 1, padding: '18px 24px', overflowY: 'auto' }}>
            <HistoryPanel results={results} onViewItem={onViewItem} onDeleteItem={onDeleteItem} onDeleteAll={onDeleteAll} isMobile={isMobile} />
          </div>
        </div>
      )}
    </div>
  );
}

export { getToolInfo, getSiblingTools };
