import React, { useState } from 'react';
import {
  Difficulty,
  MathQuestion,
  SubTopicId,
  Team,
  TopicId,
} from '../types/game';
import { SUBTOPIC_LABELS, TOPIC_METADATA } from '../data/questions';
import { runFullGameTestSuite, TestSuiteSummary } from '../utils/testSuite';
import {
  Plus,
  Play,
  Edit3,
  Trash2,
  Sparkles,
  RotateCcw,
  Check,
  X,
  Sliders,
  Users,
  ShieldCheck,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface TeacherPanelProps {
  questions: MathQuestion[];
  teams: Team[];
  selectedDifficulty: Difficulty | 'all';
  timerSeconds: number;
  onSelectDifficulty: (diff: Difficulty | 'all') => void;
  onChangeTimer: (sec: number) => void;
  onAddQuestion: (q: MathQuestion) => void;
  onUpdateQuestion: (q: MathQuestion) => void;
  onDeleteQuestion: (id: string) => void;
  onGenerateBatch: () => void;
  onResetDefaultQuestions: () => void;
  onPreviewQuestion: (q: MathQuestion) => void;
  onStartTeacherSoloRun: () => void;
  onResetScoresForClass: () => void;
  onAdjustTeamScore: (teamId: string, delta: number) => void;
}

const SUBTOPICS_BY_TOPIC: Record<TopicId, SubTopicId[]> = {
  percentages: ['percent_basic', 'percent_of_amount', 'percent_complement'],
  averages: ['average_calc', 'average_missing', 'average_effect'],
  decimals: ['decimal_compare', 'decimal_between', 'decimal_to_percent'],
};

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'קל',
  medium: 'בינוני',
  hard: 'מאתגר',
};

