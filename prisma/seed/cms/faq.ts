/**
 * FAQ Seed
 * Seeds frequently asked questions
 */

import { prisma } from '../utils/helpers';

export async function seedFAQ() {
  // eslint-disable-next-line no-console
  console.log('❓ Seeding FAQs...');

  const faqs = [
    {
      question: 'What are your shipping options?',
      answer: 'We offer free shipping on orders above ₹999. Standard delivery takes 3-5 business days.',
      category: 'Shipping',
      sort_order: 1,
    },
    {
      question: 'What is your return policy?',
      answer: 'We accept returns within 7 days of delivery. Items must be unworn with original tags attached.',
      category: 'Returns',
      sort_order: 2,
    },
    {
      question: 'How do I track my order?',
      answer: 'You can track your order using the tracking number sent to your email after dispatch.',
      category: 'Orders',
      sort_order: 3,
    },
  ];

  const createdFAQs = [];

  for (const faq of faqs) {
    const created = await prisma.faqs.create({
      data: {
        id: crypto.randomUUID(),
        ...faq,
        is_active: true,
        updated_at: new Date(),
      },
    });
    createdFAQs.push(created);
  }

  return createdFAQs;
}
