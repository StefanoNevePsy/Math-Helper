import React from 'react';
import { playHapticAudioFeedback } from '../AudioHaptic';
import { FRAC_COLORS } from './fractionMath';

export function FractionNotation({
  n,
  d,
  size = 'md',
  numColor,
  denColor,
  sign,
  highlight = false,
}) {
  const sizes = {
    sm: { font: '1.15rem', barW: '26px', barH: '3px', pad: '2px 4px' },
    md: { font: '1.65rem', barW: '38px', barH: '4px', pad: '4px 6px' },
    lg: { font: '2.35rem', barW: '54px', barH: '5px', pad: '6px 10px' },
  };
  const s = sizes[size] || sizes.md;

  return (
    <span
      className={`frac-notation ${highlight ? 'frac-notation--highlight' : ''}`}
      style={{ padding: s.pad }}
    >
      {sign && (
        <span
          className="frac-notation__sign"
          style={{ fontSize: s.font, marginRight: '4px' }}
        >
          {sign}
        </span>
      )}
      <span className="frac-notation__stack">
        <span
          className="frac-notation__num"
          style={{ fontSize: s.font, color: numColor || FRAC_COLORS.ink }}
        >
          {n}
        </span>
        <span
          className="frac-notation__bar"
          style={{ minWidth: s.barW, height: s.barH }}
        />
        <span
          className="frac-notation__den"
          style={{ fontSize: s.font, color: denColor || FRAC_COLORS.ink }}
        >
          {d}
        </span>
      </span>
    </span>
  );
}

/**
 * Horizontal unit bar(s) representing n/d.
 * Supports:
 * - Multiple unit bars when n > d (or totalFilled > d)
 * - secondCount + secondColor for visual addition
 * - removedCount for visual subtraction (shows kept + crossed-out removed pieces)
 * - subdivisions (k) to show dashed inner cuts for equivalent fractions / common denominator
 * - interactive click on segments when onSelectCount is provided
 */
