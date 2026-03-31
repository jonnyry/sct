import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Scene } from '../scenes';
import { C, CodeBlock, Note, SlideTitle } from './Slide';

// ── Title slide ────────────────────────────────────────────────────────────────

const TitleSlide: React.FC<Extract<Scene, { type: 'title' }>> = ({ title, subtitle, tagline }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleScale = spring({ frame, fps, config: { damping: 120, stiffness: 180 } });
  const subtitleOpacity = interpolate(frame, [20, 40], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const taglineOpacity = interpolate(frame, [35, 55], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        gap: 0,
      }}
    >
      {/* Subtle grid background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `linear-gradient(${C.border}22 1px, transparent 1px), linear-gradient(90deg, ${C.border}22 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />
      {/* Amber glow */}
      <div
        style={{
          position: 'absolute',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${C.amber}18 0%, transparent 70%)`,
        }}
      />

      <div style={{ position: 'relative', textAlign: 'center' }}>
        <div
          style={{
            fontSize: 180,
            fontWeight: 900,
            color: C.amber,
            letterSpacing: -8,
            lineHeight: 1,
            transform: `scale(${titleScale})`,
            fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 42,
            color: C.textBright,
            marginTop: 24,
            opacity: subtitleOpacity,
            letterSpacing: 2,
            fontWeight: 300,
          }}
        >
          {subtitle}
        </div>
        <div
          style={{
            fontSize: 30,
            color: C.textMuted,
            marginTop: 20,
            opacity: taglineOpacity,
          }}
        >
          {tagline}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Diagram slide ──────────────────────────────────────────────────────────────

const DiagramSlide: React.FC<Extract<Scene, { type: 'diagram' }>> = ({
  section,
  title,
  diagram,
  bullets,
}) => {
  const frame = useCurrentFrame();
  const bulletsOpacity = interpolate(frame, [30, 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      <SlideTitle>{title}</SlideTitle>

      <div style={{ display: 'flex', gap: 64, flex: 1 }}>
        {/* ASCII pipeline diagram */}
        <pre
          style={{
            backgroundColor: '#010409',
            border: `1px solid ${C.border}`,
            borderRadius: 10,
            padding: '28px 40px',
            fontFamily: 'Consolas, "SF Mono", "Fira Code", "Courier New", monospace',
            fontSize: 26,
            lineHeight: 1.7,
            color: C.green,
            margin: 0,
            flex: 1.4,
            whiteSpace: 'pre',
          }}
        >
          {diagram.split('\n').map((line, i) => {
            const isArrow = line.includes('──▶') || line.includes('│') || line.includes('▼');
            return (
              <div key={i} style={{ color: isArrow ? C.blue : C.green }}>
                {line || '\u00A0'}
              </div>
            );
          })}
        </pre>

        {/* Key guarantees */}
        <div style={{ flex: 1, opacity: bulletsOpacity, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 20 }}>
          {bullets.map((b, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <span style={{ color: C.amber, fontSize: 30, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>✓</span>
              <span style={{ fontSize: 32, color: C.text, lineHeight: 1.4 }}>{b}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Bullets slide ──────────────────────────────────────────────────────────────

const BULLET_STAGGER = 8;

const BulletsSlide: React.FC<Extract<Scene, { type: 'bullets' }>> = ({ section, title, bullets }) => {
  const frame = useCurrentFrame();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      <SlideTitle>{title}</SlideTitle>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {bullets.map((bullet, i) => {
          const delay = 15 + i * BULLET_STAGGER;
          const opacity = interpolate(frame, [delay, delay + 10], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const translateY = interpolate(frame, [delay, delay + 12], [20, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });

          const isIndented = bullet.startsWith('  ');
          const text = bullet.trimStart();

          return (
            <div
              key={i}
              style={{
                opacity,
                transform: `translateY(${translateY}px)`,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 14,
                paddingLeft: isIndented ? 48 : 0,
              }}
            >
              <span style={{ color: isIndented ? C.textMuted : C.amber, fontSize: 30, flexShrink: 0, marginTop: 4 }}>
                {isIndented ? '·' : '▸'}
              </span>
              <span
                style={{
                  fontSize: isIndented ? 28 : 34,
                  color: isIndented ? C.textMuted : C.text,
                  lineHeight: 1.4,
                  fontFamily: text.startsWith('sct ') ? 'Consolas, "SF Mono", monospace' : 'inherit',
                }}
              >
                {text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Code slide ─────────────────────────────────────────────────────────────────

const CodeSlide: React.FC<Extract<Scene, { type: 'code' }>> = ({
  section,
  title,
  code,
  note,
}) => {
  const frame = useCurrentFrame();
  const codeOpacity = interpolate(frame, [10, 25], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      <SlideTitle>{title}</SlideTitle>

      <div style={{ opacity: codeOpacity, flex: 1 }}>
        <CodeBlock code={code} />
        {note && <Note>{note}</Note>}
      </div>
    </div>
  );
};

// ── Table slide ────────────────────────────────────────────────────────────────

const TableSlide: React.FC<Extract<Scene, { type: 'table' }>> = ({
  section,
  title,
  headers,
  rows,
}) => {
  const frame = useCurrentFrame();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      <SlideTitle>{title}</SlideTitle>

      <table
        style={{
          borderCollapse: 'collapse',
          width: '100%',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th
                key={i}
                style={{
                  textAlign: 'left',
                  padding: '12px 24px',
                  fontSize: 26,
                  fontWeight: 600,
                  color: C.textMuted,
                  borderBottom: `2px solid ${C.border}`,
                  letterSpacing: 0.5,
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => {
            const delay = 15 + ri * 6;
            const opacity = interpolate(frame, [delay, delay + 10], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            return (
              <tr
                key={ri}
                style={{
                  opacity,
                  backgroundColor: ri % 2 === 0 ? 'transparent' : `${C.surface}80`,
                }}
              >
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    style={{
                      padding: '14px 24px',
                      fontSize: ci === 0 ? 28 : 26,
                      color: ci === 0 ? C.amber : C.text,
                      borderBottom: `1px solid ${C.border}44`,
                      fontFamily:
                        ci === 0
                          ? 'Consolas, "SF Mono", "Fira Code", monospace'
                          : 'inherit',
                    }}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// ── Router ─────────────────────────────────────────────────────────────────────

export const SlideContent: React.FC<{ scene: Scene }> = ({ scene }) => {
  switch (scene.type) {
    case 'title':
      return <TitleSlide {...scene} />;
    case 'diagram':
      return <DiagramSlide {...scene} />;
    case 'bullets':
      return <BulletsSlide {...scene} />;
    case 'code':
      return <CodeSlide {...scene} />;
    case 'table':
      return <TableSlide {...scene} />;
  }
};
