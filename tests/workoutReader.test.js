const fs = require('fs');
const os = require('os');
const path = require('path');
const { workoutCalculator, readWorkouts } = require('../workoutReader');

describe('workoutReader', () => {
  let tmpDir;

  beforeAll(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'workouts-'));
  });

  afterAll(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('readWorkouts parses CSV rows into objects', async () => {
    const rows = await readWorkouts('./data/workouts.csv');
    expect(Array.isArray(rows)).toBe(true);
    expect(rows).toHaveLength(10);
    expect(rows[0]).toHaveProperty('duration');
  });

  test('workoutCalculator returns the expected structure and totals', async () => {
    const result = await workoutCalculator('./data/workouts.csv');
    expect(result).toEqual({ totalWorkouts: 10, totalMinutes: 330 });
  });

  test('handles a CSV with a header only', async () => {
    const file = path.join(tmpDir, 'empty.csv');
    fs.writeFileSync(file, 'date,type,duration\n');
    await expect(workoutCalculator(file)).resolves.toEqual({
      totalWorkouts: 0,
      totalMinutes: 0,
    });
  });

  test('throws a clear error when the file is missing', async () => {
    await expect(workoutCalculator('./data/missing.csv')).rejects.toThrow(
      'Workout file not found'
    );
  });

  test('throws a clear error when a duration is not a number', async () => {
    const file = path.join(tmpDir, 'corrupt.csv');
    fs.writeFileSync(file, 'date,type,duration\n2026-11-01,Running,abc\n');
    await expect(workoutCalculator(file)).rejects.toThrow('corrupted');
  });
});
