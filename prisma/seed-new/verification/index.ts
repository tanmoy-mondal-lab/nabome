/**
 * Verification seed module
 * Seeds verification attempts and records
 */

import type { SeedModule, SeedContext, SeedResult } from '../shared/types';
import { registry } from '../shared/registry';

// Helper function to get random integer in range
function getRandomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper function to generate random IP address
function generateRandomIP(): string {
  return `${getRandomInRange(1, 255)}.${getRandomInRange(1, 255)}.${getRandomInRange(1, 255)}.${getRandomInRange(1, 255)}`;
}

// Helper function to generate verification code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const verificationModule: SeedModule = {
  name: 'verification',
  dependsOn: ['users'],
  idempotent: true,
  transactional: true,
  
  async seed(context: SeedContext): Promise<SeedResult> {
    const startTime = Date.now();
    let count = 0;

    try {
      context.logger.info('Seeding verification attempts...');
      
      // Get all profiles
      const profiles = await context.prisma.profile.findMany({
        select: { id: true, email: true },
      });
      
      if (profiles.length === 0) {
        context.logger.warn('No profiles found for verification attempts');
        return { success: true, count, duration: Date.now() - startTime };
      }
      
      context.logger.info(`Found ${profiles.length} profiles`);
      
      // Generate verification attempts for a subset of profiles
      // Each profile may have 0-3 verification attempts
      const profilesWithAttempts = profiles.filter(() => Math.random() < 0.5); // 50% of profiles
      
      for (const profile of profilesWithAttempts) {
        const attemptCount = getRandomInRange(1, 3);
        
        for (let i = 0; i < attemptCount; i++) {
          // Determine if this attempt was successful (70% success rate)
          const success = Math.random() < 0.7;
          
          // Generate dates
          const daysAgo = getRandomInRange(1, 30);
          const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
          
          // If not successful and this is the last attempt, lock the account for a short time
          let lockedUntil = null;
          if (!success && i === attemptCount - 1 && Math.random() < 0.3) {
            lockedUntil = new Date(createdAt.getTime() + 15 * 60 * 1000); // 15 minutes lock
          }
          
          await context.prisma.verificationAttempt.create({
            data: {
              profileId: profile.id,
              email: profile.email,
              code: generateVerificationCode(),
              ipAddress: generateRandomIP(),
              success,
              lockedUntil,
              createdAt,
            },
          });
          count++;
        }
      }
      
      context.logger.success(`Seeded ${count} verification attempts`);
      
      return {
        success: true,
        count,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      context.logger.error('Error seeding verification attempts:', error);
      return {
        success: false,
        count,
        duration: Date.now() - startTime,
        error: error as Error,
      };
    }
  },
};

registry.register(verificationModule);
