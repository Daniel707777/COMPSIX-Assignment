const fs = require('fs').promises;

/**
 * Reads a JSON health data file asynchronously and counts its entries.
 * Accepts either an object with a "metrics" array ({ user, metrics: [...] })
 * or a plain JSON array of entries.
 * @param {string} filePath - path to the JSON health data file
 * @returns {Promise<number>} the total number of health entries
 */
async function healthMetricsCounter(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(raw);

    const entries = Array.isArray(data) ? data : data && data.metrics;

    if (!Array.isArray(entries)) {
      throw new Error(
        'Health data must be a JSON array or an object with a "metrics" array.'
      );
    }

    const count = entries.length;
    console.log(`Total health entries: ${count}`);
    return count;
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`Health data file not found: ${filePath}`);
    }
    if (error instanceof SyntaxError) {
      throw new Error(`Health data file contains invalid JSON: ${filePath}`);
    }
    throw error;
  }
}

module.exports = { healthMetricsCounter };
