const fs = require('fs');
const csv = require('csv-parser');

/**
 * Reads a CSV workout file with csv-parser and returns the rows.
 * @param {string} filePath
 * @returns {Promise<Object[]>}
 */
function readWorkouts(filePath) {
  return new Promise((resolve, reject) => {
    const rows = [];
    const stream = fs.createReadStream(filePath);

    stream.on('error', (error) => {
      if (error.code === 'ENOENT') {
        reject(new Error(`Workout file not found: ${filePath}`));
      } else {
        reject(new Error(`Could not read workout file: ${error.message}`));
      }
    });

    stream
      .pipe(csv())
      .on('data', (row) => rows.push(row))
      .on('end', () => resolve(rows))
      .on('error', (error) => {
        reject(new Error(`Workout file is corrupted: ${error.message}`));
      });
  });
}

/**
 * Counts workouts and totals their minutes.
 * @param {string} filePath
 * @returns {Promise<{totalWorkouts: number, totalMinutes: number}>}
 */
async function workoutCalculator(filePath) {
  const workouts = await readWorkouts(filePath);

  let totalMinutes = 0;
  for (let i = 0; i < workouts.length; i++) {
    const minutes = Number(workouts[i].duration);
    if (Number.isNaN(minutes)) {
      throw new Error(
        `Workout file is corrupted: invalid duration "${workouts[i].duration}" on row ${i + 1}`
      );
    }
    totalMinutes += minutes;
  }

  const totalWorkouts = workouts.length;
  console.log(`Total workouts: ${totalWorkouts}`);
  console.log(`Total minutes: ${totalMinutes}`);
  return { totalWorkouts, totalMinutes };
}

module.exports = { workoutCalculator, readWorkouts };