export function FractionBar({
  n,
  d,
  fillColor = FRAC_COLORS.a,
  secondCount = 0,
  secondColor = FRAC_COLORS.b,
  removedCount = 0,
  subdivisions = 1,
  minUnits = 1,
  height = 52,
  onSelectCount,
  showUnitLabels = false,
  compact = false,
}) {
  const safeD = Math.max(1, d);
  const totalSlotsNeeded = Math.max(n + secondCount, n + removedCount);
  const units = Math.max(minUnits, Math.ceil(totalSlotsNeeded / safeD) || 1);

  return (
    <div className={`frac-bars-row ${compact ? 'frac-bars-row--compact' : ''}`}>
      {Array.from({ length: units }).map((_, unitIdx) => {
        const unitStart = unitIdx * safeD;
        return (
          <div key={unitIdx} className="frac-unit-wrap">
            <svg
              viewBox={`0 0 240 ${height}`}
              className="frac-bar-svg"
              style={{ height: `${height}px` }}
              role="img"
              aria-label={`Barra unità ${unitIdx + 1}: ${n} su ${safeD}`}
            >
              {/* Outer background */}
              <rect
                x="2"
                y="2"
                width="236"
                height={height - 4}
                rx="8"
                fill={FRAC_COLORS.empty}
                stroke={FRAC_COLORS.ink}
                strokeWidth="3.5"
              />
              {/* Segments */}
              {Array.from({ length: safeD }).map((__, segIdx) => {
                const globalIdx = unitStart + segIdx;
                const segW = 236 / safeD;
                const x = 2 + segIdx * segW;

                let fill = FRAC_COLORS.empty;
                let isRemoved = false;

                if (removedCount > 0) {
                  // For subtraction: first n are kept, next removedCount are crossed-out
                  if (globalIdx < n) {
                    fill = fillColor;
                  } else if (globalIdx < n + removedCount) {
                    fill = '#FCE4E5';
                    isRemoved = true;
                  }
                } else {
                  if (globalIdx < n) {
                    fill = fillColor;
                  } else if (globalIdx < n + secondCount) {
                    fill = secondColor;
                  }
                }

                const isFirst = segIdx === 0;
                const isLast = segIdx === safeD - 1;

                return (
                  <g
                    key={segIdx}
                    onClick={
                      onSelectCount
                        ? () => {
                            playHapticAudioFeedback();
                            const clickedCount = globalIdx + 1;
                            onSelectCount(clickedCount === n ? globalIdx : clickedCount);
                          }
                        : undefined
                    }
                    style={{ cursor: onSelectCount ? 'pointer' : 'default' }}
                  >
                    <rect
                      x={x}
                      y="2"
                      width={segW}
                      height={height - 4}
                      rx={isFirst || isLast ? 6 : 0}
                      fill={fill}
                    />
                    {/* Fix inner corners when only one side is rounded */}
                    {isFirst && !isLast && segW > 12 && (
                      <rect x={x + segW - 8} y="2" width="8" height={height - 4} fill={fill} />
                    )}
                    {isLast && !isFirst && segW > 12 && (
                      <rect x={x} y="2" width="8" height={height - 4} fill={fill} />
                    )}

                    {/* Dashed internal subdivisions (for equivalent / common denominator) */}
                    {subdivisions > 1 &&
                      Array.from({ length: subdivisions - 1 }).map((___, subIdx) => {
                        const subX = x + ((subIdx + 1) * segW) / subdivisions;
                        return (
                          <line
                            key={subIdx}
                            x1={subX}
                            y1="4"
                            x2={subX}
                            y2={height - 4}
                            stroke={FRAC_COLORS.ink}
                            strokeWidth="2"
                            strokeDasharray="4 3"
                            opacity="0.7"
                          />
                        );
                      })}

                    {/* Cross-out lines for subtracted segments */}
                    {isRemoved && (
                      <>
                        <line
                          x1={x + 4}
                          y1="6"
                          x2={x + segW - 4}
                          y2={height - 6}
                          stroke="#C83E46"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                        <line
                          x1={x + segW - 4}
                          y1="6"
                          x2={x + 4}
                          y2={height - 6}
                          stroke="#C83E46"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                      </>
                    )}

                    {/* Segment divider line */}
                    {segIdx > 0 && (
                      <line
                        x1={x}
                        y1="2"
                        x2={x}
                        y2={height - 2}
                        stroke={FRAC_COLORS.ink}
                        strokeWidth={safeD > 12 ? '2' : '3'}
                      />
                    )}
                  </g>
                );
              })}

              {/* Crisp outer border on top so fills never bleed over edges */}
              <rect
                x="2"
                y="2"
                width="236"
                height={height - 4}
                rx="8"
                fill="none"
                stroke={FRAC_COLORS.ink}
                strokeWidth="3.5"
                pointerEvents="none"
              />
            </svg>
            {showUnitLabels && units > 1 && (
              <span className="frac-unit-label">Intero {unitIdx + 1}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function describeWedge(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return [
    'M', cx, cy,
    'L', start.x, start.y,
    'A', r, r, 0, largeArcFlag, 0, end.x, end.y,
    'Z',
  ].join(' ');
}

export function FractionPie({
  n,
  d,
  fillColor = FRAC_COLORS.a,
  subdivisions = 1,
  size = 148,
  onSelectCount,
}) {
  const safeD = Math.max(1, d);
  const units = Math.max(1, Math.ceil(n / safeD) || 1);
  const cx = 60;
  const cy = 60;
  const r = 52;

  return (
    <div className="frac-pies-row">
      {Array.from({ length: units }).map((_, unitIdx) => {
        const unitStart = unitIdx * safeD;
        return (
          <svg
            key={unitIdx}
            viewBox="0 0 120 120"
            className="frac-pie-svg"
            style={{ width: `${size}px`, height: `${size}px` }}
            role="img"
            aria-label={`Torta unità ${unitIdx + 1}: ${n} su ${safeD}`}
          >
            {safeD === 1 ? (
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill={unitStart < n ? fillColor : FRAC_COLORS.empty}
                stroke={FRAC_COLORS.ink}
                strokeWidth="3.5"
                style={{ cursor: onSelectCount ? 'pointer' : 'default' }}
                onClick={
                  onSelectCount
                    ? () => {
                        playHapticAudioFeedback();
                        const clicked = unitStart + 1;
                        onSelectCount(clicked === n ? unitStart : clicked);
                      }
                    : undefined
                }
              />
            ) : (
              Array.from({ length: safeD }).map((__, segIdx) => {
                const globalIdx = unitStart + segIdx;
                const stepAngle = 360 / safeD;
                const startA = segIdx * stepAngle;
                const endA = (segIdx + 1) * stepAngle;
                const isFilled = globalIdx < n;

                return (
                  <g
                    key={segIdx}
                    style={{ cursor: onSelectCount ? 'pointer' : 'default' }}
                    onClick={
                      onSelectCount
                        ? () => {
                            playHapticAudioFeedback();
                            const clicked = globalIdx + 1;
                            onSelectCount(clicked === n ? globalIdx : clicked);
                          }
                        : undefined
                    }
                  >
                    <path
                      d={describeWedge(cx, cy, r, startA, endA)}
                      fill={isFilled ? fillColor : FRAC_COLORS.empty}
                      stroke={FRAC_COLORS.ink}
                      strokeWidth="3"
                      strokeLinejoin="round"
                    />
                    {subdivisions > 1 &&
                      Array.from({ length: subdivisions - 1 }).map((___, subIdx) => {
                        const subAngle = startA + ((subIdx + 1) * stepAngle) / subdivisions;
                        const pt = polarToCartesian(cx, cy, r, subAngle);
                        return (
                          <line
                            key={subIdx}
                            x1={cx}
                            y1={cy}
                            x2={pt.x}
                            y2={pt.y}
                            stroke={FRAC_COLORS.ink}
                            strokeWidth="1.8"
                            strokeDasharray="3 3"
                            opacity="0.7"
                          />
                        );
                      })}
                  </g>
                );
              })
            )}
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={FRAC_COLORS.ink}
              strokeWidth="3.5"
              pointerEvents="none"
            />
          </svg>
        );
      })}
    </div>
  );
}

/**
 * 2D Area Model for Multiplication: (a/b) x (c/d)
 * Vertical columns = b (first a tinted yellow)
 * Horizontal rows = d (first c tinted blue)
 * Overlap = a * c green cells out of b * d cells per unit square
 */
export function MultiplicationGrid({ a, b }) {
  const colsPerUnit = Math.max(1, a.d);
  const rowsPerUnit = Math.max(1, b.d);
  const unitCols = Math.max(1, Math.ceil(a.n / colsPerUnit));
  const unitRows = Math.max(1, Math.ceil(b.n / rowsPerUnit));

  const totalCols = unitCols * colsPerUnit;
  const totalRows = unitRows * rowsPerUnit;

  const gridW = Math.min(280, unitCols * 180);
  const gridH = Math.min(240, unitRows * 160);
  const padL = 28;
  const padT = 28;
  const svgW = gridW + padL + 16;
  const svgH = gridH + padT + 16;

  const cellW = gridW / totalCols;
  const cellH = gridH / totalRows;

  return (
    <div className="frac-mul-grid-wrap">
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="frac-mul-grid-svg"
        style={{ width: '100%', maxWidth: `${Math.max(260, svgW)}px`, height: 'auto' }}
        role="img"
        aria-label={`Griglia area per ${a.n}/${a.d} per ${b.n}/${b.d}`}
      >
        {/* Top label for A */}
        <text
          x={padL + gridW / 2}
          y="18"
          textAnchor="middle"
          fontFamily="var(--font-num)"
          fontSize="14"
          fontWeight="800"
          fill={FRAC_COLORS.ink}
        >
          {a.n}/{a.d} (colonne)
        </text>

        {/* Left label for B */}
        <text
          x="14"
          y={padT + gridH / 2}
          textAnchor="middle"
          fontFamily="var(--font-num)"
          fontSize="14"
          fontWeight="800"
          fill={FRAC_COLORS.ink}
          transform={`rotate(-90 14 ${padT + gridH / 2})`}
        >
          {b.n}/{b.d} (righe)
        </text>

        {/* Cells */}
        {Array.from({ length: totalRows }).map((_, r) =>
          Array.from({ length: totalCols }).map((__, c) => {
            const inA = c < a.n;
            const inB = r < b.n;
            let fill = FRAC_COLORS.empty;
            if (inA && inB) fill = FRAC_COLORS.result;
            else if (inA) fill = '#FDE5B6';
            else if (inB) fill = '#D7EBF8';

            return (
              <rect
                key={`${r}-${c}`}
                x={padL + c * cellW}
                y={padT + r * cellH}
                width={cellW}
                height={cellH}
                fill={fill}
                stroke={FRAC_COLORS.ink}
                strokeWidth="1.8"
              />
            );
          })
        )}

        {/* Thick unit square dividers if improper */}
        {Array.from({ length: unitCols + 1 }).map((_, u) => (
          <line
            key={`uc-${u}`}
            x1={padL + u * colsPerUnit * cellW}
            y1={padT}
            x2={padL + u * colsPerUnit * cellW}
            y2={padT + gridH}
            stroke={FRAC_COLORS.ink}
            strokeWidth="3.5"
          />
        ))}
        {Array.from({ length: unitRows + 1 }).map((_, u) => (
          <line
            key={`ur-${u}`}
            x1={padL}
            y1={padT + u * rowsPerUnit * cellH}
            x2={padL + gridW}
            y2={padT + u * rowsPerUnit * cellH}
            stroke={FRAC_COLORS.ink}
            strokeWidth="3.5"
          />
        ))}
      </svg>

      <div className="frac-legend-row">
        <span className="frac-legend-chip">
          <span className="frac-swatch" style={{ background: '#FDE5B6' }} />
          Solo {a.n}/{a.d}
        </span>
        <span className="frac-legend-chip">
          <span className="frac-swatch" style={{ background: '#D7EBF8' }} />
          Solo {b.n}/{b.d}
        </span>
        <span className="frac-legend-chip frac-legend-chip--strong">
          <span className="frac-swatch" style={{ background: FRAC_COLORS.result }} />
          Incrocio: {a.n * b.n} su {a.d * b.d}
        </span>
      </div>
    </div>
  );
}

/**
 * Visual measurement bar for Division: (a/b) ÷ (c/d)
 * Shows A and B expressed in commonDenominator units,
 * with numbered brackets showing how many times B fits into A!
 */
export function DivisionMeasurementBar({ aScaled, bScaled, commonDen }) {
  const maxUnits = Math.max(aScaled, bScaled, commonDen);
  const fullGroups = bScaled > 0 ? Math.floor(aScaled / bScaled) : 0;
  const rem = bScaled > 0 ? aScaled % bScaled : 0;

  const barW = 320;
  const padX = 12;
  const segW = barW / maxUnits;
  const svgW = barW + padX * 2;

  return (
    <div className="frac-div-measure">
      <svg
        viewBox={`0 0 ${svgW} 106`}
        style={{ width: '100%', maxWidth: '420px', height: 'auto' }}
        role="img"
        aria-label={`Quante volte ${bScaled}/${commonDen} entra in ${aScaled}/${commonDen}`}
      >
        {/* Top brackets showing groups of size bScaled */}
        {Array.from({ length: fullGroups }).map((_, gIdx) => {
          const x1 = padX + gIdx * bScaled * segW + 2;
          const x2 = padX + (gIdx + 1) * bScaled * segW - 2;
          const mid = (x1 + x2) / 2;
          return (
            <g key={`g-${gIdx}`}>
              <path
                d={`M ${x1} 34 L ${x1} 24 L ${x2} 24 L ${x2} 34`}
                fill="none"
                stroke={FRAC_COLORS.ink}
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx={mid} cy="13" r="10" fill={FRAC_COLORS.result} stroke={FRAC_COLORS.ink} strokeWidth="2" />
              <text
                x={mid}
                y="17"
                textAnchor="middle"
                fontFamily="var(--font-num)"
                fontSize="11"
                fontWeight="800"
                fill={FRAC_COLORS.ink}
              >
                {gIdx + 1}
              </text>
            </g>
          );
        })}

        {/* Remainder partial bracket */}
        {rem > 0 && (
          <g>
            {(() => {
              const x1 = padX + fullGroups * bScaled * segW + 2;
              const x2 = padX + aScaled * segW - 2;
              const mid = (x1 + x2) / 2;
              return (
                <>
                  <path
                    d={`M ${x1} 34 L ${x1} 24 L ${x2} 24 L ${x2} 34`}
                    fill="none"
                    stroke={FRAC_COLORS.ink}
                    strokeWidth="2.5"
                    strokeDasharray="4 3"
                  />
                  <text
                    x={mid}
                    y="17"
                    textAnchor="middle"
                    fontFamily="var(--font-num)"
                    fontSize="11"
                    fontWeight="800"
                    fill={FRAC_COLORS.ink}
                  >
                    +{rem}/{bScaled}
                  </text>
                </>
              );
            })()}
          </g>
        )}

        {/* Bar A (dividend) */}
        {Array.from({ length: maxUnits }).map((_, idx) => {
          const filled = idx < aScaled;
          return (
            <rect
              key={`a-${idx}`}
              x={padX + idx * segW}
              y="38"
              width={segW}
              height="26"
              fill={filled ? FRAC_COLORS.a : FRAC_COLORS.empty}
              stroke={FRAC_COLORS.ink}
              strokeWidth="2"
            />
          );
        })}

        {/* Bar B (divisor reference below) */}
        {Array.from({ length: bScaled }).map((_, idx) => (
          <rect
            key={`b-${idx}`}
            x={padX + idx * segW}
            y="72"
            width={segW}
            height="20"
            fill={FRAC_COLORS.b}
            stroke={FRAC_COLORS.ink}
            strokeWidth="2"
          />
        ))}
        <text
          x={padX + bScaled * segW + 8}
          y="86"
          fontFamily="var(--font-main)"
          fontSize="12"
          fontWeight="700"
          fill={FRAC_COLORS.ink}
        >
          1 blocco = {bScaled}/{commonDen}
        </text>
      </svg>
    </div>
  );
}

/**
 * Tactile stepper control for editing a fraction (numerator & denominator)
 */
export function FractionStepper({
  label,
  value,
  onChange,
  accentColor = FRAC_COLORS.a,
  minN = 0,
  maxN = 12,
  minD = 1,
  maxD = 12,
}) {
  const decN = () => {
    if (value.n > minN) {
      playHapticAudioFeedback();
      onChange({ ...value, n: value.n - 1 });
    }
  };
  const incN = () => {
    if (value.n < maxN) {
      playHapticAudioFeedback();
      onChange({ ...value, n: value.n + 1 });
    }
  };
  const decD = () => {
    if (value.d > minD) {
      playHapticAudioFeedback();
      onChange({ ...value, d: value.d - 1 });
    }
  };
  const incD = () => {
    if (value.d < maxD) {
      playHapticAudioFeedback();
      onChange({ ...value, d: value.d + 1 });
    }
  };

  return (
    <div className="frac-stepper" style={{ '--stepper-accent': accentColor }}>
      {label && <div className="frac-stepper__label">{label}</div>}
      <div className="frac-stepper__row">
        <button
          type="button"
          className="neo-btn frac-step-btn"
          onClick={decN}
          disabled={value.n <= minN}
          aria-label="Diminuisci numeratore"
        >
          −
        </button>
        <span className="frac-stepper__num">{value.n}</span>
        <button
          type="button"
          className="neo-btn frac-step-btn"
          onClick={incN}
          disabled={value.n >= maxN}
          aria-label="Aumenta numeratore"
        >
          +
        </button>
      </div>
      <div className="frac-stepper__bar" />
      <div className="frac-stepper__row">
        <button
          type="button"
          className="neo-btn frac-step-btn"
          onClick={decD}
          disabled={value.d <= minD}
          aria-label="Diminuisci denominatore"
        >
          −
        </button>
        <span className="frac-stepper__den">{value.d}</span>
        <button
          type="button"
          className="neo-btn frac-step-btn"
          onClick={incD}
          disabled={value.d >= maxD}
          aria-label="Aumenta denominatore"
        >
          +
        </button>
      </div>
    </div>
  );
}
