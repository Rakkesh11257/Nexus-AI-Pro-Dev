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
function getToolInfo(tabId) {
  for (const [catId, cat] of Object.entries(CATEGORY_TOOLS)) {
    for (const tool of cat.tools) {
      if (tool.tab === tabId) {
        return { category: cat, categoryId: catId, tool };
      }
    }
  }
  return null;
}

// Get sibling tools in same category
function getSiblingTools(tabId) {
  const info = getToolInfo(tabId);
  if (!info) return [];
  return info.category.tools.filter(t => !t.comingSoon && t.tab);
}

// ─── History Panel ───
function HistoryPanel({ results, onViewItem, isMobile }) {
  const imageResults = results || [];
  
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
        {imageResults.length > 0 && (
          <span style={{ fontSize: 12, color: '#555' }}>{imageResults.length} results</span>
        )}
      </div>

      {/* Results grid or empty state */}
      {imageResults.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: 10,
          overflowY: 'auto',
          flex: 1,
        }}>
          {imageResults.map((item, i) => (
            <div
              key={i}
              onClick={() => onViewItem && onViewItem(item)}
              style={{
                background: '#111827',
                borderRadius: 10,
                overflow: 'hidden',
                border: '1px solid #1f2937',
                cursor: 'pointer',
                transition: 'border-color 0.2s',
              }}
            >
              <img
                src={item.url}
                alt=""
                style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }}
                onError={e => { e.target.style.display = 'none'; }}
              />
              <div style={{ padding: '6px 8px' }}>
                <p style={{
                  fontSize: 11, color: '#777', margin: 0,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{item.prompt || 'Generated'}</p>
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

// ─── Tool Screen Layout ───
export default function ToolScreen({
  tabId,
  onBack,         // Go back to category screen
  onSwitchTool,   // Switch to sibling tool
  results,        // Generation results for history
  onViewItem,     // Open viewer for a result
  children,       // The actual form content from App.jsx
}) {
  const isMobile = useIsMobile();
  const toolInfo = getToolInfo(tabId);
  const siblings = getSiblingTools(tabId);

  if (!toolInfo) {
    // Fallback for tabs not in category system (like train, chat etc)
    return <>{children}</>;
  }

  const { category, tool } = toolInfo;
  const color = category.color;

  return (
    <div style={{ width: '100%', height: '100%', overflowX: 'hidden' }}>
      {isMobile ? (
        /* ── Mobile: stacked layout ── */
        <div style={{ padding: '0' }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '14px 14px 0',
          }}>
            <div
              onClick={onBack}
              style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', fontSize: 16, color: '#999',
              }}
            >←</div>
            <span style={{
              fontSize: 18, fontWeight: 700, color: '#f0f0f5',
              fontFamily: "'Outfit', sans-serif",
            }}>{tool.label}</span>
          </div>

          {/* Sub-tool tabs */}
          {siblings.length > 1 && (
            <div style={{
              display: 'flex', gap: 0, padding: '12px 14px 0',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
              {siblings.map(t => {
                const isActive = t.tab === tabId;
                return (
                  <div
                    key={t.id}
                    onClick={() => onSwitchTool(t.tab)}
                    style={{
                      padding: '10px 16px',
                      fontSize: 13, fontWeight: isActive ? 600 : 400,
                      color: isActive ? color : '#777',
                      cursor: 'pointer',
                      borderBottom: isActive ? `2px solid ${color}` : '2px solid transparent',
                      transition: 'all 0.2s ease',
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}
                  >
                    {t.media && (
                      <img src={t.media} alt="" style={{
                        width: 20, height: 20, borderRadius: 4, objectFit: 'cover',
                      }} />
                    )}
                    {t.label}
                  </div>
                );
              })}
            </div>
          )}

          {/* Form content */}
          <div style={{ padding: '16px 14px' }}>
            {children}
          </div>

          {/* History below */}
          <div style={{ padding: '0 14px 20px' }}>
            <HistoryPanel results={results} onViewItem={onViewItem} isMobile={isMobile} />
          </div>
        </div>
      ) : (
        /* ── Desktop: left form + right history ── */
        <div style={{
          display: 'flex', gap: 0, height: '100%',
          minHeight: 'calc(100vh - 120px)',
        }}>
          {/* Left panel: form */}
          <div style={{
            width: 520, minWidth: 420, maxWidth: 560,
            display: 'flex', flexDirection: 'column',
            borderRight: '1px solid rgba(255,255,255,0.06)',
            flexShrink: 0,
            overflowY: 'auto',
          }}>
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '18px 20px 0',
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
                fontSize: 20, fontWeight: 700, color: '#f0f0f5',
                fontFamily: "'Outfit', sans-serif",
              }}>{tool.label}</span>
            </div>

            {/* Sub-tool tabs */}
            {siblings.length > 1 && (
              <div style={{
                display: 'flex', gap: 0, padding: '12px 20px 0',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}>
                {siblings.map(t => {
                  const isActive = t.tab === tabId;
                  return (
                    <div
                      key={t.id}
                      onClick={() => onSwitchTool(t.tab)}
                      style={{
                        padding: '10px 18px',
                        fontSize: 13, fontWeight: isActive ? 600 : 400,
                        color: isActive ? color : '#777',
                        cursor: 'pointer',
                        borderBottom: isActive ? `2px solid ${color}` : '2px solid transparent',
                        transition: 'all 0.2s ease',
                        display: 'flex', alignItems: 'center', gap: 8,
                      }}
                    >
                      {t.media && (
                        <img src={t.media} alt="" style={{
                          width: 22, height: 22, borderRadius: 5, objectFit: 'cover',
                        }} />
                      )}
                      {t.label}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Form content */}
            <div style={{ padding: '18px 20px', flex: 1, overflowY: 'auto' }}>
              {children}
            </div>
          </div>

          {/* Right panel: history */}
          <div style={{
            flex: 1, padding: '18px 24px',
            overflowY: 'auto',
          }}>
            <HistoryPanel results={results} onViewItem={onViewItem} isMobile={isMobile} />
          </div>
        </div>
      )}
    </div>
  );
}

export { getToolInfo, getSiblingTools };
