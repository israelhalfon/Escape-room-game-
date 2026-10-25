import React, { useEffect, useRef } from 'react';
import { Sparkles, Unlock, Trophy } from 'lucide-react';

export interface CelebrationState {
  active: boolean;
  type: 'vault_cracked' | 'game_victory';
  title: string;
  subtitle: string;
  accentColor: string;
  codeDigits?: number[];
}

interface CelebrationOverlayProps {
  celebration: CelebrationState | null;
  onDismiss: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  shape: 'rect' | 'circle' | 'spark';
  alpha: number;
  decay: number;
}

const LAB_COLORS = [
  '#06B6D4', // Cyan
  '#F59E0B', // Amber Gold
  '#10B981', // Emerald
  '#38BDF8', // Sky
  '#FACC15', // Bright Gold
  '#A855F7', // Purple
  '#F43F5E', // Coral Rose
];

export const CelebrationOverlay: React.FC<CelebrationOverlayProps> = ({
  celebration,
  onDismiss,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!celebration?.active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles: Particle[] = [];

    const spawnBurst = (originX: number, originY: number, count: number) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 4 + Math.random() * 14;
        const shapes: Particle['shape'][] = ['rect', 'circle', 'spark'];
        particles.push({
          x: originX,
          y: originY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - (3 + Math.random() * 5),
          size: 6 + Math.random() * 8,
          color: LAB_COLORS[Math.floor(Math.random() * LAB_COLORS.length)],
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.25,
          shape: shapes[Math.floor(Math.random() * shapes.length)],
          alpha: 1,
          decay: 0.005 + Math.random() * 0.007,
        });
      }
    };

    // Initial twin cannon bursts from left, right, and center
    spawnBurst(width * 0.2, height * 0.55, 75);
    spawnBurst(width * 0.8, height * 0.55, 75);
    spawnBurst(width * 0.5, height * 0.35, 90);

    // Secondary delayed bursts for extra classroom excitement
    const t1 = setTimeout(() => {
      spawnBurst(width * 0.35, height * 0.4, 65);
      spawnBurst(width * 0.65, height * 0.4, 65);
    }, 450);

    const t2 = setTimeout(() => {
      if (celebration.type === 'game_victory') {
        spawnBurst(width * 0.25, height * 0.3, 80);
        spawnBurst(width * 0.75, height * 0.3, 80);
        spawnBurst(width * 0.5, height * 0.25, 100);
      }
    }, 1000);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.22; // gravity
        p.vx *= 0.99; // air drag
        p.rotation += p.rotationSpeed;
        p.alpha -= p.decay;

        if (p.alpha <= 0 || p.y > height + 50) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.strokeStyle = p.color;

        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.66);
        } else if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.45, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // 4-point glowing spark star
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(-p.size, 0);
          ctx.lineTo(p.size, 0);
          ctx.moveTo(0, -p.size);
          ctx.lineTo(0, p.size);
          ctx.stroke();
        }

        ctx.restore();
      }

      if (particles.length > 0) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', handleResize);
    };
  }, [celebration]);

  if (!celebration?.active) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center p-4">
      {/* Fullscreen High-FPS Confetti & Sparks Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none"
      />

      {/* Interactive Celebration Toast Banner for Vault Crack */}
      {celebration.type === 'vault_cracked' && (
        <div className="pointer-events-auto relative bg-slate-900/95 border-2 border-amber-400 rounded-2xl p-6 max-w-md w-full text-center shadow-[0_0_50px_rgba(245,158,11,0.35)] animate-in fade-in zoom-in-95 duration-200 flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300">
            <Unlock className="w-8 h-8" />
          </div>

          <div>
            <div className="text-xs font-bold text-amber-400 flex items-center justify-center gap-1 mb-1">
              <Sparkles className="w-4 h-4" />
              <span>פיצוח כספת הושלם!</span>
            </div>
            <h3 className="text-2xl font-extrabold text-slate-100">
              {celebration.title}
            </h3>
            <p className="text-sm text-slate-300 mt-1">{celebration.subtitle}</p>
          </div>

          {celebration.codeDigits && celebration.codeDigits.length > 0 && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl px-5 py-3 flex flex-col items-center gap-1.5 w-full">
              <span className="text-xs text-slate-400">קוד הכספת המלא שנחשף:</span>
              <div className="flex items-center justify-center gap-2 font-math" dir="ltr">
                {celebration.codeDigits.map((digit, idx) => (
                  <span
                    key={idx}
                    className="w-10 h-11 rounded-lg bg-emerald-950 border border-emerald-400 text-emerald-300 font-extrabold text-xl flex items-center justify-center"
                  >
                    {digit}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={onDismiss}
            className="w-full py-2.5 px-5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-sm rounded-xl transition-colors cursor-pointer"
          >
            מעולה! המשך במשימה
          </button>
        </div>
      )}

      {/* Subtle Floating Trigger when in Game Victory so confetti doesn't block the podium */}
      {celebration.type === 'game_victory' && (
        <div className="fixed bottom-6 left-6 pointer-events-auto">
          <button
            type="button"
            onClick={onDismiss}
            className="px-4 py-2 bg-slate-900/90 hover:bg-slate-800 border border-amber-400/50 text-amber-300 text-xs font-bold rounded-xl shadow-lg flex items-center gap-2 cursor-pointer"
          >
            <Trophy className="w-4 h-4" />
            <span>סגור אנימציית זיקוקים</span>
          </button>
        </div>
      )}
    </div>
  );
};
