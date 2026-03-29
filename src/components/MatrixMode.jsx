import React, { useState } from 'react';
import { playHapticAudioFeedback } from './AudioHaptic';

export default function MatrixMode({ operation, resetApp }) {
  const isDiv = operation === 'DIV';

  // phase: 1 = choose base, 2 = choose secondary parameter
  const [phase, setPhase] = useState(1);
  
  // Per Moltiplicazione: p1 = Pallini/Riga, p2 = Numero di Righe
  // Per Divisione: p1 = Totale Pallini, p2 = Gruppi da (Divisore)
  const [p1, setP1] = useState(1); 
  const [p2, setP2] = useState(1);
  
  const handleMinus = () => {
    playHapticAudioFeedback();
    if (phase === 1) {
      if (p1 > 1) setP1(p1 - 1);
    } else {
      if (p2 > 1) setP2(p2 - 1);
    }
  };

  const handlePlus = () => {
    playHapticAudioFeedback();
    if (phase === 1) {
      if (p1 < 50) setP1(p1 + 1);
    } else {
      if (p2 < 50) setP2(p2 + 1);
    }
  };

  const concludePhase = () => {
    playHapticAudioFeedback();
    if (phase === 1) {
      setPhase(2);
      setP2(1); // start phase 2 safely
    } else if (phase === 2) {
      setPhase(3);
    }
  };

  // Rendering logic for Dots
  let rowsToRender = [];
  if (phase === 1 && isDiv) {
    // Division Phase 1: All dots flow in one massive pool
    rowsToRender = [p1];
  } else if (!isDiv) {
    // Multiplication: p2 rows of p1 elements
    rowsToRender = Array.from({ length: p2 }, () => p1);
  } else {
    // Division Phase 2 and 3: group p1 total into rows of p2 elements
    const fullRows = Math.floor(p1 / p2);
    const remainder = p1 % p2;
    rowsToRender = Array.from({ length: fullRows }, () => p2);
    if (remainder > 0) rowsToRender.push(remainder);
  }

  const renderHeader = () => {
    if (phase === 3) return "✓ Completato";
    
    if (!isDiv) {
      return phase === 1 ? p1 : `Moltiplicatore: ${p2}`;
    } else {
      return phase === 1 ? p1 : `Gruppi da: ${p2}`;
    }
  };

  const renderHelpText = () => {
    if (phase === 3) return "Operazione Conclusa";
    
    if (!isDiv) {
      return phase === 1 ? "Scegli l'unità base (pallini)" : "Aggiungi righe (moltiplicatore)";
    } else {
      return phase === 1 ? "Scegli il numero totale da dividere" : "Imposta per quanto dividere";
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      
      {/* Visualizzazione del contesto in alto */}
      <div style={{ textAlign: 'center', marginTop: '10vh' }}>
        <h1 style={{ fontSize: 'var(--title-fs)', fontFamily: 'var(--font-num)', margin: 0 }}>
          {renderHeader()}
        </h1>
        <p style={{ fontSize: '1.2rem', fontFamily: 'var(--font-main)', margin: '10px 0', color: 'var(--border-color)', opacity: 0.6 }}>
          {renderHelpText()}
        </p>
      </div>

      {/* Area della matrice */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignContent: 'flex-start', justifyContent: 'center', gap: '20px', paddingTop: '20px', overflowY: 'auto', paddingBottom: '160px' }}>
        
        {rowsToRender.map((dotsInRow, rIdx) => (
          <div key={`row-${rIdx}`} style={{ 
            display: 'flex', gap: '15px', padding: '15px',
            background: (isDiv && dotsInRow < p2 && phase > 1) ? '#ffe0e0' : 'var(--badge-bg)', // Resto in colore diverso
            borderRadius: '20px',
            border: 'var(--border-width) solid var(--border-color)',
            boxShadow: '4px 4px 0px 0px var(--border-color)',
            animation: 'fadeIn 0.2s ease-out forwards',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
            height: 'fit-content' // previene stretch verticale da flex
          }}>
            {Array.from({ length: dotsInRow }).map((_, mIdx) => (
              <div key={`dot-${rIdx}-${mIdx}`} style={{
                width: '30px', height: '30px', borderRadius: '50%',
                background: 'var(--border-color)',
                flexShrink: 0
              }} />
            ))}
          </div>
        ))}
        
        {/* Mostra il risultato grande a fine operazione */}
        {phase === 3 && (
           <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
             <div style={{ padding: 'var(--fatto-btn-p)', background: 'white', border: 'var(--border-width) solid var(--border-color)', borderRadius: '20px', fontSize: 'var(--btn-fs-large)', fontWeight: 800, boxShadow: '6px 6px 0px 0px var(--border-color)', fontFamily: 'var(--font-num)', textAlign: 'center' }}>
                {!isDiv ? `${p1} × ${p2} = ${p1 * p2}` : `${p1} ÷ ${p2} = ${Math.floor(p1/p2)}` + (p1 % p2 ? ` (Resto ${p1 % p2})` : '')}
             </div>
           </div>
        )}
        
      </div>

      {/* Controlli specifici per MatrixMode in basso */}
      <div style={{
          position: 'absolute',
          bottom: '3vh',
          width: '100%',
          padding: '0 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          pointerEvents: 'none'
        }}>
          
          <div style={{ display: 'flex', width: '100%', gap: '20px', justifyContent: 'center' }}>
            <button 
              className="neo-btn" 
              onClick={handleMinus}
              style={{
                 flex: 1, maxWidth: '300px', height: 'var(--btn-h-large)', pointerEvents: 'auto',
                 background: 'var(--primary-minus)', fontSize: 'var(--btn-fs-large)'
              }}
            >−</button>

            <button 
              className="neo-btn" 
              onClick={handlePlus}
              style={{
                 flex: 1, maxWidth: '300px', height: 'var(--btn-h-large)', pointerEvents: 'auto',
                 background: 'var(--primary-plus)', fontSize: 'var(--btn-fs-large)'
              }}
            >+</button>
          </div>

          <button 
            className="neo-btn" 
            onClick={phase < 3 ? concludePhase : resetApp}
            style={{
              pointerEvents: 'auto',
              opacity: 1,
              padding: 'var(--fatto-btn-p)', fontSize: '1.5rem', 
              background: phase < 3 ? '#89E894' : '#F8A1A4'
            }}
          >
            {phase < 3 ? "FATTO ✔" : "NUOVA OPERAZIONE ↺"}
          </button>
      </div>

    </div>
  );
}