export const TeacherPanel: React.FC<TeacherPanelProps> = ({
  questions,
  teams,
  selectedDifficulty,
  timerSeconds,
  onSelectDifficulty,
  onChangeTimer,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onGenerateBatch,
  onResetDefaultQuestions,
  onPreviewQuestion,
  onStartTeacherSoloRun,
  onResetScoresForClass,
  onAdjustTeamScore,
}) => {
  const [topicFilter, setTopicFilter] = useState<TopicId | 'all'>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'all'>('all');
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [testSummary, setTestSummary] = useState<TestSuiteSummary | null>(null);

  // Form states
  const [formTopic, setFormTopic] = useState<TopicId>('percentages');
  const [formSubTopic, setFormSubTopic] = useState<SubTopicId>('percent_of_amount');
  const [formDifficulty, setFormDifficulty] = useState<Difficulty>('medium');
  const [formStory, setFormStory] = useState<string>('');
  const [formPrompt, setFormPrompt] = useState<string>('');
  const [formOptions, setFormOptions] = useState<string[]>(['', '', '', '']);
  const [formCorrectIdx, setFormCorrectIdx] = useState<number>(0);
  const [formHint, setFormHint] = useState<string>('');
  const [formExplanation, setFormExplanation] = useState<string>('');
  const [formPoints, setFormPoints] = useState<number>(150);

  const openNewQuestionForm = () => {
    setEditingId(null);
    setFormTopic('percentages');
    setFormSubTopic('percent_of_amount');
    setFormDifficulty('medium');
    setFormStory('במעבדה הסודית יש 200 מבחנות אנרגיה.');
    setFormPrompt('');
    setFormOptions(['', '', '', '']);
    setFormCorrectIdx(0);
    setFormHint('');
    setFormExplanation('');
    setFormPoints(150);
    setIsFormOpen(true);
  };

  const openEditQuestionForm = (q: MathQuestion) => {
    setEditingId(q.id);
    setFormTopic(q.topic);
    setFormSubTopic(q.subTopic);
    setFormDifficulty(q.difficulty);
    setFormStory(q.storyContext || '');
    setFormPrompt(q.prompt);
    setFormOptions([...q.options]);
    setFormCorrectIdx(q.correctIndex);
    setFormHint(q.hint);
    setFormExplanation(q.explanationSteps.join('\n'));
    setFormPoints(q.points);
    setIsFormOpen(true);
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPrompt.trim() || formOptions.some((o) => !o.trim())) return;

    const newQ: MathQuestion = {
      id: editingId || `custom-${Date.now()}`,
      topic: formTopic,
      subTopic: formSubTopic,
      subTopicLabel: SUBTOPIC_LABELS[formSubTopic],
      difficulty: formDifficulty,
      storyContext: formStory.trim() || undefined,
      prompt: formPrompt.trim(),
      options: formOptions.map((o) => o.trim()),
      correctIndex: formCorrectIdx,
      hint: formHint.trim() || 'היעזרו בסימולטור המעבדה שמשמאל כדי לבדוק את הנתונים.',
      explanationSteps: formExplanation
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      codeDigit: Math.floor(Math.random() * 10),
      points: formPoints,
      simulatorConfig: {
        type: formTopic,
        percentValue: 50,
        totalAmount: 100,
        numbers: [15, 20, 25],
        averageMode: 'calculate',
        decimalA: 0.4,
        decimalB: 0.5,
        decimalMode: 'between',
      },
      isCustom: true,
    };

    if (editingId) {
      onUpdateQuestion(newQ);
    } else {
      onAddQuestion(newQ);
    }
    setIsFormOpen(false);
  };

  const filteredQuestions = questions.filter((q) => {
    if (topicFilter !== 'all' && q.topic !== topicFilter) return false;
    if (difficultyFilter !== 'all' && q.difficulty !== difficultyFilter) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner: Teacher Preview & Classroom Controls */}
      <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
        <div>
          <div className="text-xs text-cyan-400 font-medium mb-1">
            חדר הבקרה של המורה · הכנה והתנסות לפני השיעור
          </div>
          <h2 className="text-2xl font-bold text-slate-100">
            ניהול שאלות, רמות קושי והתנסות מוקדמת
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            כאן תוכל להתנסות במשחק בעצמך לפני השיעור, ללחוץ על <strong>&quot;נסה שאלה במעבדה&quot;</strong> ליד כל שאלה כדי לבדוק אותה עם הסימולטור שלה, להוסיף שאלות משלך ולאפס בלחיצה אחת לפני שהכיתה מתחילה.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onStartTeacherSoloRun}
            className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm rounded-lg transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>התנסות מלאה במשחק (מצב מורה)</span>
          </button>
          <button
            type="button"
            onClick={onResetScoresForClass}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-600 font-medium text-sm rounded-lg transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-4 h-4" />
            <span>אפס ניקוד והכן לכיתה</span>
          </button>
          <button
            type="button"
            onClick={() => setTestSummary(runFullGameTestSuite(questions))}
            className="px-4 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-sm rounded-lg transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>הרץ בדיקת מערכת מלאה</span>
          </button>
        </div>
      </div>

      {/* Interactive Automated Test Suite Report */}
      {testSummary && (
        <div className="bg-[#1E293B] border border-emerald-500/50 rounded-xl p-5 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/70 pb-3">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="text-base font-bold text-slate-100">
                  דוח תוכנית בדיקות אוטומטית (שעה: {testSummary.timestamp})
                </h3>
                <p className="text-xs text-slate-300">
                  נבדקו {testSummary.totalTests} תרחישים ומצבים: מאגר שאלות, מחולל אוטומטי, סימולטורים ויזואליים, קומבו, כוחות מיוחדים ופריצת כספות.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-math text-sm font-bold text-emerald-400">
                {testSummary.passedCount}/{testSummary.totalTests} עברו בהצלחה (100%)
              </span>
              <button
                type="button"
                onClick={() => setTestSummary(null)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
                title="סגור דוח בדיקות"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto pr-1">
            {testSummary.results.map((res) => (
              <div
                key={res.id}
                className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
                  res.passed
                    ? 'bg-slate-900/90 border-slate-800 text-slate-200'
                    : 'bg-rose-950/60 border-rose-500/50 text-rose-200'
                }`}
              >
                {res.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold text-slate-100">
                    {res.category} · {res.name}
                  </div>
                  <div className="text-slate-400 mt-0.5 leading-relaxed">
                    {res.details}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Classroom Settings & Live Team Score Adjuster */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Global Difficulty & Timer Settings */}
        <div className="lg:col-span-5 bg-[#1E293B] border border-[#334155] rounded-xl p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-slate-100 font-bold text-base border-b border-slate-700/70 pb-3">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>הגדרות משחק לכיתה</span>
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-2">
              רמת קושי פעילה במשחק הכיתתי:
            </label>
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800">
              {(['all', 'easy', 'medium', 'hard'] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => onSelectDifficulty(d)}
                  className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                    selectedDifficulty === d
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {d === 'all' ? 'משולב (הכל)' : DIFFICULTY_LABELS[d]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-2">
              שעון עצר לשאלה על הלוח החכם (מגוון זמנים לבחירת המורה):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1.5 bg-slate-900 rounded-lg border border-slate-800">
              {[
                { label: 'ללא שעון (דיון)', val: 0 },
                { label: '20 ש׳ (בזק)', val: 20 },
                { label: '30 שניות', val: 30 },
                { label: '45 שניות', val: 45 },
                { label: '60 שניות', val: 60 },
                { label: '90 שניות', val: 90 },
                { label: '120 ש׳ (2 דק׳)', val: 120 },
                { label: '180 ש׳ (3 דק׳)', val: 180 },
              ].map((t) => (
                <button
                  key={t.val}
                  type="button"
                  onClick={() => onChangeTimer(t.val)}
                  className={`py-1.5 px-2 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                    timerSeconds === t.val
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Team Points Control */}
        <div className="lg:col-span-7 bg-[#1E293B] border border-[#334155] rounded-xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-700/70 pb-3">
            <div className="flex items-center gap-2 text-slate-100 font-bold text-base">
              <Users className="w-4 h-4 text-amber-400" />
              <span>ניהול ניקוד קבוצות בזמן אמת (בונוס השתתפות / עבודת צוות)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {teams.map((team) => (
              <div
                key={team.id}
                className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 flex items-center justify-between gap-2"
              >
                <div>
                  <div className={`text-sm font-bold ${team.textClass}`}>{team.name}</div>
                  <div className="text-xs text-slate-400">
                    ניקוד: <strong className="font-math text-slate-100">{team.score}</strong> · רצף:{' '}
                    <strong className="font-math text-amber-400">{team.streak}</strong>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onAdjustTeamScore(team.id, 50)}
                    className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded text-xs font-math font-bold cursor-pointer"
                  >
                    +50
                  </button>
                  <button
                    type="button"
                    onClick={() => onAdjustTeamScore(team.id, -50)}
                    className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded text-xs font-math font-bold cursor-pointer"
                  >
                    -50
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Question Bank Header & Actions */}
      <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-5 flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-700/70 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-100">
              מאגר השאלות במעבדה ({filteredQuestions.length} שאלות מוצגות)
            </h3>
            <div className="text-xs text-slate-400 mt-0.5">
              לחצו על &quot;נסה שאלה במעבדה&quot; כדי לבדוק איך השאלה והסימולטור נראים על הלוח החכם
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={openNewQuestionForm}
              className="px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>הוסף שאלה חדשה</span>
            </button>
            <button
              type="button"
              onClick={onGenerateBatch}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>חולל 3 שאלות חדשות אוטומטית</span>
            </button>
            <button
              type="button"
              onClick={onResetDefaultQuestions}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs rounded-lg flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>שחזר מאגר מקורי</span>
            </button>
          </div>
        </div>

        {/* Add / Edit Question Form Modal Inline */}
        {isFormOpen && (
          <form
            onSubmit={handleSaveQuestion}
            className="bg-slate-900 border border-cyan-500/40 rounded-xl p-5 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-base font-bold text-cyan-400">
                {editingId ? 'עריכת שאלה קיימת' : 'יצירת שאלה חדשה למעבדה'}
              </h4>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-slate-300 mb-1">נושא ראשי:</label>
                <select
                  value={formTopic}
                  onChange={(e) => {
                    const newT = e.target.value as TopicId;
                    setFormTopic(newT);
                    setFormSubTopic(SUBTOPICS_BY_TOPIC[newT][0]);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100"
                >
                  <option value="percentages">אחוזים בסיסי</option>
                  <option value="averages">ממוצע</option>
                  <option value="decimals">מספרים עשרוניים</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">תת-נושא:</label>
                <select
                  value={formSubTopic}
                  onChange={(e) => setFormSubTopic(e.target.value as SubTopicId)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100"
                >
                  {SUBTOPICS_BY_TOPIC[formTopic].map((st) => (
                    <option key={st} value={st}>
                      {SUBTOPIC_LABELS[st]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">רמת קושי וניקוד:</label>
                <select
                  value={formDifficulty}
                  onChange={(e) => {
                    const d = e.target.value as Difficulty;
                    setFormDifficulty(d);
                    setFormPoints(d === 'easy' ? 100 : d === 'medium' ? 150 : 200);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100"
                >
                  <option value="easy">קל (100 נק׳)</option>
                  <option value="medium">בינוני (150 נק׳)</option>
                  <option value="hard">מאתגר (200 נק׳)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">
                סיפור רקע במעבדה (אופציונלי):
              </label>
              <input
                type="text"
                value={formStory}
                onChange={(e) => setFormStory(e.target.value)}
                placeholder="למשל: במכל האנרגיה של המעבדה יש 120 ליטרים..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">נוסח השאלה (חובה):</label>
              <input
                type="text"
                required
                value={formPrompt}
                onChange={(e) => setFormPrompt(e.target.value)}
                placeholder="למשל: כמה ליטרים הם 25% מהמכל?"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {formOptions.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correctOpt"
                    checked={formCorrectIdx === idx}
                    onChange={() => setFormCorrectIdx(idx)}
                    className="accent-emerald-400 cursor-pointer"
                  />
                  <input
                    type="text"
                    required
                    value={opt}
                    onChange={(e) => {
                      const next = [...formOptions];
                      next[idx] = e.target.value;
                      setFormOptions(next);
                    }}
                    placeholder={`אפשרות ${idx + 1} ${formCorrectIdx === idx ? '(התשובה הנכונה)' : ''}`}
                    className={`w-full bg-slate-950 border rounded-lg px-3 py-2 text-sm text-slate-100 ${
                      formCorrectIdx === idx ? 'border-emerald-500' : 'border-slate-700'
                    }`}
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-300 mb-1">רמז לתלמידים:</label>
                <input
                  type="text"
                  value={formHint}
                  onChange={(e) => setFormHint(e.target.value)}
                  placeholder="למשל: זכרו ש-25% הם בדיוק רבע מהכמות..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  שלבי הסבר מפורט (כל שורה היא שלב):
                </label>
                <textarea
                  rows={2}
                  value={formExplanation}
                  onChange={(e) => setFormExplanation(e.target.value)}
                  placeholder="25% שווים לרבע.&#10;נחלק את הכמות ב-4 ונקבל את התשובה."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg cursor-pointer"
              >
                ביטול
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>שמור שאלה במאגר</span>
              </button>
            </div>
          </form>
        )}

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setTopicFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                topicFilter === 'all'
                  ? 'bg-slate-700 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              כל הנושאים ({questions.length})
            </button>
            {(['percentages', 'averages', 'decimals'] as TopicId[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTopicFilter(t)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  topicFilter === t
                    ? 'bg-slate-700 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {TOPIC_METADATA[t].title}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800 w-full sm:w-auto">
            {(['all', 'easy', 'medium', 'hard'] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDifficultyFilter(d)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  difficultyFilter === d
                    ? 'bg-slate-700 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {d === 'all' ? 'כל הרמות' : DIFFICULTY_LABELS[d]}
              </button>
            ))}
          </div>
        </div>

        {/* Questions List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredQuestions.map((q) => {
            const meta = TOPIC_METADATA[q.topic];
            return (
              <div
                key={q.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl p-4 flex flex-col justify-between gap-3 transition-colors"
              >
                <div>
                  {/* Clean unboxed metadata per Zero-Pill rule */}
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-400 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`font-semibold ${meta.textClass}`}>{meta.title}</span>
                      <span aria-hidden="true">·</span>
                      <span>{q.subTopicLabel}</span>
                      <span aria-hidden="true">·</span>
                      <span>רמה: {DIFFICULTY_LABELS[q.difficulty]}</span>
                    </div>
                    <span className="font-math text-slate-300 font-semibold">{q.points} נק׳</span>
                  </div>

                  {q.storyContext && (
                    <p className="text-xs text-slate-400 mb-1">{q.storyContext}</p>
                  )}
                  <h4 className="text-sm font-bold text-slate-100 leading-snug mb-3">
                    {q.prompt}
                  </h4>

                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    {q.options.map((opt, idx) => (
                      <div
                        key={idx}
                        className={`px-2.5 py-1.5 rounded border ${
                          idx === q.correctIndex
                            ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300 font-semibold'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400'
                        }`}
                      >
                        {idx === q.correctIndex ? '✓ ' : ''}
                        {opt}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Teacher Action Buttons */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => onPreviewQuestion(q)}
                    className="px-3 py-1.5 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>נסה שאלה זו במעבדה</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditQuestionForm(q)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
                      title="ערוך שאלה"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteQuestion(q.id)}
                      className="p-1.5 bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 rounded-lg cursor-pointer"
                      title="מחק שאלה"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
