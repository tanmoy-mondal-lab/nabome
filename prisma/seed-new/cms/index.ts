/**
 * CMS seed module
 * Seeds static pages and content
 */

import type { SeedModule, SeedContext, SeedResult } from '../shared/types';
import { registry } from '../shared/registry';

export const cmsModule: SeedModule = {
  name: 'cms',
  dependsOn: [],
  idempotent: true,
  transactional: true,
  
  async seed(context: SeedContext): Promise<SeedResult> {
    const startTime = Date.now();
    let count = 0;

    try {
      const pages = [
        {
          title: 'About Us',
          slug: 'about',
          content: {
            sections: [
              {
                type: 'hero',
                title: 'About নবME',
                content: 'Celebrating Traditional Craftsmanship',
              },
              {
                type: 'text',
                content: 'নবME was born from a vision to blend traditional Indian craftsmanship with contemporary design. We work directly with artisans across India to bring you authentic, handcrafted fashion that tells a story.',
              },
              {
                type: 'text',
                content: 'Our mission is to preserve and promote traditional arts while providing fair wages and sustainable livelihoods to skilled artisans. Every purchase supports a craftsperson and helps keep our cultural heritage alive.',
              },
            ],
          },
          template: 'default',
          isPublished: true,
          publishedAt: new Date(),
          metaTitle: 'About Us - নবME',
          metaDesc: 'Learn about নবME and our mission to celebrate traditional Indian craftsmanship.',
        },
        {
          title: 'Contact Us',
          slug: 'contact',
          content: {
            sections: [
              {
                type: 'hero',
                title: 'Contact Us',
                content: 'We are here to help',
              },
              {
                type: 'contact',
                email: 'support@nabome.com',
                phone: '+91 98765 43210',
                address: '123 Fashion Street, Bangalore, Karnataka 560001',
              },
            ],
          },
          template: 'default',
          isPublished: true,
          publishedAt: new Date(),
          metaTitle: 'Contact Us - নবME',
          metaDesc: 'Get in touch with নবME for any queries or support.',
        },
        {
          title: 'Privacy Policy',
          slug: 'privacy',
          content: {
            sections: [
              {
                type: 'hero',
                title: 'Privacy Policy',
                content: 'Your privacy matters to us',
              },
              {
                type: 'text',
                content: 'At নবME, we are committed to protecting your privacy. This policy outlines how we collect, use, and safeguard your personal information.',
              },
            ],
          },
          template: 'default',
          isPublished: true,
          publishedAt: new Date(),
          metaTitle: 'Privacy Policy - নবME',
          metaDesc: 'Read our privacy policy to understand how we protect your data.',
        },
        {
          title: 'Terms and Conditions',
          slug: 'terms',
          content: {
            sections: [
              {
                type: 'hero',
                title: 'Terms and Conditions',
                content: 'Please read carefully',
              },
              {
                type: 'text',
                content: 'By using নবME, you agree to these terms and conditions. Please read them carefully before making a purchase.',
              },
            ],
          },
          template: 'default',
          isPublished: true,
          publishedAt: new Date(),
          metaTitle: 'Terms and Conditions - নবME',
          metaDesc: 'Read our terms and conditions before shopping at নবME.',
        },
        {
          title: 'Shipping Policy',
          slug: 'shipping',
          content: {
            sections: [
              {
                type: 'hero',
                title: 'Shipping Policy',
                content: 'Delivery information',
              },
              {
                type: 'text',
                content: 'We offer free shipping on orders above ₹1000. Standard delivery takes 5-7 business days. Express shipping options are available at checkout.',
              },
            ],
          },
          template: 'default',
          isPublished: true,
          publishedAt: new Date(),
          metaTitle: 'Shipping Policy - নবME',
          metaDesc: 'Learn about our shipping policy and delivery options.',
        },
        {
          title: 'Return Policy',
          slug: 'returns',
          content: {
            sections: [
              {
                type: 'hero',
                title: 'Return Policy',
                content: 'Hassle-free returns',
              },
              {
                type: 'text',
                content: 'We offer easy returns within 30 days of delivery. Items must be unused and in original packaging. Refunds are processed within 7-10 business days.',
              },
            ],
          },
          template: 'default',
          isPublished: true,
          publishedAt: new Date(),
          metaTitle: 'Return Policy - নবME',
          metaDesc: 'Read our return policy for hassle-free shopping.',
        },
        {
          title: 'Refund Policy',
          slug: 'refund',
          content: {
            sections: [
              {
                type: 'hero',
                title: 'Refund Policy',
                content: 'Refund information',
              },
              {
                type: 'text',
                content: 'Refunds are processed to the original payment method within 7-10 business days after we receive and inspect the returned item.',
              },
            ],
          },
          template: 'default',
          isPublished: true,
          publishedAt: new Date(),
          metaTitle: 'Refund Policy - নবME',
          metaDesc: 'Learn about our refund process and timelines.',
        },
        {
          title: 'Care Guide',
          slug: 'care-guide',
          content: {
            sections: [
              {
                type: 'hero',
                title: 'Care Guide',
                content: 'How to care for your garments',
              },
              {
                type: 'text',
                content: 'To maintain the quality of your handcrafted garments, we recommend gentle hand washing or dry cleaning. Avoid harsh detergents and direct sunlight when drying.',
              },
            ],
          },
          template: 'default',
          isPublished: true,
          publishedAt: new Date(),
          metaTitle: 'Care Guide - নবME',
          metaDesc: 'Learn how to care for your নবME garments.',
        },
        {
          title: 'Size Guide',
          slug: 'size-guide',
          content: {
            sections: [
              {
                type: 'hero',
                title: 'Size Guide',
                content: 'Find your perfect fit',
              },
              {
                type: 'text',
                content: 'Please refer to our size chart before making a purchase. If you are between sizes, we recommend sizing up for a more comfortable fit.',
              },
            ],
          },
          template: 'default',
          isPublished: true,
          publishedAt: new Date(),
          metaTitle: 'Size Guide - নবME',
          metaDesc: 'Find your perfect fit with our size guide.',
        },
        {
          title: 'Seller Policy',
          slug: 'seller-policy',
          content: {
            sections: [
              {
                type: 'hero',
                title: 'Seller Policy',
                content: 'For our seller partners',
              },
              {
                type: 'text',
                content: 'We welcome artisans and sellers who share our commitment to quality and authenticity. All sellers must undergo a verification process before listing products.',
              },
            ],
          },
          template: 'default',
          isPublished: true,
          publishedAt: new Date(),
          metaTitle: 'Seller Policy - নবME',
          metaDesc: 'Read our seller policy for partnership information.',
        },
        {
          title: 'Buyer Policy',
          slug: 'buyer-policy',
          content: {
            sections: [
              {
                type: 'hero',
                title: 'Buyer Policy',
                content: 'Shopping guidelines',
              },
              {
                type: 'text',
                content: 'By shopping at নবME, you agree to our buyer policy which outlines your rights and responsibilities as a customer.',
              },
            ],
          },
          template: 'default',
          isPublished: true,
          publishedAt: new Date(),
          metaTitle: 'Buyer Policy - নবME',
          metaDesc: 'Read our buyer policy for shopping guidelines.',
        },
      ];

      for (const page of pages) {
        const existing = await context.prisma.staticPage.findUnique({
          where: { slug: page.slug },
        });

        if (existing) {
          await context.prisma.staticPage.update({
            where: { id: existing.id },
            data: {
              title: page.title,
              content: page.content,
              template: page.template,
              isPublished: page.isPublished,
              publishedAt: page.publishedAt,
              metaTitle: page.metaTitle,
              metaDesc: page.metaDesc,
            },
          });
        } else {
          await context.prisma.staticPage.create({
            data: page,
          });
        }
        count++;
      }

      context.logger.success(`Seeded ${count} CMS pages`);
      
      return {
        success: true,
        count,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        count,
        duration: Date.now() - startTime,
        error: error as Error,
      };
    }
  },
};

registry.register(cmsModule);
