import { MathQuestion, SubTopicId, TopicId } from '../types/game';

export const TOPIC_METADATA: Record<
  TopicId,
  {
    title: string;
    vaultName: string;
    subtitle: string;
    accentHex: string;
    badgeBg: string;
    borderClass: string;
    textClass: string;
  }
> = {
  percentages: {
    title: 'אחוזים בסיסי',
    vaultName: 'כספת האנרגיה (אחוזים)',
    subtitle: 'משמעות האחוז מתוך 100 · חישוב אחוז מכמות · השלמה ל-100%',
    accentHex: '#06B6D4',
    badgeBg: 'bg-cyan-500/15',
    borderClass: 'border-cyan-500/40',
    textClass: 'text-cyan-400',
  },
  averages: {
    title: 'ממוצע',
    vaultName: 'כספת האיזון (ממוצע)',
    subtitle: 'חישוב ממוצע · השלמת מספר חסר · השפעת הוספת מספר על הממוצע',
    accentHex: '#F59E0B',
    badgeBg: 'bg-amber-500/15',
    borderClass: 'border-amber-500/40',
    textClass: 'text-amber-400',
  },
  decimals: {
    title: 'מספרים עשרוניים',
    vaultName: 'כספת הלייזר (עשרוניים)',
    subtitle: 'מי יותר גדול · מספר עשרוני בין שני מספרים · המרה לאחוזים',
    accentHex: '#10B981',
    badgeBg: 'bg-emerald-500/15',
    borderClass: 'border-emerald-500/40',
    textClass: 'text-emerald-400',
  },
};

export const SUBTOPIC_LABELS: Record<SubTopicId, string> = {
  percent_basic: 'משמעות האחוז מתוך 100',
  percent_of_amount: 'חישוב אחוז מכמות',
  percent_complement: 'השלמה ל-100%',
  average_calc: 'חישוב ממוצע של סדרה',
  average_missing: 'השלמת מספר חסר בהינתן ממוצע',
  average_effect: 'מה קורה לממוצע בהוספת מספר',
  decimal_compare: 'השוואת מספרים עשרוניים (מי גדול יותר)',
  decimal_between: 'מספר עשרוני בין שני מספרים',
  decimal_to_percent: 'המרה בין עשרוני לאחוזים',
};

/**
 * Shuffles the 4 answer options of a question using Fisher-Yates and updates
 * `correctIndex` so it always points to the exact correct answer text.
 */
export function shuffleQuestionOptions(question: MathQuestion): MathQuestion {
  const correctText = question.options[question.correctIndex];
  const entries = question.options.map((text, idx) => ({
    text,
    isCorrect: idx === question.correctIndex,
  }));

  for (let i = entries.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = entries[i];
    entries[i] = entries[j];
    entries[j] = temp;
  }

  const newOptions = entries.map((e) => e.text);
  const newCorrectIndex = entries.findIndex((e) => e.isCorrect);

  return {
    ...question,
    options: newOptions,
    correctIndex: newCorrectIndex >= 0 ? newCorrectIndex : newOptions.indexOf(correctText),
  };
}

