import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActiveTab,
  Difficulty,
  GamePhase,
  MathQuestion,
  PowerUpType,
  Team,
  TopicId,
  VaultProgress,
} from './types/game';
import {
  generateProceduralQuestions,
  INITIAL_QUESTIONS,
  shuffleQuestionOptions,
  TOPIC_METADATA,
} from './data/questions';
import { PercentageSimulator } from './components/simulators/PercentageSimulator';
import { AverageSimulator } from './components/simulators/AverageSimulator';
import { DecimalSimulator } from './components/simulators/DecimalSimulator';
import { TeacherPanel } from './components/TeacherPanel';
import { SimulatorsDeck } from './components/SimulatorsDeck';
import { RulesView } from './components/RulesView';
import { CelebrationOverlay, CelebrationState } from './components/CelebrationOverlay';
import { soundFX } from './utils/sound';
import {
  Lock,
  Unlock,
  KeyRound,
  Trophy,
  Flame,
  Lightbulb,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  RotateCcw,
  Users,
  UserCheck,
  Volume2,
  VolumeX,
  Timer,
  ShieldAlert,
  Sparkles,
  Zap,
  Scale,
  Search,
  Home,
  BookOpen,
} from 'lucide-react';

const STORAGE_KEY_QUESTIONS = 'secret_math_lab_grade5_questions_v2';

const TEAM_PRESETS: Omit<
  Team,
  | 'score'
  | 'streak'
  | 'maxStreak'
  | 'correctCount'
  | 'totalAnswered'
  | 'powerUps'
  | 'crackedVaults'
>[] = [
  {
    id: 'team-1',
    name: 'צוות אלפא (המפצחים)',
    color: '#06B6D4',
    bgClass: 'bg-cyan-500/15',
    borderClass: 'border-cyan-500/50',
    textClass: 'text-cyan-400',
  },
  {
    id: 'team-2',
    name: 'צוות בטא (המדענים)',
    color: '#F59E0B',
    bgClass: 'bg-amber-500/15',
    borderClass: 'border-amber-500/50',
    textClass: 'text-amber-400',
  },
  {
    id: 'team-3',
    name: 'צוות גמא (הלייזרים)',
    color: '#10B981',
    bgClass: 'bg-emerald-500/15',
    borderClass: 'border-emerald-500/50',
    textClass: 'text-emerald-400',
  },
  {
    id: 'team-4',
    name: 'צוות דלתא (החוקרים)',
    color: '#A855F7',
    bgClass: 'bg-purple-500/15',
    borderClass: 'border-purple-500/50',
    textClass: 'text-purple-400',
  },
];

const VAULT_CRACK_BONUS = 250;

function createInitialTeams(count: number, names?: string[]): Team[] {
  return TEAM_PRESETS.slice(0, count).map((preset, idx) => ({
    ...preset,
    name: names && names[idx] ? names[idx] : preset.name,
    score: 0,
    streak: 0,
    maxStreak: 0,
    correctCount: 0,
    totalAnswered: 0,
    powerUps: {
      fifty_fifty: 1,
      free_scanner: 1,
      double_vault: 1,
    },
    crackedVaults: [],
  }));
}

const INITIAL_VAULTS: Record<TopicId, VaultProgress> = {
  percentages: {
    topic: 'percentages',
    unlockedDigits: [],
    requiredDigits: 3,
    isCracked: false,
  },
  averages: {
    topic: 'averages',
    unlockedDigits: [],
    requiredDigits: 3,
    isCracked: false,
  },
  decimals: {
    topic: 'decimals',
    unlockedDigits: [],
    requiredDigits: 3,
    isCracked: false,
  },
};

