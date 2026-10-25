export type TopicId = 'percentages' | 'averages' | 'decimals';

export type SubTopicId =
  | 'percent_basic'
  | 'percent_of_amount'
  | 'percent_complement'
  | 'average_calc'
  | 'average_missing'
  | 'average_effect'
  | 'decimal_compare'
  | 'decimal_between'
  | 'decimal_to_percent';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type PowerUpType = 'fifty_fifty' | 'free_scanner' | 'double_vault';

export interface SimulatorConfig {
  type: TopicId;
  // Percentages simulator initial values
  percentValue?: number;
  totalAmount?: number;
  // Averages simulator initial values
  numbers?: number[];
  targetAverage?: number;
  missingIndex?: number;
  addedNumber?: number;
  averageMode?: 'calculate' | 'missing' | 'effect';
  // Decimals simulator initial values
  decimalA?: number;
  decimalB?: number;
  targetDecimal?: number;
  decimalMode?: 'compare' | 'between' | 'convert';
}

export interface MathQuestion {
  id: string;
  topic: TopicId;
  subTopic: SubTopicId;
  subTopicLabel: string;
  difficulty: Difficulty;
  prompt: string;
  storyContext?: string;
  options: string[];
  correctIndex: number;
  hint: string;
  explanationSteps: string[];
  codeDigit: number;
  points: number;
  simulatorConfig: SimulatorConfig;
  isCustom?: boolean;
}

export interface Team {
  id: string;
  name: string;
  color: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  score: number;
  streak: number;
  maxStreak: number;
  correctCount: number;
  totalAnswered: number;
  powerUps: Record<PowerUpType, number>;
  crackedVaults: TopicId[];
}

export interface VaultProgress {
  topic: TopicId;
  unlockedDigits: number[];
  requiredDigits: number;
  isCracked: boolean;
  crackedByTeamName?: string;
}

export type ActiveTab = 'game' | 'rules' | 'simulators' | 'leaderboard' | 'teacher';

export type GamePhase =
  | 'SETUP_LOBBY'
  | 'LAB_MAP'
  | 'ACTIVE_CHALLENGE'
  | 'EXPLANATION_REVIEW'
  | 'TEACHER_PREVIEW_QUESTION'
  | 'FINAL_VAULT_VICTORY';
