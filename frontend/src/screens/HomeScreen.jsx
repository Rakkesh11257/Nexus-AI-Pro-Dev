import React, { useState, useEffect } from 'react';

// ─── Category definitions with sub-tools ───
const CATEGORIES = [
  {
    id: 'image',
    label: 'Image',
    desc: 'Create, edit, and explore looks.',
    icon: '🎨',
    color: '#22d47b',
    cover: '/samples/image-cover.jpg',
    subTools: [
      { id: 'create-image', label: 'Create Image', desc: 'Generate images from text prompts', media: '/samples/create-image.mp4', tab: 'image' },
      { id: 'edit-image', label: 'Edit Image', desc: 'Transform images with AI', media: '/samples/edit-image.mp4', tab: 'i2i' },
    ],
  },
  {
    id: 'video',
    label: 'Video',
    desc: 'Turn prompts and visuals into clips.',
    icon: '🎬',
    color: '#a855f7',
    cover: '/samples/video-cover.mp4',
    subTools: [
      { id: 'create-video', label: 'Create Video', desc: 'Generate videos from text', media: '/samples/create-video.mp4', tab: 't2v' },
      { id: 'animate-image', label: 'Animate Image', desc: 'Turn images into video', media: '/samples/animate-image.mp4', tab: 'i2v' },
      { id: 'motion-sync', label: 'Motion Sync', desc: 'Transfer motion between videos', media: '/samples/motion-sync.mp4', tab: 'motion' },
    ],
  },
  {
    id: 'audio',
    label: 'Audio',
    desc: 'Give your worlds a voice.',
    icon: '🔊',
    color: '#f59e0b',
    cover: '/samples/audio-cover.mp4',
    subTools: [
      { id: 'music-gen', label: 'Music Generation', desc: 'Create AI music & sound', media: '/samples/music-gen.mp4', tab: 'audio' },
    ],
  },
  {
    id: 'transcribe',
    label: 'Transcribe',
    desc: 'Convert speech to text instantly.',
    icon: '🎙️',
    color: '#ef4444',
    cover: '/samples/transcribe-cover.mp4',
    subTools: [
      { id: 'transcribe-audio', label: 'Transcribe Audio', desc: 'Speech to text with AI', media: '/samples/transcribe.mp4', tab: 'transcribe' },
    ],
  },
  {
    id: 'character',
    label: 'Custom Character',
    desc: 'Train and reuse your cast.',
    icon: '🧪',
    color: '#06b6d4',
    cover: '/samples/character-cover.mp4',
    subTools: [
      { id: 'train-model', label: 'Train Model', desc: 'Create a custom AI model', media: '/samples/train.mp4', tab: 'train' },
    ],
  },
  {
    id: 'chat',
    label: 'AI Chat',
    desc: 'Chat with the smartest AI models.',
    icon: '💬',
    color: '#8b5cf6',
    cover: '/samples/chat-cover.mp4',
    subTools: [
      { id: 'ai-chat', label: 'AI Chat', desc: 'GPT-5, Gemini, Claude & more', media: '/samples/ai-chat.mp4', tab: 'chat' },
    ],
  },
];