export default function App() {
  // Navigation & Global Mode
  const [activeTab, setActiveTab] = useState<ActiveTab>('game');
  const [gamePhase, setGamePhase] = useState<GamePhase>('SETUP_LOBBY');
  const [isTeacherSoloMode, setIsTeacherSoloMode] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Questions Bank (persisted in localStorage)
  const [questions, setQuestions] = useState<MathQuestion[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_QUESTIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const zeroIndexCount = parsed.filter(
            (q: MathQuestion) => q.correctIndex === 0
          ).length;
          // If more than half of cached questions have correctIndex === 0, shuffle their options
          if (zeroIndexCount > parsed.length * 0.5) {
            return parsed.map((q: MathQuestion) => shuffleQuestionOptions(q));
          }
          return parsed;
        }
      }
    } catch {
      // ignore storage errors
    }
    return INITIAL_QUESTIONS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_QUESTIONS, JSON.stringify(questions));
    } catch {
      // ignore storage errors
    }
  }, [questions]);

  // Setup & Classroom Configuration
  const [teamCount, setTeamCount] = useState<number>(3);
  const [teamNames, setTeamNames] = useState<string[]>(
    TEAM_PRESETS.map((t) => t.name)
  );
  const [teams, setTeams] = useState<Team[]>(() => createInitialTeams(3));
  const [activeTeamIdx, setActiveTeamIdx] = useState<number>(0);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'all'>('all');
  const [timerSeconds, setTimerSeconds] = useState<number>(60); // Default 60s visible countdown timer
  const [isTimerPaused, setIsTimerPaused] = useState<boolean>(false);
  const [proceduralBatchCount, setProceduralBatchCount] = useState<number>(1);

  // Vaults & Active Question State
  const [vaults, setVaults] = useState<Record<TopicId, VaultProgress>>(INITIAL_VAULTS);
  const [answeredQuestionIds, setAnsweredQuestionIds] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<MathQuestion | null>(null);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
  const [eliminatedOptionIndices, setEliminatedOptionIndices] = useState<number[]>([]);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [doublePointsActive, setDoublePointsActive] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [lastEarnedPoints, setLastEarnedPoints] = useState<number>(0);
  const [lastCrackedVaultBonus, setLastCrackedVaultBonus] = useState<number>(0);
  const [celebration, setCelebration] = useState<CelebrationState | null>(null);
  const challengeStageRef = useRef<HTMLDivElement | null>(null);

  // Automatically jump/scroll to the question stage whenever a question is selected or gamePhase/tab changes
  useEffect(() => {
    if (
      (gamePhase === 'ACTIVE_CHALLENGE' ||
        gamePhase === 'TEACHER_PREVIEW_QUESTION') &&
      currentQuestion
    ) {
      requestAnimationFrame(() => {
        if (challengeStageRef.current) {
          challengeStageRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentQuestion?.id, gamePhase, activeTab]);

  // Timer countdown effect during ACTIVE_CHALLENGE and TEACHER_PREVIEW_QUESTION
  useEffect(() => {
    if (
      (gamePhase !== 'ACTIVE_CHALLENGE' &&
        gamePhase !== 'TEACHER_PREVIEW_QUESTION') ||
      selectedOptionIdx !== null ||
      isTimerPaused ||
      timerSeconds <= 0 ||
      timeLeft <= 0
    ) {
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const next = Math.max(0, prev - 1);
        if (next > 0 && next <= 10) {
          soundFX.playUrgentTick();
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gamePhase, selectedOptionIdx, isTimerPaused, timerSeconds, timeLeft]);

  const activeTeam = teams[activeTeamIdx] || teams[0];

  // Toggle sound mute
  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundFX.muted = next;
  };

  // Start classroom team game
  const startClassroomGame = () => {
    soundFX.playClick();
    setCelebration(null);
    setIsTeacherSoloMode(false);
    setTeams(createInitialTeams(teamCount, teamNames));
    setActiveTeamIdx(0);
    setVaults({
      percentages: { topic: 'percentages', unlockedDigits: [], requiredDigits: 3, isCracked: false },
      averages: { topic: 'averages', unlockedDigits: [], requiredDigits: 3, isCracked: false },
      decimals: { topic: 'decimals', unlockedDigits: [], requiredDigits: 3, isCracked: false },
    });
    setAnsweredQuestionIds([]);
    setActiveTab('game');
    setGamePhase('LAB_MAP');
  };

  // Start immediate Teacher Solo Preview & Test Run
  const startTeacherSoloRun = () => {
    soundFX.playClick();
    setCelebration(null);
    setIsTeacherSoloMode(true);
    setTeams([
      {
        id: 'teacher-solo',
        name: 'מצב התנסות מורה (בדיקה מקדימה)',
        color: '#06B6D4',
        bgClass: 'bg-cyan-500/15',
        borderClass: 'border-cyan-500/50',
        textClass: 'text-cyan-400',
        score: 0,
        streak: 0,
        maxStreak: 0,
        correctCount: 0,
        totalAnswered: 0,
        powerUps: {
          fifty_fifty: 3,
          free_scanner: 3,
          double_vault: 3,
        },
        crackedVaults: [],
      },
    ]);
    setActiveTeamIdx(0);
    setVaults({
      percentages: { topic: 'percentages', unlockedDigits: [], requiredDigits: 3, isCracked: false },
      averages: { topic: 'averages', unlockedDigits: [], requiredDigits: 3, isCracked: false },
      decimals: { topic: 'decimals', unlockedDigits: [], requiredDigits: 3, isCracked: false },
    });
    setAnsweredQuestionIds([]);
    setActiveTab('game');
    setGamePhase('LAB_MAP');
  };

  // Reset scores and return to clean classroom lobby
  const resetScoresForClass = () => {
    soundFX.playClick();
    setCelebration(null);
    setIsTeacherSoloMode(false);
    setTeams(createInitialTeams(teamCount, teamNames));
    setActiveTeamIdx(0);
    setVaults(INITIAL_VAULTS);
    setAnsweredQuestionIds([]);
    setCurrentQuestion(null);
    setActiveTab('game');
    setGamePhase('SETUP_LOBBY');
  };

  // Pick a question from a topic vault (optionally filtered by specific difficulty chosen by team)
  const openTopicChallenge = (
    topic: TopicId,
    specificQuestion?: MathQuestion,
    preferredDifficulty?: Difficulty
  ) => {
    soundFX.playClick();
    let chosen: MathQuestion | undefined = specificQuestion;
    const effectiveDiff = preferredDifficulty || selectedDifficulty;

    if (!chosen) {
      const candidates = questions.filter((q) => {
        if (q.topic !== topic) return false;
        if (effectiveDiff !== 'all' && q.difficulty !== effectiveDiff) return false;
        return !answeredQuestionIds.includes(q.id);
      });

      const fallbackSameDiff = questions.filter(
        (q) =>
          q.topic === topic &&
          (effectiveDiff === 'all' || q.difficulty === effectiveDiff)
      );

      const fallbackUnanswered = questions.filter(
        (q) => q.topic === topic && !answeredQuestionIds.includes(q.id)
      );
      const anyTopicPool = questions.filter((q) => q.topic === topic);

      const pool =
        candidates.length > 0
          ? candidates
          : fallbackSameDiff.length > 0
          ? fallbackSameDiff
          : fallbackUnanswered.length > 0
          ? fallbackUnanswered
          : anyTopicPool;

      chosen = pool[Math.floor(Math.random() * pool.length)];
    }

    if (!chosen) return;

    // Always shuffle the 4 answer options when presenting the question so position is never predictable
    setCurrentQuestion(shuffleQuestionOptions(chosen));
    setSelectedOptionIdx(null);
    setEliminatedOptionIndices([]);
    setShowHint(false);
    setDoublePointsActive(false);
    setLastCrackedVaultBonus(0);
    setIsTimerPaused(false);
    setTimeLeft(timerSeconds > 0 ? timerSeconds : 60);
    setGamePhase('ACTIVE_CHALLENGE');
  };

  // Preview a specific question directly from Teacher Panel
  const handlePreviewQuestionFromTeacher = (q: MathQuestion) => {
    soundFX.playClick();
    setCurrentQuestion(shuffleQuestionOptions(q));
    setSelectedOptionIdx(null);
    setEliminatedOptionIndices([]);
    setShowHint(false);
    setDoublePointsActive(false);
    setLastCrackedVaultBonus(0);
    setIsTimerPaused(false);
    setTimeLeft(timerSeconds > 0 ? timerSeconds : 60);
    setActiveTab('game');
    setGamePhase('TEACHER_PREVIEW_QUESTION');
  };

  // Trigger a Team Power-Up
  const handleUsePowerUp = (type: PowerUpType) => {
    if (!currentQuestion || !activeTeam) return;
    if (activeTeam.powerUps[type] <= 0) return;

    if (type === 'fifty_fifty') {
      if (eliminatedOptionIndices.length > 0) return;
      const wrongIndices = currentQuestion.options
        .map((_, idx) => idx)
        .filter((idx) => idx !== currentQuestion.correctIndex);
      const shuffledWrong = wrongIndices.sort(() => Math.random() - 0.5).slice(0, 2);
      setEliminatedOptionIndices(shuffledWrong);
    } else if (type === 'free_scanner') {
      if (showHint) return;
      setShowHint(true);
    } else if (type === 'double_vault') {
      if (doublePointsActive) return;
      setDoublePointsActive(true);
    }

    soundFX.playPowerUp();
    setTeams((prev) =>
      prev.map((t, i) =>
        i === activeTeamIdx
          ? {
              ...t,
              powerUps: {
                ...t.powerUps,
                [type]: Math.max(0, t.powerUps[type] - 1),
              },
            }
          : t
      )
    );
  };

  // Lock in an answer
  const handleSubmitAnswer = (optionIdx: number) => {
    if (!currentQuestion || selectedOptionIdx !== null) return;
    setSelectedOptionIdx(optionIdx);

    const isCorrect = optionIdx === currentQuestion.correctIndex;

    if (gamePhase === 'TEACHER_PREVIEW_QUESTION') {
      if (isCorrect) {
        soundFX.playCorrect();
      } else {
        soundFX.playWrong();
      }
      return;
    }

    // Standard or Teacher Solo game progression
    setAnsweredQuestionIds((prev) =>
      prev.includes(currentQuestion.id) ? prev : [...prev, currentQuestion.id]
    );

    if (isCorrect) {
      soundFX.playCorrect();
      const newStreak = activeTeam.streak + 1;
      const comboMultiplier = newStreak >= 3 ? 2 : newStreak === 2 ? 1.5 : 1;
      const doubleMultiplier = doublePointsActive ? 2 : 1;
      const questionEarned = Math.round(
        currentQuestion.points * comboMultiplier * doubleMultiplier
      );

      // Check if this answer cracks the vault (3rd digit!)
      const currentTopicVault = vaults[currentQuestion.topic];
      let vaultBonusEarned = 0;
      let isNowCracked = false;
      let nextDigits = currentTopicVault.unlockedDigits;

      if (!currentTopicVault.isCracked) {
        nextDigits = [
          ...currentTopicVault.unlockedDigits,
          currentQuestion.codeDigit,
        ];
        isNowCracked = nextDigits.length >= currentTopicVault.requiredDigits;
        if (isNowCracked) {
          vaultBonusEarned = VAULT_CRACK_BONUS;
        }
      }

      const totalEarned = questionEarned + vaultBonusEarned;
      setLastEarnedPoints(totalEarned);
      setLastCrackedVaultBonus(vaultBonusEarned);

      // Update team score, streak, crackedVaults trophy, and award bonus power-up on 3-streak or vault crack
      setTeams((prev) =>
        prev.map((t, idx) => {
          if (idx !== activeTeamIdx) return t;
          const bonusPowerUp = newStreak % 3 === 0 || isNowCracked;
          return {
            ...t,
            score: t.score + totalEarned,
            streak: newStreak,
            maxStreak: Math.max(t.maxStreak, newStreak),
            correctCount: t.correctCount + 1,
            totalAnswered: t.totalAnswered + 1,
            crackedVaults: isNowCracked
              ? [...t.crackedVaults, currentQuestion.topic]
              : t.crackedVaults,
            powerUps: bonusPowerUp
              ? {
                  fifty_fifty: t.powerUps.fifty_fifty + 1,
                  free_scanner: t.powerUps.free_scanner + 1,
                  double_vault: t.powerUps.double_vault + 1,
                }
              : t.powerUps,
          };
        })
      );

      if (!currentTopicVault.isCracked) {
        setVaults((prev) => ({
          ...prev,
          [currentQuestion.topic]: {
            ...currentTopicVault,
            unlockedDigits: nextDigits,
            isCracked: isNowCracked,
            crackedByTeamName: isNowCracked ? activeTeam.name : undefined,
          },
        }));

        if (isNowCracked) {
          const meta = TOPIC_METADATA[currentQuestion.topic];
          setTimeout(() => {
            soundFX.playVaultCracked();
            setCelebration({
              active: true,
              type: 'vault_cracked',
              title: `${meta.vaultName} נפרצה! (+${VAULT_CRACK_BONUS} נק׳ בונוס!)`,
              subtitle: `${activeTeam.name} חשפו את הספרה ה-3, פרצו את הכספת וזכו ב-+${VAULT_CRACK_BONUS} נקודות בונוס וטעינת כוחות!`,
              accentColor: meta.accentHex,
              codeDigits: nextDigits,
            });
          }, 250);
        }
      }
    } else {
      soundFX.playWrong();
      setLastEarnedPoints(0);
      setLastCrackedVaultBonus(0);
      setTeams((prev) =>
        prev.map((t, idx) =>
          idx === activeTeamIdx
            ? {
                ...t,
                streak: 0,
                totalAnswered: t.totalAnswered + 1,
              }
            : t
        )
      );
    }

    setGamePhase('EXPLANATION_REVIEW');
  };

  // Proceed to next team's turn or Final Victory if all 3 vaults are cracked
  const handleContinueAfterExplanation = () => {
    soundFX.playClick();
    const allCracked =
      vaults.percentages.isCracked &&
      vaults.averages.isCracked &&
      vaults.decimals.isCracked;

    if (allCracked) {
      soundFX.playVaultCracked();
      setGamePhase('FINAL_VAULT_VICTORY');
      setCelebration({
        active: true,
        type: 'game_victory',
        title: 'כל הכספות פוצחו!',
        subtitle: 'המעבדה הסודית שוחררה בהצלחה!',
        accentColor: '#10B981',
      });
      return;
    }

    // Advance turn to next team in classroom mode
    if (teams.length > 1) {
      setActiveTeamIdx((prev) => (prev + 1) % teams.length);
    }
    setCurrentQuestion(null);
    setGamePhase('LAB_MAP');
  };

  // Teacher Panel Handlers
  const handleAddQuestion = (newQ: MathQuestion) => {
    setQuestions((prev) => [newQ, ...prev]);
  };

  const handleUpdateQuestion = (updatedQ: MathQuestion) => {
    setQuestions((prev) => prev.map((q) => (q.id === updatedQ.id ? updatedQ : q)));
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const handleGenerateBatch = () => {
    soundFX.playPowerUp();
    const generated = generateProceduralQuestions(proceduralBatchCount);
    setProceduralBatchCount((prev) => prev + 1);
    setQuestions((prev) => [...generated, ...prev]);
  };

  const handleResetDefaultQuestions = () => {
    soundFX.playClick();
    setQuestions(INITIAL_QUESTIONS);
  };

  const handleAdjustTeamScore = (teamId: string, delta: number) => {
    soundFX.playClick();
    setTeams((prev) =>
      prev.map((t) =>
        t.id === teamId ? { ...t, score: Math.max(0, t.score + delta) } : t
      )
    );
  };

  const sortedTeamsByScore = useMemo(
    () => [...teams].sort((a, b) => b.score - a.score),
    [teams]
  );

  const hasActiveGame =
    answeredQuestionIds.length > 0 || teams.some((t) => t.score > 0 || t.totalAnswered > 0);

  const goToHomeSetup = () => {
    soundFX.playClick();
    setActiveTab('game');
    setGamePhase('SETUP_LOBBY');
  };

  // Render corresponding simulator for a question
  const renderQuestionSimulator = (q: MathQuestion) => {
    const cfg = q.simulatorConfig;
    if (q.topic === 'percentages') {
      return (
        <PercentageSimulator
          initialPercent={cfg.percentValue ?? 35}
          initialTotal={cfg.totalAmount ?? 100}
          compact
        />
      );
    }
    if (q.topic === 'averages') {
      return (
        <AverageSimulator
          initialNumbers={cfg.numbers ?? [12, 16, 20, 24]}
          initialMode={cfg.averageMode ?? 'calculate'}
          targetAverage={cfg.targetAverage ?? 20}
          addedNumber={cfg.addedNumber ?? 28}
        />
      );
    }
    return (
      <DecimalSimulator
        initialDecimalA={cfg.decimalA ?? 0.4}
        initialDecimalB={cfg.decimalB ?? 0.5}
        initialTarget={cfg.targetDecimal ?? 0.46}
        initialMode={cfg.decimalMode ?? 'between'}
      />
    );
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#F8FAFC] flex flex-col">
      {/* ==================== TOP BAR (Strict 3-Zone Contract) ==================== */}
      <header className="flex items-center justify-between gap-8 px-6 py-4 bg-[#0F172A]/95 border-b border-[#334155] sticky top-0 z-40 backdrop-blur">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            goToHomeSetup();
          }}
          className="text-lg font-extrabold tracking-tight text-slate-100 whitespace-nowrap shrink-0"
        >
          המעבדה הסודית: פיצוח הקוד המתמטי
        </a>

        {/* Zone 2: 5 concise single-line text navigation links */}
        <nav className="flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            type="button"
            onClick={() => setActiveTab('game')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 ${
              activeTab === 'game'
                ? 'text-cyan-400 border-b-2 border-cyan-400 font-bold'
                : ''
            }`}
          >
            זירת המשחק
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('rules')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 ${
              activeTab === 'rules'
                ? 'text-cyan-400 border-b-2 border-cyan-400 font-bold'
                : ''
            }`}
          >
            חוקי המשחק
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('simulators')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 ${
              activeTab === 'simulators'
                ? 'text-cyan-400 border-b-2 border-cyan-400 font-bold'
                : ''
            }`}
          >
            כלי מעבדה
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('leaderboard')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 ${
              activeTab === 'leaderboard'
                ? 'text-cyan-400 border-b-2 border-cyan-400 font-bold'
                : ''
            }`}
          >
            לוח שיאים
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('teacher')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 ${
              activeTab === 'teacher'
                ? 'text-cyan-400 border-b-2 border-cyan-400 font-bold'
                : ''
            }`}
          >
            פאנל מורה
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => {
              if (activeTab === 'game' && gamePhase === 'SETUP_LOBBY') {
                startTeacherSoloRun();
              } else {
                goToHomeSetup();
              }
            }}
            className="px-4 py-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {activeTab === 'game' && gamePhase === 'SETUP_LOBBY'
              ? 'התנסות מהירה למורה'
              : 'מסך הבית (התחלה)'}
          </button>
        </div>
      </header>

      {/* ==================== MAIN CONTENT CONTAINER ==================== */}
      <main className="flex-1 w-full max-w-[1380px] mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
        {/* Sub-Toolbar for Classroom Status, Home Return & Audio Control */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-[#1E293B]/70 border border-[#334155] rounded-xl px-4 py-2.5 text-xs">
          <div className="flex flex-wrap items-center gap-3 text-slate-300">
            <span className="font-semibold text-slate-100">כיתה ה׳ · חשבון</span>
            <span aria-hidden="true">·</span>
            <span>אחוזים בסיסי</span>
            <span aria-hidden="true">·</span>
            <span>ממוצע (חישוב, השלמת חסר, הוספת איבר)</span>
            <span aria-hidden="true">·</span>
            <span>מספרים עשרוניים (השוואה, בין עשרוניים, המרה לאחוזים)</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {(gamePhase !== 'SETUP_LOBBY' || activeTab !== 'game') && (
              <button
                type="button"
                onClick={goToHomeSetup}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 rounded-md font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Home className="w-3.5 h-3.5" />
                <span>חזרה למסך הבית (התחלה)</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveTab('rules')}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md font-medium flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>איך משחקים? (חוקים)</span>
            </button>
            {isTeacherSoloMode && gamePhase !== 'SETUP_LOBBY' && (
              <button
                type="button"
                onClick={resetScoresForClass}
                className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-md font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>סיום התנסות מורה ואיפוס לכיתה</span>
              </button>
            )}
            <button
              type="button"
              onClick={toggleMute}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                  <span>צלילים מושתקים</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>צלילי מעבדה פעילים</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ==================== TAB: GAME RULES & CLASSROOM GUIDE ==================== */}
        {activeTab === 'rules' && (
          <RulesView
            onGoToHomeSetup={goToHomeSetup}
            onResumeOrStartGame={() => {
              setActiveTab('game');
              setGamePhase('LAB_MAP');
            }}
            onStartTeacherSolo={startTeacherSoloRun}
            hasActiveGame={hasActiveGame}
          />
        )}

        {/* ==================== TAB 2: STANDALONE SIMULATORS ==================== */}
        {activeTab === 'simulators' && <SimulatorsDeck />}

        {/* ==================== TAB 3: LEADERBOARD & STATS ==================== */}
        {activeTab === 'leaderboard' && (
          <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-6 flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-700/70 pb-4">
              <div>
                <div className="text-xs text-amber-400 font-medium mb-1">
                  דירוג צוותי הפיצוח בזמן אמת
                </div>
                <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-amber-400" />
                  <span>לוח השיאים ומצב פיצוח הכספות</span>
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('game')}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg cursor-pointer whitespace-nowrap"
              >
                חזרה לזירת המשחק
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(['percentages', 'averages', 'decimals'] as TopicId[]).map((topic) => {
                const v = vaults[topic];
                const meta = TOPIC_METADATA[topic];
                return (
                  <div
                    key={topic}
                    className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-center justify-between"
                  >
                    <div>
                      <div className={`text-sm font-bold ${meta.textClass}`}>
                        {meta.vaultName}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        סטטוס:{' '}
                        <strong className="text-slate-200">
                          {v.isCracked
                            ? 'נפרצה בהצלחה!'
                            : `${v.unlockedDigits.length}/${v.requiredDigits} ספרות קוד`}
                        </strong>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 font-math">
                      {Array.from({ length: v.requiredDigits }, (_, i) => (
                        <span
                          key={i}
                          className={`w-8 h-9 rounded-lg flex items-center justify-center text-sm font-bold border ${
                            v.unlockedDigits[i] !== undefined
                              ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                              : 'bg-slate-950 border-slate-800 text-slate-600'
                          }`}
                        >
                          {v.unlockedDigits[i] !== undefined ? v.unlockedDigits[i] : '?'}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="border-b border-slate-700 text-xs text-slate-400">
                    <th className="py-3 px-4">דירוג</th>
                    <th className="py-3 px-4">שם הצוות</th>
                    <th className="py-3 px-4">ניקוד מצטבר</th>
                    <th className="py-3 px-4">תשובות נכונות</th>
                    <th className="py-3 px-4">שיא רצף (Combo)</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {sortedTeamsByScore.map((team, idx) => (
                    <tr
                      key={team.id}
                      className="border-b border-slate-800/70 hover:bg-slate-900/50"
                    >
                      <td className="py-3.5 px-4 font-math font-bold text-amber-400">
                        #{idx + 1}
                      </td>
                      <td className={`py-3.5 px-4 font-bold ${team.textClass}`}>
                        {team.name}
                      </td>
                      <td className="py-3.5 px-4 font-math text-lg font-bold text-slate-100">
                        {team.score}
                      </td>
                      <td className="py-3.5 px-4 font-math text-slate-300">
                        {team.correctCount} מתוך {team.totalAnswered}
                      </td>
                      <td className="py-3.5 px-4 font-math text-amber-300">
                        🔥 {team.maxStreak}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================== TAB 4: TEACHER PANEL ==================== */}
        {activeTab === 'teacher' && (
          <TeacherPanel
            questions={questions}
            teams={teams}
            selectedDifficulty={selectedDifficulty}
            timerSeconds={timerSeconds}
            onSelectDifficulty={setSelectedDifficulty}
            onChangeTimer={setTimerSeconds}
            onAddQuestion={handleAddQuestion}
            onUpdateQuestion={handleUpdateQuestion}
            onDeleteQuestion={handleDeleteQuestion}
            onGenerateBatch={handleGenerateBatch}
            onResetDefaultQuestions={handleResetDefaultQuestions}
            onPreviewQuestion={handlePreviewQuestionFromTeacher}
            onStartTeacherSoloRun={startTeacherSoloRun}
            onResetScoresForClass={resetScoresForClass}
            onAdjustTeamScore={handleAdjustTeamScore}
          />
        )}

        {/* ==================== TAB 1: MAIN GAME ARENA ==================== */}
        {activeTab === 'game' && (
          <>
            {/* ---------- PHASE 1: SETUP LOBBY ---------- */}
            {gamePhase === 'SETUP_LOBBY' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* Right Column: Hero & Teacher Quick Try */}
                <div className="lg:col-span-7 bg-[#1E293B] border border-[#334155] rounded-xl p-6 sm:p-8 flex flex-col justify-between gap-6">
                  <div className="flex flex-col gap-4">
                    <div className="text-xs font-semibold text-cyan-400">
                      משחק כיתתי ללוח החכם · סיכום נושאי כיתה ה׳
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 leading-tight headline-balance">
                      המעבדה הסודית ננעלה! האם הכיתה שלכם תצליח לפצח את 3 הכספות?
                    </h1>
                    <p className="text-base text-slate-300 leading-relaxed">
                      התחלקו לקבוצות, הפעילו את סימולטורי המעבדה האינטראקטיביים על הלוח החכם, צברו רצף תשובות נכונות (Combo) להכפלת נקודות ופתיחת כוחות מיוחדים, ואספו את 9 ספרות הקוד הסודי ב-3 אגפי המעבדה:
                    </p>

                    {/* 3 Topic Vault Highlights */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      <div className="bg-slate-900/90 border border-cyan-500/30 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm mb-1">
                          <Zap className="w-4 h-4" />
                          <span>אגף אחוזים בסיסי</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          משמעות האחוז מתוך 100, חישוב אחוז מכמות והשלמה ל-100% בעזרת רשת ה-100.
                        </p>
                      </div>

                      <div className="bg-slate-900/90 border border-amber-500/30 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-1">
                          <Scale className="w-4 h-4" />
                          <span>אגף הממוצע</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          חישוב ממוצע, מציאת מספר חסר בהינתן ממוצע, ומה קורה לממוצע בהוספת מספר.
                        </p>
                      </div>

                      <div className="bg-slate-900/90 border border-emerald-500/30 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-1">
                          <Search className="w-4 h-4" />
                          <span>אגף עשרוניים</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          מי גדול יותר, מציאת מספר עשרוני בין שני מספרים עם זום על הציר, והמרה לאחוזים.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Dedicated Teacher Preview Callout Box */}
                  <div className="bg-slate-900/95 border border-cyan-500/40 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-bold text-cyan-300 flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4" />
                        <span>מורה? רוצה להתנסות במשחק לפני השיעור?</span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">
                        לחץ כאן כדי להיכנס מיד למשחק המלא במצב התנסות אישי, לבדוק את כל השאלות והסימולטורים, ולאפס בלחיצה אחת לפני השיעור.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={startTeacherSoloRun}
                      className="px-4 py-2.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/50 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      כניסה להתנסות מורה
                    </button>
                  </div>
                </div>

                {/* Left Column: Classroom Team & Difficulty Setup Card */}
                <div className="lg:col-span-5 bg-[#1E293B] border border-[#334155] rounded-xl p-6 flex flex-col justify-between gap-5">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-slate-700/70 pb-3">
                      <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                        <Users className="w-5 h-5 text-cyan-400" />
                        <span>הגדרת תחרות כיתתית על הלוח החכם</span>
                      </h2>
                    </div>

                    {/* Number of Competing Teams */}
                    <div>
                      <label className="block text-xs text-slate-300 mb-2">
                        מספר קבוצות מתחרות בכיתה:
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[2, 3, 4].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setTeamCount(num)}
                            className={`py-2 px-3 text-xs font-bold rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                              teamCount === num
                                ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                                : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
                            }`}
                          >
                            {num} קבוצות
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Editable Team Names */}
                    <div className="flex flex-col gap-2">
                      <label className="block text-xs text-slate-300">
                        שמות הקבוצות המתחרות:
                      </label>
                      {Array.from({ length: teamCount }, (_, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span
                            className={`text-xs font-bold w-16 shrink-0 ${TEAM_PRESETS[idx].textClass}`}
                          >
                            קבוצה {idx + 1}:
                          </span>
                          <input
                            type="text"
                            value={teamNames[idx]}
                            onChange={(e) => {
                              const updated = [...teamNames];
                              updated[idx] = e.target.value;
                              setTeamNames(updated);
                            }}
                            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-100"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Difficulty Selection */}
                    <div>
                      <label className="block text-xs text-slate-300 mb-1.5">
                        רמת קושי של החידות:
                      </label>
                      <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800">
                        {[
                          { id: 'all', label: 'משולב' },
                          { id: 'easy', label: 'קל' },
                          { id: 'medium', label: 'בינוני' },
                          { id: 'hard', label: 'מאתגר' },
                        ].map((d) => (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() =>
                              setSelectedDifficulty(d.id as Difficulty | 'all')
                            }
                            className={`py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                              selectedDifficulty === d.id
                                ? 'bg-cyan-500 text-slate-950 font-bold'
                                : 'text-slate-300 hover:text-white'
                            }`}
                          >
                            {d.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Timer Selection */}
                    <div>
                      <label className="block text-xs text-slate-300 mb-1.5">
                        שעון עצר לכל שאלה (מגוון זמנים לבחירת המורה):
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1.5 bg-slate-900 rounded-lg border border-slate-800">
                        {[
                          { val: 0, label: 'ללא שעון (דיון)' },
                          { val: 20, label: '20 ש׳ (בזק)' },
                          { val: 30, label: '30 שניות' },
                          { val: 45, label: '45 שניות' },
                          { val: 60, label: '60 שניות' },
                          { val: 90, label: '90 שניות' },
                          { val: 120, label: '120 ש׳ (2 דק׳)' },
                          { val: 180, label: '180 ש׳ (3 דק׳)' },
                        ].map((t) => (
                          <button
                            key={t.val}
                            type="button"
                            onClick={() => setTimerSeconds(t.val)}
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

                  {/* Primary Launch CTA & Resume/Rules Buttons */}
                  <div className="flex flex-col gap-2.5">
                    {hasActiveGame && (
                      <button
                        type="button"
                        onClick={() => setGamePhase('LAB_MAP')}
                        className="w-full py-3 px-6 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm rounded-xl transition-colors cursor-pointer whitespace-nowrap"
                      >
                        המשך משחק פעיל במפת הכספות ←
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={startClassroomGame}
                      className="w-full py-3.5 px-6 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-extrabold text-base rounded-xl shadow-lg transition-transform active:scale-[0.99] cursor-pointer whitespace-nowrap"
                    >
                      {hasActiveGame
                        ? 'אפס והתחל משחק כיתתי חדש!'
                        : 'התחל משחק כיתתי ופצח את המעבדה!'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('rules')}
                      className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                    >
                      <BookOpen className="w-4 h-4 text-cyan-400" />
                      <span>איך אמור להתנהל המשחק? קראו את חוקי המשחק</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ---------- PHASE 2: LAB MAP (VAULT SELECTION & TEAM HUD) ---------- */}
            {gamePhase === 'LAB_MAP' && (
              <div className="flex flex-col gap-6">
                {/* Active Team Turn & Scoreboard Strip */}
                <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-5 flex flex-col gap-4">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-700/70 pb-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={goToHomeSetup}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                      >
                        <Home className="w-3.5 h-3.5 text-cyan-400" />
                        <span>מסך הבית (התחלה)</span>
                      </button>
                      <span className="text-xs text-slate-400">תור הפיצוח כעת:</span>
                      <span className={`text-xl font-extrabold ${activeTeam.textClass}`}>
                        {activeTeam.name}
                      </span>
                      {activeTeam.streak >= 2 && (
                        <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                          <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span>
                            רצף לוהט! ({activeTeam.streak} ברצף · בונוס ניקוד ×
                            {activeTeam.streak >= 3 ? '2' : '1.5'})
                          </span>
                        </span>
                      )}
                    </div>

                    {!isTeacherSoloMode && teams.length > 1 && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-400">החלף תור קבוצה ידנית:</span>
                        {teams.map((t, idx) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setActiveTeamIdx(idx)}
                            className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap ${
                              activeTeamIdx === idx
                                ? 'bg-slate-100 text-slate-950 font-bold'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            {t.name.split(' ')[1] || t.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Team Score Cards */}
                  <div
                    className={`grid gap-3 ${
                      teams.length === 1
                        ? 'grid-cols-1'
                        : teams.length === 2
                        ? 'grid-cols-1 sm:grid-cols-2'
                        : teams.length === 3
                        ? 'grid-cols-1 sm:grid-cols-3'
                        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                    }`}
                  >
                    {teams.map((team, idx) => {
                      const isCurrentTurn = idx === activeTeamIdx;
                      return (
                        <div
                          key={team.id}
                          onClick={() => setActiveTeamIdx(idx)}
                          className={`rounded-xl p-4 border transition-all cursor-pointer flex items-center justify-between ${
                            isCurrentTurn
                              ? `${team.bgClass} ${team.borderClass} shadow-md`
                              : 'bg-slate-900/70 border-slate-800 opacity-80 hover:opacity-100'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`font-bold text-sm ${team.textClass}`}>
                                {team.name}
                              </span>
                              {isCurrentTurn && (
                                <span className="text-[11px] text-slate-200 font-semibold">
                                  (בתור)
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-2">
                              <span>נכונות: {team.correctCount}</span>
                              <span aria-hidden="true">·</span>
                              <span>רצף: {team.streak}</span>
                              {team.crackedVaults.length > 0 && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span className="text-amber-300 font-bold flex items-center gap-1">
                                    <Trophy className="w-3 h-3 text-amber-400" />
                                    <span>כספות: {team.crackedVaults.length}</span>
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="text-left">
                            <div className="font-math text-2xl font-extrabold text-slate-100">
                              {team.score}
                            </div>
                            <div className="text-[11px] text-slate-400">נקודות</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Rules Banner on Map */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-cyan-300">איך משחקים ומנצחים?</span>
                    <span>
                      בכל תור הקבוצה שבתור יכולה לבחור חידה מכל אחת מ-3 הכספות ובכל רמת קושי (100 / 150 / 200 נק׳).
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 font-medium">
                    <span className="text-amber-300 font-bold">
                      פיצוח הספרה ה-3 בכספת = +{VAULT_CRACK_BONUS} נק׳ בונוס פריצת כספת!
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="text-emerald-300 font-bold">
                      מנצחת: הקבוצה עם סך הנקודות הגבוה ביותר!
                    </span>
                  </div>
                </div>

                {/* 3 Topic Vault Doors Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {(['percentages', 'averages', 'decimals'] as TopicId[]).map((topic) => {
                    const meta = TOPIC_METADATA[topic];
                    const vault = vaults[topic];
                    const topicQuestions = questions.filter((q) => q.topic === topic);
                    const remainingQuestions = topicQuestions.filter(
                      (q) => !answeredQuestionIds.includes(q.id)
                    );
                    const isOneDigitAway =
                      !vault.isCracked &&
                      vault.unlockedDigits.length === vault.requiredDigits - 1;

                    return (
                      <div
                        key={topic}
                        className={`bg-[#1E293B] border rounded-xl p-6 flex flex-col justify-between gap-5 transition-all ${
                          vault.isCracked
                            ? 'border-emerald-500/60'
                            : isOneDigitAway
                            ? 'border-amber-400 shadow-lg shadow-amber-500/10'
                            : meta.borderClass
                        }`}
                      >
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-bold ${meta.textClass}`}>
                              {meta.title} · {remainingQuestions.length}/{topicQuestions.length} פנויות
                            </span>
                            {vault.isCracked ? (
                              <span className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                                <Unlock className="w-4 h-4" />
                                <span>
                                  נפרצה!{' '}
                                  {vault.crackedByTeamName
                                    ? `(${vault.crackedByTeamName.split(' ')[1] || vault.crackedByTeamName})`
                                    : ''}
                                </span>
                              </span>
                            ) : isOneDigitAway ? (
                              <span className="flex items-center gap-1 text-xs font-extrabold text-amber-300">
                                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                <span>ספרה אחרונה לבונוס +{VAULT_CRACK_BONUS}!</span>
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-xs text-slate-400">
                                <Lock className="w-4 h-4" />
                                <span>נעולה (פתוחה לכל הקבוצות)</span>
                              </span>
                            )}
                          </div>

                          <h3 className="text-xl font-extrabold text-slate-100">
                            {meta.vaultName}
                          </h3>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {meta.subtitle}
                          </p>

                          {/* Vault Code Digits Display */}
                          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 mt-1">
                            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                              <span className="flex items-center gap-1.5">
                                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                                <span>ספרות הקוד שנחשפו:</span>
                              </span>
                              <span className="font-math font-bold text-slate-200">
                                {vault.unlockedDigits.length}/{vault.requiredDigits}
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 font-math" dir="ltr">
                              {Array.from({ length: vault.requiredDigits }, (_, idx) => {
                                const digit = vault.unlockedDigits[idx];
                                return (
                                  <div
                                    key={idx}
                                    className={`h-11 rounded-lg flex items-center justify-center text-lg font-extrabold border ${
                                      digit !== undefined
                                        ? 'bg-emerald-950/70 border-emerald-400 text-emerald-300'
                                        : isOneDigitAway && idx === vault.requiredDigits - 1
                                        ? 'bg-amber-950/40 border-amber-400/70 text-amber-300'
                                        : 'bg-slate-900 border-slate-800 text-slate-600'
                                    }`}
                                  >
                                    {digit !== undefined ? digit : '?'}
                                  </div>
                                );
                              })}
                            </div>
                            <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                              <span className="text-slate-400">מענק פתיחת כספת (ספרה 3):</span>
                              <span className="font-math font-bold text-amber-300">
                                +{VAULT_CRACK_BONUS} נק׳ + חידוש כוח מיוחד
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2.5">
                          <div className="text-xs text-slate-300 font-semibold flex items-center justify-between">
                            <span>בחרו רמת קושי ושווי נקודות לחידה:</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            {(
                              [
                                {
                                  diff: 'easy' as Difficulty,
                                  label: 'קל',
                                  pts: 100,
                                  color:
                                    'bg-emerald-950/70 hover:bg-emerald-900/90 border-emerald-500/50 text-emerald-300',
                                },
                                {
                                  diff: 'medium' as Difficulty,
                                  label: 'בינוני',
                                  pts: 150,
                                  color:
                                    'bg-amber-950/70 hover:bg-amber-900/90 border-amber-500/50 text-amber-300',
                                },
                                {
                                  diff: 'hard' as Difficulty,
                                  label: 'מאתגר',
                                  pts: 200,
                                  color:
                                    'bg-rose-950/70 hover:bg-rose-900/90 border-rose-500/50 text-rose-300',
                                },
                              ] as const
                            ).map((item) => {
                              const availCount = remainingQuestions.filter(
                                (q) => q.difficulty === item.diff
                              ).length;
                              return (
                                <button
                                  key={item.diff}
                                  type="button"
                                  onClick={() => openTopicChallenge(topic, undefined, item.diff)}
                                  className={`py-2 px-2 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${item.color}`}
                                >
                                  <span className="text-xs font-extrabold">{item.label}</span>
                                  <span className="font-math text-xs font-bold">
                                    {item.pts} נק׳
                                  </span>
                                  <span className="text-[10px] opacity-80">
                                    ({availCount} פנויות)
                                  </span>
                                </button>
                              );
                            })}
                          </div>

                          <button
                            type="button"
                            onClick={() => openTopicChallenge(topic)}
                            className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-colors cursor-pointer whitespace-nowrap ${
                              topic === 'percentages'
                                ? 'bg-cyan-400 hover:bg-cyan-300 text-slate-950'
                                : topic === 'averages'
                                ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                                : 'bg-emerald-400 hover:bg-emerald-300 text-slate-950'
                            }`}
                          >
                            {vault.isCracked
                              ? 'שגר חידת בונוס אקראית בנושא זה'
                              : `שגר חידה אקראית ב${meta.title}`}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ---------- PHASE 3 & 4: ACTIVE CHALLENGE / EXPLANATION / TEACHER PREVIEW ---------- */}
            {(gamePhase === 'ACTIVE_CHALLENGE' ||
              gamePhase === 'EXPLANATION_REVIEW' ||
              gamePhase === 'TEACHER_PREVIEW_QUESTION') &&
              currentQuestion && (
                <div
                  ref={challengeStageRef}
                  id="active-challenge-stage"
                  className="flex flex-col gap-5 scroll-mt-20"
                >
                  {/* Challenge Top Status Bar */}
                  <div className="bg-[#1E293B] border border-[#334155] rounded-xl px-5 py-3.5 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        type="button"
                        onClick={goToHomeSetup}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                      >
                        <Home className="w-3.5 h-3.5 text-cyan-400" />
                        <span>מסך הבית</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (gamePhase === 'TEACHER_PREVIEW_QUESTION') {
                            setActiveTab('teacher');
                          } else {
                            setGamePhase('LAB_MAP');
                          }
                        }}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>
                          {gamePhase === 'TEACHER_PREVIEW_QUESTION'
                            ? 'חזרה לפאנל המורה'
                            : 'חזרה למפת הכספות'}
                        </span>
                      </button>

                      <div className="text-xs text-slate-300 flex flex-wrap items-center gap-2">
                        <span
                          className={`font-bold ${
                            TOPIC_METADATA[currentQuestion.topic].textClass
                          }`}
                        >
                          {TOPIC_METADATA[currentQuestion.topic].vaultName}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{currentQuestion.subTopicLabel}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {gamePhase === 'TEACHER_PREVIEW_QUESTION' ? (
                        <span className="text-xs font-bold text-cyan-300">
                          מצב תצוגה מקדימה למורה (ללא השפעה על ניקוד הכיתה)
                        </span>
                      ) : (
                        <span className={`text-sm font-bold ${activeTeam.textClass}`}>
                          בתור: {activeTeam.name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Two-Zone Split Stage: Right = Question & Options, Left = Live Interactive Simulator */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Right Zone (5 cols): Question Card, Options, Powerups & Step-by-Step Explanation */}
                    <div className="lg:col-span-5 bg-[#1E293B] border border-[#334155] rounded-xl p-6 flex flex-col gap-5">
                      {/* PROMINENT RIDDLE TIMER & QUESTION POINT VALUE BANNER */}
                      <div
                        className={`rounded-xl p-4 border transition-all flex flex-col gap-3 ${
                          timerSeconds > 0 &&
                          timeLeft < 10 &&
                          selectedOptionIdx === null
                            ? 'bg-rose-950/60 border-2 border-rose-500 timer-urgent-pulse'
                            : 'bg-slate-950/90 border-slate-700'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          {/* Countdown Timer Display */}
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                                timerSeconds > 0 && timeLeft < 10 && selectedOptionIdx === null
                                  ? 'bg-rose-500/20 border-rose-400 text-rose-300'
                                  : 'bg-cyan-500/15 border-cyan-500/40 text-cyan-400'
                              }`}
                            >
                              <Timer className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="text-[11px] text-slate-400 font-medium">
                                טיימר חידה:
                              </div>
                              {timerSeconds > 0 ? (
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`font-math text-2xl font-extrabold tracking-tight ${
                                      timeLeft < 10 && selectedOptionIdx === null
                                        ? 'text-rose-300'
                                        : timeLeft === 0
                                        ? 'text-rose-400'
                                        : 'text-slate-100'
                                    }`}
                                    dir="ltr"
                                  >
                                    {Math.floor(timeLeft / 60)}:
                                    {String(timeLeft % 60).padStart(2, '0')} ({timeLeft}s)
                                  </span>
                                  {timeLeft < 10 && timeLeft > 0 && selectedOptionIdx === null && (
                                    <span className="text-xs font-extrabold text-rose-300">
                                      זמן אוזל!
                                    </span>
                                  )}
                                  {timeLeft === 0 && selectedOptionIdx === null && (
                                    <span className="text-xs font-extrabold text-rose-400">
                                      הזמן תם!
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-bold text-slate-300">
                                    ללא הגבלת זמן
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setTimerSeconds(60);
                                      setTimeLeft(60);
                                      setIsTimerPaused(false);
                                    }}
                                    className="px-2 py-0.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded text-[11px] font-bold cursor-pointer"
                                  >
                                    הפעל טיימר 60 ש׳
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Question Point Value & Difficulty Box */}
                          <div className="bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-left flex flex-col items-end">
                            <div className="flex items-center gap-1.5 text-[11px]">
                              <span className="text-slate-400">שווי השאלה:</span>
                              <span
                                className={`font-extrabold ${
                                  currentQuestion.difficulty === 'easy'
                                    ? 'text-emerald-400'
                                    : currentQuestion.difficulty === 'medium'
                                    ? 'text-amber-400'
                                    : 'text-rose-400'
                                }`}
                              >
                                ({currentQuestion.difficulty === 'easy'
                                  ? 'קל'
                                  : currentQuestion.difficulty === 'medium'
                                  ? 'בינוני'
                                  : 'מאתגר'})
                              </span>
                            </div>
                            <div className="font-math text-xl font-extrabold text-amber-300">
                              {doublePointsActive
                                ? `${currentQuestion.points * 2} נק׳ (×2!)`
                                : `${currentQuestion.points} נק׳`}
                            </div>
                            {!vaults[currentQuestion.topic].isCracked &&
                              vaults[currentQuestion.topic].unlockedDigits.length ===
                                vaults[currentQuestion.topic].requiredDigits - 1 && (
                                <div className="text-[11px] font-bold text-emerald-400">
                                  +{VAULT_CRACK_BONUS} נק׳ בונוס פריצת כספת!
                                </div>
                              )}
                          </div>
                        </div>

                        {/* Timer Progress Bar & Classroom Teacher Controls */}
                        {timerSeconds > 0 && selectedOptionIdx === null && (
                          <div className="flex flex-col gap-2">
                            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-500 ${
                                  timeLeft < 10
                                    ? 'bg-rose-500'
                                    : timeLeft < timerSeconds * 0.4
                                    ? 'bg-amber-400'
                                    : 'bg-cyan-400'
                                }`}
                                style={{
                                  width: `${Math.min(
                                    100,
                                    Math.max(0, (timeLeft / timerSeconds) * 100)
                                  )}%`,
                                }}
                              />
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-slate-400">
                              <span>
                                {isTimerPaused ? 'הטיימר מושהה לדיון כיתתי' : 'הטיימר פועל'}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setIsTimerPaused((prev) => !prev)}
                                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 cursor-pointer"
                                >
                                  {isTimerPaused ? 'המשך טיימר' : 'השהה טיימר'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setTimeLeft((prev) => prev + 15)}
                                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded border border-slate-700 font-math cursor-pointer"
                                >
                                  +15s
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Teacher Mode / Preview Difficulty Switcher Bar */}
                      {(isTeacherSoloMode || gamePhase === 'TEACHER_PREVIEW_QUESTION') && (
                        <div className="bg-slate-950/90 border border-cyan-500/40 rounded-xl px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-2">
                            <UserCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                            <span className="text-slate-300 font-medium">
                              תצוגת מורה · החלף רמת קושי לבדיקה:
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => (
                              <button
                                key={diff}
                                type="button"
                                onClick={() => {
                                  const match =
                                    questions.find(
                                      (q) =>
                                        q.topic === currentQuestion.topic &&
                                        q.difficulty === diff &&
                                        q.id !== currentQuestion.id
                                    ) ||
                                    questions.find(
                                      (q) =>
                                        q.topic === currentQuestion.topic &&
                                        q.difficulty === diff
                                    );
                                  if (match) {
                                    setCurrentQuestion(shuffleQuestionOptions(match));
                                    setSelectedOptionIdx(null);
                                    setEliminatedOptionIndices([]);
                                    setShowHint(false);
                                    setTimeLeft(timerSeconds);
                                  }
                                }}
                                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                                  currentQuestion.difficulty === diff
                                    ? 'bg-cyan-500 text-slate-950 font-bold'
                                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                }`}
                              >
                                {diff === 'easy'
                                  ? 'קל (100)'
                                  : diff === 'medium'
                                  ? 'בינוני (150)'
                                  : 'מאתגר (200)'}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Story Context & Question Prompt */}
                      <div>
                        {currentQuestion.storyContext && (
                          <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 text-xs text-slate-300 leading-relaxed mb-3">
                            {currentQuestion.storyContext}
                          </div>
                        )}
                        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 leading-snug">
                          {currentQuestion.prompt}
                        </h2>
                      </div>

                      {/* Team Power-Ups Bar (Active before answering) */}
                      {selectedOptionIdx === null && (
                        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex flex-col gap-2">
                          <div className="text-xs text-slate-400 flex items-center justify-between">
                            <span>כוחות מיוחדים של הצוות:</span>
                            <span>לחיצה מפעילה מיד</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <button
                              type="button"
                              disabled={
                                activeTeam.powerUps.fifty_fifty <= 0 ||
                                eliminatedOptionIndices.length > 0
                              }
                              onClick={() => handleUsePowerUp('fifty_fifty')}
                              className="p-2 bg-slate-950 hover:bg-slate-800 disabled:opacity-40 border border-slate-700 rounded-lg text-xs flex flex-col items-center gap-1 cursor-pointer"
                            >
                              <ShieldAlert className="w-4 h-4 text-cyan-400" />
                              <span className="font-bold text-slate-200 whitespace-nowrap">
                                מנטרל 50/50
                              </span>
                              <span className="font-math text-[11px] text-cyan-400">
                                ({activeTeam.powerUps.fifty_fifty})
                              </span>
                            </button>

                            <button
                              type="button"
                              disabled={
                                activeTeam.powerUps.free_scanner <= 0 || showHint
                              }
                              onClick={() => handleUsePowerUp('free_scanner')}
                              className="p-2 bg-slate-950 hover:bg-slate-800 disabled:opacity-40 border border-slate-700 rounded-lg text-xs flex flex-col items-center gap-1 cursor-pointer"
                            >
                              <Lightbulb className="w-4 h-4 text-amber-400" />
                              <span className="font-bold text-slate-200 whitespace-nowrap">
                                סורק רמז
                              </span>
                              <span className="font-math text-[11px] text-amber-400">
                                ({activeTeam.powerUps.free_scanner})
                              </span>
                            </button>

                            <button
                              type="button"
                              disabled={
                                activeTeam.powerUps.double_vault <= 0 ||
                                doublePointsActive
                              }
                              onClick={() => handleUsePowerUp('double_vault')}
                              className="p-2 bg-slate-950 hover:bg-slate-800 disabled:opacity-40 border border-slate-700 rounded-lg text-xs flex flex-col items-center gap-1 cursor-pointer"
                            >
                              <Sparkles className="w-4 h-4 text-emerald-400" />
                              <span className="font-bold text-slate-200 whitespace-nowrap">
                                הכפל ניקוד ×2
                              </span>
                              <span className="font-math text-[11px] text-emerald-400">
                                ({activeTeam.powerUps.double_vault})
                              </span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 4 Answer Options */}
                      <div className="flex flex-col gap-2.5">
                        {currentQuestion.options.map((opt, idx) => {
                          const isEliminated = eliminatedOptionIndices.includes(idx);
                          const isAnswered = selectedOptionIdx !== null;
                          const isSelected = selectedOptionIdx === idx;
                          const isCorrectOption = idx === currentQuestion.correctIndex;

                          let btnStyle =
                            'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-100';
                          if (isEliminated && !isAnswered) {
                            btnStyle =
                              'bg-slate-950/40 border-slate-800/50 text-slate-600 line-through pointer-events-none';
                          } else if (isAnswered) {
                            if (isCorrectOption) {
                              btnStyle =
                                'bg-emerald-950/80 border-emerald-400 text-emerald-200 font-bold';
                            } else if (isSelected && !isCorrectOption) {
                              btnStyle =
                                'bg-rose-950/80 border-rose-400 text-rose-200';
                            } else {
                              btnStyle =
                                'bg-slate-950/50 border-slate-800 text-slate-500';
                            }
                          }

                          return (
                            <button
                              key={idx}
                              type="button"
                              disabled={isEliminated || isAnswered}
                              onClick={() => handleSubmitAnswer(idx)}
                              className={`w-full p-4 rounded-xl border text-right text-base font-medium transition-all flex items-center justify-between gap-3 cursor-pointer ${btnStyle}`}
                            >
                              <div className="flex items-center gap-3">
                                <span className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-600 flex items-center justify-center font-math text-xs font-bold text-slate-300 shrink-0">
                                  {idx + 1}
                                </span>
                                <span>{opt}</span>
                              </div>
                              {isAnswered && isCorrectOption && (
                                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                              )}
                              {isAnswered && isSelected && !isCorrectOption && (
                                <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Progressive Hint Button & Box */}
                      {selectedOptionIdx === null && (
                        <div>
                          {!showHint ? (
                            <button
                              type="button"
                              onClick={() => setShowHint(true)}
                              className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1.5 cursor-pointer"
                            >
                              <Lightbulb className="w-4 h-4" />
                              <span>צריכים כיוון? לחצו לפתיחת רמז מעבדה</span>
                            </button>
                          ) : (
                            <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-3.5 text-xs text-amber-200 leading-relaxed">
                              <div className="font-bold text-amber-300 mb-1 flex items-center gap-1.5">
                                <Lightbulb className="w-4 h-4" />
                                <span>רמז מהמעבדה:</span>
                              </div>
                              {currentQuestion.hint}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Post-Answer Step-by-Step Mathematical Explanation */}
                      {selectedOptionIdx !== null && (
                        <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            {selectedOptionIdx === currentQuestion.correctIndex ? (
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-base">
                                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                                  <span>
                                    פיצוח מדויק!{' '}
                                    {gamePhase !== 'TEACHER_PREVIEW_QUESTION' &&
                                      `(+${lastEarnedPoints} נק׳ סה"כ · ספרת קוד שנחשפה: ${currentQuestion.codeDigit})`}
                                  </span>
                                </div>
                                {lastCrackedVaultBonus > 0 &&
                                  gamePhase !== 'TEACHER_PREVIEW_QUESTION' && (
                                    <div className="text-xs font-extrabold text-amber-300 flex items-center gap-1.5">
                                      <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                                      <span>
                                        בונוס פריצת כספת! קיבלתם +{lastCrackedVaultBonus} נקודות מענק + חידוש כוח מיוחד!
                                      </span>
                                    </div>
                                  )}
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-rose-400 font-extrabold text-base">
                                <XCircle className="w-5 h-5" />
                                <span>לא מדויק — בואו נלמד יחד מהפתרון:</span>
                              </div>
                            )}
                          </div>

                          <div className="border-t border-slate-800 pt-2.5">
                            <div className="text-xs font-bold text-cyan-300 mb-1.5">
                              הסבר שלב-אחר-שלב:
                            </div>
                            <ol className="list-decimal list-inside flex flex-col gap-1.5 text-xs text-slate-200 leading-relaxed">
                              {currentQuestion.explanationSteps.map((step, i) => (
                                <li key={i}>{step}</li>
                              ))}
                            </ol>
                          </div>

                          {gamePhase === 'TEACHER_PREVIEW_QUESTION' ? (
                            <div className="flex items-center gap-2 pt-2">
                              <button
                                type="button"
                                onClick={() => setSelectedOptionIdx(null)}
                                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-lg cursor-pointer"
                              >
                                נסה לענות שוב על שאלה זו
                              </button>
                              <button
                                type="button"
                                onClick={() => setActiveTab('teacher')}
                                className="flex-1 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg cursor-pointer"
                              >
                                חזרה לפאנל המורה
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={handleContinueAfterExplanation}
                              className="w-full py-3 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-extrabold text-sm rounded-xl cursor-pointer mt-1"
                            >
                              המשך למפת הכספות ולתור הבא ←
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Left Zone (7 cols): Synchronized Interactive Visual Lab Simulator */}
                    <div className="lg:col-span-7 flex flex-col gap-3">
                      {renderQuestionSimulator(currentQuestion)}
                      <div className="text-xs text-slate-400 text-center">
                        טיפ לכיתה: הזיזו את הסליידרים בסימולטור כדי לבדוק את התשובה שלכם באופן מוחשי על הלוח!
                      </div>
                    </div>
                  </div>
                </div>
              )}

            {/* ---------- PHASE 5: FINAL VAULT VICTORY ---------- */}
            {gamePhase === 'FINAL_VAULT_VICTORY' && (
              <div className="bg-[#1E293B] border border-emerald-500/50 rounded-xl p-8 text-center flex flex-col items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400">
                  <Trophy className="w-9 h-9" />
                </div>

                <div>
                  <div className="text-xs font-bold text-emerald-400 mb-1">
                    כל 3 כספות המעבדה נפרצו בהצלחה!
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100">
                    כל הכבוד לכיתה ה׳! פיצחתם את המעבדה הסודית!
                  </h2>
                  <p className="text-sm text-slate-300 mt-2 max-w-xl mx-auto">
                    הוכחתם שליטה מעולה באחוזים בסיסי, בחישוב והבנת הממוצע, ובמספרים עשרוניים.
                  </p>
                </div>

                {/* Winning Teams Podium Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl">
                  {sortedTeamsByScore.map((team, idx) => (
                    <div
                      key={team.id}
                      className={`rounded-xl p-5 border flex flex-col items-center gap-2 ${
                        idx === 0
                          ? 'bg-amber-950/40 border-amber-400'
                          : 'bg-slate-900/90 border-slate-800'
                      }`}
                    >
                      <span className="font-math text-xs font-bold text-amber-400">
                        מקום #{idx + 1}
                      </span>
                      <span className={`text-lg font-extrabold ${team.textClass}`}>
                        {team.name}
                      </span>
                      <span className="font-math text-3xl font-extrabold text-slate-100">
                        {team.score}
                      </span>
                      <span className="text-xs text-slate-400">
                        {team.correctCount} תשובות נכונות · שיא רצף {team.maxStreak}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playVaultCracked();
                      setCelebration({
                        active: true,
                        type: 'game_victory',
                        title: 'אלופי המעבדה!',
                        subtitle: 'מטח קונפטי וניצוצות לכבוד הניצחון!',
                        accentColor: '#F59E0B',
                      });
                    }}
                    className="px-5 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-sm rounded-xl flex items-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>שגר מטח קונפטי וניצוצות!</span>
                  </button>
                  <button
                    type="button"
                    onClick={startClassroomGame}
                    className="px-6 py-3 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-extrabold text-sm rounded-xl cursor-pointer"
                  >
                    שחקו סבב חדש עם הכיתה
                  </button>
                  <button
                    type="button"
                    onClick={() => setGamePhase('SETUP_LOBBY')}
                    className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm rounded-xl border border-slate-600 cursor-pointer"
                  >
                    חזרה למסך הגדרת קבוצות
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Fullscreen Confetti & Lab Sparks Overlay */}
      <CelebrationOverlay
        celebration={celebration}
        onDismiss={() => setCelebration(null)}
      />
    </div>
  );
}
