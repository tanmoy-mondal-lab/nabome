/**
 * FAQ seed module
 * Seeds FAQ items by category
 */

import type { SeedModule, SeedContext, SeedResult } from '../shared/types';
import { registry } from '../shared/registry';

export const faqModule: SeedModule = {
  name: 'faq',
  dependsOn: [],
  idempotent: true,
  transactional: true,
  
  async seed(context: SeedContext): Promise<SeedResult> {
    const startTime = Date.now();
    let count = 0;

    try {
      const faqs = [
        // Orders
        { question: 'How can I track my order?', answer: 'Once your order is shipped, you will receive an email with tracking information. You can also track your order from the My Orders section in your account.', category: 'Orders', sortOrder: 0, isActive: true },
        { question: 'Can I modify my order after placing it?', answer: 'Orders can be modified within 2 hours of placement, provided they have not been processed. Please contact our support team immediately for assistance.', category: 'Orders', sortOrder: 1, isActive: true },
        { question: 'What payment methods do you accept?', answer: 'We accept all major credit cards, debit cards, UPI, net banking, and popular wallets including Paytm and PhonePe.', category: 'Orders', sortOrder: 2, isActive: true },
        { question: 'Is cash on delivery available?', answer: 'Yes, we offer cash on delivery for orders below ₹10,000 within India.', category: 'Orders', sortOrder: 3, isActive: true },
        
        // Shipping
        { question: 'What are your shipping charges?', answer: 'We offer free shipping on orders above ₹1000. For orders below ₹1000, a nominal shipping fee of ₹99 applies.', category: 'Shipping', sortOrder: 0, isActive: true },
        { question: 'How long does delivery take?', answer: 'Standard delivery takes 5-7 business days. Express delivery (2-3 business days) is available at an additional cost.', category: 'Shipping', sortOrder: 1, isActive: true },
        { question: 'Do you ship internationally?', answer: 'Currently, we only ship within India. We are working on international shipping and will announce it soon.', category: 'Shipping', sortOrder: 2, isActive: true },
        { question: 'Can I change my shipping address?', answer: 'Address changes can be requested within 24 hours of order placement, before the order is processed. Contact support for assistance.', category: 'Shipping', sortOrder: 3, isActive: true },
        
        // Returns
        { question: 'What is your return policy?', answer: 'We offer easy returns within 30 days of delivery. Items must be unused, in original packaging, and with tags attached.', category: 'Returns', sortOrder: 0, isActive: true },
        { question: 'How do I initiate a return?', answer: 'Go to My Orders, select the order, and click on Return Request. Follow the instructions to complete the process.', category: 'Returns', sortOrder: 1, isActive: true },
        { question: 'How long do refunds take?', answer: 'Refunds are processed within 7-10 business days after we receive and inspect the returned item. The amount is credited to your original payment method.', category: 'Returns', sortOrder: 2, isActive: true },
        { question: 'Are return shipping charges covered?', answer: 'Return shipping is free for defective or wrong items. For other returns, a nominal shipping fee may apply.', category: 'Returns', sortOrder: 3, isActive: true },
        
        // Payments
        { question: 'Is my payment information secure?', answer: 'Yes, we use industry-standard encryption and secure payment gateways. Your payment information is never stored on our servers.', category: 'Payments', sortOrder: 0, isActive: true },
        { question: 'Can I use multiple coupons on one order?', answer: 'No, only one coupon can be applied per order. Coupons cannot be combined with other ongoing offers.', category: 'Payments', sortOrder: 1, isActive: true },
        { question: 'What if my payment fails?', answer: 'If your payment fails, please try again or use a different payment method. If the amount was deducted, it will be refunded within 5-7 business days.', category: 'Payments', sortOrder: 2, isActive: true },
        
        // Account
        { question: 'How do I create an account?', answer: 'Click on Sign Up, enter your details, and verify your email address. You can also sign up using Google or Facebook.', category: 'Account', sortOrder: 0, isActive: true },
        { question: 'I forgot my password. What should I do?', answer: 'Click on Forgot Password on the login page, enter your email, and follow the instructions to reset your password.', category: 'Account', sortOrder: 1, isActive: true },
        { question: 'Can I change my email address?', answer: 'Yes, you can update your email address from Account Settings. You will need to verify the new email address.', category: 'Account', sortOrder: 2, isActive: true },
        { question: 'How do I delete my account?', answer: 'To delete your account, contact our support team. Please note that this action is irreversible and all your data will be permanently deleted.', category: 'Account', sortOrder: 3, isActive: true },
        
        // Seller
        { question: 'How can I become a seller on নবME?', answer: 'Apply through our Seller Registration page. Our team will review your application and verify your business details before approval.', category: 'Seller', sortOrder: 0, isActive: true },
        { question: '.What are the seller fees?', answer: 'We charge a competitive commission on each sale. There are no listing fees or hidden charges. Contact us for detailed fee structure.', category: 'Seller', sortOrder: 1, isActive: true },
        { question: 'How do I manage my inventory?', answer: 'Sellers can manage inventory through the seller dashboard. You can add, edit, or remove products and track stock levels.', category: 'Seller', sortOrder: 2, isActive: true },
        { question: 'When do I receive payments for my sales?', answer: 'Payments are settled within 7-10 business days after order delivery, minus the commission and any applicable fees.', category: 'Seller', sortOrder: 3, isActive: true },
        
        // General
        { question: 'Are your products authentic?', answer: 'Yes, all products are sourced directly from artisans and verified sellers. We guarantee authenticity and quality.', category: 'General', sortOrder: 0, isActive: true },
        { question: 'Do you offer gift wrapping?', answer: 'Yes, gift wrapping is available at checkout for a nominal fee. You can also add a personalized message.', category: 'General', sortOrder: 1, isActive: true },
        { question: 'How can I contact customer support?', answer: 'You can reach us via email at support@nabome.com, phone at +91 98765 43210, or through the contact form on our website.', category: 'General', sortOrder: 2, isActive: true },
        { question: 'Do you have a physical store?', answer: 'Currently, নবME is an online-only marketplace. We do not have physical retail stores.', category: 'General', sortOrder: 3, isActive: true },
      ];

      for (const faq of faqs) {
        const existing = await context.prisma.fAQ.findFirst({
          where: {
            question: faq.question,
            category: faq.category,
          },
        });

        if (existing) {
          await context.prisma.fAQ.update({
            where: { id: existing.id },
            data: {
              answer: faq.answer,
              sortOrder: faq.sortOrder,
              isActive: faq.isActive,
            },
          });
        } else {
          await context.prisma.fAQ.create({
            data: faq,
          });
        }
        count++;
      }

      context.logger.success(`Seeded ${count} FAQ entries`);
      
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

registry.register(faqModule);
