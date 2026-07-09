/**
 * Product data generators
 * Generates realistic product data for seeding
 */

import { Gender } from '@prisma/client';

// Size options
export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

// Color options with hex codes
export const COLORS = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Red', hex: '#FF0000' },
  { name: 'Blue', hex: '#0000FF' },
  { name: 'Green', hex: '#008000' },
  { name: 'Yellow', hex: '#FFFF00' },
  { name: 'Pink', hex: '#FFC0CB' },
  { name: 'Orange', hex: '#FFA500' },
  { name: 'Purple', hex: '#800080' },
  { name: 'Brown', hex: '#A52A2A' },
  { name: 'Gray', hex: '#808080' },
  { name: 'Navy', hex: '#000080' },
  { name: 'Maroon', hex: '#800000' },
  { name: 'Teal', hex: '#008080' },
  { name: 'Beige', hex: '#F5F5DC' },
  { name: 'Cream', hex: '#FFFDD0' },
  { name: 'Gold', hex: '#FFD700' },
  { name: 'Silver', hex: '#C0C0C0' },
  { name: 'Coral', hex: '#FF7F50' },
  { name: 'Turquoise', hex: '#40E0D0' },
];

// Material options
export const MATERIALS = [
  'Cotton',
  'Silk',
  'Linen',
  'Wool',
  'Rayon',
  'Polyester',
  'Denim',
  'Chiffon',
  'Georgette',
  'Crepe',
  'Velvet',
  'Satin',
  'Khadi',
  'Handloom',
  'Banarasi',
  'Chanderi',
  'Kota',
  'Cotton Silk',
  'Viscose',
  'Nylon',
];

// Product name templates by category
const PRODUCT_TEMPLATES: Record<string, string[]> = {
  'men-kurtas': [
    'Classic Cotton Kurta',
    'Embroidered Silk Kurta',
    'Solid Linen Kurta',
    'Printed Rayon Kurta',
    'Pathani Suit Kurta',
    'Short Kurta',
    'Long Kurta',
    'Nehru Collar Kurta',
    'Mandarin Collar Kurta',
    'Bandhgala Kurta',
  ],
  'men-sherwanis': [
    'Royal Sherwani',
    'Embroidered Sherwani',
    'Jodhpuri Sherwani',
    'Indo-Western Sherwani',
    'Designer Sherwani',
    'Wedding Sherwani',
    'Classic Sherwani',
    'Festive Sherwani',
  ],
  'men-shirts': [
    'Formal Cotton Shirt',
    'Casual Linen Shirt',
    'Checkered Shirt',
    'Striped Shirt',
    'Solid Shirt',
    'Denim Shirt',
    'Oxford Shirt',
    'Polo Shirt',
    'Flannel Shirt',
  ],
  'men-trousers': [
    'Formal Trousers',
    'Chinos',
    'Cargo Pants',
    'Slim Fit Trousers',
    'Regular Fit Trousers',
    'Pleated Trousers',
    'Flat Front Trousers',
  ],
  'men-jeans': [
    'Slim Fit Jeans',
    'Regular Fit Jeans',
    'Skinny Jeans',
    'Bootcut Jeans',
    'Straight Fit Jeans',
    'Ripped Jeans',
    'Distressed Jeans',
  ],
  'men-tshirts': [
    'Graphic T-Shirt',
    'Solid T-Shirt',
    'Striped T-Shirt',
    'Polo T-Shirt',
    'V-Neck T-Shirt',
    'Round Neck T-Shirt',
    'Henley T-Shirt',
  ],
  'women-sarees': [
    'Banarasi Silk Saree',
    'Cotton Silk Saree',
    'Chiffon Saree',
    'Georgette Saree',
    'Kanjivaram Saree',
    'Patola Saree',
    'Bandhani Saree',
    'Chanderi Saree',
    'Kota Saree',
    'Handloom Saree',
  ],
  'women-kurtas': [
    'Anarkali Kurta',
    'Straight Kurta',
    'A-Line Kurta',
    'Kaftan Kurta',
    'Tunic Kurta',
    'Asymmetric Kurta',
    'Layered Kurta',
    'Shirt Style Kurta',
  ],
  'women-salwar-suits': [
    'Salwar Kameez',
    'Churidar Suit',
    'Palazzo Suit',
    'Patiala Suit',
    'Sharara Suit',
    'Plazzo Suit',
    'Straight Suit',
    'Anarkali Suit',
  ],
  'women-dresses': [
    'Maxi Dress',
    'Midi Dress',
    'Mini Dress',
    'A-Line Dress',
    'Wrap Dress',
    'Shirt Dress',
    'Bodycon Dress',
    'Shift Dress',
    'Fit and Flare Dress',
  ],
  'women-tops': [
    'Peplum Top',
    'Crop Top',
    'Off-Shoulder Top',
    'Cold Shoulder Top',
    'Halter Neck Top',
    'Tank Top',
    'Blouse',
    'Tunic Top',
    'Button Down Top',
  ],
  'women-palazzos': [
    'Solid Palazzo',
    'Printed Palazzo',
    'Striped Palazzo',
    'Embroidered Palazzo',
    'Culottes',
    'Wide Leg Pants',
    'Flowy Palazzo',
  ],
  'women-lehengas': [
    'Bridal Lehenga',
    'Festive Lehenga',
    'Designer Lehenga',
    'A-Line Lehenga',
    'Mermaid Lehenga',
    'Panelled Lehenga',
    'Circular Lehenga',
  ],
  'boys-clothing': [
    'Boys T-Shirt',
    'Boys Shirt',
    'Boys Jeans',
    'Boys Shorts',
    'Boys Trousers',
    'Boys Kurta',
    'Boys Jacket',
  ],
  'girls-clothing': [
    'Girls Frock',
    'Girls Dress',
    'Girls Top',
    'Girls Skirt',
    'Girls Leggings',
    'Girls Kurti',
    'Girls Lehenga',
  ],
  'baby-clothing': [
    'Baby Onesie',
    'Baby Romper',
    'Baby Dress',
    'Baby Shirt',
    'Baby Pants',
    'Baby Bib',
  ],
  'bags': [
    'Handbag',
    'Clutch',
    'Tote Bag',
    'Satchel',
    'Crossbody Bag',
    'Backpack',
    'Shoulder Bag',
    'Sling Bag',
  ],
  'jewelry': [
    'Earrings',
    'Necklace',
    'Bracelet',
    'Bangles',
    'Pendant',
    'Ring',
    'Anklet',
    'Maang Tikka',
  ],
  'watches': [
    'Analog Watch',
    'Digital Watch',
    'Smart Watch',
    'Chronograph Watch',
    'Leather Strap Watch',
    'Metal Strap Watch',
  ],
  'sunglasses': [
    'Aviator Sunglasses',
    'Wayfarer Sunglasses',
    'Cat Eye Sunglasses',
    'Round Sunglasses',
    'Square Sunglasses',
    'Oversized Sunglasses',
  ],
  'belts': [
    'Leather Belt',
    'Canvas Belt',
    'Dress Belt',
    'Casual Belt',
    'Braided Belt',
    'Chain Belt',
  ],
};

