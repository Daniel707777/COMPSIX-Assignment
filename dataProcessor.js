require('dotenv').config();

const { workoutCalculator } = require('./workoutReader');
const { healthMetricsCounter } = require('./healthReader');

async function processFiles() {
  const userName = process.env.USER_NAME || 'Athlete';
  const weeklyGoal = Number(process.env.WEEKLY_GOAL);

  if (Number.isNaN(weeklyGoal)) {
    console.error('WEEKLY_GOAL is missing or not a number. Check your .env file.');
    return;
  }

  console.log(`Processing data for: ${userName}`);

  try {
    console.log('📁 Reading workout data...');
    const { totalWorkouts, totalMinutes } = await workoutCalculator('./data/workouts.csv');

    console.log('📁 Reading health data...');
    const healthEntries = await healthMetricsCounter('./data/health-metrics.json');

    console.log('\n=== SUMMARY ===');
    console.log(`Workouts found: ${totalWorkouts}`);
    console.log(`Total workout minutes: ${totalMinutes}`);
    console.log(`Health entries found: ${healthEntries}`);
    console.log(`Weekly goal: ${weeklyGoal} minutes`);

    if (totalMinutes > weeklyGoal) {
      console.log(`🎉 Congratulations ${userName}! You have exceeded your weekly goal!`);
    } else if (totalMinutes === weeklyGoal) {
      console.log(`✅ Nice work ${userName}! You hit your weekly goal exactly!`);
    } else {
      console.log(
        `💪 Keep going ${userName}! You are ${weeklyGoal - totalMinutes} minutes short of your weekly goal.`
      );
    }
  } catch (error) {
    console.error(`❌ Something went wrong: ${error.message}`);
    console.error('Check that your data files exist in ./data and are formatted correctly.');
  }
}

processFiles();
