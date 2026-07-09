/**
 * Addresses seed module
 * Seeds customer addresses
 */

import type { SeedModule, SeedContext, SeedResult } from '../shared/types';
import { registry } from '../shared/registry';

// Customer email to address mappings
const customerAddresses = [
  {
    email: 'priya.sharma@example.com',
    addresses: [
      {
        label: 'Home',
        fullName: 'Priya Sharma',
        phone: '+919876543001',
        line1: '123, Green Park Extension',
        line2: 'A Block, Sector 15',
        city: 'Mumbai',
        district: 'Mumbai City',
        state: 'Maharashtra',
        pincode: '400050',
        country: 'India',
        isDefault: true,
        isBillingDefault: true,
        addressType: 'shipping',
      },
    ],
  },
  {
    email: 'rahul.verma@example.com',
    addresses: [
      {
        label: 'Home',
        fullName: 'Rahul Verma',
        phone: '+919876543002',
        line1: '45, Hauz Khas Village',
        line2: 'Near Deer Park',
        city: 'New Delhi',
        district: 'South Delhi',
        state: 'Delhi',
        pincode: '110016',
        country: 'India',
        isDefault: true,
        isBillingDefault: true,
        addressType: 'shipping',
      },
      {
        label: 'Work',
        fullName: 'Rahul Verma',
        phone: '+919876543002',
        line1: 'Cyber City, Sector 44',
        line2: 'Tower A, 5th Floor',
        city: 'Gurugram',
        district: 'Gurugram',
        state: 'Haryana',
        pincode: '122002',
        country: 'India',
        isDefault: false,
        isBillingDefault: false,
        addressType: 'shipping',
      },
    ],
  },
  {
    email: 'anita.desai@example.com',
    addresses: [
      {
        label: 'Home',
        fullName: 'Anita Desai',
        phone: '+919876543003',
        line1: '78, Koramangala 5th Block',
        line2: '80 Feet Road',
        city: 'Bengaluru',
        district: 'Bengaluru Urban',
        state: 'Karnataka',
        pincode: '560095',
        country: 'India',
        isDefault: true,
        isBillingDefault: true,
        addressType: 'shipping',
      },
    ],
  },
  {
    email: 'vikram.mehta@example.com',
    addresses: [
      {
        label: 'Home',
        fullName: 'Vikram Mehta',
        phone: '+919876543004',
        line1: '12, Salt Lake City',
        line2: 'Sector 3',
        city: 'Kolkata',
        district: 'North 24 Parganas',
        state: 'West Bengal',
        pincode: '700091',
        country: 'India',
        isDefault: true,
        isBillingDefault: true,
        addressType: 'shipping',
      },
    ],
  },
  {
    email: 'sneha.kapoor@example.com',
    addresses: [
      {
        label: 'Home',
        fullName: 'Sneha Kapoor',
        phone: '+919876543005',
        line1: '56, Banjara Hills',
        line2: 'Road No 12',
        city: 'Hyderabad',
        district: 'Hyderabad',
        state: 'Telangana',
        pincode: '500034',
        country: 'India',
        isDefault: true,
        isBillingDefault: true,
        addressType: 'shipping',
      },
    ],
  },
  {
    email: 'arjun.singh@example.com',
    addresses: [
      {
        label: 'Home',
        fullName: 'Arjun Singh',
        phone: '+919876543006',
        line1: '89, Civil Lines',
        line2: 'Near Railway Station',
        city: 'Jaipur',
        district: 'Jaipur',
        state: 'Rajasthan',
        pincode: '302006',
        country: 'India',
        isDefault: true,
        isBillingDefault: true,
        addressType: 'shipping',
      },
    ],
  },
  {
    email: 'meera.nair@example.com',
    addresses: [
      {
        label: 'Home',
        fullName: 'Meera Nair',
        phone: '+919876543007',
        line1: '34, Vyttila',
        line2: 'NH 47 Bypass',
        city: 'Kochi',
        district: 'Ernakulam',
        state: 'Kerala',
        pincode: '682019',
        country: 'India',
        isDefault: true,
        isBillingDefault: true,
        addressType: 'shipping',
      },
    ],
  },
  {
    email: 'karthik.rajan@example.com',
    addresses: [
      {
        label: 'Home',
        fullName: 'Karthik Rajan',
        phone: '+919876543008',
        line1: '67, Adyar',
        line2: 'LB Road',
        city: 'Chennai',
        district: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600020',
        country: 'India',
        isDefault: true,
        isBillingDefault: true,
        addressType: 'shipping',
      },
    ],
  },
  {
    email: 'divya.iyer@example.com',
    addresses: [
      {
        label: 'Home',
        fullName: 'Divya Iyer',
        phone: '+919876543009',
        line1: '23, Koregaon Park',
        line2: 'Lane 7',
        city: 'Pune',
        district: 'Pune',
        state: 'Maharashtra',
        pincode: '411001',
        country: 'India',
        isDefault: true,
        isBillingDefault: true,
        addressType: 'shipping',
      },
    ],
  },
  {
    email: 'rohit.sharma@example.com',
    addresses: [
      {
        label: 'Home',
        fullName: 'Rohit Sharma',
        phone: '+919876543010',
        line1: '91, Connaught Place',
        line2: 'Block A',
        city: 'New Delhi',
        district: 'New Delhi',
        state: 'Delhi',
        pincode: '110001',
        country: 'India',
        isDefault: true,
        isBillingDefault: true,
        addressType: 'shipping',
      },
    ],
  },
  {
    email: 'kavita.reddy@example.com',
    addresses: [
      {
        label: 'Home',
        fullName: 'Kavita Reddy',
        phone: '+919876543011',
        line1: '45, Jubilee Hills',
        line2: 'Road No 36',
        city: 'Hyderabad',
        district: 'Hyderabad',
        state: 'Telangana',
        pincode: '500033',
        country: 'India',
        isDefault: true,
        isBillingDefault: true,
        addressType: 'shipping',
      },
    ],
  },
  {
    email: 'aditya.patel@example.com',
    addresses: [
      {
        label: 'Home',
        fullName: 'Aditya Patel',
        phone: '+919876543012',
        line1: '12, Navrangpura',
        line2: 'Near University',
        city: 'Ahmedabad',
        district: 'Ahmedabad',
        state: 'Gujarat',
        pincode: '380009',
        country: 'India',
        isDefault: true,
        isBillingDefault: true,
        addressType: 'shipping',
      },
    ],
  },
  {
    email: 'pooja.joshi@example.com',
    addresses: [
      {
        label: 'Home',
        fullName: 'Pooja Joshi',
        phone: '+919876543013',
        line1: '78, Malleshwaram',
        line2: '5th Main Road',
        city: 'Bengaluru',
        district: 'Bengaluru Urban',
        state: 'Karnataka',
        pincode: '560003',
        country: 'India',
        isDefault: true,
        isBillingDefault: true,
        addressType: 'shipping',
      },
    ],
  },
  {
    email: 'naveen.kumar@example.com',
    addresses: [
      {
        label: 'Home',
        fullName: 'Naveen Kumar',
        phone: '+919876543014',
        line1: '34, T. Nagar',
        line2: 'Usman Road',
        city: 'Chennai',
        district: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600017',
        country: 'India',
        isDefault: true,
        isBillingDefault: true,
        addressType: 'shipping',
      },
    ],
  },
  {
    email: 'rani.gupta@example.com',
    addresses: [
      {
        label: 'Home',
        fullName: 'Rani Gupta',
        phone: '+919876543015',
        line1: '56, South Extension',
        line2: 'Part 2',
        city: 'New Delhi',
        district: 'South Delhi',
        state: 'Delhi',
        pincode: '110049',
        country: 'India',
        isDefault: true,
        isBillingDefault: true,
        addressType: 'shipping',
      },
    ],
  },
  {
    email: 'suresh.pillai@example.com',
    addresses: [
      {
        label: 'Home',
        fullName: 'Suresh Pillai',
        phone: '+919876543016',
        line1: '23, Thiruvanmiyur',
        line2: 'East Coast Road',
        city: 'Chennai',
        district: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600041',
        country: 'India',
        isDefault: true,
        isBillingDefault: true,
        addressType: 'shipping',
      },
    ],
  },
  {
    email: 'lakshmi.menon@example.com',
    addresses: [
      {
        label: 'Home',
        fullName: 'Lakshmi Menon',
        phone: '+919876543017',
        line1: '67, Vashi',
        line2: 'Sector 17',
        city: 'Navi Mumbai',
        district: 'Thane',
        state: 'Maharashtra',
        pincode: '400703',
        country: 'India',
        isDefault: true,
        isBillingDefault: true,
        addressType: 'shipping',
      },
    ],
  },
  {
    email: 'deepak.chopra@example.com',
    addresses: [
      {
        label: 'Home',
        fullName: 'Deepak Chopra',
        phone: '+919876543018',
        line1: '89, Sector 62',
        line2: 'Noida',
        city: 'Noida',
        district: 'Gautam Buddha Nagar',
        state: 'Uttar Pradesh',
        pincode: '201309',
        country: 'India',
        isDefault: true,
        isBillingDefault: true,
        addressType: 'shipping',
      },
    ],
  },
  {
    email: 'neha.agarwal@example.com',
    addresses: [
      {
        label: 'Home',
        fullName: 'Neha Agarwal',
        phone: '+919876543019',
        line1: '45, DLF Phase 3',
        line2: 'Sector 24',
        city: 'Gurugram',
        district: 'Gurugram',
        state: 'Haryana',
        pincode: '122002',
        country: 'India',
        isDefault: true,
        isBillingDefault: true,
        addressType: 'shipping',
      },
    ],
  },
  {
    email: 'manoj.bhat@example.com',
    addresses: [
      {
        label: 'Home',
        fullName: 'Manoj Bhat',
        phone: '+919876543020',
        line1: '12, Indiranagar',
        line2: '100 Feet Road',
        city: 'Bengaluru',
        district: 'Bengaluru Urban',
        state: 'Karnataka',
        pincode: '560038',
        country: 'India',
        isDefault: true,
        isBillingDefault: true,
        addressType: 'shipping',
      },
    ],
  },
  {
    email: 'swati.das@example.com',
    addresses: [
      {
        label: 'Home',
        fullName: 'Swati Das',
        phone: '+919876543021',
        line1: '78, Salt Lake',
        line2: 'Sector 5',
        city: 'Kolkata',
        district: 'North 24 Parganas',
        state: 'West Bengal',
        pincode: '700091',
        country: 'India',
        isDefault: true,
        isBillingDefault: true,
        addressType: 'shipping',
      },
    ],
  },
  {
    email: 'venkat.ramaswamy@example.com',
    addresses: [
      {
        label: 'Home',
        fullName: 'Venkat Ramaswamy',
        phone: '+919876543022',
        line1: '34, Anna Nagar',
        line2: '3rd Avenue',
        city: 'Chennai',
        district: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600040',
        country: 'India',
        isDefault: true,
        isBillingDefault: true,
        addressType: 'shipping',
      },
    ],
  },
  {
    email: 'reshma.khan@example.com',
    addresses: [
      {
        label: 'Home',
        fullName: 'Reshma Khan',
        phone: '+919876543023',
        line1: '56, Park Street',
        line2: 'Near Mirza Ghalib Street',
        city: 'Kolkata',
        district: 'Kolkata',
        state: 'West Bengal',
        pincode: '700016',
        country: 'India',
        isDefault: true,
        isBillingDefault: true,
        addressType: 'shipping',
      },
    ],
  },
  {
    email: 'amit.jain@example.com',
    addresses: [
      {
        label: 'Home',
        fullName: 'Amit Jain',
        phone: '+919876543024',
        line1: '23, C-Scheme',
        line2: 'Near Jaipur Club',
        city: 'Jaipur',
        district: 'Jaipur',
        state: 'Rajasthan',
        pincode: '302001',
        country: 'India',
        isDefault: true,
        isBillingDefault: true,
        addressType: 'shipping',
      },
    ],
  },
  {
    email: 'sunita.mishra@example.com',
    addresses: [
      {
        label: 'Home',
        fullName: 'Sunita Mishra',
        phone: '+919876543025',
        line1: '67, Bhubaneswar',
        line2: 'Unit 1',
        city: 'Bhubaneswar',
        district: 'Khordha',
        state: 'Odisha',
        pincode: '751001',
        country: 'India',
        isDefault: true,
        isBillingDefault: true,
        addressType: 'shipping',
      },
    ],
  },
  {
    email: 'rajesh.tiwari@example.com',
    addresses: [
      {
        label: 'Home',
        fullName: 'Rajesh Tiwari',
        phone: '+919876543026',
        line1: '89, Lucknow',
        line2: 'Gomti Nagar',
        city: 'Lucknow',
        district: 'Lucknow',
        state: 'Uttar Pradesh',
        pincode: '226010',
        country: 'India',
        isDefault: true,
        isBillingDefault: true,
        addressType: 'shipping',
      },
    ],
  },
  {
    email: 'madhuri.saxena@example.com',
    addresses: [
      {
        label: 'Home',
        fullName: 'Madhuri Saxena',
        phone: '+919876543027',
        line1: '45, Chandigarh',
        line2: 'Sector 21',
        city: 'Chandigarh',
        district: 'Chandigarh',
        state: 'Chandigarh',
        pincode: '160021',
        country: 'India',
        isDefault: true,
        isBillingDefault: true,
        addressType: 'shipping',
      },
    ],
  },
  {
    email: 'sunil.malhotra@example.com',
    addresses: [
      {
        label: 'Home',
        fullName: 'Sunil Malhotra',
        phone: '+919876543028',
        line1: '12, Ludhiana',
        line2: 'Model Town',
        city: 'Ludhiana',
        district: 'Ludhiana',
        state: 'Punjab',
        pincode: '141002',
        country: 'India',
        isDefault: true,
        isBillingDefault: true,
        addressType: 'shipping',
      },
    ],
  },
  {
    email: 'geeta.sen@example.com',
    addresses: [
      {
        label: 'Home',
        fullName: 'Geeta Sen',
        phone: '+919876543029',
        line1: '78, Guwahati',
        line2: 'Dispur',
        city: 'Guwahati',
        district: 'Kamrup Metropolitan',
        state: 'Assam',
        pincode: '781005',
        country: 'India',
        isDefault: true,
        isBillingDefault: true,
        addressType: 'shipping',
      },
    ],
  },
  {
    email: 'prakash.bansal@example.com',
    addresses: [
      {
        label: 'Home',
        fullName: 'Prakash Bansal',
        phone: '+919876543030',
        line1: '34, Faridabad',
        line2: 'Sector 15',
        city: 'Faridabad',
        district: 'Faridabad',
        state: 'Haryana',
        pincode: '121007',
        country: 'India',
        isDefault: true,
        isBillingDefault: true,
        addressType: 'shipping',
      },
    ],
  },
];

