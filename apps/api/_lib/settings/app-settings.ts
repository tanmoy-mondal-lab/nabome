import { getPrisma } from '../prisma.ts';

export type SettingsKey =
  | 'global'
  | 'tax'
  | 'commission'
  | 'shipping'
  | 'payment'
  | 'cms'
  | 'notifications'
  | 'feature_flags';

const DEFAULTS: Record<SettingsKey, any> = {
  global: { platformName: 'Nabome', timezone: 'Asia/Kolkata', currency: 'INR' },
  tax: { gstRate: 18, taxIncluded: true },
  commission: { platformCommission: 5, paymentGatewayCommission: 2 },
  shipping: { freeShippingThreshold: 500, defaultShippingRate: 50 },
  payment: { razorpayEnabled: true, codEnabled: true },
  cms: { homepageLayout: 'default', featuredProductsCount: 8 },
  notifications: { emailEnabled: true, smsEnabled: false, pushEnabled: true },
  feature_flags: { enable_wishlist: true, enable_reviews: true },
};

function cloneDefault(key: SettingsKey) {
  return JSON.parse(JSON.stringify(DEFAULTS[key]));
}

export async function getAppSetting<T = any>(key: SettingsKey): Promise<T> {
  try {
    const prisma: any = getPrisma();
    const row = await prisma.appSetting.findUnique({ where: { key } });
    if (row?.value != null) return row.value as T;
  } catch {}
  return cloneDefault(key) as T;
}

export async function setAppSetting(
  key: SettingsKey,
  value: any,
  updatedBy?: string | null,
): Promise<any> {
  const prisma: any = getPrisma();
  const row = await prisma.appSetting.upsert({
    where: { key },
    create: { key, value, updatedBy: updatedBy ?? null },
    update: { value, updatedBy: updatedBy ?? null },
  });
  return row.value;
}

export function getDefault(key: SettingsKey) {
  return cloneDefault(key);
}

export const SETTINGS_DEFAULTS = DEFAULTS;
