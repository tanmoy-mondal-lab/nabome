/**
 * Support seed module
 * Seeds support tickets and replies
 */

import type { SeedModule, SeedContext, SeedResult } from '../shared/types';
import { registry } from '../shared/registry';
import { SupportTicketStatus, SupportTicketPriority, OrderStatus } from '@prisma/client';

// Helper function to get random items from array
function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Helper function to get random integer in range
function getRandomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Support ticket subjects
const TICKET_SUBJECTS = [
  'Order not received',
  'Wrong item delivered',
  'Payment issue',
  'Product quality issue',
  'Size exchange request',
  'Refund request',
  'Shipping delay',
  'Account access issue',
  'Website not working',
  'General inquiry',
];

// Support ticket messages
const TICKET_MESSAGES = [
  'I placed an order 5 days ago but haven\'t received any shipping confirmation.',
  'The item I received is different from what I ordered. The color is completely wrong.',
  'My payment was deducted but the order was not placed. Please help.',
  'The product quality is not as expected. There are loose threads and poor stitching.',
  'I need to exchange this item for a different size. How can I proceed?',
  'I want to request a refund for my order. The product arrived damaged.',
  'My order has been stuck in "processing" for 3 days. When will it ship?',
  'I cannot log into my account. I keep getting an error message.',
  'The website is not loading properly on my browser. I get a blank page.',
  'I have a question about your return policy. Can you explain it?',
];

// Support ticket status distribution
const STATUS_DISTRIBUTION = {
  open: 0.30,
  in_progress: 0.25,
  resolved: 0.30,
  closed: 0.15,
};

// Support ticket priority distribution
const PRIORITY_DISTRIBUTION = {
  low: 0.20,
  medium: 0.50,
  high: 0.25,
  urgent: 0.05,
};

// Staff replies
const STAFF_REPLIES = [
  'Thank you for reaching out. We are looking into this issue.',
  'I apologize for the inconvenience. Let me check your order details.',
  'We have received your request and are working on a resolution.',
  'Your ticket has been escalated to our specialist team.',
  'I can help you with this. Please provide your order number.',
  'Thank you for your patience. We are processing your request.',
  'I understand your concern. Let me assist you right away.',
];

