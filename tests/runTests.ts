import { runFullGameTestSuite } from '../src/utils/testSuite';

console.log('==============================================================');
console.log('🧪 הרצת תוכנית בדיקות אוטומטית: המעבדה הסודית - כיתה ה׳');
console.log('==============================================================\n');

const summary = runFullGameTestSuite();

for (const res of summary.results) {
  const badge = res.passed ? '✅ [PASS]' : '❌ [FAIL]';
  console.log(`${badge} [${res.category}] ${res.name}`);
  console.log(`   ↳ ${res.details}\n`);
}

console.log('--------------------------------------------------------------');
console.log(
  `סיכום בדיקות: ${summary.passedCount}/${summary.totalTests} עברו בהצלחה (${
    summary.allPassed ? '100% תקין!' : `${summary.failedCount} נכשלו`
  })`
);
console.log('--------------------------------------------------------------');

if (!summary.allPassed) {
  process.exit(1);
}
