/**
 * Email Template Seed
 * Seeds email templates
 * Note: Email templates are configured via notification_templates
 * This seed documents the email template configuration
 */

export async function seedEmailTemplates() {
  // eslint-disable-next-line no-console
  console.log('📧 Seeding email template configuration...');

  // Email templates are configured via notification_templates
  // This documents the email template configuration
  const emailTemplateConfig = {
    from: {
      name: 'NABOME',
      email: 'noreply@nabome.online',
    },
    replyTo: 'support@nabome.online',
    branding: {
      logo: 'https://res.cloudinary.com/demo/image/upload/v1234567890/nabome/logo.png',
      primaryColor: '#1a1a1a',
      footerText: '© 2024 NABOME. All rights reserved.',
    },
    templates: {
      orderConfirmation: 'order_placed',
      paymentSuccess: 'payment_success',
      orderShipped: 'order_shipped',
      welcome: 'welcome',
      passwordReset: 'password_reset',
    },
  };

  // eslint-disable-next-line no-console
  console.log('Email template configuration:', emailTemplateConfig);

  return emailTemplateConfig;
}
