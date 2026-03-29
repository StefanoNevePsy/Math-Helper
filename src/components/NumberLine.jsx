import React, { useMemo, useEffect, useRef } from 'react';

const UNIT_WIDTH = 80;

export default function NumberLine({ currentValue, history, badgeValue, badgeColor, stepSize, isMoving, onDragChange }) {
  const dragAcc = useRef(0);
  const lastX = useRef(null);

  const handlePointerDown = (e) => {
    if (!onDragChange) return;
    lastX.current = e.clientX || (e.touches && e.touches[0].clientX);
    e.currentTarget.setPointerCapture?.(e.pointerId); // Prevent scroll on mobile devices capturing PointerEvent
  };

  const handlePointerMove = (e) => {
    if (!onDragChange || lastX.current === null) return;
    const currentX = e.clientX || (e.touches && e.touches[0].clientX);
    const diff = lastX.current - currentX;
    lastX.current = currentX;
    
    dragAcc.current += diff;
    // Step ogni mezza unità (40px) per essere più reattivo
    if (Math.abs(dragAcc.current) >= (UNIT_WIDTH / 2)) {
       const steps = Math.trunc(dragAcc.current / (UNIT_WIDTH / 2));
       onDragChange(currentValue + steps);
       dragAcc.current -= steps * (UNIT_WIDTH / 2);
    }
  };

  const handlePointerUp = (e) => {
    if (lastX.current !== null) {
      lastX.current = null;
      dragAcc.current = 0;
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    }
  };
  // Generate numbers to render based on current position
  // We want to render a safe margin left and right to avoid seeing elements disappearing
  const visibleRange = 25; 
  
  const numbers = useMemo(() => {
    let arr = [];
    for (let i = currentValue - visibleRange; i <= currentValue + visibleRange; i++) {
        arr.push(i);
    }
    return arr;
  }, [currentValue]);

  // Arcs generation
  const renderArcs = () => {
    return history.map((jmp, index) => {
      const fromX = jmp.from * UNIT_WIDTH;
      const toX = jmp.to * UNIT_WIDTH;
      const diff = Math.abs(jmp.to - jmp.from);
      
      const isRight = jmp.to > jmp.from;
      // height of arc based on step size
      const arcHeight = Math.max(60, diff * 15);
      const midX = (fromX + toX) / 2;
      
      const pathData = `M ${fromX} 0 C ${fromX} ${-arcHeight}, ${toX} ${-arcHeight}, ${toX} 0`;
      
      const dots = [];
      if (diff > 1) {
        const dir = isRight ? 1 : -1;
        for (let j = 0; j < diff; j++) {
           const dotX = fromX + (dir * j * UNIT_WIDTH) + (dir * UNIT_WIDTH / 2);
           dots.push(
             <circle key={`dot-${index}-${j}`} cx={dotX} cy="-15" r="5" fill="var(--border-color)" opacity="0.6" />
           );
        }
      }

      return (
        <g key={`arc-${index}`}>
           <path d={pathData} className="arc-path" />
           {dots}
           {/* arrow head mapping at the end of arc */}
           <polygon 
             points={isRight ? `${toX - 5},-10 ${toX + 5},-5 ${toX},0` : `${toX + 5},-10 ${toX - 5},-5 ${toX},0`}
             className="arc-arrow"
           />
        </g>
      );
    });
  };

  const containerStyle = {
    transform: `translateX(calc(50vw - ${currentValue * UNIT_WIDTH}px))`,
    transition: isMoving ? 'transform 0.3s ease-in-out' : 'transform 0.05s ease-in-out',
  };

  return (
    <div 
      style={{ 
        position: 'relative', width: '100%', height: '30vh', minHeight: '200px', 
        overflow: 'hidden', display: 'flex', alignItems: 'flex-end', paddingBottom: '20px',
        cursor: onDragChange ? 'grab' : 'default',
        touchAction: 'none' // blocco scrolling nativo così il drag funziona bene su mobile
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', ...containerStyle }}>
        
        {/* SVG Wrapper inside sliding container */}
        <svg style={{ position: 'absolute', bottom: '60px', left: 0, width: '100%', height: '1px', overflow: 'visible', zIndex: 1 }}>
           {renderArcs()}
        </svg>

        {/* L'asse orizzontale */}
        <div style={{ position: 'absolute', bottom: '60px', left: '-50000px', width: '100000px', height: 'var(--border-width)', background: 'var(--border-color)', zIndex: 0 }} />

        {/* I numeri e il tick. La line è a bottom: 60px. */}
        {numbers.map(num => {
          const isCenter = num === currentValue;
          return (
            <div 
              key={`num-${num}`} 
              className="number-font"
              style={{
                position: 'absolute',
                bottom: '0px',
                left: `${num * UNIT_WIDTH}px`,
                transform: 'translateX(-50%)',
                display: 'flex',
                justifyContent: 'center',
                width: '80px',
                height: '120px', 
                zIndex: isCenter ? 10 : 2,
                transition: 'color 0.2s',
                color: isCenter ? 'var(--border-color)' : 'rgba(0,0,0,0.3)'
              }}
            >
              
              {/* Tick line */}
              <div style={{ 
                position: 'absolute',
                bottom: 'var(--line-bottom-offset)', // es. 60px o meno su mobile
                left: '50%',
                transform: 'translateX(-50%)',
                width: 'var(--border-width)', 
                height: isCenter ? '30px' : '15px', 
                background: isCenter ? 'var(--border-color)' : 'rgba(0,0,0,0.3)'
              }} />
              
              {/* Contenitore Numerico + Mirino (Posizionamento assolutamente centrato) */}
              <div style={{ 
                position: 'absolute', 
                bottom: '10px', 
                left: '50%',
                transform: 'translateX(-50%)', // centratura testuale rigida
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center' 
              }}>
                {num}
                
                {isCenter && (
                  <>
                    {/* Pillola / Cerchio selettore allargato per includere numeri negativi a due cifre */}
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: 'var(--pill-w)',
                      height: 'var(--pill-h)',
                      border: 'var(--border-width) solid var(--border-color)',
                      borderRadius: '30px', 
                      pointerEvents: 'none',
                    }} />
                    {/* Segnali visivi -/+ sopra la linea */}
                    <div style={{ position: 'absolute', bottom: 'calc(var(--line-bottom-offset) + 20px)', left: '-50px', color: 'var(--primary-minus)', fontSize: 'var(--btn-fs-large)', fontWeight: 800 }}>−</div>
                    <div style={{ position: 'absolute', bottom: 'calc(var(--line-bottom-offset) + 20px)', right: '-50px', color: 'var(--primary-plus)', fontSize: 'var(--btn-fs-large)', fontWeight: 800 }}>+</div>
                  </>
                )}
              </div>

              {/* Counter Badge Neo-brutalista */}
              {isCenter && badgeValue && (
                <div style={{
                  position: 'absolute',
                  top: '-10px', // Sopra il tick (che arriva a 90px bottom -> 30px top)
                  background: badgeColor || 'var(--badge-bg)',
                  border: 'var(--border-width) solid var(--border-color)',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  boxShadow: '4px 4px 0px 0px var(--border-color)',
                  fontWeight: 800,
                  fontSize: '1.2rem',
                  fontFamily: 'var(--font-num)',
                  whiteSpace: 'nowrap'
                }}>
                  {badgeValue}
                </div>
              )}

            </div>
          )
        })}
      </div>
      
      {/* Centro fisso - asse tratteggiato */}
      <div style={{
        position: 'absolute',
        bottom: '60px',
        left: '50vw',
        transform: 'translateX(-50%)',
        width: '4px',
        height: '40px',
        background: 'transparent', 
        borderLeft: '2px dashed rgba(0,0,0, 0.1)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />
      
    </div>
  );
}
