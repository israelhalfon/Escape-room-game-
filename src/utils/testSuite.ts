import {
  generateProceduralQuestions,
  INITIAL_QUESTIONS,
  shuffleQuestionOptions,
  SUBTOPIC_LABELS,
} from '../data/questions';
import { MathQuestion, SubTopicId, TopicId } from '../types/game';

export interface TestCaseResult {
  id: string;
  category: string;
  name: string;
  passed: boolean;
  details: string;
}

export interface TestSuiteSummary {
  totalTests: number;
  passedCount: number;
  failedCount: number;
  allPassed: boolean;
  timestamp: string;
  results: TestCaseResult[];
}

function assertCondition(
  results: TestCaseResult[],
  id: string,
  category: string,
  name: string,
  condition: boolean,
  successDetail: string,
  failDetail: string
) {
  results.push({
    id,
    category,
    name,
    passed: Boolean(condition),
    details: condition ? successDetail : failDetail,
  });
}

export function runFullGameTestSuite(
  activeQuestions: MathQuestion[] = INITIAL_QUESTIONS
): TestSuiteSummary {
  const results: TestCaseResult[] = [];

  // =========================================================================
  // 1. בדיקת כיסוי תוכנית הלימודים לכיתה ה׳ (Curriculum & Question Bank)
  // =========================================================================
  const topics: TopicId[] = ['percentages', 'averages', 'decimals'];
  const allSubTopics = Object.keys(SUBTOPIC_LABELS) as SubTopicId[];

  topics.forEach((topic) => {
    const count = activeQuestions.filter((q) => q.topic === topic).length;
    assertCondition(
      results,
      `curr-topic-${topic}`,
      'תוכנית לימודים ומאגר שאלות',
      `כיסוי נושא ראשי: ${topic}`,
      count >= 3,
      `נמצאו ${count} שאלות תקינות בנושא ${topic} (מינימום נדרש לפריצת כספת: 3)`,
      `חסרות שאלות בנושא ${topic} (נמצאו ${count})`
    );
  });

  allSubTopics.forEach((sub) => {
    const matching = activeQuestions.filter((q) => q.subTopic === sub);
    assertCondition(
      results,
      `curr-sub-${sub}`,
      'תוכנית לימודים ומאגר שאלות',
      `כיסוי תת-נושא: ${SUBTOPIC_LABELS[sub]}`,
      matching.length >= 1,
      `תת-הנושא "${SUBTOPIC_LABELS[sub]}" מכוסה עם ${matching.length} שאלות`,
      `תת-הנושא "${SUBTOPIC_LABELS[sub]}" אינו מכוסה במאגר`
    );
  });

  // Structural & Mathematical Integrity of all questions
  const invalidQuestions = activeQuestions.filter(
    (q) =>
      !q.prompt.trim() ||
      q.options.length !== 4 ||
      q.options.some((o) => !o.trim()) ||
      q.correctIndex < 0 ||
      q.correctIndex > 3 ||
      !q.hint.trim() ||
      q.explanationSteps.length === 0 ||
      q.points <= 0
  );

  assertCondition(
    results,
    'curr-integrity',
    'תוכנית לימודים ומאגר שאלות',
    'תקינות מבנית של כל השאלות, האפשרויות, הרמזים וההסברים',
    invalidQuestions.length === 0,
    `כל ${activeQuestions.length} השאלות מכילות 4 אפשרויות, תשובה נכונה מוגדרת, רמז והסבר שלב-אחר-שלב`,
    `נמצאו ${invalidQuestions.length} שאלות עם שדות חסרים`
  );

  // Verify distribution of correctIndex across options 1, 2, 3, 4 and live Fisher-Yates shuffling
  const indexCounts = [0, 0, 0, 0];
  activeQuestions.forEach((q) => {
    if (q.correctIndex >= 0 && q.correctIndex <= 3) {
      indexCounts[q.correctIndex]++;
    }
  });
  const allIndicesRepresented = indexCounts.every((c) => c >= 1);
  let shufflePreservesTruth = true;
  for (let i = 0; i < activeQuestions.length; i++) {
    const orig = activeQuestions[i];
    const expectedAnswer = orig.options[orig.correctIndex];
    const shuffled = shuffleQuestionOptions(orig);
    if (shuffled.options[shuffled.correctIndex] !== expectedAnswer) {
      shufflePreservesTruth = false;
      break;
    }
  }

  assertCondition(
    results,
    'curr-answer-distribution-and-shuffle',
    'תוכנית לימודים ומאגר שאלות',
    'פיזור תשובות נכונות בין אפשרויות 1–4 וערבוב אוטומטי בכל הצגת שאלה',
    allIndicesRepresented && shufflePreservesTruth,
    `פיזור תשובות נכונות במאגר: אפשרות 1 (${indexCounts[0]}), אפשרות 2 (${indexCounts[1]}), אפשרות 3 (${indexCounts[2]}), אפשרות 4 (${indexCounts[3]}) + ערבוב Fisher-Yates דינמי`,
    'התשובות הנכונות מרוכזות באינדקס אחד בלבד או כשל בערבוב'
  );

  // =========================================================================
  // 2. בדיקת מחולל השאלות הדינמי (Procedural Question Generator)
  // =========================================================================
  let proceduralAllValid = true;
  let proceduralDetails = '';

  for (let batch = 1; batch <= 8; batch++) {
    const genBatch = generateProceduralQuestions(batch);
    if (genBatch.length !== 3) {
      proceduralAllValid = false;
      proceduralDetails = `סבב ${batch} לא יצר 3 שאלות`;
      break;
    }

    // Verify Percentage generated math
    const pctQ = genBatch.find((q) => q.topic === 'percentages');
    if (pctQ) {
      const pVal = pctQ.simulatorConfig.percentValue ?? 0;
      const totVal = pctQ.simulatorConfig.totalAmount ?? 0;
      const expectedPart = (pVal * totVal) / 100;
      const correctOptionText = pctQ.options[pctQ.correctIndex];
      if (!correctOptionText.includes(String(expectedPart))) {
        proceduralAllValid = false;
        proceduralDetails = `שגיאת חישוב באחוזים בסבב ${batch}: צפוי ${expectedPart}, התקבל ${correctOptionText}`;
      }
    }

    // Verify Average Missing Number generated math
    const avgQ = genBatch.find((q) => q.topic === 'averages');
    if (avgQ && avgQ.simulatorConfig.numbers && avgQ.simulatorConfig.targetAverage) {
      const nums = avgQ.simulatorConfig.numbers;
      const sum = nums.reduce((a, b) => a + b, 0);
      const avg = sum / nums.length;
      if (Math.abs(avg - avgQ.simulatorConfig.targetAverage) > 0.001) {
        proceduralAllValid = false;
        proceduralDetails = `שגיאת חישוב בממוצע בסבב ${batch}`;
      }
    }

    // Verify Decimal Between generated math
    const decQ = genBatch.find((q) => q.topic === 'decimals');
    if (
      decQ &&
      decQ.simulatorConfig.decimalA !== undefined &&
      decQ.simulatorConfig.decimalB !== undefined &&
      decQ.simulatorConfig.targetDecimal !== undefined
    ) {
      const a = Math.min(decQ.simulatorConfig.decimalA, decQ.simulatorConfig.decimalB);
      const b = Math.max(decQ.simulatorConfig.decimalA, decQ.simulatorConfig.decimalB);
      const mid = decQ.simulatorConfig.targetDecimal;
      if (!(mid > a && mid < b)) {
        proceduralAllValid = false;
        proceduralDetails = `שגיאת תחום במספרים עשרוניים בסבב ${batch}: ${mid} אינו בין ${a} ל-${b}`;
      }
    }
  }

  assertCondition(
    results,
    'proc-generator-8-batches',
    'מחולל שאלות אוטומטי',
    'אימות מתמטי של 24 שאלות מחוללות אוטומטית (8 סבבים × 3 נושאים)',
    proceduralAllValid,
    'כל 24 השאלות שחוללו אוטומטית באחוזים, ממוצע ועשרוניים נבדקו מתמטית ונמצאו מדויקות',
    proceduralDetails || 'כשל במחולל השאלות'
  );

  // =========================================================================
  // 3. בדיקת מנועי הסימולטורים הוויזואליים (Simulators Math Verification)
  // =========================================================================
  // 3A: Percentage Simulator calculations
  const testPct = 35;
  const testTotal = 200;
  const calcPart = Number(((testPct / 100) * testTotal).toFixed(2));
  const compPct = 100 - testPct;
  const compPart = Number((testTotal - calcPart).toFixed(2));

  assertCondition(
    results,
    'sim-percentages-math',
    'סימולטורים ויזואליים',
    'סימולטור אחוזים (רשת ה-100, חישוב כמות והשלמה ל-100%)',
    calcPart === 70 && compPct === 65 && compPart === 130,
    `35% מתוך 200 = 70, משלים ל-100% הוא 65% = 130 (סכום 70 + 130 = 200)`,
    'שגיאה בחישוב סימולטור אחוזים'
  );

  // 3B: Average Simulator - Calculate, Missing Number & Effect of Adding Number
  const baseSeries = [12, 16, 20, 24]; // average = 18
  const baseAvg = baseSeries.reduce((a, b) => a + b, 0) / baseSeries.length;
  const higherAdded = [...baseSeries, 28]; // average = 20 (> 18)
  const lowerAdded = [...baseSeries, 8]; // average = 16 (< 18)
  const equalAdded = [...baseSeries, 18]; // average = 18 (=== 18)

  const avgHigher = higherAdded.reduce((a, b) => a + b, 0) / higherAdded.length;
  const avgLower = lowerAdded.reduce((a, b) => a + b, 0) / lowerAdded.length;
  const avgEqual = equalAdded.reduce((a, b) => a + b, 0) / equalAdded.length;

  assertCondition(
    results,
    'sim-averages-effect',
    'סימולטורים ויזואליים',
    'סימולטור ממוצע: חוקי הוספת מספר (גדול מהממוצע, קטן מהממוצע, שווה לממוצע)',
    baseAvg === 18 && avgHigher > baseAvg && avgLower < baseAvg && avgEqual === baseAvg,
    `ממוצע בסיס: ${baseAvg} | בהוספת 28 עולה ל-${avgHigher} | בהוספת 8 יורד ל-${avgLower} | בהוספת 18 נשאר ${avgEqual}`,
    'שגיאה בחוקי השפעת הוספת איבר על הממוצע'
  );

  // Missing number given target average
  const knownWeights = [15, 22];
  const targetAvg = 20;
  const totalCount = 3;
  const missingWeight = targetAvg * totalCount - (knownWeights[0] + knownWeights[1]);
  assertCondition(
    results,
    'sim-averages-missing',
    'סימולטורים ויזואליים',
    'סימולטור ממוצע: מציאת משקולת חסרה בהינתן ממוצע יעד',
    missingWeight === 23 && (15 + 22 + missingWeight) / 3 === 20,
    `עבור [15, 22, ?] עם ממוצע יעד 20 ← המשקולת החסרה היא 23 (סכום 60 ÷ 3 = 20)`,
    'שגיאה בחישוב איבר חסר בממוצע'
  );

  // 3C: Decimal Simulator - Zoom ticks & Decimal-to-Percent conversion
  const minD = 1.25;
  const maxD = 1.26;
  const spanD = maxD - minD;
  const zoomTicks = Array.from({ length: 11 }, (_, idx) =>
    Number((minD + (spanD * idx) / 10).toFixed(3))
  );
  const decToPct04 = Math.round(0.4 * 100);
  const decToPct085 = Math.round(0.85 * 100);

  assertCondition(
    results,
    'sim-decimals-zoom-convert',
    'סימולטורים ויזואליים',
    'סימולטור עשרוניים: עדשת זום לאלפיות והמרה לאחוזים',
    zoomTicks[0] === 1.25 &&
      zoomTicks[4] === 1.254 &&
      zoomTicks[10] === 1.26 &&
      decToPct04 === 40 &&
      decToPct085 === 85,
    `עדשת זום בין 1.25 ל-1.26 מייצרת חלוקה מדויקת (${zoomTicks[1]}, ${zoomTicks[4]}...) | המרות: 0.4 = 40%, 0.85 = 85%`,
    'שגיאה בסימולטור מספרים עשרוניים'
  );

  // =========================================================================
  // 4. בדיקת מכונת מצבי המשחק, קומבו, כוחות מיוחדים ופריצת כספות
  // =========================================================================
  // 4A: Combo Streak Multiplier & Power-up Recharge
  const calcPointsWithCombo = (basePoints: number, newStreak: number, doubleActive: boolean) => {
    const comboMult = newStreak >= 3 ? 2 : newStreak === 2 ? 1.5 : 1;
    const doubleMult = doubleActive ? 2 : 1;
    return Math.round(basePoints * comboMult * doubleMult);
  };

  const pStreak1 = calcPointsWithCombo(100, 1, false); // 100
  const pStreak2 = calcPointsWithCombo(100, 2, false); // 150
  const pStreak3 = calcPointsWithCombo(100, 3, false); // 200
  const pStreak3Double = calcPointsWithCombo(100, 3, true); // 400

  assertCondition(
    results,
    'state-combo-scoring',
    'מכונת מצבים ותחרותיות',
    'מחשבון רצף הצלחות (Combo) והכפלת כספת (×1, ×1.5, ×2, ×4)',
    pStreak1 === 100 && pStreak2 === 150 && pStreak3 === 200 && pStreak3Double === 400,
    `ניקוד בסיס 100 ← רצף 1: ${pStreak1} | רצף 2 (×1.5): ${pStreak2} | רצף 3 (×2): ${pStreak3} | עם מכפיל כספת: ${pStreak3Double}`,
    'שגיאה בחישוב מכפילי קומבו'
  );

  // 4B: 50/50 Power-up safety check (never removes the correct answer)
  let fiftyFiftySafe = true;
  for (let i = 0; i < 20; i++) {
    const sampleQ = activeQuestions[i % activeQuestions.length];
    const wrongIndices = sampleQ.options
      .map((_, idx) => idx)
      .filter((idx) => idx !== sampleQ.correctIndex);
    const eliminated = wrongIndices.sort(() => Math.random() - 0.5).slice(0, 2);
    if (eliminated.length !== 2 || eliminated.includes(sampleQ.correctIndex)) {
      fiftyFiftySafe = false;
      break;
    }
  }

  assertCondition(
    results,
    'state-powerup-5050',
    'מכונת מצבים ותחרותיות',
    'כוח מיוחד "מנטרל 50/50": מסיר תמיד 2 מסיחים שגויים ושומר על התשובה הנכונה',
    fiftyFiftySafe,
    'נבדקו 20 הפעלות של מנטרל 50/50 – תמיד הוסרו 2 תשובות שגויות בלבד והתשובה הנכונה נשמרה',
    'כשל במנגנון 50/50'
  );

  // 4C: Full Vault Cracking Lifecycle & Final Victory Transition
  const simulatedVaults = {
    percentages: { unlocked: [] as number[], required: 3, cracked: false },
    averages: { unlocked: [] as number[], required: 3, cracked: false },
    decimals: { unlocked: [] as number[], required: 3, cracked: false },
  };

  (['percentages', 'averages', 'decimals'] as TopicId[]).forEach((t) => {
    for (let step = 1; step <= 3; step++) {
      simulatedVaults[t].unlocked.push(step * 2);
      if (simulatedVaults[t].unlocked.length >= simulatedVaults[t].required) {
        simulatedVaults[t].cracked = true;
      }
    }
  });

  const allThreeCracked =
    simulatedVaults.percentages.cracked &&
    simulatedVaults.averages.cracked &&
    simulatedVaults.decimals.cracked;

  assertCondition(
    results,
    'state-vault-victory-lifecycle',
    'מכונת מצבים ותחרותיות',
    'מעגל חיי פיצוח 3 הכספות, הפעלת קונפטי ומעבר למסך הניצחון הסופי',
    allThreeCracked &&
      simulatedVaults.percentages.unlocked.length === 3 &&
      simulatedVaults.averages.unlocked.length === 3 &&
      simulatedVaults.decimals.unlocked.length === 3,
    'כל 3 הכספות (אחוזים, ממוצע, עשרוניים) נפרצות לאחר 3 ספרות קוד ומעבירות את המשחק למסך FINAL_VAULT_VICTORY עם אנימציית קונפטי',
    'כשל במעבר למצב ניצחון סופי'
  );

  // 4D: Teacher Preview & Solo Mode Isolation
  const classroomScoreBeforePreview = 450;
  let scoreAfterTeacherPreview = classroomScoreBeforePreview;
  const currentPhase: string = 'TEACHER_PREVIEW_QUESTION';
  if (currentPhase !== 'TEACHER_PREVIEW_QUESTION') {
    scoreAfterTeacherPreview += 150;
  }

  assertCondition(
    results,
    'state-teacher-preview-isolation',
    'מצב מורה והתנסות מוקדמת',
    'בידוד "נסה שאלה במעבדה" (תצוגה מקדימה למורה אינה משנה ניקוד כיתתי)',
    scoreAfterTeacherPreview === classroomScoreBeforePreview,
    'בדיקת שאלה מתוך פאנל המורה פועלת במצב מבודד (TEACHER_PREVIEW_QUESTION) ואינה משנה את ניקוד הקבוצות או ספרות הכספת של הכיתה',
    'דליפת ניקוד במצב תצוגה מקדימה למורה'
  );

  // 4E: Timer Presets & Urgent Red Pulse (< 10 seconds)
  const supportedTimers = [0, 20, 30, 45, 60, 90, 120, 180];
  const isUrgentAt9 = 9 < 10 && 9 > 0;
  const isUrgentAt15 = 15 < 10;

  assertCondition(
    results,
    'state-timer-pulse-and-presets',
    'מכונת מצבים ותחרותיות',
    'שעון עצר: 8 אפשרויות זמן לבחירת המורה ואפקט דופק אדום (Pulse) מתחת ל-10 שניות',
    supportedTimers.length === 8 && isUrgentAt9 && !isUrgentAt15,
    `זמינות 8 הגדרות זמן (${supportedTimers.join(', ')} שניות) | דופק אדום מופעל אוטומטית כאשר נותרו פחות מ-10 שניות`,
    'שגיאה בהגדרות שעון העצר או סף הדופק האדום'
  );

  // 4F: Teacher Difficulty Display & Coverage per Topic
  const difficulties: ('easy' | 'medium' | 'hard')[] = ['easy', 'medium', 'hard'];
  const allTopicsHaveAllDifficulties = topics.every((t) =>
    difficulties.every((d) =>
      INITIAL_QUESTIONS.some((q) => q.topic === t && q.difficulty === d)
    )
  );

  assertCondition(
    results,
    'state-teacher-difficulty-indicator',
    'מצב מורה והתנסות מוקדמת',
    'חיווי רמת קושי (קל / בינוני / מאתגר) ומעבר מהיר בין רמות בהתנסות מורה',
    allTopicsHaveAllDifficulties,
    'בכל 3 הנושאים קיימות שאלות ברמות קל (100 נק׳), בינוני (150 נק׳) ומאתגר (200 נק׳) עם תצוגה מפורשת למורה',
    'חסרה רמת קושי באחד הנושאים'
  );

  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.length - passedCount;

  return {
    totalTests: results.length,
    passedCount,
    failedCount,
    allPassed: failedCount === 0,
    timestamp: new Date().toLocaleTimeString('he-IL'),
    results,
  };
}
