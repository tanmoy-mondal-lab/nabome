/**
 * Customer Addresses Seed
 * Seeds default address for customer
 */

import { prisma } from '../utils/helpers';
import { upsertByField } from '../utils/upsert';
import { CUSTOMER_CREDENTIALS } from '../utils/constants';

export async function seedCustomerAddresses(customerId: string) {
  // eslint-disable-next-line no-console
  console.log('📍 Seeding customer addresses...');

  // Use a fixed UUID for address to ensure idempotency
  const addressId = '00000000-0000-0000-0000-000000000006';

  const address = await upsertByField(
    prisma.addresses,
    { id: addressId },
    {
      id: addressId,
      profileId: customerId,
      label: 'Home',
      fullName: `${CUSTOMER_CREDENTIALS.firstName} ${CUSTOMER_CREDENTIALS.lastName}`,
      phone: CUSTOMER_CREDENTIALS.phone,
      line1: '123, Fashion Street',
      line2: 'Andheri West',
      city: 'Mumbai',
      district: 'Mumbai City',
      state: 'Maharashtra',
      pincode: '400058',
      country: 'India',
      isDefault: true,
      isBillingDefault: true,
      addressType: 'shipping',
      updatedAt: new Date(),
    },
    'CustomerAddress'
  );

  return address;
}
