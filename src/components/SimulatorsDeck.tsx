import React, { useState } from 'react';
import { TopicId } from '../types/game';
import { PercentageSimulator } from './simulators/PercentageSimulator';
import { AverageSimulator } from './simulators/AverageSimulator';
import { DecimalSimulator } from './simulators/DecimalSimulator';
import { Zap, Scale, Search } from 'lucide-react';

export const SimulatorsDeck: React.FC = () => {
  const [activeTool, setActiveTool] = useState<TopicId>('percentages');

  return (
    <div className="flex flex-col gap-6">
      {/* Header & Tool Selector */}
      <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-cyan-400 font-medium mb-1">
            מעבדת הדמיה חופשית · להדגמה פרונטלית בכיתה ולהתנסות עצמאית
          </div>
          <h2 className="text-2xl font-bold text-slate-100">
            כלי המעבדה האינטראקטיביים (אחוזים · ממוצע · עשרוניים)
          </h2>
          <p className="text-sm text-slate-300 mt-1">
            בחרו כלי הדמיה כדי להציג על הלוח החכם ולהמחיש לתלמידים את העקרונות המתמטיים בזמן אמת.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-900 rounded-xl border border-slate-800 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setActiveTool('percentages')}
            className={`flex-1 md:flex-initial justify-center px-3 sm:px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTool === 'percentages'
                ? 'bg-cyan-500 text-slate-950'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4 shrink-0" />
            <span>אחוזים (רשת ה-100)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTool('averages')}
            className={`flex-1 md:flex-initial justify-center px-3 sm:px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTool === 'averages'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Scale className="w-4 h-4 shrink-0" />
            <span>מאזני הממוצע</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTool('decimals')}
            className={`flex-1 md:flex-initial justify-center px-3 sm:px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTool === 'decimals'
                ? 'bg-emerald-500 text-slate-950'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Search className="w-4 h-4 shrink-0" />
            <span>ציר עשרוניים (זום)</span>
          </button>
        </div>
      </div>

      {/* Active Simulator View */}
      {activeTool === 'percentages' && (
        <PercentageSimulator initialPercent={40} initialTotal={150} />
      )}
      {activeTool === 'averages' && (
        <AverageSimulator
          initialNumbers={[14, 18, 22, 26]}
          initialMode="calculate"
          targetAverage={20}
          addedNumber={30}
        />
      )}
      {activeTool === 'decimals' && (
        <DecimalSimulator
          initialDecimalA={0.4}
          initialDecimalB={0.5}
          initialTarget={0.46}
          initialMode="between"
        />
      )}
    </div>
  );
};