// Description templates
const DESCRIPTION_TEMPLATES = [
  'Crafted with premium {material} for exceptional comfort and style. Perfect for {occasion}.',
  'Elegant {material} fabric with intricate {detail}. Ideal for {occasion}.',
  'Contemporary design in {material}. Versatile enough for {occasion}.',
  'Handcrafted {material} with traditional {detail}. A perfect choice for {occasion}.',
  'Premium quality {material} with modern styling. Great for {occasion}.',
];

const OCCASIONS = [
  'everyday wear',
  'special occasions',
  'festive celebrations',
  'casual outings',
  'formal events',
  'parties',
  'office wear',
  'weddings',
];

const DETAILS = [
  'embroidery',
  'prints',
  'weaving patterns',
  'embellishments',
  'textured finish',
  'subtle patterns',
];

// Price ranges by category (in INR)
const PRICE_RANGES: Record<string, { min: number; max: number }> = {
  'men-kurtas': { min: 899, max: 4999 },
  'men-sherwanis': { min: 2999, max: 19999 },
  'men-shirts': { min: 699, max: 2999 },
  'men-trousers': { min: 999, max: 3499 },
  'men-jeans': { min: 1199, max: 4999 },
  'men-tshirts': { min: 499, max: 1999 },
  'women-sarees': { min: 1499, max: 24999 },
  'women-kurtas': { min: 799, max: 4999 },
  'women-salwar-suits': { min: 1299, max: 9999 },
  'women-dresses': { min: 999, max: 5999 },
  'women-tops': { min: 499, max: 2499 },
  'women-palazzos': { min: 699, max: 1999 },
  'women-lehengas': { min: 3999, max: 49999 },
  'boys-clothing': { min: 399, max: 1999 },
  'girls-clothing': { min: 399, max: 2499 },
  'baby-clothing': { min: 299, max: 1499 },
  'bags': { min: 999, max: 9999 },
  'jewelry': { min: 499, max: 19999 },
  'watches': { min: 1499, max: 29999 },
  'sunglasses': { min: 799, max: 5999 },
  'belts': { min: 399, max: 1999 },
};

// Helper functions
export function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, array.length));
}

export function getRandomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function generateProductName(categorySlug: string, brand: string): string {
  const templates = PRODUCT_TEMPLATES[categorySlug] || ['Classic Product'];
  const template = getRandomItem(templates);
  return `${brand} ${template}`;
}

