import React, { useEffect, useState } from 'react';
import { Sliders, Zap, RotateCcw } from 'lucide-react';

interface PercentageSimulatorProps {
  initialPercent?: number;
  initialTotal?: number;
  compact?: boolean;
}

const PRESET_TOTALS = [50, 80, 100, 150, 200, 300];
const PRESET_PERCENTS = [10, 20, 25, 50, 75, 100];

export const PercentageSimulator: React.FC<PercentageSimulatorProps> = ({
  initialPercent = 35,
  initialTotal = 100,
  compact = false,
}) => {
  const [percent, setPercent] = useState<number>(initialPercent);
  const [totalAmount, setTotalAmount] = useState<number>(initialTotal);

  useEffect(() => {
    setPercent(initialPercent);
    setTotalAmount(initialTotal);
  }, [initialPercent, initialTotal]);

  const calculatedPart = Number(((percent / 100) * totalAmount).toFixed(2));
  const complementPercent = 100 - percent;
  const complementPart = Number((totalAmount - calculatedPart).toFixed(2));

  return (
    <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-5 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-700/70 pb-3">
        <div>
          <div className="text-xs text-cyan-400 font-medium">
            סימולטור מעבדה · אגף האנרגיה
          </div>
          <h3 className="text-lg font-bold text-slate-100">
            רשת המאה ומכל אחוזים אינטראקטיבי
          </h3>
        </div>
        <button
          type="button"
          onClick={() => {
            setPercent(initialPercent);
            setTotalAmount(initialTotal);
          }}
          className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>איפוס כלי</span>
        </button>
      </div>

      {/* Main Split: 10x10 Grid + Controls & Live Conversion */}
      <div className={`grid gap-6 ${compact ? 'grid-cols-1 xl:grid-cols-12' : 'grid-cols-1 lg:grid-cols-12'} items-center`}>
        {/* 10x10 Visual Energy Grid */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="text-xs text-slate-400 mb-2 text-center">
            לחצו על תא ברשת ה-100 כדי לשנות את האחוז
          </div>
          <div
            className="grid grid-cols-10 gap-1 p-2.5 bg-slate-950/90 border border-slate-700 rounded-xl w-full max-w-[260px] aspect-square"
            dir="ltr"
          >
            {Array.from({ length: 100 }, (_, idx) => {
              const cellNumber = idx + 1;
              const isFilled = cellNumber <= percent;
              return (
                <button
                  key={cellNumber}
                  type="button"
                  onClick={() => setPercent(cellNumber)}
                  title={`${cellNumber}%`}
                  className={`rounded-[3px] transition-transform duration-150 cursor-pointer ${
                    isFilled
                      ? 'bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.45)] scale-100'
                      : 'bg-slate-800/80 hover:bg-slate-700'
                  }`}
                />
              );
            })}
          </div>
          <div className="mt-2.5 flex items-center gap-3 text-xs text-slate-300">
            <span>טעון: <strong className="font-math text-cyan-400">{percent}%</strong></span>
            <span aria-hidden="true">·</span>
            <span>נותר להשלמה: <strong className="font-math text-slate-300">{complementPercent}%</strong></span>
          </div>
        </div>

        {/* Sliders & Live Math Breakdown */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Percentage Slider */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3.5">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="pct-slider" className="text-sm font-medium text-slate-200 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span>אחוז נבחר (מתוך 100):</span>
              </label>
              <span className="font-math text-lg font-bold text-cyan-400">{percent}%</span>
            </div>
            <input
              id="pct-slider"
              type="range"
              min={0}
              max={100}
              step={1}
              value={percent}
              onChange={(e) => setPercent(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
              dir="ltr"
            />
            <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
              <span className="text-xs text-slate-400 ml-1">בחירה מהירה:</span>
              {PRESET_PERCENTS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPercent(p)}
                  className={`px-2.5 py-1 text-xs font-math rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    percent === p
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {p}%
                </button>
              ))}
            </div>
          </div>

          {/* Total Quantity Selector */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3.5">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="total-slider" className="text-sm font-medium text-slate-200 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>הכמות הכוללת (השלם = 100%):</span>
              </label>
              <span className="font-math text-lg font-bold text-slate-100">{totalAmount}</span>
            </div>
            <input
              id="total-slider"
              type="range"
              min={10}
              max={500}
              step={10}
              value={totalAmount}
              onChange={(e) => setTotalAmount(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
              dir="ltr"
            />
            <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
              <span className="text-xs text-slate-400 ml-1">כמות שלמה:</span>
              {PRESET_TOTALS.map((tot) => (
                <button
                  key={tot}
                  type="button"
                  onClick={() => setTotalAmount(tot)}
                  className={`px-2.5 py-1 text-xs font-math rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    totalAmount === tot
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {tot}
                </button>
              ))}
            </div>
          </div>

          {/* Live Formula Equivalence Cards */}
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
              <div className="text-xs text-slate-400 mb-1">ייצוג כשבר וכעשרוני</div>
              <div className="font-math text-base font-bold text-slate-100">
                {percent}/100 = {(percent / 100).toFixed(2)}
              </div>
            </div>
            <div className="bg-cyan-950/40 border border-cyan-500/40 rounded-lg p-3">
              <div className="text-xs text-cyan-300 mb-1">החלק מתוך {totalAmount}</div>
              <div className="font-math text-lg font-bold text-cyan-300">
                {calculatedPart}
              </div>
            </div>
            <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
              <div className="text-xs text-slate-400 mb-1">המשלים ל-100% ({complementPercent}%)</div>
              <div className="font-math text-base font-bold text-slate-200">
                {complementPart}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
