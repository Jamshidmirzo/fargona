import { useState, useEffect, useRef } from 'react';
import { useLang } from '../contexts/LangContext';

export default function ExpositionPlayer({ museum, onExit }) {
  const { lang, t } = useLang();
  
  // Flatten all exhibits across all halls into a single continuous array
  const allExhibits = [];
  let imgCounter = 1;
  
  (t.halls || []).forEach((hall, hIdx) => {
    hall.exhibits.forEach((ex, eIdx) => {
      allExhibits.push({
        hallTitle: hall.title,
        hallSubtitle: hall.subtitle,
        exhibitTitle: ex,
        hallIndex: hIdx + 1,
        // Using our existing sample images from 1 to 12
        imgSrc: `http://localhost:3000/uploads/image${(imgCounter % 12) + 1}.jpeg`,
        fallbackSrc: `http://localhost:3000/uploads/image${(imgCounter % 12) + 1}.png`
      });
      imgCounter++;
    });
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  
  const total = allExhibits.length;
  const slideDuration = 7000; // 7 seconds per slide

  // Auto-play logic
  useEffect(() => {
    if (!isPlaying || total === 0) return;
    
    let startTime = Date.now();
    let animationFrame;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const percent = (elapsed / slideDuration) * 100;
      
      if (percent >= 100) {
        if (currentIndex >= total - 1) {
          setIsPlaying(false);
          setTimeout(() => {
            onExit();
          }, 0);
          return; // Stop animation loop
        }
        // Next slide
        setCurrentIndex(prev => prev + 1);
        startTime = Date.now();
        setProgress(0);
        animationFrame = requestAnimationFrame(animate);
      } else {
        setProgress(percent);
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [currentIndex, isPlaying, total]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') onExit();
      if (e.key === ' ') setIsPlaying(p => !p);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNext = () => {
    if (currentIndex < total - 1) {
      setCurrentIndex(prev => prev + 1);
      setProgress(0);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setProgress(0);
    }
  };

  if (total === 0) return null;
  const current = allExhibits[currentIndex];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#000', color: '#fff', overflow: 'hidden' }}>
      
      {/* Background Image with Ken Burns effect */}
      {allExhibits.map((ex, idx) => (
        <div 
          key={idx}
          style={{ 
            position: 'absolute', 
            inset: 0, 
            opacity: currentIndex === idx ? 1 : 0, 
            transition: 'opacity 1.5s ease-in-out',
            pointerEvents: 'none'
          }}
        >
          <img 
            src={ex.imgSrc} 
            onError={(e) => { e.target.src = ex.fallbackSrc; }}
            alt={ex.exhibitTitle}
            className={currentIndex === idx ? 'kenburns-active' : ''}
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover',
              objectPosition: 'center',
            }} 
          />
        </div>
      ))}

      {/* Dark Gradient Overlay */}
      <div style={{ 
        position: 'absolute', 
        inset: 0, 
        background: 'linear-gradient(to right, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 45%, transparent 100%)',
        pointerEvents: 'none'
      }} />

      {/* Top Bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '40px 60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
          </div>
          <div>
            <div style={{ fontSize: 13, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>Virtual Tour</div>
            <div style={{ fontFamily: 'var(--font-head)', fontSize: 20, fontWeight: 700 }}>{(museum[lang] || museum.uz || museum.ru || museum.en || museum).name}</div>
          </div>
        </div>
        
        <button onClick={onExit} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', width: 48, height: 48, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .2s', backdropFilter: 'blur(10px)' }} onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.2)'} onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.1)'}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>

      {/* Main Content Area (Left side) */}
      <div style={{ position: 'absolute', top: '50%', left: 60, transform: 'translateY(-50%)', maxWidth: 600, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, animation: 'slideUp .6s ease both' }} key={`hall-${currentIndex}`}>
          <span style={{ fontSize: 13, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 600 }}>{t.hall} {current.hallIndex}</span>
          <span style={{ width: 40, height: 1, background: 'rgba(255,255,255,0.3)' }} />
          <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>{current.hallTitle}</span>
        </div>
        
        <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: 800, lineHeight: 1.1, marginBottom: 24, animation: 'slideUp .6s .1s ease both' }} key={`title-${currentIndex}`}>
          {current.exhibitTitle}
        </h1>
        
        <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, animation: 'slideUp .6s .2s ease both' }} key={`desc-${currentIndex}`}>
          {current.hallSubtitle} Imagine standing right here, surrounded by the echoes of history. The artifacts speak of a time long past, meticulously preserved for the future.
        </p>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginTop: 48, animation: 'slideUp .6s .3s ease both' }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={handlePrev} disabled={currentIndex === 0} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', width: 56, height: 56, borderRadius: '50%', cursor: currentIndex === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: currentIndex === 0 ? 0.3 : 1, transition: 'background .2s', backdropFilter: 'blur(10px)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <button onClick={() => setIsPlaying(!isPlaying)} style={{ background: 'var(--accent)', border: 'none', color: '#fff', width: 56, height: 56, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .2s', boxShadow: '0 8px 24px rgba(162, 104, 61, 0.4)' }}>
              {isPlaying ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3l14 9-14 9V3z"/></svg>
              )}
            </button>
            <button onClick={handleNext} disabled={currentIndex === total - 1} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', width: 56, height: 56, borderRadius: '50%', cursor: currentIndex === total - 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: currentIndex === total - 1 ? 0.3 : 1, transition: 'background .2s', backdropFilter: 'blur(10px)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>
          
          <div style={{ fontSize: 14, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>
            <span style={{ color: '#fff', fontWeight: 700 }}>{(currentIndex + 1).toString().padStart(2, '0')}</span> / {total.toString().padStart(2, '0')}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: 'rgba(255,255,255,0.1)', zIndex: 10 }}>
        <div style={{ height: '100%', background: 'var(--accent)', width: `${progress}%` }} />
      </div>

    </div>
  );
}
