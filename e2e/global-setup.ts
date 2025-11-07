/**
 * Playwright Global Setup
 * Runs once before all tests
 */

import { SeedHelpers } from './utils/seed-helpers';

export default function globalSetup() {
  console.log('Resetting E2E database...');
  SeedHelpers.resetDatabase();
  console.log('E2E database ready');
}
