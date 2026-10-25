import React, { useEffect, useState } from 'react';
import { Search, RotateCcw } from 'lucide-react';

interface DecimalSimulatorProps {
  initialDecimalA?: number;
  initialDecimalB?: number;
  initialTarget?: number;
  initialMode?: 'compare' | 'between' | 'convert';
}

export const DecimalSimulator: React.FC<DecimalSimulatorProps> = ({
  initialDecimalA = 0.4,
  initialDecimalB = 0.5,
  initialTarget = 0.46,
  initialMode = 'between',
}) => {
  const [mode, setMode] = useState<'compare' | 'between' | 'convert'>(initialMode);
  const [valA, setValA] = useState<number>(initialDecimalA);
  const [valB, setValB] = useState<number>(initialDecimalB);
  const [probeVal, setProbeVal] = useState<number>(initialTarget);

  useEffect(() => {
    setMode(initialMode);
    setValA(initialDecimalA);
    setValB(initialDecimalB);
    if (initialTarget !== undefined) {
      setProbeVal(initialTarget);
    } else {
      setProbeVal(Number(((initialDecimalA + initialDecimalB) / 2).toFixed(3)));
    }
  }, [initialDecimalA, initialDecimalB, initialTarget, initialMode]);

  const minBound = Math.min(valA, valB);
  const maxBound = Math.max(valA, valB);
  const span = Math.max(0.01, maxBound - minBound);

  // Generate 11 ticks between minBound and maxBound for the zoomed number line
  const ticks = Array.from({ length: 11 }, (_, idx) =>
    Number((minBound + (span * idx) / 10).toFixed(3))
  );

  const probeRatio = Math.min(100, Math.max(0, ((probeVal - minBound) / span) * 100));

  // Helper to decompose decimal into units, tenths, hundredths, thousandths
  const decompose = (n: number) => {
    const fixed = n.toFixed(3);
    const [whole, frac = '000'] = fixed.split('.');
    return {
      units: whole,
      tenths: frac[0] || '0',
      hundredths: frac[1] || '0',
      thousandths: frac[2] || '0',
    };
  };

  const decA = decompose(valA);
  const decB = decompose(valB);

  return (
    <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-5 flex flex-col gap-5">
      {/* Header & Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/70 pb-3">
        <div>
          <div className="text-xs text-emerald-400 font-medium">
            סימולטור מעבדה · אגף הלייזר המדויק
          </div>
          <h3 className="text-lg font-bold text-slate-100">
            ציר מספרים עשרוני מתקרב (Zoom) והמרה לאחוזים
          </h3>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => setMode('between')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              mode === 'between'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            עדשת זום (בין מספרים)
          </button>
          <button
            type="button"
            onClick={() => setMode('compare')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              mode === 'compare'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            מי גדול יותר?
          </button>
          <button
            type="button"
            onClick={() => setMode('convert')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              mode === 'convert'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            המרה לאחוזים
          </button>
        </div>
      </div>

      {/* Mode 1: Zoomable Number Line Between Two Decimals */}
      {mode === 'between' && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
            <span className="flex items-center gap-1.5">
              <Search className="w-4 h-4 text-emerald-400" />
              <span>
                עדשת הזום מראה את 10 החלקים שבין{' '}
                <strong className="font-math text-emerald-300">{minBound}</strong> לבין{' '}
                <strong className="font-math text-emerald-300">{maxBound}</strong>:
              </span>
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setValA(0.4);
                  setValB(0.5);
                  setProbeVal(0.46);
                }}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs font-math cursor-pointer"
              >
                0.4 ↔ 0.5
              </button>
              <button
                type="button"
                onClick={() => {
                  setValA(1.25);
                  setValB(1.26);
                  setProbeVal(1.254);
                }}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs font-math cursor-pointer"
              >
                1.25 ↔ 1.26
              </button>
              <button
                type="button"
                onClick={() => {
                  setValA(0.7);
                  setValB(0.8);
                  setProbeVal(0.75);
                }}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs font-math cursor-pointer"
              >
                0.7 ↔ 0.8
              </button>
            </div>
          </div>

          {/* Interactive Number Line Canvas */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-6 pt-12 pb-8 relative" dir="ltr">
            {/* Movable Laser Pointer Marker */}
            <div
              className="absolute top-3 -translate-x-1/2 flex flex-col items-center transition-all duration-150 pointer-events-none"
              style={{ left: `${probeRatio}%` }}
            >
              <div className="bg-emerald-400 text-slate-950 font-math text-sm font-bold px-2.5 py-0.5 rounded shadow">
                {probeVal}
              </div>
              <div className="w-0.5 h-6 bg-emerald-400" />
            </div>

            {/* Horizontal Axis Line */}
            <div className="relative h-2 bg-slate-800 rounded-full my-4">
              <div
                className="absolute left-0 top-0 bottom-0 bg-emerald-500/40 rounded-full"
                style={{ width: `${probeRatio}%` }}
              />
              {ticks.map((t, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setProbeVal(t)}
                  style={{ left: `${i * 10}%` }}
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center group cursor-pointer"
                >
                  <div
                    className={`w-2.5 h-2.5 rounded-full border transition-transform group-hover:scale-125 ${
                      i === 0 || i === 10
                        ? 'bg-cyan-400 border-slate-950 scale-125'
                        : Math.abs(t - probeVal) < 0.0005
                        ? 'bg-emerald-400 border-slate-950 scale-125'
                        : 'bg-slate-600 border-slate-900'
                    }`}
                  />
                  <span
                    className={`mt-3 font-math text-[11px] ${
                      i === 0 || i === 10
                        ? 'text-cyan-300 font-bold'
                        : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  >
                    {t}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Fine Laser Slider */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3.5 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>הזיזו את סמן הלייזר כדי למצוא מספרים עשרוניים בין הקצוות:</span>
              <span className="font-math text-sm font-bold text-emerald-400">
                {minBound.toFixed(3)} &lt; {probeVal.toFixed(3)} &lt; {maxBound.toFixed(3)}
              </span>
            </div>
            <input
              type="range"
              min={minBound}
              max={maxBound}
              step={span / 100}
              value={probeVal}
              onChange={(e) => setProbeVal(Number(Number(e.target.value).toFixed(3)))}
              className="w-full accent-emerald-400 cursor-pointer"
              dir="ltr"
            />
          </div>
        </div>
      )}

      {/* Mode 2: Compare Two Decimals with Place Value Table */}
      {mode === 'compare' && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>מספר עשרוני א׳</span>
                <span className="font-math text-emerald-400 font-bold">{valA}</span>
              </div>
              <input
                type="range"
                min={0}
                max={4}
                step={0.01}
                value={valA}
                onChange={(e) => setValA(Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
                dir="ltr"
              />
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>מספר עשרוני ב׳</span>
                <span className="font-math text-cyan-400 font-bold">{valB}</span>
              </div>
              <input
                type="range"
                min={0}
                max={4}
                step={0.01}
                value={valB}
                onChange={(e) => setValB(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
                dir="ltr"
              />
            </div>
          </div>

          {/* Place-Value Comparison Table */}
          <div className="overflow-x-auto bg-slate-950/80 border border-slate-800 rounded-xl p-3">
            <table className="w-full text-center text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800">
                  <th className="py-2 px-2 text-right">מספר</th>
                  <th className="py-2 px-2">יחידות (1)</th>
                  <th className="py-2 px-1">.</th>
                  <th className="py-2 px-2 text-emerald-300">עשיריות (0.1)</th>
                  <th className="py-2 px-2 text-cyan-300">מאיות (0.01)</th>
                  <th className="py-2 px-2 text-amber-300">אלפיות (0.001)</th>
                  <th className="py-2 px-2">הרחבה שווה</th>
                </tr>
              </thead>
              <tbody className="font-math text-sm">
                <tr className="border-b border-slate-800/60">
                  <td className="py-2.5 px-2 text-right font-bold text-emerald-400">{valA}</td>
                  <td className="py-2.5 font-bold">{decA.units}</td>
                  <td className="py-2.5 font-bold">.</td>
                  <td className="py-2.5 font-bold text-emerald-300">{decA.tenths}</td>
                  <td className="py-2.5 font-bold text-cyan-300">{decA.hundredths}</td>
                  <td className="py-2.5 font-bold text-amber-300">{decA.thousandths}</td>
                  <td className="py-2.5 text-slate-300">{valA.toFixed(3)}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-2 text-right font-bold text-cyan-400">{valB}</td>
                  <td className="py-2.5 font-bold">{decB.units}</td>
                  <td className="py-2.5 font-bold">.</td>
                  <td className="py-2.5 font-bold text-emerald-300">{decB.tenths}</td>
                  <td className="py-2.5 font-bold text-cyan-300">{decB.hundredths}</td>
                  <td className="py-2.5 font-bold text-amber-300">{decB.thousandths}</td>
                  <td className="py-2.5 text-slate-300">{valB.toFixed(3)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-lg p-3 text-center">
            <span className="font-math text-base font-bold text-emerald-300">
              {valA > valB
                ? `${valA} > ${valB}`
                : valA < valB
                ? `${valA} < ${valB}`
                : `${valA} = ${valB}`}
            </span>
            <span className="text-xs text-slate-300 mr-3">
              (משווים משמאל לימין: יחידות ← עשיריות ← מאיות ← אלפיות)
            </span>
          </div>
        </div>
      )}

      {/* Mode 3: Decimal <-> Percent Conversion */}
      {mode === 'convert' && (
        <div className="flex flex-col gap-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-200">
                בחרו מספר עשרוני בין 0 ל-1 כדי להמיר לשבר מאיות ולאחוזים:
              </span>
              <button
                type="button"
                onClick={() => setValA(0.4)}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>דוגמת 0.4</span>
              </button>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={Math.min(1, valA)}
              onChange={(e) => setValA(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
              dir="ltr"
            />
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3.5">
              <div className="text-xs text-slate-400 mb-1">מספר עשרוני</div>
              <div className="font-math text-xl font-bold text-slate-100">
                {Math.min(1, valA)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 font-math">
                = {Math.min(1, valA).toFixed(2)}
              </div>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3.5">
              <div className="text-xs text-slate-400 mb-1">שבר מאיות (מתוך 100)</div>
              <div className="font-math text-xl font-bold text-cyan-300">
                {Math.round(Math.min(1, valA) * 100)}/100
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {Math.round(Math.min(1, valA) * 100)} מאיות
              </div>
            </div>
            <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-lg p-3.5">
              <div className="text-xs text-emerald-300 mb-1">באחוזים (%)</div>
              <div className="font-math text-2xl font-bold text-emerald-300">
                {Math.round(Math.min(1, valA) * 100)}%
              </div>
              <div className="text-[11px] text-emerald-200/80 mt-1">
                כופלים ב-100
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