// ─── Media cover: supports image or video, with gradient fallback ───
function CoverMedia({ src, color, icon, style }) {
  const [failed, setFailed] = useState(false);
  const isVideo = src && (src.endsWith('.mp4') || src.endsWith('.webm'));

  if (failed || !src) {
    return (
      <div style={{ width: '100%', height: '100%', ...style,
        background: `linear-gradient(145deg, ${color}18 0%, ${color}06 50%, #080810 100%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56, opacity: 0.45,
      }}>{icon}</div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', ...style }}>
      {isVideo ? (
        <video
          src={src} autoPlay loop muted playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={() => setFailed(true)}
        />
      ) : (
        <img
          src={src} alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

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

// ─── Home Screen ───
export default function HomeScreen({ onSelectTool, onSelectCategory }) {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredSuite, setHoveredSuite] = useState(null);
  const isMobile = useIsMobile();

  return (
    <div style={{ padding: 0, width: '100%', overflowX: 'hidden' }}>

      {/* ── Hero ── */}
      <div style={{ textAlign: 'center', padding: isMobile ? '24px 16px 18px' : '36px 16px 28px' }}>
        <h1 style={{
          fontSize: isMobile ? 28 : 'clamp(32px, 5vw, 52px)', fontWeight: 800, color: '#f0f0f5',
          lineHeight: 1.12, letterSpacing: '-0.03em', margin: 0, fontFamily: "'Outfit', sans-serif",
        }}>
          What would you like<br />
          to <span style={{ color: '#22d47b' }}>create</span> today?
        </h1>
        {!isMobile && (
          <p style={{ color: '#555', fontSize: 15, margin: '10px 0 0', fontWeight: 400, letterSpacing: '0.01em' }}>
            Unrestricted AI generation — images, videos, audio & more
          </p>
        )}
      </div>

      {/* ── Category Cards ── */}
      {isMobile ? (
        /* Mobile: 2-column grid, wrapping naturally */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 10,
          padding: '0 12px',
          marginBottom: 28,
        }}>
          {CATEGORIES.map(cat => (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              style={{
                position: 'relative', borderRadius: 14, overflow: 'hidden',
                cursor: 'pointer', background: '#0c0e13',
                border: '1px solid rgba(255,255,255,0.06)',
                aspectRatio: '1 / 1',
              }}
            >
              <div style={{ position: 'absolute', inset: 0 }}>
                <CoverMedia src={cat.cover} color={cat.color} icon={cat.icon} />
              </div>
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 60%, transparent 100%)',
                padding: '30px 12px 12px',
                textAlign: 'center',
              }}>
                <div style={{
                  fontSize: 16, fontWeight: 700, color: '#fff',
                  fontFamily: "'Outfit', sans-serif",
                  background: `linear-gradient(135deg, ${cat.color}, #fff)`,
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>{cat.label}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Desktop: flex row, equal width */
        <div style={{
          display: 'flex', gap: 10, padding: '0 12px', marginBottom: 36,
          width: '100%', boxSizing: 'border-box',
        }}>
          {CATEGORIES.map(cat => {
            const isHovered = hoveredCard === cat.id;
            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                onMouseEnter={() => setHoveredCard(cat.id)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  flex: '1 1 0', minWidth: 0, position: 'relative', borderRadius: 16,
                  overflow: 'hidden', cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                  border: `1.5px solid ${isHovered ? cat.color + '50' : 'rgba(255,255,255,0.06)'}`,
                  boxShadow: isHovered ? `0 16px 48px ${cat.color}25, inset 0 -1px 0 ${cat.color}30` : '0 2px 8px rgba(0,0,0,0.3)',
                  background: '#0c0e13', aspectRatio: '3 / 4',
                }}
              >
                <div style={{ position: 'absolute', inset: 0 }}>
                  <CoverMedia src={cat.cover} color={cat.color} icon={cat.icon} />
                </div>
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.65) 50%, transparent 100%)',
                  padding: '60px 14px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                }}>
                  <div style={{
                    fontSize: 'clamp(15px, 1.4vw, 20px)', fontWeight: 700, color: '#fff', marginBottom: 4,
                    fontFamily: "'Outfit', sans-serif", textAlign: 'center',
                    background: isHovered ? `linear-gradient(135deg, ${cat.color}, #fff)` : 'none',
                    WebkitBackgroundClip: isHovered ? 'text' : 'unset',
                    WebkitTextFillColor: isHovered ? 'transparent' : '#fff',
                    transition: 'all 0.3s ease',
                  }}>{cat.label}</div>
                  <div style={{ fontSize: 'clamp(10px, 0.9vw, 13px)', color: '#999', lineHeight: 1.35, textAlign: 'center' }}>
                    {cat.desc}
                  </div>
                </div>
                {isHovered && (
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
                    background: `linear-gradient(90deg, transparent, ${cat.color}, transparent)`,
                    boxShadow: `0 0 20px ${cat.color}60`,
                  }} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── NEXUS AI Suite ── */}
      <div style={{ padding: '0 12px', marginBottom: 40 }}>
        <h2 style={{ fontSize: isMobile ? 20 : 22, fontWeight: 700, color: '#f0f0f5', margin: '0 0 14px', fontFamily: "'Outfit', sans-serif" }}>
          NEXUS AI Suite
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
          gap: 10,
        }}>
          {CATEGORIES.flatMap(cat =>
            cat.subTools.map(tool => {
              const isHovered = hoveredSuite === tool.id;
              return (
                <div
                  key={tool.id}
                  onClick={() => onSelectTool(tool.tab)}
                  onMouseEnter={() => setHoveredSuite(tool.id)}
                  onMouseLeave={() => setHoveredSuite(null)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: isMobile ? '12px' : '10px 12px',
                    background: isHovered ? `rgba(${hexToRgb(cat.color)}, 0.05)` : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${isHovered ? cat.color + '35' : 'rgba(255,255,255,0.06)'}`,
                    borderRadius: 14, cursor: 'pointer', transition: 'all 0.25s ease',
                  }}
                >
                  {/* Left thumbnail */}
                  <div style={{
                    width: isMobile ? 64 : 72, height: isMobile ? 64 : 72,
                    borderRadius: 12, overflow: 'hidden', flexShrink: 0,
                    background: '#0a0a12',
                    border: `1px solid ${isHovered ? cat.color + '20' : 'rgba(255,255,255,0.04)'}`,
                    transition: 'border-color 0.25s ease',
                  }}>
                    <CoverMedia src={tool.media} color={cat.color} icon={cat.icon} />
                  </div>
                  {/* Text */}
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{
                      fontSize: isMobile ? 15 : 14, fontWeight: 600,
                      color: isHovered ? cat.color : '#ddd',
                      marginBottom: 3, transition: 'color 0.2s ease', fontFamily: "'Outfit', sans-serif",
                    }}>{tool.label}</div>
                    <div style={{
                      fontSize: isMobile ? 13 : 12, color: '#666', lineHeight: 1.35,
                      overflow: 'hidden', textOverflow: 'ellipsis',
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                    }}>{tool.desc}</div>
                  </div>

                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [parseInt(h.substring(0,2),16), parseInt(h.substring(2,4),16), parseInt(h.substring(4,6),16)].join(', ');
}

export { CATEGORIES };
