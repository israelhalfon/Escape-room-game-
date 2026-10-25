import React, { useEffect, useState } from 'react';
import { Scale, Plus, Trash2, RotateCcw, ArrowUpRight, ArrowDownRight, Equal } from 'lucide-react';

interface AverageSimulatorProps {
  initialNumbers?: number[];
  initialMode?: 'calculate' | 'missing' | 'effect';
  targetAverage?: number;
  addedNumber?: number;
}

export const AverageSimulator: React.FC<AverageSimulatorProps> = ({
  initialNumbers = [12, 16, 20, 24],
  initialMode = 'calculate',
  targetAverage = 20,
  addedNumber = 28,
}) => {
  const [mode, setMode] = useState<'calculate' | 'missing' | 'effect'>(initialMode);
  const [numbers, setNumbers] = useState<number[]>(initialNumbers);
  const [goalAverage, setGoalAverage] = useState<number>(targetAverage);
  const [mysteryGuess, setMysteryGuess] = useState<number>(15);
  const [testExtraNumber, setTestExtraNumber] = useState<number>(addedNumber);
  const [includeExtra, setIncludeExtra] = useState<boolean>(false);

  useEffect(() => {
    setMode(initialMode);
    setNumbers(initialNumbers.length > 0 ? initialNumbers : [12, 18, 24]);
    if (targetAverage !== undefined) setGoalAverage(targetAverage);
    if (addedNumber !== undefined) setTestExtraNumber(addedNumber);
    setIncludeExtra(false);
  }, [initialNumbers, initialMode, targetAverage, addedNumber]);

  // Mode 1 & 3 calculations
  const activeSeries =
    mode === 'missing'
      ? [...numbers.slice(0, -1), mysteryGuess]
      : mode === 'effect' && includeExtra
      ? [...numbers, testExtraNumber]
      : numbers;

  const baseSum = numbers.reduce((acc, n) => acc + n, 0);
  const baseAverage = numbers.length > 0 ? Number((baseSum / numbers.length).toFixed(2)) : 0;

  const currentSum = activeSeries.reduce((acc, n) => acc + n, 0);
  const currentAverage =
    activeSeries.length > 0 ? Number((currentSum / activeSeries.length).toFixed(2)) : 0;

  const maxBarValue = Math.max(...activeSeries, goalAverage, 40, currentAverage + 10);

  const handleValueChange = (index: number, newVal: number) => {
    const updated = [...numbers];
    updated[index] = Math.max(0, Math.min(100, newVal));
    setNumbers(updated);
  };

  const addBar = () => {
    if (numbers.length < 7) {
      setNumbers([...numbers, Math.round(baseAverage)]);
    }
  };

  const removeBar = (idx: number) => {
    if (numbers.length > 2) {
      setNumbers(numbers.filter((_, i) => i !== idx));
    }
  };

  // Determine effect relation in mode === 'effect'
  const diffFromBase = testExtraNumber - baseAverage;

  return (
    <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-5 flex flex-col gap-5">
      {/* Header & Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/70 pb-3">
        <div>
          <div className="text-xs text-amber-400 font-medium">
            סימולטור מעבדה · אגף האיזון
          </div>
          <h3 className="text-lg font-bold text-slate-100">
            מאזני ממוצע ועמודות גובה מתאזנות
          </h3>
        </div>

        {/* Interactive Mode Segmented Buttons */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setMode('calculate')}
            className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              mode === 'calculate'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            חישוב ממוצע
          </button>
          <button
            type="button"
            onClick={() => setMode('missing')}
            className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              mode === 'missing'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            מציאת מספר חסר
          </button>
          <button
            type="button"
            onClick={() => setMode('effect')}
            className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              mode === 'effect'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            הוספת מספר לממוצע
          </button>
        </div>
      </div>

      {/* Visual Leveling Columns Canvas */}
      <div className="relative bg-slate-950/90 border border-slate-800 rounded-xl p-4 pt-8 h-56 flex items-end justify-around gap-3 overflow-hidden">
        {/* Horizontal Equilibrium Average Line */}
        <div
          className="absolute left-0 right-0 border-t-2 border-dashed border-amber-400 z-10 transition-transform duration-200 pointer-events-none flex items-center justify-between px-3"
          style={{
            bottom: `${Math.min(88, Math.max(12, (currentAverage / maxBarValue) * 100))}%`,
          }}
        >
          <span className="bg-amber-500 text-slate-950 text-xs font-bold px-2 py-0.5 rounded font-math -mt-6 shadow">
            קו הממוצע: {currentAverage}
          </span>
        </div>

        {/* Target Average Line when in 'missing' mode */}
        {mode === 'missing' && (
          <div
            className="absolute left-0 right-0 border-t-2 border-cyan-400/70 z-10 pointer-events-none flex justify-end px-3"
            style={{
              bottom: `${Math.min(88, Math.max(12, (goalAverage / maxBarValue) * 100))}%`,
            }}
          >
            <span className="bg-cyan-500 text-slate-950 text-xs font-bold px-2 py-0.5 rounded font-math -mt-6">
              ממוצע יעד: {goalAverage}
            </span>
          </div>
        )}

        {/* Bars */}
        {activeSeries.map((val, idx) => {
          const isMysteryBar = mode === 'missing' && idx === activeSeries.length - 1;
          const isExtraBar = mode === 'effect' && includeExtra && idx === activeSeries.length - 1;
          const heightPercent = Math.min(92, Math.max(8, (val / maxBarValue) * 100));

          return (
            <div key={idx} className="flex flex-col items-center justify-end h-full flex-1 max-w-[72px] z-20">
              <span
                className={`font-math text-sm font-bold mb-1 ${
                  isMysteryBar
                    ? 'text-cyan-300'
                    : isExtraBar
                    ? 'text-emerald-300'
                    : 'text-slate-200'
                }`}
              >
                {isMysteryBar ? `? (${val})` : val}
              </span>
              <div
                className={`w-full rounded-t-lg transition-all duration-200 ${
                  isMysteryBar
                    ? 'bg-cyan-500/80 border-2 border-cyan-300'
                    : isExtraBar
                    ? 'bg-emerald-500/80 border-2 border-emerald-300'
                    : 'bg-amber-500/75 border border-amber-400'
                }`}
                style={{ height: `${heightPercent}%` }}
              />
              <span className="text-[11px] text-slate-400 mt-1.5 whitespace-nowrap">
                {isMysteryBar ? 'מספר חסר' : isExtraBar ? 'מספר נוסף' : `איבר ${idx + 1}`}
              </span>
            </div>
          );
        })}
      </div>

      {/* Mode-Specific Interactive Controls */}
      {mode === 'calculate' && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300">
              שנו את ערכי המספרים כדי לראות איך הסכום וקו הממוצע מתעדכנים:
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={addBar}
                disabled={numbers.length >= 7}
                className="px-2.5 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-md flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>הוסף איבר</span>
              </button>
              <button
                type="button"
                onClick={() => setNumbers(initialNumbers)}
                className="px-2.5 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>איפוס</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {numbers.map((num, idx) => (
              <div
                key={idx}
                className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>איבר {idx + 1}</span>
                  {numbers.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeBar(idx)}
                      className="text-slate-500 hover:text-rose-400 cursor-pointer"
                      title="הסר איבר"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <input
                  type="range"
                  min={0}
                  max={60}
                  value={num}
                  onChange={(e) => handleValueChange(idx, Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                  dir="ltr"
                />
                <div className="text-center font-math text-sm font-bold text-amber-300">
                  {num}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {mode === 'missing' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm font-medium text-slate-200">
              הזיזו את המשקולת החסרה (<span className="text-cyan-400 font-bold">?</span>) עד שקו הממוצע יתלכד עם ממוצע היעד (<span className="font-math text-cyan-300 font-bold">{goalAverage}</span>):
            </div>
            <span className="font-math text-base font-bold text-cyan-400">
              ערך נבדק: {mysteryGuess}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={60}
            value={mysteryGuess}
            onChange={(e) => setMysteryGuess(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
            dir="ltr"
          />
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300 pt-1">
            <span>
              סכום רצוי ({activeSeries.length} איברים × ממוצע {goalAverage}):{' '}
              <strong className="font-math text-cyan-300">{activeSeries.length * goalAverage}</strong>
            </span>
            <span>
              סכום נוכחי במאזניים: <strong className="font-math text-amber-300">{currentSum}</strong>
            </span>
            <span className="font-semibold">
              {currentAverage === goalAverage
                ? '✓ המאזניים מאוזנים בדיוק על ממוצע היעד!'
                : currentAverage < goalAverage
                ? '▲ הממוצע עדיין נמוך מהיעד – הגדילו את המספר החסר'
                : '▼ הממוצע גבוה מהיעד – הקטינו את המספר החסר'}
            </span>
          </div>
        </div>
      )}

      {mode === 'effect' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium text-slate-200">
                ממוצע הסדרה המקורית הוא <strong className="font-math text-amber-400">{baseAverage}</strong>. בחרו מספר להוספה:
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                גלו מה קורה לממוצע כשמוסיפים מספר גדול ממנו, קטן ממנו או שווה לו
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIncludeExtra(!includeExtra)}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                includeExtra
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
              }`}
            >
              {includeExtra ? 'הסר את המספר הנוסף מהסדרה' : `הוסף את ${testExtraNumber} לסדרה ובדוק`}
            </button>
          </div>

          <div className="flex items-center gap-4">
            <input
              type="range"
              min={0}
              max={100}
              value={testExtraNumber}
              onChange={(e) => {
                setTestExtraNumber(Number(e.target.value));
                setIncludeExtra(true);
              }}
              className="flex-1 accent-emerald-400 cursor-pointer"
              dir="ltr"
            />
            <span className="font-math text-lg font-bold text-emerald-400 min-w-[48px] text-center">
              {testExtraNumber}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs bg-slate-950/80 border border-slate-800 rounded-lg p-3">
            <div className="flex items-center gap-2">
              {diffFromBase > 0 ? (
                <>
                  <ArrowUpRight className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-emerald-300 font-medium">
                    המספר הנוסף ({testExtraNumber}) גדול מהממוצע הקודם ({baseAverage}) ← הממוצע עולה!
                  </span>
                </>
              ) : diffFromBase < 0 ? (
                <>
                  <ArrowDownRight className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="text-rose-300 font-medium">
                    המספר הנוסף ({testExtraNumber}) קטן מהממוצע הקודם ({baseAverage}) ← הממוצע יורד!
                  </span>
                </>
              ) : (
                <>
                  <Equal className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="text-cyan-300 font-medium">
                    המספר הנוסף ({testExtraNumber}) שווה בדיוק לממוצע ({baseAverage}) ← הממוצע לא משתנה!
                  </span>
                </>
              )}
            </div>
            <div className="font-math text-slate-300">
              {baseAverage} → <strong className="text-amber-300">{currentAverage}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Summary Formula Strip */}
      <div className="grid grid-cols-3 gap-2.5 text-center">
        <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-2.5">
          <div className="text-xs text-slate-400">סכום כל האיברים</div>
          <div className="font-math text-base font-bold text-slate-100">{currentSum}</div>
        </div>
        <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-2.5">
          <div className="text-xs text-slate-400">מספר האיברים</div>
          <div className="font-math text-base font-bold text-slate-100">{activeSeries.length}</div>
        </div>
        <div className="bg-amber-950/40 border border-amber-500/40 rounded-lg p-2.5">
          <div className="text-xs text-amber-300 flex items-center justify-center gap-1">
            <Scale className="w-3.5 h-3.5" />
            <span>ממוצע (סכום ÷ כמות)</span>
          </div>
          <div className="font-math text-lg font-bold text-amber-300">
            {currentSum} ÷ {activeSeries.length} = {currentAverage}
          </div>
        </div>
      </div>
    </div>
  );
};