export const addressesModule: SeedModule = {
  name: 'addresses',
  dependsOn: ['users'],
  idempotent: true,
  transactional: false,
  
  async seed(context: SeedContext): Promise<SeedResult> {
    const startTime = Date.now();
    let count = 0;

    try {
      context.logger.info('Seeding customer addresses...');
      
      for (const customerData of customerAddresses) {
        // Get the profile by email
        const profile = await context.prisma.profile.findUnique({
          where: { email: customerData.email },
        });
        
        if (!profile) {
          context.logger.warn(`Profile not found for email: ${customerData.email}`);
          continue;
        }
        
        // Seed addresses for this customer
        for (const addressData of customerData.addresses) {
          // Check if address already exists for this profile
          const existingAddress = await context.prisma.address.findFirst({
            where: {
              profileId: profile.id,
              label: addressData.label,
              line1: addressData.line1,
              city: addressData.city,
              pincode: addressData.pincode,
            },
          });

          if (!existingAddress) {
            await context.prisma.address.create({
              data: {
                ...addressData,
                profileId: profile.id,
              },
            });
            count++;
          }
        }
      }
      
      context.logger.success(`Seeded ${count} addresses`);
      
      return {
        success: true,
        count,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      context.logger.error('Error seeding addresses:', error);
      return {
        success: false,
        count,
        duration: Date.now() - startTime,
        error: error as Error,
      };
    }
  },
};

registry.register(addressesModule);
