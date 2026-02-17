import React, { useState, useEffect } from 'react';

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

// ─── Category configs ───
const CATEGORY_TOOLS = {
  image: {
    label: 'Image',
    icon: '🎨',
    color: '#22d47b',
    tools: [
      { id: 'create-image', label: 'Create Image', media: '/samples/create-image.gif', tab: 'image' },
      { id: 'edit-image', label: 'Edit Image', media: '/samples/edit-image.gif', tab: 'i2i' },
      { id: 'animate-image', label: 'Animate Image', media: '/samples/animate-image.gif', tab: 'i2v' },
      { id: 'face-swap', label: 'Face Swap', desc: 'Swap faces between photos', media: '/samples/face-swap.gif', tab: 'faceswap' },
      { id: 'image-upscale', label: 'Image Upscale', desc: 'Enhance resolution up to 10x', media: '/samples/image-upscale.gif', tab: 'upscale' },
      { id: 'portrait-studio', label: 'Portrait Studio', desc: 'Enhance portraits & change haircuts', media: '/samples/portrait-studio.gif', tab: 'skin' },
    ],
  },
  video: {
    label: 'Video',
    icon: '🎬',
    color: '#a855f7',
    tools: [
      { id: 'create-video', label: 'Create Video', media: '/samples/create-video.gif', tab: 't2v' },
      { id: 'edit-video', label: 'Edit Video', desc: 'Transform videos with AI prompts', media: '/samples/edit-video.gif', tab: 'v2v' },
      { id: 'animate-image-v', label: 'Animate Image', media: '/samples/animate-image.gif', tab: 'i2v' },
      { id: 'motion-sync', label: 'Motion Sync', media: '/samples/motion-sync.gif', tab: 'motion' },
      { id: 'video-face-swap', label: 'Video Face Swap', desc: 'Swap faces in videos', media: '/samples/face-swap.gif', tab: 'videofs' },
      { id: 'video-enhance', label: 'Replace Character', desc: 'Replace characters in videos with AI', media: '/samples/image-upscale.gif', tab: 'replacechar' },
    ],
  },
  audio: {
    label: 'Audio',
    icon: '🔊',
    color: '#f59e0b',
    tools: [
      { id: 'music-gen', label: 'Music Generation', media: '/samples/music-gen.gif', tab: 'audio' },
    ],
  },
  transcribe: {
    label: 'Transcribe',
    icon: '🎙️',
    color: '#ef4444',
    tools: [
      { id: 'transcribe-audio', label: 'Transcribe Audio', media: '/samples/transcribe.gif', tab: 'transcribe' },
    ],
  },
  character: {
    label: 'Custom Character',
    icon: '🧪',
    color: '#06b6d4',
    tools: [
      { id: 'train-model', label: 'Train Model', media: '/samples/train.gif', tab: 'train' },
    ],
  },
  chat: {
    label: 'AI Chat',
    icon: '💬',
    color: '#8b5cf6',
    tools: [
      { id: 'ai-chat', label: 'AI Chat', media: '/samples/ai-chat.gif', tab: 'chat' },
    ],
  },
};

// ─── Tool Card ───
function ToolCard({ tool, color, onSelect, isMobile }) {
  const [hovered, setHovered] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const isDisabled = tool.comingSoon;

  return (
    <div
      onClick={() => !isDisabled && onSelect(tool.tab)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        borderRadius: 14,
        overflow: 'hidden',
        cursor: isDisabled ? 'default' : 'pointer',
        background: '#0c0e13',
        border: `1.5px solid ${hovered && !isDisabled ? color + '40' : 'rgba(255,255,255,0.06)'}`,
        transition: 'all 0.25s ease',
        transform: hovered && !isDisabled ? 'translateY(-2px)' : 'none',
        opacity: isDisabled ? 0.5 : 1,
      }}
    >
      {/* Thumbnail */}
      <div style={{
        width: '100%',
        aspectRatio: '4 / 3',
        background: `linear-gradient(145deg, ${color}15 0%, #0c0e13 100%)`,
        overflow: 'hidden',
      }}>
        {tool.media && !imgFailed ? (
          <img
            src={tool.media}
            alt={tool.label}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 48, opacity: 0.3,
          }}>
            {tool.comingSoon ? '🔜' : '🖼️'}
          </div>
        )}
      </div>

      {/* Label */}
      <div style={{
        padding: '10px 12px',
        fontSize: isMobile ? 14 : 13,
        fontWeight: 600,
        color: hovered && !isDisabled ? color : '#ddd',
        fontFamily: "'Outfit', sans-serif",
        transition: 'color 0.2s ease',
      }}>
        {tool.label}
        {isDisabled && (
          <span style={{
            marginLeft: 8,
            fontSize: 10,
            padding: '2px 6px',
            borderRadius: 4,
            background: 'rgba(255,255,255,0.06)',
            color: '#666',
            fontWeight: 500,
          }}>Coming Soon</span>
        )}
      </div>

      {/* Hover glow bar */}
      {hovered && !isDisabled && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        }} />
      )}
    </div>
  );
}

