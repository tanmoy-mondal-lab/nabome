/**
 * Environment verification
 * Ensures seeding only happens in safe environments
 */

/**
 * Allowed environments for seeding
 */
const ALLOWED_ENVIRONMENTS = ['development', 'test'] as const;

/**
 * Check if current environment is safe for seeding
 */
export function isSafeEnvironment(): boolean {
  const env = process.env.NODE_ENV;
  
  if (!env) {
    console.warn('⚠️  NODE_ENV not set. Assuming development environment.');
    return true;
  }

  const isAllowed = ALLOWED_ENVIRONMENTS.includes(env as any);
  
  if (!isAllowed) {
    console.error(`❌ Seeding is not allowed in '${env}' environment.`);
    console.error('❌ Allowed environments:', ALLOWED_ENVIRONMENTS.join(', '));
    console.error('❌ To force seeding in this environment, set SEED_FORCE=true (not recommended)');
    
    if (process.env.SEED_FORCE === 'true') {
      console.warn('⚠️  FORCE SEEDING ENABLED - This is dangerous in production!');
      return true;
    }
    
    return false;
  }

  return true;
}

/**
 * Verify environment before seeding
 * Throws error if environment is not safe
 */
export function verifyEnvironment(): void {
  if (!isSafeEnvironment()) {
    throw new Error(
      'Seeding is not allowed in this environment. ' +
      'Set NODE_ENV=development or NODE_ENV=test, or set SEED_FORCE=true to override.'
    );
  }
}

/**
 * Get current environment
 */
export function getCurrentEnvironment(): string {
  return process.env.NODE_ENV || 'development';
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  const env = process.env.NODE_ENV || '';
  return env === 'production';
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  const env = process.env.NODE_ENV || '';
  return env === 'development' || env === '';
}

/**
 * Check if running in test
 */
export function isTest(): boolean {
  const env = process.env.NODE_ENV || '';
  return env === 'test';
}
