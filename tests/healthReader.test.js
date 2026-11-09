const fs = require('fs');
const os = require('os');
const path = require('path');
const { healthMetricsCounter } = require('../healthReader');

describe('healthMetricsCounter', () => {
  let tmpDir;

  beforeAll(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'health-'));
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

  test('reads valid JSON and returns the entry count as a number', async () => {
    const count = await healthMetricsCounter('./data/health-metrics.json');
    expect(typeof count).toBe('number');
    expect(count).toBe(8);
  });

  test('counts entries in an object with a metrics array', async () => {
    const file = path.join(tmpDir, 'metrics.json');
    fs.writeFileSync(file, JSON.stringify({ user: 'Test', metrics: [{}, {}, {}] }));
    await expect(healthMetricsCounter(file)).resolves.toBe(3);
  });

  test('returns 0 for an empty array', async () => {
    const file = path.join(tmpDir, 'empty.json');
    fs.writeFileSync(file, '[]');
    await expect(healthMetricsCounter(file)).resolves.toBe(0);
  });

  test('throws a clear error when the file is missing', async () => {
    await expect(healthMetricsCounter('./data/nope.json')).rejects.toThrow(
      'Health data file not found'
    );
  });

  test('throws a clear error when the JSON is invalid', async () => {
    const file = path.join(tmpDir, 'bad.json');
    fs.writeFileSync(file, '{ not valid json');
    await expect(healthMetricsCounter(file)).rejects.toThrow('invalid JSON');
  });

  test('throws when the JSON has no metrics array', async () => {
    const file = path.join(tmpDir, 'object.json');
    fs.writeFileSync(file, '{"a": 1}');
    await expect(healthMetricsCounter(file)).rejects.toThrow('JSON array');
  });
});
