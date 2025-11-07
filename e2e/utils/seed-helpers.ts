/**
 * Database state management for E2E tests
 * Handles initialization and cleanup of test database
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SEED_DATA_PATH = path.resolve(__dirname, '../fixtures/seed-data.json');
const DB_PATH = path.resolve(__dirname, '../../src/__mocks__/response/e2e.json');

export class SeedHelpers {
  /**
   * Reset database to empty state
   * Call this in globalSetup or test.beforeEach
   */
  static resetDatabase(): void {
    fs.writeFileSync(DB_PATH, JSON.stringify({ events: [] }));
  }

  /**
   * Load seed data from fixture file into E2E database
   * Use only when tests need pre-populated data
   */
  static loadSeedData(): void {
    if (!fs.existsSync(SEED_DATA_PATH)) {
      throw new Error(`Seed data file not found: ${SEED_DATA_PATH}`);
    }

    const seedData = fs.readFileSync(SEED_DATA_PATH, 'utf8');
    fs.writeFileSync(DB_PATH, seedData);
  }

  /**
   * Get current database path (useful for debugging)
   */
  static getDatabasePath(): string {
    return DB_PATH;
  }
}