// ─── History Panel (right side) ───
function HistoryPanel({ categoryId, color, isMobile }) {
  // History will be populated from generation results stored in App.jsx
  // For now, show a placeholder
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: isMobile ? 200 : 400,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '0 0 16px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        marginBottom: 16,
      }}>
        <span style={{ fontSize: 14, color: '#999' }}>🕐</span>
        <span style={{
          fontSize: 15,
          fontWeight: 600,
          color: '#ccc',
          fontFamily: "'Outfit', sans-serif",
        }}>Generation History</span>
      </div>

      {/* Empty state */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        opacity: 0.4,
      }}>
        <div style={{ fontSize: 40 }}>📂</div>
        <div style={{
          fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 1.5,
        }}>
          Your generations will<br />appear here
        </div>
      </div>
    </div>
  );
}

// ─── Main Category Screen ───
export default function CategoryScreen({ categoryId, onSelectTool, onBack, generationHistory }) {
  // Wrap onSelectTool to include categoryId so parent knows which category the tool came from
  const handleSelectTool = (tabId) => onSelectTool(tabId, categoryId);
  const isMobile = useIsMobile();
  const category = CATEGORY_TOOLS[categoryId];

  if (!category) return null;

  const { label, icon, color, tools } = category;
  // Determine grid columns based on tool count
  const cols = tools.length <= 2 ? 2 : 3;

  return (
    <div style={{ width: '100%', height: '100%', overflowX: 'hidden' }}>
      {isMobile ? (
        /* ── Mobile Layout: stacked ── */
        <div style={{ padding: '0 14px' }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '16px 0 20px',
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
            <span style={{ fontSize: 14, opacity: 0.5 }}>{icon}</span>
            <span style={{
              fontSize: 20, fontWeight: 700, color: '#f0f0f5',
              fontFamily: "'Outfit', sans-serif",
            }}>{label}</span>
          </div>

          {/* Tool Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${Math.min(cols, 2)}, 1fr)`,
            gap: 10,
            marginBottom: 24,
          }}>
            {tools.map(tool => (
              <ToolCard key={tool.id} tool={tool} color={color} onSelect={handleSelectTool} isMobile={isMobile} />
            ))}
          </div>

          {/* History below on mobile */}
          <HistoryPanel categoryId={categoryId} color={color} isMobile={isMobile} />
        </div>
      ) : (
        /* ── Desktop Layout: left tools + right history ── */
        <div style={{
          display: 'flex',
          gap: 0,
          height: '100%',
          minHeight: 'calc(100vh - 120px)',
        }}>
          {/* Left panel: tools */}
          <div style={{
            width: 520,
            minWidth: 420,
            maxWidth: 560,
            padding: '0 20px 20px 20px',
            borderRight: '1px solid rgba(255,255,255,0.06)',
            overflowY: 'auto',
            flexShrink: 0,
          }}>
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '20px 0 24px',
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
              <span style={{ fontSize: 16, opacity: 0.5 }}>{icon}</span>
              <span style={{
                fontSize: 22, fontWeight: 700, color: '#f0f0f5',
                fontFamily: "'Outfit', sans-serif",
              }}>{label}</span>
            </div>

            {/* Tool Cards Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              gap: 12,
            }}>
              {tools.map(tool => (
                <ToolCard key={tool.id} tool={tool} color={color} onSelect={handleSelectTool} isMobile={isMobile} />
              ))}
            </div>
          </div>

          {/* Right panel: history */}
          <div style={{
            flex: 1,
            padding: '20px 24px',
            overflowY: 'auto',
          }}>
            <HistoryPanel categoryId={categoryId} color={color} isMobile={isMobile} />
          </div>
        </div>
      )}
    </div>
  );
}

export { CATEGORY_TOOLS };