export const INITIAL_QUESTIONS: MathQuestion[] = [
  // ==================== אחוזים בסיסי (PERCENTAGES) ====================
  {
    id: 'pct-1',
    topic: 'percentages',
    subTopic: 'percent_basic',
    subTopicLabel: 'משמעות האחוז מתוך 100',
    difficulty: 'easy',
    storyContext: 'סוללת הגיבוי של דלת המעבדה מחולקת ל-100 תאי אנרגיה שווים. 35 תאים כבר טעונים.',
    prompt: 'איזה אחוז מסוללת המעבדה טעון כרגע, וכמה אחוזים חסרים לטעינה מלאה?',
    options: [
      '35% טעון, וחסרים 75%',
      '65% טעון, וחסרים 35%',
      '35% טעון, וחסרים 65%',
      '3.5% טעון, וחסרים 96.5%',
    ],
    correctIndex: 2,
    hint: 'אחוז פירושו "מתוך 100". השלם המלא הוא 100%. חסרו מ-100 את מספר התאים הטעונים.',
    explanationSteps: [
      '35 תאים מתוך 100 תאים שווים בדיוק ל-35%.',
      'השלם המלא הוא 100%.',
      'נחשב את ההשלמה ל-100%: 100% פחות 35% שווה 65%.',
    ],
    codeDigit: 7,
    points: 100,
    simulatorConfig: {
      type: 'percentages',
      percentValue: 35,
      totalAmount: 100,
    },
  },
  {
    id: 'pct-2',
    topic: 'percentages',
    subTopic: 'percent_of_amount',
    subTopicLabel: 'חישוב אחוז מכמות',
    difficulty: 'easy',
    storyContext: 'במחסן הרובוטים של המעבדה יש 80 חיישנים. 25% מהם הם חיישני לייזר.',
    prompt: 'כמה חיישני לייזר נמצאים במחסן המעבדה?',
    options: ['25 חיישנים', '20 חיישנים', '40 חיישנים', '16 חיישנים'],
    correctIndex: 1,
    hint: 'זכרו: 25% הם בדיוק רבע (1/4) מהכמות הכוללת! חלקו את הכמות הכוללת ב-4.',
    explanationSteps: [
      '25% שווים לשבר 25/100 ובצמצום לרבע (1/4).',
      'כדי למצוא רבע מתוך 80, נחלק 80 ב-4.',
      '80 ÷ 4 = 20 חיישני לייזר.',
    ],
    codeDigit: 2,
    points: 100,
    simulatorConfig: {
      type: 'percentages',
      percentValue: 25,
      totalAmount: 80,
    },
  },
  {
    id: 'pct-3',
    topic: 'percentages',
    subTopic: 'percent_of_amount',
    subTopicLabel: 'חישוב אחוז מכמות',
    difficulty: 'medium',
    storyContext: 'כדי להפעיל את כור האנרגיה דרושים 200 ליטרים של נוזל קירור. המד מראה שהמכל מלא ב-60%.',
    prompt: 'כמה ליטרים של נוזל קירור יש כרגע במכל?',
    options: ['60 ליטרים', '140 ליטרים', '80 ליטרים', '120 ליטרים'],
    correctIndex: 3,
    hint: 'בכל 100 ליטרים יש 60 ליטרים מלאים. אם יש 200 ליטרים (פעמיים 100), כמה ליטרים יהיו?',
    explanationSteps: [
      'אפשרות א׳: 60% מתוך 100 הם 60. לכן מתוך 200 (שזה פי 2 מ-100) יש 60 × 2 = 120 ליטרים.',
      'אפשרות ב׳: 10% מתוך 200 הם 20 ליטרים. לכן 60% (פי 6) הם 20 × 6 = 120 ליטרים.',
    ],
    codeDigit: 4,
    points: 150,
    simulatorConfig: {
      type: 'percentages',
      percentValue: 60,
      totalAmount: 200,
    },
  },
  {
    id: 'pct-4',
    topic: 'percentages',
    subTopic: 'percent_complement',
    subTopicLabel: 'השלמה ל-100%',
    difficulty: 'medium',
    storyContext: 'צוות הפיצוח סרק 3/4 (שלושה רבעים) מהקבצים המוצפנים במחשב המעבדה.',
    prompt: 'איזה אחוז מהקבצים עדיין לא נסרק?',
    options: ['25%', '75%', '34%', '20%'],
    correctIndex: 0,
    hint: 'כמה אחוזים שווה רבע אחד (1/4)? אם סרקנו 3 רבעים, נשאר רבע אחד.',
    explanationSteps: [
      'השלם הוא 100%, וכל רבע (1/4) שווה 25%.',
      'שלושה רבעים (3/4) שווים ל-75% שנסרקו.',
      'החלק שנותר לסרוק הוא 100% פחות 75% = 25%.',
    ],
    codeDigit: 9,
    points: 150,
    simulatorConfig: {
      type: 'percentages',
      percentValue: 75,
      totalAmount: 100,
    },
  },
  {
    id: 'pct-5',
    topic: 'percentages',
    subTopic: 'percent_of_amount',
    subTopicLabel: 'חישוב אחוז מכמות',
    difficulty: 'hard',
    storyContext: 'במעבדה 150 מבחנות ניסוי. 20% מהן מכילות תמיסה כחולה, 50% מכילות תמיסה ירוקה, והשאר שקופות.',
    prompt: 'כמה מבחנות שקופות יש במעבדה?',
    options: ['30 מבחנות', '75 מבחנות', '45 מבחנות', '50 מבחנות'],
    correctIndex: 2,
    hint: 'חשבו תחילה איזה אחוז מהמבחנות הן שקופות (השלמה ל-100%), ואז מצאו כמה הן מתוך 150.',
    explanationSteps: [
      'נחבר את אחוז המבחנות הצבעוניות: 20% + 50% = 70%.',
      'אחוז המבחנות השקופות הוא: 100% - 70% = 30%.',
      'נמצא 10% מתוך 150: 150 ÷ 10 = 15 מבחנות.',
      'לכן 30% הם 15 × 3 = 45 מבחנות שקופות.',
    ],
    codeDigit: 5,
    points: 200,
    simulatorConfig: {
      type: 'percentages',
      percentValue: 30,
      totalAmount: 150,
    },
  },
  {
    id: 'pct-6',
    topic: 'percentages',
    subTopic: 'percent_basic',
    subTopicLabel: 'משמעות האחוז מתוך 100',
    difficulty: 'hard',
    storyContext: 'בקודן הכספת יש 50 כפתורים. 18 כפתורים זוהרים באור טורקיז.',
    prompt: 'איזה אחוז מכלל הכפתורים בקודן זוהרים?',
    options: ['18%', '36%', '68%', '9%'],
    correctIndex: 1,
    hint: 'אחוז הוא מתוך 100. הרחיבו את השבר 18/50 כך שהמכנה יהיה 100!',
    explanationSteps: [
      '18 מתוך 50 כפתורים זוהרים, כלומר השבר 18/50.',
      'כדי לעבור לאחוזים (מתוך 100), נכפיל את המונה והמכנה ב-2.',
      '18 × 2 = 36 מתוך 100, כלומר 36%.',
    ],
    codeDigit: 6,
    points: 200,
    simulatorConfig: {
      type: 'percentages',
      percentValue: 36,
      totalAmount: 50,
    },
  },

  // ==================== ממוצע (AVERAGES) ====================
  {
    id: 'avg-1',
    topic: 'averages',
    subTopic: 'average_calc',
    subTopicLabel: 'חישוב ממוצע של סדרה',
    difficulty: 'easy',
    storyContext: 'כדי לפתוח את שער האיזון, יש להזין את הטמפרטורה הממוצעת של 4 חדרי הקירור: 12, 16, 20, 24 מעלות.',
    prompt: 'מהי הטמפרטורה הממוצעת של ארבעת חדרי הקירור?',
    options: ['16 מעלות', '20 מעלות', '72 מעלות', '18 מעלות'],
    correctIndex: 3,
    hint: 'חברו את כל ארבע הטמפרטורות יחד, וחלקו את הסכום במספר החדרים (4).',
    explanationSteps: [
      'שלב א׳ - סכום המספרים: 12 + 16 + 20 + 24 = 72.',
      'שלב ב׳ - חלוקה במספר האיברים (4 חדרים): 72 ÷ 4 = 18.',
      'הטמפרטורה הממוצעת היא 18 מעלות.',
    ],
    codeDigit: 8,
    points: 100,
    simulatorConfig: {
      type: 'averages',
      averageMode: 'calculate',
      numbers: [12, 16, 20, 24],
    },
  },
  {
    id: 'avg-2',
    topic: 'averages',
    subTopic: 'average_missing',
    subTopicLabel: 'השלמת מספר חסר בהינתן ממוצע',
    difficulty: 'medium',
    storyContext: 'על מאזני המעבדה מונחות 3 משקולות. הממוצע שלהן חייב להיות 20 גרם בדיוק. שתיים מהמשקולות הן 15 גרם ו-22 גרם.',
    prompt: 'מה חייב להיות המשקל של המשקולת השלישית כדי שהממוצע יהיה 20?',
    options: ['20 גרם', '23 גרם', '18 גרם', '37 גרם'],
    correctIndex: 1,
    hint: 'אם הממוצע של 3 משקולות הוא 20, מה חייב להיות הסכום הכולל של שלושתן יחד?',
    explanationSteps: [
      'אם הממוצע של 3 מספרים הוא 20, הסכום של שלושתם חייב להיות: 3 × 20 = 60.',
      'נחבר את שתי המשקולות הידועות: 15 + 22 = 37.',
      'נחסר מהסכום הכולל: 60 - 37 = 23 גרם.',
    ],
    codeDigit: 3,
    points: 150,
    simulatorConfig: {
      type: 'averages',
      averageMode: 'missing',
      numbers: [15, 22, 23],
      targetAverage: 20,
      missingIndex: 2,
    },
  },
  {
    id: 'avg-3',
    topic: 'averages',
    subTopic: 'average_effect',
    subTopicLabel: 'מה קורה לממוצע בהוספת מספר',
    difficulty: 'easy',
    storyContext: 'ממוצע הניקוד של קבוצת מדענים ב-5 ניסויים הוא 80 נקודות. בניסוי השישי הם קיבלו 92 נקודות.',
    prompt: 'מה יקרה לממוצע הניקוד של הקבוצה לאחר הוספת הניסוי השישי (ללא חישוב מדויק)?',
    options: [
      'הממוצע ירד (יהיה קטן מ-80)',
      'הממוצע יישאר 80 בדיוק',
      'הממוצע יעלה (יהיה גדול מ-80)',
      'אי אפשר לדעת בלי לדעת את כל הציונים הקודמים',
    ],
    correctIndex: 2,
    hint: 'השוו את המספר החדש שנוסף (92) לממוצע הקיים (80). האם הוא מושך את הממוצע למעלה או למטה?',
    explanationSteps: [
      'חוק הממוצע: כאשר מוסיפים לסדרה מספר שגדול מהממוצע הקיים (92 גדול מ-80), הממוצע החדש עולה.',
      'המספר 92 מביא איתו "עודף" של 12 נקודות מעל הממוצע שמתחלק בין כל הניסויים.',
    ],
    codeDigit: 1,
    points: 100,
    simulatorConfig: {
      type: 'averages',
      averageMode: 'effect',
      numbers: [76, 80, 84, 78, 82],
      addedNumber: 92,
    },
  },
  {
    id: 'avg-4',
    topic: 'averages',
    subTopic: 'average_effect',
    subTopicLabel: 'מה קורה לממוצע בהוספת מספר',
    difficulty: 'medium',
    storyContext: 'ממוצע של 4 מספרי קוד במעבדה הוא 35. הוסיפו לסדרה מספר חמישי שהוא 35, ומספר שישי שהוא 20.',
    prompt: 'מה קרה לממוצע הסדרה לאחר הוספת שני המספרים?',
    options: [
      'אחרי הוספת 35 הממוצע עלה, ואחרי הוספת 20 הממוצע חזר ל-35',
      'הממוצע עלה בשני המקרים כי הוספנו עוד מספרים לסכום',
      'הממוצע נשאר 35 כי הסכום גדל',
      'אחרי הוספת 35 הממוצע לא השתנה, ואחרי הוספת 20 הממוצע ירד',
    ],
    correctIndex: 3,
    hint: 'מה קורה לממוצע כשמוסיפים איבר ששווה בדיוק לממוצע? ומה קורה כשמוסיפים איבר שקטן מהממוצע?',
    explanationSteps: [
      'כאשר מוסיפים לסדרה את המספר 35 (ששווה בדיוק לממוצע הקיים 35), הממוצע נשאר 35 ללא שינוי.',
      'כאשר מוסיפים לאחר מכן את המספר 20 (שקטן מהממוצע 35), הוא מושך את הממוצע למטה ולכן הממוצע יורד.',
    ],
    codeDigit: 5,
    points: 150,
    simulatorConfig: {
      type: 'averages',
      averageMode: 'effect',
      numbers: [30, 35, 40, 35],
      addedNumber: 20,
    },
  },
  {
    id: 'avg-5',
    topic: 'averages',
    subTopic: 'average_missing',
    subTopicLabel: 'השלמת מספר חסר בהינתן ממוצע',
    difficulty: 'hard',
    storyContext: 'בכספת 4 גלגלי שיניים. הממוצע של מספר השיניים שלהם הוא 25. בשלושה גלגלים יש: 20, 30 ו-18 שיניים.',
    prompt: 'כמה שיניים יש בגלגל הרביעי?',
    options: ['32 שיניים', '25 שיניים', '28 שיניים', '22 שיניים'],
    correctIndex: 0,
    hint: 'חשבו תחילה את הסכום של כל 4 הגלגלים יחד (4 כפול הממוצע 25).',
    explanationSteps: [
      'הסכום הכולל של 4 גלגלים שממוצעם 25 הוא: 4 × 25 = 100.',
      'סכום שלושת הגלגלים הידועים: 20 + 30 + 18 = 68.',
      'מספר השיניים בגלגל הרביעי: 100 - 68 = 32.',
    ],
    codeDigit: 2,
    points: 200,
    simulatorConfig: {
      type: 'averages',
      averageMode: 'missing',
      numbers: [20, 30, 18, 32],
      targetAverage: 25,
      missingIndex: 3,
    },
  },
  {
    id: 'avg-6',
    topic: 'averages',
    subTopic: 'average_calc',
    subTopicLabel: 'חישוב ממוצע של סדרה',
    difficulty: 'hard',
    storyContext: 'חיישן המהירות מדד 5 פולסים במעבדה: 10, 0, 20, 15, 5.',
    prompt: 'מהו הממוצע של חמשת הפולסים? (שימו לב לאפס!)',
    options: ['12.5', '50', '10', '8'],
    correctIndex: 2,
    hint: 'המספר 0 לא מוסיף לסכום, אבל הוא כן נספר כאיבר אחד מתוך 5 המדידות!',
    explanationSteps: [
      'נחבר את כל 5 המדידות: 10 + 0 + 20 + 15 + 5 = 50.',
      'מאחר שיש 5 מדידות (כולל המדידה שערכה 0), נחלק ב-5.',
      '50 ÷ 5 = 10.',
    ],
    codeDigit: 0,
    points: 200,
    simulatorConfig: {
      type: 'averages',
      averageMode: 'calculate',
      numbers: [10, 0, 20, 15, 5],
    },
  },

  // ==================== מספרים עשרוניים (DECIMALS) ====================
  {
    id: 'dec-1',
    topic: 'decimals',
    subTopic: 'decimal_compare',
    subTopicLabel: 'השוואת מספרים עשרוניים (מי גדול יותר)',
    difficulty: 'easy',
    storyContext: 'שתי קרני לייזר מכוונות אל המנעול: קרן א׳ בעוצמה 0.7 וקרן ב׳ בעוצמה 0.68.',
    prompt: 'איזו קרן לייזר חזקה יותר (מי המספר הגדול יותר)?',
    options: [
      '0.68 גדול מ-0.7 כי 68 גדול מ-7',
      '0.7 גדול מ-0.68',
      'שני המספרים שווים',
      'אי אפשר להשוות מספר עם עשירית למספר עם מאיות',
    ],
    correctIndex: 1,
    hint: 'השוו קודם את ספרת העשיריות (הספרה הראשונה מימין לנקודה), או הוסיפו 0 בסוף של 0.7 כדי לקבל מאיות!',
    explanationSteps: [
      'המספר 0.7 שווה ל-0.70 (7 עשיריות הן 70 מאיות).',
      'כעת נשווה בין 0.70 לבין 0.68.',
      '70 מאיות גדולות מ-68 מאיות, ולכן 0.7 > 0.68.',
    ],
    codeDigit: 7,
    points: 100,
    simulatorConfig: {
      type: 'decimals',
      decimalMode: 'compare',
      decimalA: 0.7,
      decimalB: 0.68,
    },
  },
  {
    id: 'dec-2',
    topic: 'decimals',
    subTopic: 'decimal_between',
    subTopicLabel: 'מספר עשרוני בין שני מספרים',
    difficulty: 'medium',
    storyContext: 'המפתח האלקטרוני מסתתר על ציר המספרים בדיוק בין 0.4 לבין 0.5.',
    prompt: 'איזה מהמספרים הבאים נמצא בין 0.4 לבין 0.5?',
    options: ['0.52', '0.39', '0.045', '0.46'],
    correctIndex: 3,
    hint: 'השתמשו בעדשת הזום! רשמו את 0.4 בתור 0.40 ואת 0.5 בתור 0.50. אילו מספרים נמצאים ביניהם?',
    explanationSteps: [
      'נרחיב למאיות: 0.4 = 0.40 וכן 0.5 = 0.50.',
      'כל מספר בין 0.41 ל-0.49 נמצא בין 0.4 ל-0.5.',
      'מתוך האפשרויות, 0.46 נמצא בדיוק בתחום הזה (0.40 < 0.46 < 0.50).',
    ],
    codeDigit: 6,
    points: 150,
    simulatorConfig: {
      type: 'decimals',
      decimalMode: 'between',
      decimalA: 0.4,
      decimalB: 0.5,
      targetDecimal: 0.46,
    },
  },
  {
    id: 'dec-3',
    topic: 'decimals',
    subTopic: 'decimal_to_percent',
    subTopicLabel: 'המרה בין עשרוני לאחוזים',
    difficulty: 'easy',
    storyContext: 'על צג הכספת מופיע השבר העשרוני 0.85, אך המנעול מקבל קלט באחוזים בלבד.',
    prompt: 'לכמה אחוזים שווה המספר העשרוני 0.85?',
    options: ['8.5%', '0.85%', '85%', '850%'],
    correctIndex: 2,
    hint: 'איך קוראים את המספר 0.85 בשם שבר? "שמונים וחמש מאיות" (85/100).',
    explanationSteps: [
      'המספר 0.85 מבוטא כ-85 מאיות (85/100).',
      'מאחר שאחוז הוא מאית (חלק מתוך 100), 85 מאיות הן בדיוק 85%.',
    ],
    codeDigit: 5,
    points: 100,
    simulatorConfig: {
      type: 'decimals',
      decimalMode: 'convert',
      decimalA: 0.85,
    },
  },
  {
    id: 'dec-4',
    topic: 'decimals',
    subTopic: 'decimal_to_percent',
    subTopicLabel: 'המרה בין עשרוני לאחוזים',
    difficulty: 'medium',
    storyContext: 'זהירות, מלכודת מעבדה! על המסך מופיע המספר העשרוני 0.4 ועליכם להמיר אותו לאחוזים.',
    prompt: 'לכמה אחוזים שווה המספר העשרוני 0.4?',
    options: ['4%', '40%', '0.4%', '44%'],
    correctIndex: 1,
    hint: '0.4 הם 4 עשיריות. לכמה מאיות שוות 4 עשיריות?',
    explanationSteps: [
      'המספר 0.4 שווה ל-0.40 (4 עשיריות = 40 מאיות).',
      '40 מאיות (40/100) הן 40%.',
      'שימו לב לא להתבלבל עם 0.04 שהוא 4%!',
    ],
    codeDigit: 4,
    points: 150,
    simulatorConfig: {
      type: 'decimals',
      decimalMode: 'convert',
      decimalA: 0.4,
    },
  },
  {
    id: 'dec-5',
    topic: 'decimals',
    subTopic: 'decimal_between',
    subTopicLabel: 'מספר עשרוני בין שני מספרים',
    difficulty: 'hard',
    storyContext: 'הלייזר דורש דיוק של אלפיות! עליכם לכוון את הסמן למספר שנמצא בין 1.25 לבין 1.26.',
    prompt: 'איזה מהמספרים הבאים נמצא בין 1.25 לבין 1.26?',
    options: ['1.254', '1.261', '1.249', '1.27'],
    correctIndex: 0,
    hint: 'הוסיפו 0 בקצה של שני המספרים כדי לעבור לאלפיות: 1.250 ו-1.260.',
    explanationSteps: [
      'נרחיב לאלפיות: 1.25 = 1.250 וכן 1.26 = 1.260.',
      'אנחנו מחפשים מספר שגדול מ-1.250 וקטן מ-1.260.',
      'המספר 1.254 נמצא בדיוק ביניהם!',
    ],
    codeDigit: 4,
    points: 200,
    simulatorConfig: {
      type: 'decimals',
      decimalMode: 'between',
      decimalA: 1.25,
      decimalB: 1.26,
      targetDecimal: 1.254,
    },
  },
  {
    id: 'dec-6',
    topic: 'decimals',
    subTopic: 'decimal_compare',
    subTopicLabel: 'השוואת מספרים עשרוניים (מי גדול יותר)',
    difficulty: 'hard',
    storyContext: 'ארבע דלתות ממוספרות במספרים עשרוניים: 3.09, 3.9, 3.89, 3.905. רק הדלת עם המספר הגדול ביותר נפתחת.',
    prompt: 'איזה מבין ארבעת המספרים העשרוניים הוא הגדול ביותר?',
    options: ['3.89', '3.9', '3.09', '3.905'],
    correctIndex: 3,
    hint: 'השוו לכולם אורך זהה של 3 ספרות אחרי הנקודה (אלפיות): 3.090, 3.900, 3.890, 3.905.',
    explanationSteps: [
      'נרשום את כל המספרים עם אלפיות (3 ספרות אחרי הנקודה):',
      '3.09 = 3.090 | 3.89 = 3.890 | 3.9 = 3.900 | 3.905.',
      'המספר הגדול ביותר הוא 3.905 (גדול ב-5 אלפיות מ-3.9).',
    ],
    codeDigit: 9,
    points: 200,
    simulatorConfig: {
      type: 'decimals',
      decimalMode: 'compare',
      decimalA: 3.905,
      decimalB: 3.9,
    },
  },
];

