import { execSync } from 'child_process';

// Add BigInt serialization support for tests
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

beforeAll(async () => {
  // Reset database before tests
  execSync('npm run db:reset', { stdio: 'inherit' });
});
