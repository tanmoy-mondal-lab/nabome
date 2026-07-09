/**
 * Users seed module
 * Seeds admin users and customers
 * Note: Seller role does not exist in current schema - only customer and admin roles are available
 */

import type { SeedModule, SeedContext, SeedResult } from '../shared/types';
import { registry } from '../shared/registry';
import { UserRole } from '@prisma/client';

// Helper function to hash passwords (simple implementation for seed)
async function hashPassword(password: string): Promise<string> {
  // In production, use bcrypt. For seed data, we'll use a simple hash
  // The actual authentication system will handle proper hashing
  return password; // Placeholder - authentication system handles real hashing
}

// Default notification preferences
const defaultNotificationPreferences = {
  email: {
    orderUpdates: true,
    promotions: true,
    newsletter: true,
    account: true,
  },
  sms: {
    orderUpdates: false,
    promotions: false,
  },
  push: {
    orderUpdates: true,
    promotions: true,
  },
};

// Default user preferences
const defaultPreferences = {
  language: 'en',
  currency: 'INR',
  theme: 'light',
  timezone: 'Asia/Kolkata',
};

// Admin users
const adminUsers = [
  {
    email: 'admin@nabome.com',
    firstName: 'Super',
    lastName: 'Admin',
    phone: '+919876543210',
    role: UserRole.admin,
    isActive: true,
    emailVerified: true,
    phoneVerified: true,
    marketingOptIn: false,
    preferences: {
      ...defaultPreferences,
      language: 'en',
      currency: 'INR',
    },
    notificationPreferences: {
      ...defaultNotificationPreferences,
      email: { ...defaultNotificationPreferences.email, promotions: false, newsletter: false },
      sms: { ...defaultNotificationPreferences.sms, orderUpdates: true },
    },
  },
  {
    email: 'operations@nabome.com',
    firstName: 'Operations',
    lastName: 'Manager',
    phone: '+919876543211',
    role: UserRole.admin,
    isActive: true,
    emailVerified: true,
    phoneVerified: true,
    marketingOptIn: false,
    preferences: defaultPreferences,
    notificationPreferences: defaultNotificationPreferences,
  },
  {
    email: 'support@nabome.com',
    firstName: 'Customer',
    lastName: 'Support',
    phone: '+919876543212',
    role: UserRole.admin,
    isActive: true,
    emailVerified: true,
    phoneVerified: true,
    marketingOptIn: false,
    preferences: defaultPreferences,
    notificationPreferences: defaultNotificationPreferences,
  },
];

