import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';

const FADE_FRAMES = 12;

// Color palette — GitHub dark aesthetic
export const C = {
  bg: '#0d1117',
  surface: '#161b22',
  surfaceAlt: '#1c2128',
  border: '#30363d',
  text: '#c9d1d9',
  textBright: '#f0f6fc',
  textMuted: '#8b949e',
  amber: '#f0883e',   // sct brand accent
  blue: '#79c0ff',
  green: '#7ee787',
  yellow: '#e3b341',
  purple: '#d2a8ff',
} as const;

// Wrapper that fades in and out, sets background
export const Slide: React.FC<{ children: React.ReactNode; duration: number }> = ({
  children,
  duration,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, FADE_FRAMES, duration - FADE_FRAMES, duration],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill
      style={{
        opacity,
        backgroundColor: C.bg,
        fontFamily: 'system-ui, -apple-system, "Segoe UI", Helvetica, Arial, sans-serif',
        padding: '72px 112px',
        boxSizing: 'border-box',
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// Section badge — e.g. "§3"
export const SectionBadge: React.FC<{ section: string }> = ({ section }) => (
  <div
    style={{
      fontFamily: 'Consolas, "SF Mono", "Fira Code", monospace',
      fontSize: 28,
      color: C.amber,
      marginBottom: 16,
      letterSpacing: 1,
    }}
  >
    {section}
  </div>
);

// Slide title
export const SlideTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h1
    style={{
      fontSize: 72,
      fontWeight: 700,
      color: C.textBright,
      margin: '0 0 48px 0',
      lineHeight: 1.15,
      letterSpacing: -1,
    }}
  >
    {children}
  </h1>
);

// Terminal-style code block
export const CodeBlock: React.FC<{ code: string }> = ({ code }) => (
  <div
    style={{
      backgroundColor: '#010409',
      border: `1px solid ${C.border}`,
      borderRadius: 10,
      padding: '28px 36px',
      fontFamily: 'Consolas, "SF Mono", "Fira Code", "Courier New", monospace',
      fontSize: 28,
      lineHeight: 1.65,
      color: C.green,
      whiteSpace: 'pre',
      overflow: 'hidden',
    }}
  >
    {/* Tint comment lines and prompt symbols differently */}
    {code.split('\n').map((line, i) => {
      const isComment = line.trimStart().startsWith('#');
      const isPrompt = line.startsWith('$');
      return (
        <div
          key={i}
          style={{
            color: isComment ? C.textMuted : isPrompt ? C.amber : C.green,
          }}
        >
          {line || '\u00A0'}
        </div>
      );
    })}
  </div>
);

// Small note below a code block
export const Note: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      fontSize: 30,
      color: C.textMuted,
      marginTop: 28,
      fontStyle: 'italic',
    }}
  >
    {children}
  </div>
);
