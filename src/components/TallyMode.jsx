import React, { useState } from 'react';
import { playHapticAudioFeedback } from './AudioHaptic';

// Un componente interno per disegnare i "bastoncini" (Tally Marks)
const TallyGroup = ({ count }) => {
  return (
    <svg viewBox="0 0 50 50" style={{ width: '60px', height: '60px', overflow: 'visible' }}>
      {count >= 1 && <line x1="10" y1="5" x2="10" y2="45" stroke="var(--border-color)" strokeWidth="6" strokeLinecap="round" />}
      {count >= 2 && <line x1="20" y1="5" x2="20" y2="45" stroke="var(--border-color)" strokeWidth="6" strokeLinecap="round" />}
      {count >= 3 && <line x1="30" y1="5" x2="30" y2="45" stroke="var(--border-color)" strokeWidth="6" strokeLinecap="round" />}
      {count >= 4 && <line x1="40" y1="5" x2="40" y2="45" stroke="var(--border-color)" strokeWidth="6" strokeLinecap="round" />}
      {count >= 5 && <line x1="2" y1="38" x2="48" y2="12" stroke="var(--primary-minus)" strokeWidth="6" strokeLinecap="round" />}
    </svg>
  );
};

export default function TallyMode({ resetApp }) {
  const [count, setCount] = useState(0);

  const increment = () => {
    playHapticAudioFeedback();
    setCount(prev => prev + 1);
  };

  const decrement = () => {
    playHapticAudioFeedback();
    if (count > 0) setCount(prev => prev - 1);
  };

  // Calcoliamo i gruppi da 5 e il resto
  const fullFives = Math.floor(count / 5);
  const remainder = count % 5;
  const groups = Array.from({ length: fullFives }, () => 5);
  if (remainder > 0) groups.push(remainder);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      
      <div style={{ textAlign: 'center', marginTop: '10vh', flexShrink: 0 }}>
        <h1 style={{ fontSize: 'var(--title-fs)', fontFamily: 'var(--font-num)', margin: 0 }}>
          {count}
        </h1>
        <p style={{ fontSize: '1.2rem', fontFamily: 'var(--font-main)', margin: '10px 0', color: 'var(--border-color)', opacity: 0.6 }}>
          Contatore Sequenziale (Tally)
        </p>
      </div>

      <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'row', 
          flexWrap: 'wrap', 
          alignContent: 'flex-start', 
          justifyContent: 'center', 
          gap: '20px', 
          padding: '20px', 
          overflowY: 'auto'
      }}>
        {groups.map((val, idx) => (
          <div key={idx} style={{
              padding: '10px',
              background: 'white',
              borderRadius: '15px',
              border: 'var(--border-width) solid var(--border-color)',
              boxShadow: '4px 4px 0px 0px var(--border-color)',
              animation: 'fadeIn 0.2s ease-out forwards'
          }}>
            <TallyGroup count={val} />
          </div>
        ))}
      </div>

      <div style={{
          flexShrink: 0,
          width: '100%',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          background: 'var(--bg-color)',
          paddingBottom: 'max(3vh, 20px)'
        }}>
          
          <div style={{ display: 'flex', width: '100%', gap: '20px', justifyContent: 'center' }}>
            <button 
              className="neo-btn" 
              onClick={decrement}
              style={{
                 flex: 1, maxWidth: '300px', height: 'var(--btn-h-large)', pointerEvents: 'auto',
                 background: 'var(--primary-minus)', fontSize: 'var(--btn-fs-large)'
              }}
            >−</button>

            <button 
              className="neo-btn" 
              onClick={increment}
              style={{
                 flex: 1, maxWidth: '300px', height: 'var(--btn-h-large)', pointerEvents: 'auto',
                 background: 'var(--primary-plus)', fontSize: 'var(--btn-fs-large)'
              }}
            >+</button>
          </div>

          <button 
            className="neo-btn" 
            onClick={resetApp}
            style={{ padding: 'var(--fatto-btn-p)', fontSize: '1.5rem', background: '#F8A1A4' }}
          >
            AZZERA ↺
          </button>
      </div>

    </div>
  );
}