// Customer users (30 realistic customers)
const customerUsers = [
  {
    email: 'priya.sharma@example.com',
    firstName: 'Priya',
    lastName: 'Sharma',
    phone: '+919876543001',
    role: UserRole.customer,
    isActive: true,
    emailVerified: true,
    phoneVerified: false,
    marketingOptIn: true,
    preferences: defaultPreferences,
    notificationPreferences: defaultNotificationPreferences,
  },
  {
    email: 'rahul.verma@example.com',
    firstName: 'Rahul',
    lastName: 'Verma',
    phone: '+919876543002',
    role: UserRole.customer,
    isActive: true,
    emailVerified: true,
    phoneVerified: true,
    marketingOptIn: true,
    preferences: defaultPreferences,
    notificationPreferences: defaultNotificationPreferences,
  },
  {
    email: 'anita.desai@example.com',
    firstName: 'Anita',
    lastName: 'Desai',
    phone: '+919876543003',
    role: UserRole.customer,
    isActive: true,
    emailVerified: true,
    phoneVerified: false,
    marketingOptIn: true,
    preferences: defaultPreferences,
    notificationPreferences: defaultNotificationPreferences,
  },
  {
    email: 'vikram.mehta@example.com',
    firstName: 'Vikram',
    lastName: 'Mehta',
    phone: '+919876543004',
    role: UserRole.customer,
    isActive: true,
    emailVerified: true,
    phoneVerified: true,
    marketingOptIn: false,
    preferences: defaultPreferences,
    notificationPreferences: defaultNotificationPreferences,
  },
  {
    email: 'sneha.kapoor@example.com',
    firstName: 'Sneha',
    lastName: 'Kapoor',
    phone: '+919876543005',
    role: UserRole.customer,
    isActive: true,
    emailVerified: true,
    phoneVerified: false,
    marketingOptIn: true,
    preferences: defaultPreferences,
    notificationPreferences: defaultNotificationPreferences,
  },
  {
    email: 'arjun.singh@example.com',
    firstName: 'Arjun',
    lastName: 'Singh',
    phone: '+919876543006',
    role: UserRole.customer,
    isActive: true,
    emailVerified: true,
    phoneVerified: true,
    marketingOptIn: true,
    preferences: defaultPreferences,
    notificationPreferences: defaultNotificationPreferences,
  },
  {
    email: 'meera.nair@example.com',
    firstName: 'Meera',
    lastName: 'Nair',
    phone: '+919876543007',
    role: UserRole.customer,
    isActive: true,
    emailVerified: true,
    phoneVerified: false,
    marketingOptIn: true,
    preferences: defaultPreferences,
    notificationPreferences: defaultNotificationPreferences,
  },
  {
    email: 'karthik.rajan@example.com',
    firstName: 'Karthik',
    lastName: 'Rajan',
    phone: '+919876543008',
    role: UserRole.customer,
    isActive: true,
    emailVerified: true,
    phoneVerified: true,
    marketingOptIn: false,
    preferences: defaultPreferences,
    notificationPreferences: defaultNotificationPreferences,
  },
  {
    email: 'divya.iyer@example.com',
    firstName: 'Divya',
    lastName: 'Iyer',
    phone: '+919876543009',
    role: UserRole.customer,
    isActive: true,
    emailVerified: true,
    phoneVerified: false,
    marketingOptIn: true,
    preferences: defaultPreferences,
    notificationPreferences: defaultNotificationPreferences,
  },
  {
    email: 'rohit.sharma@example.com',
    firstName: 'Rohit',
    lastName: 'Sharma',
    phone: '+919876543010',
    role: UserRole.customer,
    isActive: true,
    emailVerified: true,
    phoneVerified: true,
    marketingOptIn: true,
    preferences: defaultPreferences,
    notificationPreferences: defaultNotificationPreferences,
  },
  {
    email: 'kavita.reddy@example.com',
    firstName: 'Kavita',
    lastName: 'Reddy',
    phone: '+919876543011',
    role: UserRole.customer,
    isActive: true,
    emailVerified: true,
    phoneVerified: false,
    marketingOptIn: true,
    preferences: defaultPreferences,
    notificationPreferences: defaultNotificationPreferences,
  },
  {
    email: 'aditya.patel@example.com',
    firstName: 'Aditya',
    lastName: 'Patel',
    phone: '+919876543012',
    role: UserRole.customer,
    isActive: true,
    emailVerified: true,
    phoneVerified: true,
    marketingOptIn: false,
    preferences: defaultPreferences,
    notificationPreferences: defaultNotificationPreferences,
  },
  {
    email: 'pooja.joshi@example.com',
    firstName: 'Pooja',
    lastName: 'Joshi',
    phone: '+919876543013',
    role: UserRole.customer,
    isActive: true,
    emailVerified: true,
    phoneVerified: false,
    marketingOptIn: true,
    preferences: defaultPreferences,
    notificationPreferences: defaultNotificationPreferences,
  },
  {
    email: 'naveen.kumar@example.com',
    firstName: 'Naveen',
    lastName: 'Kumar',
    phone: '+919876543014',
    role: UserRole.customer,
    isActive: true,
    emailVerified: true,
    phoneVerified: true,
    marketingOptIn: true,
    preferences: defaultPreferences,
    notificationPreferences: defaultNotificationPreferences,
  },
  {
    email: 'rani.gupta@example.com',
    firstName: 'Rani',
    lastName: 'Gupta',
    phone: '+919876543015',
    role: UserRole.customer,
    isActive: true,
    emailVerified: true,
    phoneVerified: false,
    marketingOptIn: true,
    preferences: defaultPreferences,
    notificationPreferences: defaultNotificationPreferences,
  },
  {
    email: 'suresh.pillai@example.com',
    firstName: 'Suresh',
    lastName: 'Pillai',
    phone: '+919876543016',
    role: UserRole.customer,
    isActive: true,
    emailVerified: true,
    phoneVerified: true,
    marketingOptIn: false,
    preferences: defaultPreferences,
    notificationPreferences: defaultNotificationPreferences,
  },
  {
    email: 'lakshmi.menon@example.com',
    firstName: 'Lakshmi',
    lastName: 'Menon',
    phone: '+919876543017',
    role: UserRole.customer,
    isActive: true,
    emailVerified: true,
    phoneVerified: false,
    marketingOptIn: true,
    preferences: defaultPreferences,
    notificationPreferences: defaultNotificationPreferences,
  },
  {
    email: 'deepak.chopra@example.com',
    firstName: 'Deepak',
    lastName: 'Chopra',
    phone: '+919876543018',
    role: UserRole.customer,
    isActive: true,
    emailVerified: true,
    phoneVerified: true,
    marketingOptIn: true,
    preferences: defaultPreferences,
    notificationPreferences: defaultNotificationPreferences,
  },
  {
    email: 'neha.agarwal@example.com',
    firstName: 'Neha',
    lastName: 'Agarwal',
    phone: '+919876543019',
    role: UserRole.customer,
    isActive: true,
    emailVerified: true,
    phoneVerified: false,
    marketingOptIn: true,
    preferences: defaultPreferences,
    notificationPreferences: defaultNotificationPreferences,
  },
  {
    email: 'manoj.bhat@example.com',
    firstName: 'Manoj',
    lastName: 'Bhat',
    phone: '+919876543020',
    role: UserRole.customer,
    isActive: true,
    emailVerified: true,
    phoneVerified: true,
    marketingOptIn: false,
    preferences: defaultPreferences,
    notificationPreferences: defaultNotificationPreferences,
  },
  {
    email: 'swati.das@example.com',
    firstName: 'Swati',
    lastName: 'Das',
    phone: '+919876543021',
    role: UserRole.customer,
    isActive: true,
    emailVerified: true,
    phoneVerified: false,
    marketingOptIn: true,
    preferences: defaultPreferences,
    notificationPreferences: defaultNotificationPreferences,
  },
  {
    email: 'venkat.ramaswamy@example.com',
    firstName: 'Venkat',
    lastName: 'Ramaswamy',
    phone: '+919876543022',
    role: UserRole.customer,
    isActive: true,
    emailVerified: true,
    phoneVerified: true,
    marketingOptIn: true,
    preferences: defaultPreferences,
    notificationPreferences: defaultNotificationPreferences,
  },
  {
    email: 'reshma.khan@example.com',
    firstName: 'Reshma',
    lastName: 'Khan',
    phone: '+919876543023',
    role: UserRole.customer,
    isActive: true,
    emailVerified: true,
    phoneVerified: false,
    marketingOptIn: true,
    preferences: defaultPreferences,
    notificationPreferences: defaultNotificationPreferences,
  },
  {
    email: 'amit.jain@example.com',
    firstName: 'Amit',
    lastName: 'Jain',
    phone: '+919876543024',
    role: UserRole.customer,
    isActive: true,
    emailVerified: true,
    phoneVerified: true,
    marketingOptIn: false,
    preferences: defaultPreferences,
    notificationPreferences: defaultNotificationPreferences,
  },
  {
    email: 'sunita.mishra@example.com',
    firstName: 'Sunita',
    lastName: 'Mishra',
    phone: '+919876543025',
    role: UserRole.customer,
    isActive: true,
    emailVerified: true,
    phoneVerified: false,
    marketingOptIn: true,
    preferences: defaultPreferences,
    notificationPreferences: defaultNotificationPreferences,
  },
  {
    email: 'rajesh.tiwari@example.com',
    firstName: 'Rajesh',
    lastName: 'Tiwari',
    phone: '+919876543026',
    role: UserRole.customer,
    isActive: true,
    emailVerified: true,
    phoneVerified: true,
    marketingOptIn: true,
    preferences: defaultPreferences,
    notificationPreferences: defaultNotificationPreferences,
  },
  {
    email: 'madhuri.saxena@example.com',
    firstName: 'Madhuri',
    lastName: 'Saxena',
    phone: '+919876543027',
    role: UserRole.customer,
    isActive: true,
    emailVerified: true,
    phoneVerified: false,
    marketingOptIn: true,
    preferences: defaultPreferences,
    notificationPreferences: defaultNotificationPreferences,
  },
  {
    email: 'sunil.malhotra@example.com',
    firstName: 'Sunil',
    lastName: 'Malhotra',
    phone: '+919876543028',
    role: UserRole.customer,
    isActive: true,
    emailVerified: true,
    phoneVerified: true,
    marketingOptIn: false,
    preferences: defaultPreferences,
    notificationPreferences: defaultNotificationPreferences,
  },
  {
    email: 'geeta.sen@example.com',
    firstName: 'Geeta',
    lastName: 'Sen',
    phone: '+919876543029',
    role: UserRole.customer,
    isActive: true,
    emailVerified: true,
    phoneVerified: false,
    marketingOptIn: true,
    preferences: defaultPreferences,
    notificationPreferences: defaultNotificationPreferences,
  },
  {
    email: 'prakash.bansal@example.com',
    firstName: 'Prakash',
    lastName: 'Bansal',
    phone: '+919876543030',
    role: UserRole.customer,
    isActive: true,
    emailVerified: true,
    phoneVerified: true,
    marketingOptIn: true,
    preferences: defaultPreferences,
    notificationPreferences: defaultNotificationPreferences,
  },
];