export function generateDescription(material: string): string {
  const template = getRandomItem(DESCRIPTION_TEMPLATES);
  const occasion = getRandomItem(OCCASIONS);
  const detail = getRandomItem(DETAILS);
  return template
    .replace('{material}', material)
    .replace('{occasion}', occasion)
    .replace('{detail}', detail);
}

export function generatePrice(categorySlug: string): number {
  const range = PRICE_RANGES[categorySlug] || { min: 499, max: 4999 };
  return getRandomInRange(range.min, range.max);
}

export function generateSalePrice(basePrice: number): number | null {
  // 30% chance of having a sale
  if (Math.random() < 0.3) {
    const discountPercent = getRandomInRange(10, 40);
    return Math.round(basePrice * (1 - discountPercent / 100));
  }
  return null;
}

export function generateCostPrice(basePrice: number): number {
  // Cost price is typically 40-60% of base price
  return Math.round(basePrice * (getRandomInRange(40, 60) / 100));
}

export function generateGender(categorySlug: string): Gender {
  if (categorySlug.startsWith('men-') || categorySlug === 'boys-clothing') {
    return Gender.men;
  }
  if (categorySlug.startsWith('women-') || categorySlug === 'girls-clothing') {
    return Gender.women;
  }
  return Gender.unisex;
}

export function generateVariantCount(categorySlug: string): number {
  // Accessories typically have fewer variants
  if (['bags', 'jewelry', 'watches', 'sunglasses', 'belts'].includes(categorySlug)) {
    return getRandomInRange(1, 3);
  }
  // Clothing has more variants
  return getRandomInRange(3, 6);
}

export function generateStock(): number {
  // 70% chance of good stock, 20% low stock, 10% out of stock
  const roll = Math.random();
  if (roll < 0.7) {
    return getRandomInRange(20, 100);
  } else if (roll < 0.9) {
    return getRandomInRange(5, 15);
  } else {
    return 0;
  }
}

export function generateSku(productId: string, size: string, color: string): string {
  const prefix = productId.substring(0, 8).toUpperCase();
  const sizeCode = size.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const colorCode = color.substring(0, 3).toUpperCase();
  return `${prefix}-${sizeCode}-${colorCode}`;
}

export function generateAttributes(categorySlug: string, material: string): Array<{ name: string; value: string }> {
  const attributes: Array<{ name: string; value: string }> = [
    { name: 'Material', value: material },
  ];

  // Add category-specific attributes
  if (categorySlug.includes('kurta') || categorySlug.includes('saree') || categorySlug.includes('lehenga')) {
    attributes.push({ name: 'Pattern', value: getRandomItem(['Solid', 'Printed', 'Embroidered', 'Woven', 'Self Design']) });
    attributes.push({ name: 'Fabric', value: material });
  }

  if (categorySlug.includes('dress') || categorySlug.includes('top')) {
    attributes.push({ name: 'Sleeve Length', value: getRandomItem(['Full', 'Half', 'Sleeveless', '3/4 Sleeve']) });
    attributes.push({ name: 'Neck', value: getRandomItem(['Round', 'V-Neck', 'Collar', 'Boat Neck', 'Square']) });
  }

  if (categorySlug.includes('shirt') || categorySlug.includes('trousers') || categorySlug.includes('jeans')) {
    attributes.push({ name: 'Fit', value: getRandomItem(['Slim', 'Regular', 'Relaxed', 'Skinny']) });
    attributes.push({ name: 'Rise', value: getRandomItem(['High', 'Mid', 'Low']) });
  }

  if (categorySlug.includes('saree')) {
    attributes.push({ name: 'Border', value: getRandomItem(['With Border', 'Without Border', 'Contrast Border']) });
    attributes.push({ name: 'Blouse Piece', value: getRandomItem(['Included', 'Not Included']) });
  }

  if (categorySlug === 'bags') {
    attributes.push({ name: 'Closure', value: getRandomItem(['Zipper', 'Magnetic', 'Button', 'Drawstring']) });
    attributes.push({ name: 'Compartments', value: getRandomInRange(1, 4).toString() });
  }

  if (categorySlug === 'jewelry') {
    attributes.push({ name: 'Metal', value: getRandomItem(['Gold Plated', 'Silver Plated', 'Brass', 'Copper']) });
    attributes.push({ name: 'Stone Type', value: getRandomItem(['Kundan', 'Pearl', 'Crystal', 'Beads', 'Uncut']) });
  }

  return attributes;
}

export function generateSeoTitle(name: string, brand: string): string {
  return `${name} by ${brand} | NABOME`;
}

export function generateSeoDescription(name: string, description: string): string {
  return `Buy ${name} online. ${description} Shop now at NABOME for the best prices and quality.`;
}
