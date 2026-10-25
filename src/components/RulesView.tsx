import React from 'react';
import {
  BookOpen,
  Users,
  KeyRound,
  Flame,
  ShieldAlert,
  Lightbulb,
  Sparkles,
  Zap,
  Scale,
  Search,
  Play,
  Home,
  UserCheck,
  Trophy,
  Unlock,
} from 'lucide-react';

interface RulesViewProps {
  onGoToHomeSetup: () => void;
  onResumeOrStartGame: () => void;
  onStartTeacherSolo: () => void;
  hasActiveGame: boolean;
}

export const RulesView: React.FC<RulesViewProps> = ({
  onGoToHomeSetup,
  onResumeOrStartGame,
  onStartTeacherSolo,
  hasActiveGame,
}) => {
  return (
    <div className="flex flex-col gap-6">
      {/* Header Banner */}
      <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
        <div>
          <div className="text-xs text-cyan-400 font-medium mb-1">
            מדריך הפעלה לכיתה ולמורה · כיתה ו׳
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-cyan-400 shrink-0" />
            <span>חוקי המשחק: איך מתנהל פיצוח המעבדה הסודית?</span>
          </h2>
          <p className="text-sm text-slate-300 mt-1.5 max-w-3xl leading-relaxed">
            המשחק מוקרן על הלוח החכם בכיתה. הקבוצות מתחרות בתורות על פיצוח 3 כספות מתמטיות משותפות (אחוזים, ממוצע ומספרים עשרוניים) במטרה לצבור את כמות הנקודות הגבוהה ביותר!
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {hasActiveGame ? (
            <button
              type="button"
              onClick={onResumeOrStartGame}
              className="px-4 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-extrabold text-sm rounded-lg transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>חזור למשחק הפעיל</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onGoToHomeSetup}
              className="px-4 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-extrabold text-sm rounded-lg transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <Home className="w-4 h-4" />
              <span>למסך הבית והגדרת משחק</span>
            </button>
          )}
          <button
            type="button"
            onClick={onStartTeacherSolo}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-bold text-sm rounded-lg transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <UserCheck className="w-4 h-4 text-cyan-400" />
            <span>התנסות מהירה למורה</span>
          </button>
        </div>
      </div>

      {/* Key Questions & Direct Answers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1E293B] border border-cyan-500/40 rounded-xl p-5 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-sm">
            <Users className="w-4 h-4 shrink-0" />
            <span>האם כל קבוצה בוחרת מכל כספת?</span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">
            <strong>כן! 3 הכספות משותפות לכל הכיתה.</strong> בכל תור, הקבוצה הפעילה יכולה לבחור כל כספת שתרצה (אחוזים, ממוצע או עשרוניים) וגם לבחור את רמת הקושי של השאלה (100, 150 או 200 נק׳).
          </p>
        </div>

        <div className="bg-[#1E293B] border border-amber-500/40 rounded-xl p-5 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>כמה נקודות שווה כל שאלה?</span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">
            שווי השאלה מוצג מראש ובולט על כרטיס החידה: <strong>קל = 100 נק׳</strong>, <strong>בינוני = 150 נק׳</strong>, <strong>מאתגר = 200 נק׳</strong>. רצף תשובות (Combo) או כוח הכפלה מכפילים את הניקוד!
          </p>
        </div>

        <div className="bg-[#1E293B] border border-emerald-500/40 rounded-xl p-5 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm">
            <Unlock className="w-4 h-4 shrink-0" />
            <span>במה זוכה קבוצה שפורצת כספת?</span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">
            כל כספת דורשת 3 ספרות קוד. הקבוצה שפותרת את השאלה שחושפת את <strong>הספרה ה-3 והאחרונה</strong> פורצת את הכספת וזוכה מיד ב-<strong>+250 נקודות בונוס כספת</strong>, גביע כספת וטעינת כוח מיוחד!
          </p>
        </div>

        <div className="bg-[#1E293B] border border-purple-500/40 rounded-xl p-5 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-purple-400 font-extrabold text-sm">
            <Trophy className="w-4 h-4 shrink-0" />
            <span>מי הקבוצה שמנצחת במשחק?</span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">
            ברגע שכל 3 הכספות נפרצו (9 ספרות קוד בסך הכל), המעבדה הסודית נפתחת! <strong>הקבוצה שצברה את סך הנקודות הגבוה ביותר</strong> (מפתרון שאלות + קומבו + בונוס פריצת כספות) מוכתרת כאלופת המעבדה!
          </p>
        </div>
      </div>

      {/* Section 1: 5 Step Classroom Game Flow */}
      <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-6 flex flex-col gap-5">
        <div className="border-b border-slate-700/70 pb-3">
          <h3 className="text-lg font-extrabold text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <span>מהלך המשחק בכיתה — 5 שלבים פשוטים</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
            <div className="font-math text-xs font-bold text-cyan-400">01. הכנה</div>
            <h4 className="text-base font-bold text-slate-100">חלוקה לקבוצות</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              במסך הבית בוחרים 2 עד 4 קבוצות מתחרות, נותנים להן שמות, ובוחרים זמן לשעון העצר (למשל 60 שניות לשאלה).
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
            <div className="font-math text-xs font-bold text-amber-400">02. בחירה אסטרטגית</div>
            <h4 className="text-base font-bold text-slate-100">בחירת כספת ורמת קושי</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              הקבוצה שבתור בוחרת כספת ובוחרת האם לקחת שאלה קלה (100 נק׳), בינונית (150 נק׳) או מאתגרת (200 נק׳). אם לכספת חסרה ספרה אחת – כדאי למהר לפרוץ אותה בשביל בונוס +250!
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
            <div className="font-math text-xs font-bold text-emerald-400">03. חקירה ופתרון</div>
            <h4 className="text-base font-bold text-slate-100">פתרון מול שעון העצר</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              שעון העצר פועל בראש החידה (ומהבהב באדום ב-10 השניות האחרונות). הקבוצה נעזרת בסימולטור הוויזואלי ובכוחות המיוחדים שלה ובוחרת תשובה.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
            <div className="font-math text-xs font-bold text-purple-400">04. למידה וקוד</div>
            <h4 className="text-base font-bold text-slate-100">הסבר וחשיפת ספרה</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              מיד לאחר המענה מוצג <strong>הסבר מתמטי שלב-אחר-שלב</strong>. תשובה נכונה מזכה בנקודות, מעלה את מד ה-Combo וחושפת ספרת קוד בכספת.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
            <div className="font-math text-xs font-bold text-rose-400">05. ניצחון</div>
            <h4 className="text-base font-bold text-slate-100">פודיום האלופים</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              לאחר פיצוח כל 3 הכספות, מוצג פודיום הניצחון עם דירוג הקבוצות לפי סך הנקודות שצברו לאורך המשחק.
            </p>
          </div>
        </div>
      </div>

      {/* Section 2: Scoring, Combo & Special Power-Ups */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Scoring & Combo Rules */}
        <div className="lg:col-span-6 bg-[#1E293B] border border-[#334155] rounded-xl p-6 flex flex-col gap-4">
          <div className="border-b border-slate-700/70 pb-3 flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-extrabold text-slate-100">
              טבלת הנקודות, הבונוסים ומכפיל ה-Combo
            </h3>
          </div>

          <div className="flex flex-col gap-3 text-sm text-slate-300">
            <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3.5 flex items-center justify-between">
              <span>ניקוד בסיס לשאלה:</span>
              <div className="flex items-center gap-2 font-math text-xs font-bold">
                <span className="text-emerald-400">קל: 100 נק׳</span>
                <span>·</span>
                <span className="text-amber-400">בינוני: 150 נק׳</span>
                <span>·</span>
                <span className="text-rose-400">מאתגר: 200 נק׳</span>
              </div>
            </div>

            <div className="bg-amber-950/30 border border-amber-500/40 rounded-lg p-3.5 flex items-center justify-between">
              <span className="font-bold text-amber-300">בונוס פריצת כספת (ספרה 3 מתוך 3):</span>
              <span className="font-math text-sm font-extrabold text-amber-300">
                +250 נקודות בונוס!
              </span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3.5">
              <div className="font-bold text-cyan-300 mb-1">
                איך עובד מכפיל הרצף (Combo)?
              </div>
              <ul className="list-disc list-inside text-xs text-slate-300 flex flex-col gap-1.5 leading-relaxed">
                <li>
                  <strong>2 תשובות נכונות ברצף:</strong> הניקוד של השאלה מוכפל ב-<strong className="font-math text-amber-300">×1.5</strong>.
                </li>
                <li>
                  <strong>3 תשובות נכונות ברצף ומעלה:</strong> הניקוד של השאלה מוכפל ב-<strong className="font-math text-amber-300">×2</strong> + הקבוצה מקבלת טעינה מחדש של כוחות מיוחדים!
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 3 Special Power-Ups */}
        <div className="lg:col-span-6 bg-[#1E293B] border border-[#334155] rounded-xl p-6 flex flex-col gap-4">
          <div className="border-b border-slate-700/70 pb-3 flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-extrabold text-slate-100">
              3 הכוחות המיוחדים של כל קבוצה
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>מנטרל 50/50</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                מוחק אוטומטית 2 אפשרויות שגויות מתוך ה-4 ומשאיר לקבוצה התלבטות רק בין 2 תשובות.
              </p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Lightbulb className="w-4 h-4 shrink-0" />
                <span>סורק רמז</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                חושף רמז מתמטי מכוון שמסביר לתלמידים איך לגשת לתרגיל ואיך להיעזר בסימולטור.
              </p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>הכפל ניקוד ×2</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                מכפיל פי 2 את הניקוד של השאלה הנוכחית (מצטרף גם למכפיל ה-Combo אם הקבוצה ברצף!).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Guide to the 3 Interactive Lab Simulators */}
      <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-6 flex flex-col gap-4">
        <div className="border-b border-slate-700/70 pb-3">
          <h3 className="text-lg font-extrabold text-slate-100">
            איך נעזרים ב-3 סימולטורי המעבדה בזמן פתרון שאלה?
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900/90 border border-cyan-500/30 rounded-xl p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
              <Zap className="w-4 h-4" />
              <span>רשת ה-100 (אחוזים)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              ניתן ללחוץ על תאים ברשת ה-100 או להזיז את סליידר האחוז והכמות הכוללת כדי לראות מיד כמה שווה האחוז מתוך הכמות וכמה נשאר להשלמה ל-100%.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-amber-500/30 rounded-xl p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Scale className="w-4 h-4" />
              <span>מאזני הממוצע</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              מאפשרים לראות את קו הממוצע המתאזן בין העמודות, לחפש מספר חסר (`?`) עד שהקו מתלכד עם ממוצע היעד, ולבדוק מה קורה לממוצע כשמוסיפים מספר חדש.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-emerald-500/30 rounded-xl p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Search className="w-4 h-4" />
              <span>ציר המספרים העשרוני (זום)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              מציג בהגדלה את 10 החלקים שבין שני מספרים עשרוניים (למשל בין 0.4 ל-0.5), משווה ספרות בטבלת מבנה עשורי (יחידות, עשיריות, מאיות, אלפיות) וממיר לאחוזים.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
