import React, { useState, useEffect } from 'react';
import NumberLine from './components/NumberLine';
import Controls from './components/Controls';
import MatrixMode from './components/MatrixMode';
import TallyMode from './components/TallyMode';
import { playHapticAudioFeedback } from './components/AudioHaptic';

export default function App() {
  const [currentValue, setCurrentValue] = useState(0);
  const [baseValue, setBaseValue] = useState(0); // number at the start of sequence
  const [stepCount, setStepCount] = useState(0); // count of jumps made (+ or -)
  const [history, setHistory] = useState([]); // Array of { from, to }

  const [operation, setOperation] = useState('ADD'); // ADD, SUB, MUL, DIV
  const [stepSize, setStepSize] = useState(1);
  const [isMoving, setIsMoving] = useState(false);
  
  const [appMode, setAppMode] = useState('SETUP'); // SETUP or OPERATE
  const [resetKey, setResetKey] = useState(0);

  // Show settings panel
  const [showSettings, setShowSettings] = useState(false);

  const resetAll = () => {
    playHapticAudioFeedback();
    setCurrentValue(0);
    setBaseValue(0);
    setStepCount(0);
    setHistory([]);
    setAppMode('SETUP');
    setResetKey(prev => prev + 1); // Forzo il remount di componenenti isolati
  };

  const endSequence = () => {
    setBaseValue(currentValue);
    setStepCount(0);
    setHistory([]);
  };

  const startOperation = () => {
    playHapticAudioFeedback();
    setBaseValue(currentValue);
    setStepCount(0);
    setHistory([]);
    setAppMode('OPERATE');
  };

  const jump = (direction) => {
    setIsMoving(true);
    
    // Calculate new values
    const deltaSteps = direction === 'RIGHT' ? 1 : -1;
    const increment = direction === 'RIGHT' ? stepSize : -stepSize;
    const newValue = currentValue + increment;
    
    // Calcola il badge (quanti passi totali stiamo contando)
    // Se stavamo andando a destra e premiamo destra, aumenta. etc.
    // Ma per semplicità: stepCount tiene proprio traccia di questo.
    const newStepCount = stepCount + deltaSteps;
    
    // Add to history or Undo
    setHistory(prev => {
      if (prev.length > 0) {
        const lastJump = prev[prev.length - 1];
        const lastDirection = lastJump.to > lastJump.from ? 'RIGHT' : 'LEFT';
        if (lastDirection !== direction) {
          // Undoing! Remove the last jump visual
          return prev.slice(0, -1);
        }
      }
      return [...prev, { from: currentValue, to: newValue }];
    });
    
    setCurrentValue(newValue);
    setStepCount(newStepCount);

    setTimeout(() => {
      setIsMoving(false);
    }, 300); // match css transition
  };

  // Badge testuale: sempre col segno. Ex: "+1", "-2"
  const getBadgeValue = () => {
    if (stepCount === 0) return null;
    return stepCount > 0 ? `+${stepCount}` : `${stepCount}`;
  };

  const getBadgeColor = () => {
    if (stepCount === 0) return 'var(--badge-bg)';
    return stepCount > 0 ? 'var(--primary-plus)' : 'var(--primary-minus)';
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div style={{ padding: '0', display: 'flex', flexDirection: 'column', height: '100vh', justifyContent: 'center', position: 'relative' }}>
      
      {/* Top Left: Fullscreen */}
      <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 100 }}>
        <button 
          className="neo-btn" 
          onClick={toggleFullscreen}
          style={{ padding: '10px 15px', fontSize: '1.2rem', background: '#e0e0e0', color: 'var(--border-color)' }}
        >
          ⛶
        </button>
      </div>

      {/* Top Right: OP Settings */}
      <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 100 }}>
        <button 
           className="neo-btn" 
           onClick={() => { playHapticAudioFeedback(); setShowSettings(!showSettings); }}
           style={{ padding: '10px 20px', fontSize: '1.2rem', background: 'white' }}
        >
           ⚙️ OP
        </button>
      </div>

      {/* Bottom Right: Reset Button Floating */}
      <div style={{ position: 'absolute', bottom: '20px', right: '20px', zIndex: 100 }}>
         <button 
            className="neo-btn" 
            onClick={resetAll}
            title="Svuota ed Inizia da capo"
            style={{ padding: '15px 20px', fontSize: '1.5rem', background: '#F8A1A4', borderRadius: '50%' }}
         >
           ↻
         </button>
      </div>

      {showSettings && (
        <div style={{
          position: 'absolute',
          top: '80px', right: '20px',
          background: 'white',
          border: 'var(--border-width) solid var(--border-color)',
          boxShadow: 'var(--shadow-offset) var(--shadow-offset) 0px 0px var(--border-color)',
          padding: '20px', borderRadius: '12px', zIndex: 110,
          display: 'flex', flexDirection: 'column', gap: '15px'
        }}>
           <h3 style={{ margin: 0 }}>Impostazioni Modalità</h3>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                className="neo-btn" 
                style={{ padding: '10px', fontSize: '1.2rem', background: (operation === 'ADD' || operation === 'SUB') ? '#89E894' : 'white' }} 
                onClick={() => { setOperation('ADD'); setStepSize(1); }}
              >
                + / - Addizioni e Sottrazioni
              </button>
              <button 
                className="neo-btn" 
                style={{ padding: '10px', fontSize: '1.2rem', background: operation === 'MUL' ? '#89E894' : 'white' }} 
                onClick={() => { setOperation('MUL'); }}
              >
                × Moltiplicazioni
              </button>
              <button 
                className="neo-btn" 
                style={{ padding: '10px', fontSize: '1.2rem', background: operation === 'DIV' ? '#89E894' : 'white' }} 
                onClick={() => { setOperation('DIV'); }}
              >
                ÷ Divisioni
              </button>
              <button 
                className="neo-btn" 
                style={{ padding: '10px', fontSize: '1.2rem', background: operation === 'TALLY' ? '#89E894' : 'white' }} 
                onClick={() => { setOperation('TALLY'); }}
              >
                |||| Tally Counter
              </button>
           </div>
           
           <button 
             className="neo-btn"
             onClick={() => { playHapticAudioFeedback(); setShowSettings(false); endSequence(); }}
             style={{ padding: '10px', marginTop: '10px', fontSize: '1.2rem', background: 'var(--primary-plus)' }}
           >
             Fatto
           </button>
        </div>
      )}
      <div style={{ textAlign: 'center', marginBottom: '20px', marginTop: '-10vh' }}>
         <h1 style={{ fontSize: 'var(--title-fs)', fontFamily: 'var(--font-num)', margin: 0 }}>
           {currentValue}
         </h1>
      </div>

      {/* Ramo per: Addizione e Sottrazione */}
      {(operation === 'ADD' || operation === 'SUB') && (
        <>
          <NumberLine 
            currentValue={currentValue}
            history={history}
            badgeValue={getBadgeValue()}
            badgeColor={getBadgeColor()}
            stepSize={stepSize}
            isMoving={isMoving}
            onDragChange={appMode === 'SETUP' ? setCurrentValue : undefined}
          />

          {appMode === 'SETUP' ? (
            <div style={{ position: 'absolute', bottom: '5vh', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <div style={{ padding: '10px', fontSize: '1.2rem', color: 'var(--border-color)', opacity: 0.8, fontWeight: 800 }}>
                 ⇄ Trascina la linea dei numeri per iniziare a contare
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                 <button 
                   className="neo-btn" 
                   onClick={startOperation}
                   style={{ padding: 'var(--fatto-btn-p)', fontSize: '1.5rem', background: '#89E894' }}
                 >
                   INIZIA DA {currentValue}
                 </button>

                 <button 
                   className="neo-btn" 
                   onClick={() => setCurrentValue(0)}
                   style={{ padding: '10px 20px', fontSize: '1.2rem', background: 'white' }}
                 >
                   Vai allo 0
                 </button>
              </div>
            </div>
          ) : (
            <Controls 
              onStepLeft={() => jump('LEFT')}
              onStepRight={() => jump('RIGHT')}
              operation={operation}
              stepSize={stepSize}
              showCommit={history.length > 0}
              onCommit={() => { playHapticAudioFeedback(); endSequence(); }}
            />
          )}
        </>
      )}

      {/* Ramo per: Moltiplicazione e Divisione */}
      {(operation === 'MUL' || operation === 'DIV') && (
         <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 50, background: 'var(--bg-color)' }}>
            <MatrixMode key={`matrix-${resetKey}`} operation={operation} resetApp={resetAll} />
         </div>
      )}

      {/* Ramo per: Tally Counter */}
      {operation === 'TALLY' && (
         <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 50, background: 'var(--bg-color)' }}>
            <TallyMode key={`tally-${resetKey}`} resetApp={resetAll} />
         </div>
      )}

    </div>
  );
}
