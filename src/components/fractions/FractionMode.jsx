import React, { useState } from 'react';
import { playHapticAudioFeedback } from '../AudioHaptic';
import {
  FRAC_COLORS,
  addFractions,
  subFractions,
  mulFractions,
  divFractions,
  simplify,
  toMixed,
  classifyFraction,
  readFractionItalian,
} from './fractionMath';
import {
  FractionNotation,
  FractionBar,
  FractionPie,
  MultiplicationGrid,
  DivisionMeasurementBar,
  FractionStepper,
} from './FractionVisuals';
import './fractions.css';

const TABS = [
  { id: 'explore', label: 'Esplora' },
  { id: 'equiv', label: 'Equivalenti' },
  { id: 'addsub', label: '+  −' },
  { id: 'muldiv', label: '×  ÷' },
];

const EXPLORE_PRESETS = [
  { n: 1, d: 2 },
  { n: 1, d: 3 },
  { n: 3, d: 4 },
  { n: 2, d: 5 },
  { n: 5, d: 4 },
];

const EQUIV_PRESETS = [
  { n: 1, d: 2 },
  { n: 1, d: 3 },
  { n: 2, d: 3 },
  { n: 3, d: 4 },
  { n: 2, d: 5 },
];

export default function FractionMode() {
  const [tab, setTab] = useState('explore');

  // Tab 1: Explore
  const [expFrac, setExpFrac] = useState({ n: 3, d: 4 });

  // Tab 2: Equivalent
  const [eqBase, setEqBase] = useState({ n: 1, d: 2 });
  const [eqTargetD, setEqTargetD] = useState(4);
  const [showCuts, setShowCuts] = useState(true);

  // Tab 3: Add / Sub
  const [asOp, setAsOp] = useState('ADD'); // ADD | SUB
  const [asA, setAsA] = useState({ n: 1, d: 2 });
  const [asB, setAsB] = useState({ n: 1, d: 3 });

  // Tab 4: Mul / Div
  const [mdOp, setMdOp] = useState('MUL'); // MUL | DIV
  const [mdA, setMdA] = useState({ n: 2, d: 3 });
  const [mdB, setMdB] = useState({ n: 3, d: 4 });

  const switchTab = (nextTab) => {
    playHapticAudioFeedback();
    setTab(nextTab);
  };

  // --- Render Tab 1: ESPLORA ---
  const renderExplore = () => {
    const { n, d } = expFrac;
    const simp = simplify(n, d);
    const mixed = toMixed(n, d);
    const cls = classifyFraction(n, d);
    const reading = readFractionItalian(n, d);

    return (
      <div className="frac-stage">
        {/* Preset bar */}
        <div className="frac-presets">
          {EXPLORE_PRESETS.map((p) => {
            const active = p.n === n && p.d === d;
            return (
              <button
                key={`${p.n}/${p.d}`}
                type="button"
                className={`neo-btn frac-preset-btn ${active ? 'is-active' : ''}`}
                onClick={() => {
                  playHapticAudioFeedback();
                  setExpFrac(p);
                }}
              >
                {p.n}/{p.d}
              </button>
            );
          })}
        </div>

        {/* Main visual + stepper layout */}
        <div className="frac-explore-grid">
          <div className="frac-panel frac-panel--controls">
            <FractionStepper
              label="Costruisci la frazione"
              value={expFrac}
              onChange={setExpFrac}
              accentColor={FRAC_COLORS.a}
              minN={0}
              maxN={Math.min(16, d * 2)}
              minD={1}
              maxD={12}
            />

            <div className="frac-meaning-list">
              <div className="frac-meaning-item">
                <span className="frac-dot" style={{ background: FRAC_COLORS.a }} />
                <span>
                  <strong>Numeratore ({n}):</strong> quante parti prendi
                </span>
              </div>
              <div className="frac-meaning-item">
                <span className="frac-dot" style={{ background: FRAC_COLORS.ink }} />
                <span>
                  <strong>Denominatore ({d}):</strong> in quante parti dividi 1 intero
                </span>
              </div>
            </div>
          </div>

          <div className="frac-panel frac-panel--visual">
            <div className="frac-summary-row">
              <span className="frac-reading">“{reading}”</span>
              <span className={`frac-badge frac-badge--${cls.type}`}>{cls.label}</span>
              {simp.factor > 1 && n > 0 && (
                <span className="frac-badge frac-badge--equiv">
                  = {simp.n}/{simp.d}
                </span>
              )}
              {mixed.whole > 0 && mixed.rem > 0 && (
                <span className="frac-badge frac-badge--mixed">
                  = {mixed.whole} + {mixed.rem}/{mixed.d}
                </span>
              )}
            </div>

            <div className="frac-visual-block">
              <div className="frac-visual-caption">Barra (tocca un blocco per colorarlo)</div>
              <FractionBar
                n={n}
                d={d}
                fillColor={FRAC_COLORS.a}
                height={56}
                showUnitLabels
                onSelectCount={(count) => setExpFrac({ n: count, d })}
              />
            </div>

            <div className="frac-visual-block">
              <div className="frac-visual-caption">Cerchio (tocca uno spicchio)</div>
              <FractionPie
                n={n}
                d={d}
                fillColor={FRAC_COLORS.a}
                size={152}
                onSelectCount={(count) => setExpFrac({ n: count, d })}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- Render Tab 2: EQUIVALENTI ---
  const renderEquivalent = () => {
    const { n, d } = eqBase;
    const simp = simplify(n, d);
    const ratio = Math.min(1, n / d);

    const isExactEquiv = eqTargetD % simp.d === 0;
    const eqN = isExactEquiv ? (eqTargetD / simp.d) * simp.n : null;
    const exactFloat = (n * eqTargetD) / d;
    const exactFloatLabel = exactFloat.toFixed(2).replace(/\.?0+$/, '').replace('.', ',');

    // Determine relationship between base denominator d and eqTargetD
    const isDirectMult = eqTargetD >= d && eqTargetD % d === 0;
    const directMult = isDirectMult ? eqTargetD / d : null;
    const isDirectDiv = eqTargetD < d && d % eqTargetD === 0 && isExactEquiv;
    const directDiv = isDirectDiv ? d / eqTargetD : null;

    // Dashed subdivisions only apply when showCuts is ON and target is a clean multiple of base
    const barSubdivisions = showCuts && directMult && directMult > 1 ? directMult : 1;

    // Nearest valid denominators when target doesn't divide evenly
    const prevValidD = Math.floor(eqTargetD / simp.d) * simp.d;
    const nextValidD = Math.ceil(eqTargetD / simp.d) * simp.d;
    const suggestedDs = [prevValidD, nextValidD].filter((v) => v >= 2 && v <= 24 && v !== eqTargetD);

    const updateEqBase = (nextBase) => {
      const clampedN = Math.min(nextBase.n, nextBase.d);
      const next = { n: clampedN, d: nextBase.d };
      setEqBase(next);
      // Keep current multiplier if it was a clean multiple, otherwise default to ×2
      const keepK = directMult && directMult >= 1 && directMult <= 5 ? directMult : 2;
      setEqTargetD(Math.min(24, next.d * keepK));
    };

    return (
      <div className="frac-stage">
        <div className="frac-presets">
          {EQUIV_PRESETS.map((p) => {
            const active = p.n === n && p.d === d;
            return (
              <button
                key={`${p.n}/${p.d}`}
                type="button"
                className={`neo-btn frac-preset-btn ${active ? 'is-active' : ''}`}
                onClick={() => {
                  playHapticAudioFeedback();
                  updateEqBase(p);
                }}
              >
                {p.n}/{p.d}
              </button>
            );
          })}
          {simp.factor > 1 && n > 0 && (
            <button
              type="button"
              className="neo-btn frac-preset-btn frac-preset-btn--green"
              onClick={() => {
                playHapticAudioFeedback();
                setEqBase({ n: simp.n, d: simp.d });
                setEqTargetD(d);
              }}
            >
              Semplifica (÷{simp.factor})
            </button>
          )}
          <button
            type="button"
            className={`neo-btn frac-toggle-btn ${showCuts ? 'is-on' : ''}`}
            onClick={() => {
              playHapticAudioFeedback();
              setShowCuts((v) => !v);
            }}
            aria-pressed={showCuts}
          >
            {showCuts ? '✂ Linee tratteggiate: SÌ' : '✂ Linee tratteggiate: NO'}
          </button>
        </div>

        <div className="frac-explore-grid">
          <div className="frac-panel frac-panel--controls">
            <FractionStepper
              label="Frazione di partenza"
              value={eqBase}
              onChange={updateEqBase}
              accentColor={FRAC_COLORS.a}
              minN={1}
              maxN={eqBase.d}
              minD={2}
              maxD={8}
            />

            <div className="frac-mult-box">
              <div className="frac-stepper__label">Moltiplicatore rapido</div>
              <div className="frac-mult-buttons">
                {[1, 2, 3, 4, 5].map((k) => {
                  const candidateD = d * k;
                  const disabled = candidateD > 24;
                  const active = eqTargetD === candidateD;
                  return (
                    <button
                      key={k}
                      type="button"
                      disabled={disabled}
                      className={`neo-btn frac-mult-btn ${active ? 'is-active' : ''}`}
                      onClick={() => {
                        playHapticAudioFeedback();
                        setEqTargetD(candidateD);
                      }}
                    >
                      ×{k}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="frac-target-den-box">
              <div className="frac-stepper__label">Oppure scegli il denominatore</div>
              <div className="frac-stepper__row">
                <button
                  type="button"
                  className="neo-btn frac-step-btn"
                  style={{ '--stepper-accent': FRAC_COLORS.result }}
                  disabled={eqTargetD <= 2}
                  onClick={() => {
                    playHapticAudioFeedback();
                    setEqTargetD((prev) => Math.max(2, prev - 1));
                  }}
                  aria-label="Diminuisci denominatore target"
                >
                  −
                </button>
                <span className="frac-stepper__den">{eqTargetD}</span>
                <button
                  type="button"
                  className="neo-btn frac-step-btn"
                  style={{ '--stepper-accent': FRAC_COLORS.result }}
                  disabled={eqTargetD >= 24}
                  onClick={() => {
                    playHapticAudioFeedback();
                    setEqTargetD((prev) => Math.min(24, prev + 1));
                  }}
                  aria-label="Aumenta denominatore target"
                >
                  +
                </button>
              </div>
              {isExactEquiv && (
                <div className="frac-auto-num-pill">
                  Numeratore calcolato: <strong>{eqN}</strong>
                </div>
              )}
            </div>
          </div>

          <div className="frac-panel frac-panel--visual">
            {isExactEquiv ? (
              <>
                {/* Formula explanation */}
                <div className="frac-eq-formula">
                  <FractionNotation n={n} d={d} size="md" />
                  {directMult ? (
                    <div className="frac-eq-arrow">
                      <span className="frac-eq-op">×{directMult}</span>
                      <span className="frac-eq-equals">=</span>
                      <span className="frac-eq-op">×{directMult}</span>
                    </div>
                  ) : directDiv ? (
                    <div className="frac-eq-arrow">
                      <span className="frac-eq-op">÷{directDiv}</span>
                      <span className="frac-eq-equals">=</span>
                      <span className="frac-eq-op">÷{directDiv}</span>
                    </div>
                  ) : (
                    <>
                      <span className="frac-eq-equals">=</span>
                      <FractionNotation n={simp.n} d={simp.d} size="sm" />
                      <span className="frac-eq-equals">=</span>
                    </>
                  )}
                  <FractionNotation n={eqN} d={eqTargetD} size="md" highlight />
                </div>

                <p className="frac-explain-line">
                  {directMult ? (
                    <>
                      Moltiplicando <strong>numeratore</strong> e <strong>denominatore</strong> per{' '}
                      <strong>{directMult}</strong>, le fette diventano più piccole ma la{' '}
                      <strong>quantità colorata resta identica</strong>.
                    </>
                  ) : directDiv ? (
                    <>
                      Dividendo <strong>numeratore</strong> e <strong>denominatore</strong> per{' '}
                      <strong>{directDiv}</strong>, le fette si uniscono in parti più grandi ma la{' '}
                      <strong>quantità colorata resta identica</strong>.
                    </>
                  ) : (
                    <>
                      Entrambe le frazioni si semplificano in{' '}
                      <strong>
                        {simp.n}/{simp.d}
                      </strong>
                      : la <strong>quantità colorata è identica</strong>!
                    </>
                  )}
                </p>

                {/* Stacked aligned bars */}
                <div className="frac-equiv-bars">
                  <div className="frac-equiv-row">
                    <span className="frac-equiv-tag">{n}/{d}</span>
                    <div className="frac-equiv-bar-slot">
                      <FractionBar
                        n={n}
                        d={d}
                        fillColor={FRAC_COLORS.a}
                        subdivisions={barSubdivisions}
                        height={48}
                      />
                    </div>
                  </div>

                  <div className="frac-equiv-row">
                    <span className="frac-equiv-tag frac-equiv-tag--green">
                      {eqN}/{eqTargetD}
                    </span>
                    <div className="frac-equiv-bar-slot">
                      <FractionBar
                        n={eqN}
                        d={eqTargetD}
                        fillColor={FRAC_COLORS.result}
                        height={48}
                      />
                    </div>
                  </div>

                  {ratio > 0 && ratio < 1 && (
                    <div className="frac-align-note">
                      Stessa lunghezza: <strong>{Math.round(ratio * 100)}%</strong> dell’intero
                    </div>
                  )}
                </div>

                {/* Side-by-side pies */}
                <div className="frac-equiv-pies">
                  <div className="frac-pie-card">
                    <FractionPie
                      n={n}
                      d={d}
                      fillColor={FRAC_COLORS.a}
                      subdivisions={barSubdivisions}
                      size={118}
                    />
                    <span className="frac-pie-label">{n}/{d}</span>
                  </div>
                  <span className="frac-big-sym">=</span>
                  <div className="frac-pie-card">
                    <FractionPie
                      n={eqN}
                      d={eqTargetD}
                      fillColor={FRAC_COLORS.result}
                      size={118}
                    />
                    <span className="frac-pie-label">{eqN}/{eqTargetD}</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="frac-warning-box">
                  <p>
                    Con denominatore <strong>{eqTargetD}</strong> non si ottiene una frazione
                    equivalente esatta per <strong>{n}/{d}</strong> (servirebbero{' '}
                    <strong>{exactFloatLabel}</strong> parti intere su {eqTargetD}).
                  </p>
                  {suggestedDs.length > 0 && (
                    <div className="frac-suggest-row">
                      <span>Prova un denominatore compatibile:</span>
                      {suggestedDs.map((sd) => (
                        <button
                          key={sd}
                          type="button"
                          className="neo-btn frac-preset-btn frac-preset-btn--green"
                          onClick={() => {
                            playHapticAudioFeedback();
                            setEqTargetD(sd);
                          }}
                        >
                          Usa /{sd}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="frac-equiv-bars">
                  <div className="frac-equiv-row">
                    <span className="frac-equiv-tag">{n}/{d}</span>
                    <div className="frac-equiv-bar-slot">
                      <FractionBar n={n} d={d} fillColor={FRAC_COLORS.a} height={48} />
                    </div>
                  </div>
                  <div className="frac-equiv-row">
                    <span className="frac-equiv-tag">?/{eqTargetD}</span>
                    <div className="frac-equiv-bar-slot">
                      <FractionBar
                        n={Math.floor(exactFloat)}
                        d={eqTargetD}
                        fillColor={FRAC_COLORS.b}
                        height={48}
                      />
                    </div>
                  </div>
                  <div className="frac-align-note">
                    I tagli di /{eqTargetD} non cadono esattamente sul bordo di {n}/{d}.
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  // --- Render Tab 3: SOMME E DIFFERENZE ---
  const renderAddSub = () => {
    const isSub = asOp === 'SUB';
    const res = isSub ? subFractions(asA, asB) : addFractions(asA, asB);
    const sameDen = asA.d === asB.d;
    const minUnits = Math.max(
      1,
      Math.ceil(res.aScaled / res.commonDen),
      Math.ceil(res.bScaled / res.commonDen)
    );

    const swapAB = () => {
      playHapticAudioFeedback();
      const prevA = asA;
      setAsA(asB);
      setAsB(prevA);
    };

    return (
      <div className="frac-stage">
        {/* Top controls: A [+/-] B */}
        <div className="frac-op-controls">
          <FractionStepper
            label="Frazione A"
            value={asA}
            onChange={setAsA}
            accentColor={FRAC_COLORS.a}
            minN={0}
            maxN={10}
            minD={1}
            maxD={8}
          />

          <div className="frac-op-toggle">
            <button
              type="button"
              className={`neo-btn frac-op-btn ${!isSub ? 'is-plus' : ''}`}
              onClick={() => {
                playHapticAudioFeedback();
                setAsOp('ADD');
              }}
              aria-label="Addizione"
            >
              +
            </button>
            <button
              type="button"
              className={`neo-btn frac-op-btn ${isSub ? 'is-minus' : ''}`}
              onClick={() => {
                playHapticAudioFeedback();
                setAsOp('SUB');
              }}
              aria-label="Sottrazione"
            >
              −
            </button>
          </div>

          <FractionStepper
            label="Frazione B"
            value={asB}
            onChange={setAsB}
            accentColor={FRAC_COLORS.b}
            minN={0}
            maxN={10}
            minD={1}
            maxD={8}
          />
        </div>

        {/* Step-by-step visual cards */}
        <div className="frac-steps-grid">
          {/* Step 1: Common denominator conversion */}
          <div className="frac-panel">
            <div className="frac-step-header frac-step-header--between">
              <div className="frac-step-header">
                <span className="frac-step-pill">1</span>
                <h3>
                  {sameDen
                    ? `Stesso denominatore (${res.commonDen})`
                    : `Denominatore comune: ${res.commonDen}`}
                </h3>
              </div>
              {!sameDen && (
                <button
                  type="button"
                  className={`neo-btn frac-toggle-btn frac-toggle-btn--sm ${showCuts ? 'is-on' : ''}`}
                  onClick={() => {
                    playHapticAudioFeedback();
                    setShowCuts((v) => !v);
                  }}
                  aria-pressed={showCuts}
                >
                  {showCuts ? '✂ Linee: SÌ' : '✂ Linee: NO'}
                </button>
              )}
            </div>

            {!sameDen && (
              <p className="frac-explain-line">
                Per {isSub ? 'sottrarre' : 'sommare'}, tagliamo entrambe le barre in{' '}
                <strong>{res.commonDen}</strong> parti uguali (m.c.m. di {asA.d} e {asB.d}).
              </p>
            )}

            <div className="frac-conv-list">
              <div className="frac-conv-row">
                <div className="frac-conv-math">
                  <FractionNotation n={asA.n} d={asA.d} size="sm" />
                  {!sameDen && (
                    <>
                      <span className="frac-conv-eq">=</span>
                      <FractionNotation n={res.aScaled} d={res.commonDen} size="sm" highlight />
                    </>
                  )}
                </div>
                <div className="frac-conv-bar">
                  <FractionBar
                    n={asA.n}
                    d={asA.d}
                    fillColor={FRAC_COLORS.a}
                    subdivisions={showCuts ? res.mulA : 1}
                    minUnits={minUnits}
                    height={40}
                    compact
                  />
                </div>
              </div>

              <div className="frac-conv-row">
                <div className="frac-conv-math">
                  <FractionNotation n={asB.n} d={asB.d} size="sm" />
                  {!sameDen && (
                    <>
                      <span className="frac-conv-eq">=</span>
                      <FractionNotation n={res.bScaled} d={res.commonDen} size="sm" highlight />
                    </>
                  )}
                </div>
                <div className="frac-conv-bar">
                  <FractionBar
                    n={asB.n}
                    d={asB.d}
                    fillColor={FRAC_COLORS.b}
                    subdivisions={showCuts ? res.mulB : 1}
                    minUnits={minUnits}
                    height={40}
                    compact
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Visual Result */}
          <div className="frac-panel frac-panel--result">
            <div className="frac-step-header">
              <span className="frac-step-pill frac-step-pill--green">2</span>
              <h3>{isSub ? 'Togliamo le parti' : 'Uniamo le parti'}</h3>
            </div>

            {isSub && res.isNegative ? (
              <div className="frac-warning-box">
                <p>
                  <strong>{asA.n}/{asA.d}</strong> è più piccola di <strong>{asB.n}/{asB.d}</strong>:
                  non ci sono abbastanza parti da togliere!
                </p>
                <button
                  type="button"
                  className="neo-btn frac-swap-btn"
                  onClick={swapAB}
                >
                  ⇄ Scambia A e B
                </button>
              </div>
            ) : (
              <>
                <div className="frac-result-equation">
                  <FractionNotation n={res.aScaled} d={res.commonDen} size="sm" />
                  <span className="frac-big-sym">{isSub ? '−' : '+'}</span>
                  <FractionNotation n={res.bScaled} d={res.commonDen} size="sm" />
                  <span className="frac-big-sym">=</span>
                  <FractionNotation n={res.raw.n} d={res.raw.d} size="md" highlight />
                  {res.simplified.factor > 1 && res.raw.n > 0 && (
                    <>
                      <span className="frac-big-sym">=</span>
                      <FractionNotation
                        n={res.simplified.n}
                        d={res.simplified.d}
                        size="md"
                        highlight
                      />
                    </>
                  )}
                </div>

                {res.mixed.whole > 0 && res.mixed.rem > 0 && (
                  <div className="frac-mixed-note">
                    Numero misto: <strong>{res.mixed.whole}</strong>{' '}
                    {res.mixed.whole === 1 ? 'intero' : 'interi'} +{' '}
                    <strong>
                      {res.mixed.rem}/{res.mixed.d}
                    </strong>
                  </div>
                )}

                <div className="frac-visual-block">
                  {isSub ? (
                    <FractionBar
                      n={res.raw.n}
                      d={res.commonDen}
                      fillColor={FRAC_COLORS.result}
                      removedCount={res.bScaled}
                      height={52}
                      showUnitLabels
                    />
                  ) : (
                    <FractionBar
                      n={res.aScaled}
                      d={res.commonDen}
                      fillColor={FRAC_COLORS.a}
                      secondCount={res.bScaled}
                      secondColor={FRAC_COLORS.b}
                      height={52}
                      showUnitLabels
                    />
                  )}
                </div>

                <div className="frac-legend-row">
                  {isSub ? (
                    <>
                      <span className="frac-legend-chip frac-legend-chip--strong">
                        <span className="frac-swatch" style={{ background: FRAC_COLORS.result }} />
                        Restano: {res.raw.n}
                      </span>
                      <span className="frac-legend-chip">
                        <span className="frac-swatch" style={{ background: '#FCE4E5' }} />
                        Tolte: {res.bScaled}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="frac-legend-chip">
                        <span className="frac-swatch" style={{ background: FRAC_COLORS.a }} />
                        Da A: {res.aScaled}
                      </span>
                      <span className="frac-legend-chip">
                        <span className="frac-swatch" style={{ background: FRAC_COLORS.b }} />
                        Da B: {res.bScaled}
                      </span>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  // --- Render Tab 4: MOLTIPLICAZIONI E DIVISIONI ---
  const renderMulDiv = () => {
    const isDiv = mdOp === 'DIV';
    const safeB = isDiv && mdB.n === 0 ? { ...mdB, n: 1 } : mdB;
    const mulRes = mulFractions(mdA, safeB);
    const divRes = divFractions(mdA, safeB);
    const res = isDiv ? divRes : mulRes;

    return (
      <div className="frac-stage">
        <div className="frac-op-controls">
          <FractionStepper
            label="Frazione A"
            value={mdA}
            onChange={setMdA}
            accentColor={FRAC_COLORS.a}
            minN={1}
            maxN={6}
            minD={1}
            maxD={6}
          />

          <div className="frac-op-toggle">
            <button
              type="button"
              className={`neo-btn frac-op-btn ${!isDiv ? 'is-plus' : ''}`}
              onClick={() => {
                playHapticAudioFeedback();
                setMdOp('MUL');
              }}
              aria-label="Moltiplicazione"
            >
              ×
            </button>
            <button
              type="button"
              className={`neo-btn frac-op-btn ${isDiv ? 'is-minus' : ''}`}
              onClick={() => {
                playHapticAudioFeedback();
                setMdOp('DIV');
                if (mdB.n === 0) setMdB({ ...mdB, n: 1 });
              }}
              aria-label="Divisione"
            >
              ÷
            </button>
          </div>

          <FractionStepper
            label="Frazione B"
            value={safeB}
            onChange={setMdB}
            accentColor={FRAC_COLORS.b}
            minN={1}
            maxN={6}
            minD={1}
            maxD={6}
          />
        </div>

        <div className="frac-steps-grid">
          {/* Left: Visual intuition */}
          <div className="frac-panel">
            <div className="frac-step-header">
              <span className="frac-step-pill">1</span>
              <h3>{isDiv ? 'Quante volte ci sta?' : 'Modello ad area (incrocio)'}</h3>
            </div>

            {!isDiv ? (
              <>
                <p className="frac-explain-line">
                  Prendiamo <strong>{mdA.n}/{mdA.d}</strong> delle colonne e{' '}
                  <strong>{safeB.n}/{safeB.d}</strong> delle righe: le caselle{' '}
                  <strong>verdi</strong> sono il risultato!
                </p>
                <MultiplicationGrid a={mdA} b={safeB} />
              </>
            ) : (
              <>
                <p className="frac-explain-line">
                  Con denominatore comune <strong>{divRes.commonDen}</strong>, contiamo quanti
                  blocchi da <strong>{divRes.bScaled}/{divRes.commonDen}</strong> entrano in{' '}
                  <strong>{divRes.aScaled}/{divRes.commonDen}</strong>:
                </p>
                <DivisionMeasurementBar
                  aScaled={divRes.aScaled}
                  bScaled={divRes.bScaled}
                  commonDen={divRes.commonDen}
                />
              </>
            )}
          </div>

          {/* Right: Rule + Result */}
          <div className="frac-panel frac-panel--result">
            <div className="frac-step-header">
              <span className="frac-step-pill frac-step-pill--green">2</span>
              <h3>{isDiv ? 'Regola: inverti e moltiplica' : 'Regola: dritto per dritto'}</h3>
            </div>

            {!isDiv ? (
              <>
                <p className="frac-explain-line">
                  Moltiplica <strong>numeratore × numeratore</strong> e{' '}
                  <strong>denominatore × denominatore</strong>.
                </p>
                <div className="frac-result-equation">
                  <FractionNotation n={mdA.n} d={mdA.d} size="sm" />
                  <span className="frac-big-sym">×</span>
                  <FractionNotation n={safeB.n} d={safeB.d} size="sm" />
                  <span className="frac-big-sym">=</span>
                  <FractionNotation
                    n={`${mdA.n}×${safeB.n}`}
                    d={`${mdA.d}×${safeB.d}`}
                    size="sm"
                  />
                  <span className="frac-big-sym">=</span>
                  <FractionNotation n={res.raw.n} d={res.raw.d} size="md" highlight />
                </div>
              </>
            ) : (
              <>
                <p className="frac-explain-line">
                  Capovolgi la seconda frazione (<strong>{safeB.n}/{safeB.d}</strong> →{' '}
                  <strong>{safeB.d}/{safeB.n}</strong>) e trasforma <strong>÷</strong> in{' '}
                  <strong>×</strong>.
                </p>
                <div className="frac-result-equation">
                  <FractionNotation n={mdA.n} d={mdA.d} size="sm" />
                  <span className="frac-big-sym">×</span>
                  <FractionNotation
                    n={divRes.reciprocal.n}
                    d={divRes.reciprocal.d}
                    size="sm"
                    highlight
                  />
                  <span className="frac-big-sym">=</span>
                  <FractionNotation n={res.raw.n} d={res.raw.d} size="md" highlight />
                </div>
              </>
            )}

            {/* Simplified & Mixed summary */}
            {res.simplified.factor > 1 && (
              <div className="frac-simp-banner">
                <span>Semplificata (÷{res.simplified.factor}):</span>
                <FractionNotation
                  n={res.simplified.n}
                  d={res.simplified.d}
                  size="md"
                  highlight
                />
              </div>
            )}

            {res.mixed.whole > 0 && res.mixed.rem > 0 && (
              <div className="frac-mixed-note">
                Numero misto: <strong>{res.mixed.whole}</strong>{' '}
                {res.mixed.whole === 1 ? 'intero' : 'interi'} +{' '}
                <strong>
                  {res.mixed.rem}/{res.mixed.d}
                </strong>
              </div>
            )}

            {res.mixed.whole > 0 && res.mixed.rem === 0 && (
              <div className="frac-mixed-note">
                Risultato intero: <strong>{res.mixed.whole}</strong>
              </div>
            )}

            <div className="frac-visual-block">
              <div className="frac-visual-caption">Risultato visivo</div>
              <FractionBar
                n={res.simplified.n}
                d={res.simplified.d}
                fillColor={FRAC_COLORS.result}
                height={46}
                showUnitLabels
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="frac-root">
      {/* Top navigation tabs (leaves room for Fullscreen on left & OP on right) */}
      <header className="frac-header">
        <nav className="frac-tabs" aria-label="Sezioni frazioni">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`neo-btn frac-tab-btn ${tab === t.id ? 'is-active' : ''}`}
              onClick={() => switchTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="frac-workspace">
        {tab === 'explore' && renderExplore()}
        {tab === 'equiv' && renderEquivalent()}
        {tab === 'addsub' && renderAddSub()}
        {tab === 'muldiv' && renderMulDiv()}
      </main>
    </div>
  );
}