// Dynamic generator to allow teachers to add fresh procedural rounds on demand
export function generateProceduralQuestions(batchNumber: number): MathQuestion[] {
  const pctAmounts = [40, 60, 120, 200, 300, 400];
  const chosenTotal = pctAmounts[batchNumber % pctAmounts.length];
  const chosenPct = [10, 20, 25, 50, 75][(batchNumber + 1) % 5];
  const correctPctResult = (chosenTotal * chosenPct) / 100;

  const avgBase = 14 + (batchNumber % 8) * 2;
  const n1 = avgBase - 4;
  const n2 = avgBase + 2;
  const n3 = avgBase + 2; // sum = 3 * avgBase

  const decStart = Number((0.1 * ((batchNumber % 7) + 2)).toFixed(1));
  const decEnd = Number((decStart + 0.1).toFixed(1));
  const decMid = Number((decStart + 0.04).toFixed(2));

  const rawBatch: MathQuestion[] = [
    {
      id: `gen-pct-${Date.now()}-1`,
      topic: 'percentages',
      subTopic: 'percent_of_amount',
      subTopicLabel: 'חישוב אחוז מכמות',
      difficulty: 'medium',
      storyContext: `בסבב אבטחה חדש במעבדה נבדקו ${chosenTotal} גלאים. ${chosenPct}% מהם נמצאו תקינים.`,
      prompt: `כמה גלאים תקינים נמצאו מתוך ${chosenTotal} הגלאים?`,
      options: [
        `${correctPctResult + 10} גלאים`,
        `${correctPctResult} גלאים`,
        `${Math.max(5, correctPctResult - 10)} גלאים`,
        `${chosenPct} גלאים`,
      ],
      correctIndex: 1,
      hint: `חשבו כמה הם ${chosenPct}% מתוך 100, ואז התאימו לכמות של ${chosenTotal}.`,
      explanationSteps: [
        `נחשב ${chosenPct}% מתוך ${chosenTotal}:`,
        `(${chosenPct} ÷ 100) × ${chosenTotal} = ${correctPctResult} גלאים תקינים.`,
      ],
      codeDigit: correctPctResult % 10,
      points: 150,
      simulatorConfig: {
        type: 'percentages',
        percentValue: chosenPct,
        totalAmount: chosenTotal,
      },
      isCustom: true,
    },
    {
      id: `gen-avg-${Date.now()}-2`,
      topic: 'averages',
      subTopic: 'average_missing',
      subTopicLabel: 'השלמת מספר חסר בהינתן ממוצע',
      difficulty: 'medium',
      storyContext: `הממוצע של 3 קודי אבטחה במעבדה הוא ${avgBase}. שניים מהקודים הם ${n1} ו-${n2}.`,
      prompt: `מהו המספר השלישי בסדרה אם הממוצע של שלושתם הוא ${avgBase}?`,
      options: [
        `${avgBase}`,
        `${n1 + n2}`,
        `${n3}`,
        `${n3 + 4}`,
      ],
      correctIndex: 2,
      hint: `הכפילו את הממוצע (${avgBase}) ב-3 כדי למצוא את הסכום של שלושת המספרים יחד.`,
      explanationSteps: [
        `סכום שלושת המספרים חייב להיות: 3 × ${avgBase} = ${avgBase * 3}.`,
        `סכום שני המספרים הנתונים: ${n1} + ${n2} = ${n1 + n2}.`,
        `המספר החסר הוא: ${avgBase * 3} - ${n1 + n2} = ${n3}.`,
      ],
      codeDigit: n3 % 10,
      points: 150,
      simulatorConfig: {
        type: 'averages',
        averageMode: 'missing',
        numbers: [n1, n2, n3],
        targetAverage: avgBase,
        missingIndex: 2,
      },
      isCustom: true,
    },
    {
      id: `gen-dec-${Date.now()}-3`,
      topic: 'decimals',
      subTopic: 'decimal_between',
      subTopicLabel: 'מספר עשרוני בין שני מספרים',
      difficulty: 'medium',
      storyContext: `חיישן הלייזר מכוון לקטע שעל ציר המספרים בין ${decStart} לבין ${decEnd}.`,
      prompt: `איזה מהמספרים הבאים נמצא בדיוק בין ${decStart} לבין ${decEnd}?`,
      options: [
        `${(decEnd + 0.03).toFixed(2)}`,
        `${Math.max(0.01, Number((decStart - 0.02).toFixed(2)))}`,
        `${(decStart / 10).toFixed(2)}`,
        `${decMid}`,
      ],
      correctIndex: 3,
      hint: `הרחיבו את ${decStart} ל-${decStart.toFixed(2)} ואת ${decEnd} ל-${decEnd.toFixed(2)}.`,
      explanationSteps: [
        `${decStart} שווה ל-${decStart.toFixed(2)}, וכן ${decEnd} שווה ל-${decEnd.toFixed(2)}.`,
        `המספר ${decMid} נמצא ביניהם על ציר המספרים.`,
      ],
      codeDigit: Math.round(decMid * 100) % 10,
      points: 150,
      simulatorConfig: {
        type: 'decimals',
        decimalMode: 'between',
        decimalA: decStart,
        decimalB: decEnd,
        targetDecimal: decMid,
      },
      isCustom: true,
    },
  ];

  return rawBatch.map((q) => shuffleQuestionOptions(q));
}
