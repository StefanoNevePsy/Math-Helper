import React from 'react';
import { playHapticAudioFeedback } from './AudioHaptic';

export default function Controls({ onStepLeft, onStepRight, operation, stepSize, showCommit, onCommit }) {
  const isMultDiv = operation === 'MUL' || operation === 'DIV';

  const handleLeft = () => {
    playHapticAudioFeedback();
    onStepLeft();
  };

  const handleRight = () => {
    playHapticAudioFeedback();
    onStepRight();
  };

  return (
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
        {/* Tasto Sinistro: Sottrazione / Retrocedere */}
        <button 
          className="neo-btn" 
          onClick={handleLeft}
          aria-label="Sottrai"
          style={{
             flex: 1, 
             maxWidth: '300px',
             height: 'var(--btn-h-large)', 
             pointerEvents: 'auto',
             background: 'var(--primary-minus)',
          }}
        >
          <span style={{ fontSize: 'var(--btn-fs-large)', marginTop: '-5px' }}>−</span>
          {isMultDiv && <span style={{ fontSize: '1.2rem', marginLeft: '10px' }}>{stepSize}</span>}
        </button>

        {/* Tasto Destro: Addizione / Avanzare */}
        <button 
          className="neo-btn" 
          onClick={handleRight}
          aria-label="Aggiungi"
          style={{
             flex: 1, 
             maxWidth: '300px',
             height: 'var(--btn-h-large)', 
             pointerEvents: 'auto',
             background: 'var(--primary-plus)',
          }}
        >
          <span style={{ fontSize: 'var(--btn-fs-large)', marginTop: '-5px' }}>+</span>
          {isMultDiv && <span style={{ fontSize: '1.2rem', marginLeft: '10px' }}>{stepSize}</span>}
        </button>
      </div>

      <button 
        className="neo-btn" 
        onClick={showCommit ? onCommit : undefined}
        style={{
          pointerEvents: showCommit ? 'auto' : 'none',
          opacity: showCommit ? 1 : 0.3,
          padding: 'var(--fatto-btn-p)',
          fontSize: '1.5rem',
          background: '#89E894'
        }}
      >
        FATTO ✔
      </button>
      
    </div>
  );
}