export const usersModule: SeedModule = {
  name: 'users',
  dependsOn: [],
  idempotent: true,
  transactional: false,
  
  async seed(context: SeedContext): Promise<SeedResult> {
    const startTime = Date.now();
    let count = 0;

    try {
      context.logger.info('Seeding admin users...');
      
      // Seed admin users
      for (const admin of adminUsers) {
        await context.prisma.profile.upsert({
          where: { email: admin.email },
          update: {
            firstName: admin.firstName,
            lastName: admin.lastName,
            phone: admin.phone,
            role: admin.role,
            isActive: admin.isActive,
            emailVerified: admin.emailVerified,
            phoneVerified: admin.phoneVerified,
            marketingOptIn: admin.marketingOptIn,
            preferences: admin.preferences,
            notificationPreferences: admin.notificationPreferences,
          },
          create: admin,
        });
        count++;
      }
      
      context.logger.success(`Seeded ${adminUsers.length} admin users`);
      
      context.logger.info('Seeding customer users...');
      
      // Seed customer users
      for (const customer of customerUsers) {
        await context.prisma.profile.upsert({
          where: { email: customer.email },
          update: {
            firstName: customer.firstName,
            lastName: customer.lastName,
            phone: customer.phone,
            role: customer.role,
            isActive: customer.isActive,
            emailVerified: customer.emailVerified,
            phoneVerified: customer.phoneVerified,
            marketingOptIn: customer.marketingOptIn,
            preferences: customer.preferences,
            notificationPreferences: customer.notificationPreferences,
          },
          create: customer,
        });
        count++;
      }
      
      context.logger.success(`Seeded ${customerUsers.length} customer users`);
      context.logger.success(`Total users seeded: ${count}`);
      
      return {
        success: true,
        count,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      context.logger.error('Error seeding users:', error);
      return {
        success: false,
        count,
        duration: Date.now() - startTime,
        error: error as Error,
      };
    }
  },
};

registry.register(usersModule);