export const supportModule: SeedModule = {
  name: 'support',
  dependsOn: ['customers', 'orders'],
  idempotent: true,
  transactional: true,
  
  async seed(context: SeedContext): Promise<SeedResult> {
    const startTime = Date.now();
    let ticketCount = 0;
    let replyCount = 0;

    try {
      context.logger.info('Seeding support tickets...');
      
      // Get customer profiles
      const customers = await context.prisma.profile.findMany({
        where: { role: 'customer' },
        select: { id: true, email: true, firstName: true, lastName: true },
      });
      
      // Get admin profiles for assignment
      const admins = await context.prisma.profile.findMany({
        where: { role: 'admin' },
        select: { id: true },
      });
      
      // Get orders for reference
      const orders = await context.prisma.order.findMany({
        where: { profileId: { not: null } },
        select: { id: true, orderNumber: true, profileId: true },
        take: 50,
      });
      
      if (customers.length === 0) {
        context.logger.warn('No customers found for support tickets');
        return { success: true, count: 0, duration: Date.now() - startTime };
      }
      
      context.logger.info(`Found ${customers.length} customers, ${admins.length} admins, ${orders.length} orders`);
      
      // Create support tickets for a subset of customers (about 40%)
      const customersWithTickets = getRandomItems(customers, Math.floor(customers.length * 0.40));
      
      for (const customer of customersWithTickets) {
        // Determine number of tickets for this customer (1-2)
        const ticketCountForCustomer = getRandomInRange(1, 2);
        
        for (let i = 0; i < ticketCountForCustomer; i++) {
          // Determine status
          const statusRoll = Math.random();
          let status: SupportTicketStatus;
          
          if (statusRoll < STATUS_DISTRIBUTION.open) {
            status = SupportTicketStatus.open;
          } else if (statusRoll < STATUS_DISTRIBUTION.open + STATUS_DISTRIBUTION.in_progress) {
            status = SupportTicketStatus.in_progress;
          } else if (statusRoll < STATUS_DISTRIBUTION.open + STATUS_DISTRIBUTION.in_progress + STATUS_DISTRIBUTION.resolved) {
            status = SupportTicketStatus.resolved;
          } else {
            status = SupportTicketStatus.closed;
          }
          
          // Determine priority
          const priorityRoll = Math.random();
          let priority: SupportTicketPriority;
          
          if (priorityRoll < PRIORITY_DISTRIBUTION.low) {
            priority = SupportTicketPriority.low;
          } else if (priorityRoll < PRIORITY_DISTRIBUTION.low + PRIORITY_DISTRIBUTION.medium) {
            priority = SupportTicketPriority.medium;
          } else if (priorityRoll < PRIORITY_DISTRIBUTION.low + PRIORITY_DISTRIBUTION.medium + PRIORITY_DISTRIBUTION.high) {
            priority = SupportTicketPriority.high;
          } else {
            priority = SupportTicketPriority.urgent;
          }
          
          // Get random subject and message
          const subject = getRandomItems(TICKET_SUBJECTS, 1)[0];
          const message = getRandomItems(TICKET_MESSAGES, 1)[0];
          
          // Get customer's order if available (50% chance)
          let orderId = null;
          const customerOrders = orders.filter(o => o.profileId === customer.id);
          if (customerOrders.length > 0 && Math.random() < 0.5) {
            orderId = getRandomItems(customerOrders, 1)[0].id;
          }
          
          // Assign to admin if not open (70% chance for in_progress/resolved/closed)
          let assignedTo = null;
          if (status !== SupportTicketStatus.open && admins.length > 0 && Math.random() < 0.7) {
            assignedTo = getRandomItems(admins, 1)[0].id;
          }
          
          // Generate dates
          const daysAgo = getRandomInRange(1, 60);
          const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
          let resolvedAt = null;
          
          if (status === SupportTicketStatus.resolved || status === SupportTicketStatus.closed) {
            resolvedAt = new Date(createdAt.getTime() + getRandomInRange(1, 7) * 24 * 60 * 60 * 1000);
          }
          
          // Create support ticket
          const ticket = await context.prisma.supportTicket.create({
            data: {
              orderId,
              profileId: customer.id,
              name: `${customer.firstName} ${customer.lastName || ''}`.trim(),
              email: customer.email,
              subject,
              message,
              status,
              priority,
              assignedTo,
              resolvedAt,
              createdAt,
            },
          });
          ticketCount++;
          
          // Add replies based on status
          // Open: 0 replies, In progress: 1-2 replies, Resolved/Closed: 2-3 replies
          let replyCountForTicket = 0;
          if (status === SupportTicketStatus.in_progress) {
            replyCountForTicket = getRandomInRange(1, 2);
          } else if (status === SupportTicketStatus.resolved || status === SupportTicketStatus.closed) {
            replyCountForTicket = getRandomInRange(2, 3);
          }
          
          for (let j = 0; j < replyCountForTicket; j++) {
            const isStaff = j % 2 === 0; // Alternate between staff and customer
            const replyMessage = isStaff 
              ? getRandomItems(STAFF_REPLIES, 1)[0]
              : 'Thank you for the update. I appreciate your help.';
            
            const replyAuthorId = isStaff && assignedTo ? assignedTo : customer.id;
            
            await context.prisma.supportTicketReply.create({
              data: {
                ticketId: ticket.id,
                profileId: replyAuthorId,
                message: replyMessage,
                isStaff,
                createdAt: new Date(createdAt.getTime() + (j + 1) * 24 * 60 * 60 * 1000),
              },
            });
            replyCount++;
          }
        }
      }
      
      context.logger.success(`Seeded ${ticketCount} support tickets with ${replyCount} replies`);
      
      return {
        success: true,
        count: ticketCount + replyCount,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      context.logger.error('Error seeding support tickets:', error);
      return {
        success: false,
        count: ticketCount + replyCount,
        duration: Date.now() - startTime,
        error: error as Error,
      };
    }
  },
};

registry.register(supportModule);
