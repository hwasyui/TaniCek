import cron from 'node-cron';
import { analyzeAllMachines } from '../utils/aiAnalyzer.js';

async function runDailyAnalysis() {
  console.log('Running daily AI analysis job...');
  const results = await analyzeAllMachines();
  console.log('Daily AI analysis completed:', results.length, 'machines analyzed');
}

cron.schedule('0 8 * * *', () => {
  runDailyAnalysis();
}, {
  timezone: "Asia/Jakarta"
});

