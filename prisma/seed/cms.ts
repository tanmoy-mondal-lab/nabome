import { type PrismaClient, SectionType, MenuLocation } from '@prisma/client';

export async function seedCMS(prisma: PrismaClient) {
  // Seed Static Pages
  const pages = [
    {
      title: 'About Us',
      slug: 'about',
      content: {
        sections: [
          {
            type: 'hero',
            title: 'Our Story',
            subtitle: 'Crafting timeless fashion since 2024',
            content: {
              imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80',
            },
          },
          {
            type: 'text',
            title: 'Our Philosophy',
            content: {
              body: 'At নবME, we believe that fashion is more than just clothing—it\'s a form of self-expression. Our collections are thoughtfully curated to blend timeless elegance with contemporary design, creating pieces that transcend seasons and trends.',
            },
          },
          {
            type: 'text',
            title: 'Quality & Craftsmanship',
            content: {
              body: 'Every piece in our collection is crafted with meticulous attention to detail. We partner with skilled artisans and use premium materials to ensure that each garment meets our exacting standards of quality and durability.',
            },
          },
          {
            type: 'text',
            title: 'Sustainability',
            content: {
              body: 'We are committed to sustainable practices throughout our supply chain. From responsibly sourced materials to ethical manufacturing processes, we strive to minimize our environmental impact while creating beautiful, long-lasting fashion.',
            },
          },
        ],
      },
      template: 'default',
      isPublished: true,
      publishedAt: new Date(),
      metaTitle: 'About Us | নবME - Premium Fashion',
      metaDesc: 'Learn about নবME\'s story, philosophy, and commitment to quality and sustainability in fashion.',
    },
    {
      title: 'Contact Us',
      slug: 'contact',
      content: {
        sections: [
          {
            type: 'hero',
            title: 'Get in Touch',
            subtitle: 'We\'d love to hear from you',
            content: {
              imageUrl: 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1200&q=80',
            },
          },
          {
            type: 'contact',
            title: 'Contact Information',
            content: {
              email: 'hello@nabome.online',
              phone: '+91 98765 43210',
              address: '123 Fashion Street, Mumbai, Maharashtra 400001, India',
              hours: 'Monday - Saturday: 10 AM - 7 PM',
            },
          },
          {
            type: 'text',
            title: 'Customer Support',
            content: {
              body: 'Our customer support team is available to assist you with any questions about orders, products, or services. Reach out to us via email or phone, and we\'ll respond within 24 hours.',
            },
          },
        ],
      },
      template: 'default',
      isPublished: true,
      publishedAt: new Date(),
      metaTitle: 'Contact Us | নবME - Premium Fashion',
      metaDesc: 'Contact নবME for any questions about orders, products, or services. We\'re here to help.',
    },
    {
      title: 'Shipping Policy',
      slug: 'shipping-policy',
      content: {
        sections: [
          {
            type: 'hero',
            title: 'Shipping Policy',
            subtitle: 'Free shipping on orders above ₹500',
            content: {},
          },
          {
            type: 'text',
            title: 'Shipping Rates',
            content: {
              body: 'Standard Shipping (5-7 business days): ₹50\nExpress Shipping (2-3 business days): ₹150\nFree Shipping on orders above ₹500',
            },
          },
          {
            type: 'text',
            title: 'International Shipping',
            content: {
              body: 'We currently ship within India only. International shipping will be available soon. Subscribe to our newsletter for updates.',
            },
          },
          {
            type: 'text',
            title: 'Order Processing',
            content: {
              body: 'Orders are processed within 1-2 business days. You will receive a confirmation email with tracking information once your order ships.',
            },
          },
        ],
      },
      template: 'default',
      isPublished: true,
      publishedAt: new Date(),
      metaTitle: 'Shipping Policy | নবME',
      metaDesc: 'Learn about নবME\'s shipping rates, delivery times, and order processing.',
    },
    {
      title: 'Privacy Policy',
      slug: 'privacy-policy',
      content: {
        sections: [
          {
            type: 'hero',
            title: 'Privacy Policy',
            subtitle: 'Your privacy is important to us',
            content: {},
          },
          {
            type: 'text',
            title: 'Information We Collect',
            content: {
              body: 'We collect information you provide directly, including name, email address, shipping address, and payment information. We also collect information about your use of our website.',
            },
          },
          {
            type: 'text',
            title: 'How We Use Your Information',
            content: {
              body: 'We use your information to process orders, send order confirmations, communicate with you about your orders, and improve our services. We do not sell your personal information to third parties.',
            },
          },
          {
            type: 'text',
            title: 'Data Security',
            content: {
              body: 'We implement appropriate security measures to protect your personal information. All payment transactions are encrypted and secure.',
            },
          },
        ],
      },
      template: 'default',
      isPublished: true,
      publishedAt: new Date(),
      metaTitle: 'Privacy Policy | নবME',
      metaDesc: 'Read নবME\'s privacy policy to understand how we collect, use, and protect your information.',
    },
    {
      title: 'Refund Policy',
      slug: 'refund-policy',
      content: {
        sections: [
          {
            type: 'hero',
            title: 'Refund & Return Policy',
            subtitle: 'Easy returns within 30 days',
            content: {},
          },
          {
            type: 'text',
            title: 'Return Policy',
            content: {
              body: 'We accept returns within 30 days of delivery. Items must be unworn, unwashed, and in original packaging with tags attached. Sale items are final sale and cannot be returned.',
            },
          },
          {
            type: 'text',
            title: 'Refund Process',
            content: {
              body: 'Refunds are processed within 7-10 business days after we receive your return. Refunds are credited to the original payment method. You will receive an email confirmation when your refund is processed.',
            },
          },
          {
            type: 'text',
            title: 'Exchange Policy',
            content: {
              body: 'Exchanges are available for different sizes or colors of the same item, subject to availability. To request an exchange, please contact our customer support team.',
            },
          },
        ],
      },
      template: 'default',
      isPublished: true,
      publishedAt: new Date(),
      metaTitle: 'Refund Policy | নবME',
      metaDesc: 'Learn about নবME\'s return and refund policy. Easy returns within 30 days.',
    },
    {
      title: 'Terms & Conditions',
      slug: 'terms-conditions',
      content: {
        sections: [
          {
            type: 'hero',
            title: 'Terms & Conditions',
            subtitle: 'Please read our terms carefully',
            content: {},
          },
          {
            type: 'text',
            title: 'Acceptance of Terms',
            content: {
              body: 'By accessing and using নবME\'s website, you agree to be bound by these Terms & Conditions. If you do not agree to these terms, please do not use our website.',
            },
          },
          {
            type: 'text',
            title: 'Product Information',
            content: {
              body: 'We strive to provide accurate product descriptions and images. However, we do not warrant that descriptions are error-free. Colors may vary slightly due to monitor settings.',
            },
          },
          {
            type: 'text',
            title: 'Pricing & Payment',
            content: {
              body: 'All prices are in Indian Rupees (INR) and include applicable taxes. We reserve the right to modify prices at any time. Payment is due at the time of purchase.',
            },
          },
        ],
      },
      template: 'default',
      isPublished: true,
      publishedAt: new Date(),
      metaTitle: 'Terms & Conditions | নবME',
      metaDesc: 'Read নবME\'s terms and conditions for using our website and making purchases.',
    },
  ];

  for (const page of pages) {
    await prisma.staticPage.upsert({
      where: { slug: page.slug },
      update: page,
      create: page,
    });
  }

  // Seed Homepage Sections
  const homepageSections = [
    {
      sectionType: SectionType.HERO_CAROUSEL,
      title: 'Summer Collection 2024',
      subtitle: 'Discover the essence of elegance',
      content: {
        slides: [
          {
            imageUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1600&q=80',
            title: 'Summer Essentials',
            subtitle: 'Lightweight fabrics for warm days',
            link: '/collections/summer-essentials',
            linkText: 'Shop Now',
          },
          {
            imageUrl: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=1600&q=80',
            title: 'Workwear Edit',
            subtitle: 'Professional yet sophisticated',
            link: '/collections/workwear-edit',
            linkText: 'Explore',
          },
          {
            imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=80',
            title: 'Evening Elegance',
            subtitle: 'Statement pieces for special moments',
            link: '/collections/evening-elegance',
            linkText: 'Discover',
          },
        ],
      },
      sortOrder: 1,
      isActive: true,
    },
    {
      sectionType: SectionType.TRUST_BAR,
      title: null,
      subtitle: null,
      content: {
        items: [
          { icon: 'truck', text: 'Free Shipping above ₹500' },
          { icon: 'shield', text: 'Secure Payment' },
          { icon: 'rotate-ccw', text: 'Easy 30-Day Returns' },
          { icon: 'headphones', text: '24/7 Customer Support' },
        ],
      },
      sortOrder: 2,
      isActive: true,
    },
    {
      sectionType: SectionType.PRODUCT_GRID,
      title: 'New Arrivals',
      subtitle: 'Fresh styles just in',
      content: {
        productIds: [], // Will be populated dynamically
        columns: 4,
        showVariants: false,
      },
      sortOrder: 3,
      isActive: true,
    },
    {
      sectionType: SectionType.EDITORIAL,
      title: 'The Art of Summer Dressing',
      subtitle: 'Master the warm season with effortless elegance',
      content: {
        imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200&q=80',
        body: 'Summer fashion is about embracing lightness while maintaining sophistication. Our curated collection features breathable fabrics like linen, cotton, and silk in timeless silhouettes that transition seamlessly from day to evening.',
        link: '/collections/summer-essentials',
        linkText: 'Shop Summer Collection',
        layout: 'split',
      },
      sortOrder: 4,
      isActive: true,
    },
    {
      sectionType: SectionType.CATEGORY_GRID,
      title: 'Shop by Category',
      subtitle: 'Explore our collections',
      content: {
        columns: 3,
      },
      sortOrder: 5,
      isActive: true,
    },
    {
      sectionType: SectionType.PRODUCT_GRID,
      title: 'Best Sellers',
      subtitle: 'Most loved pieces',
      content: {
        productIds: [],
        columns: 4,
        showVariants: false,
      },
      sortOrder: 6,
      isActive: true,
    },
    {
      sectionType: SectionType.VIDEO_BANNER,
      title: 'Behind the Scenes',
      subtitle: 'Craftsmanship in every detail',
      content: {
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Placeholder
        imageUrl: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1200&q=80',
        overlayText: 'Watch our story unfold',
        link: '/about',
        linkText: 'Learn More',
      },
      sortOrder: 7,
      isActive: true,
    },
    {
      sectionType: SectionType.NEWSLETTER,
      title: 'Join Our Newsletter',
      subtitle: 'Be the first to know about new arrivals and exclusive offers',
      content: {
        placeholder: 'Enter your email',
        buttonText: 'Subscribe',
      },
      sortOrder: 8,
      isActive: true,
    },
  ];

  for (const section of homepageSections) {
    await prisma.homepageSection.create({
      data: section,
    });
  }

  // Seed Navigation Menus
  const navigationMenus = [
    {
      name: 'Header Navigation',
      location: MenuLocation.HEADER,
      items: [
        { label: 'Women', link: '/categories/women', type: 'link' },
        { label: 'Men', link: '/categories/men', type: 'link' },
        { label: 'Collections', link: '/collections', type: 'link' },
        { label: 'Lookbooks', link: '/lookbooks', type: 'link' },
        { label: 'Sale', link: '/products?sale=true', type: 'link' },
      ],
      isActive: true,
    },
    {
      name: 'Footer Navigation',
      location: MenuLocation.FOOTER,
      items: [
        { label: 'Shop', link: '/products', type: 'link' },
        { label: 'Collections', link: '/collections', type: 'link' },
        { label: 'About Us', link: '/about', type: 'link' },
        { label: 'Contact', link: '/contact', type: 'link' },
      ],
      isActive: true,
    },
    {
      name: 'Mobile Navigation',
      location: MenuLocation.MOBILE,
      items: [
        { label: 'Home', link: '/', type: 'link' },
        { label: 'Shop', link: '/products', type: 'link' },
        { label: 'Categories', link: '/categories', type: 'link' },
        { label: 'Account', link: '/account', type: 'link' },
      ],
      isActive: true,
    },
  ];

  for (const menu of navigationMenus) {
    await prisma.navigationMenu.upsert({
      where: { name_location: { name: menu.name, location: menu.location } },
      update: menu,
      create: menu,
    });
  }

  // Seed Footer Sections
  const footerSections = [
    {
      column: 1,
      title: 'Shop',
      contentType: 'links',
      content: {
        links: [
          { label: 'Women', link: '/categories/women' },
          { label: 'Men', link: '/categories/men' },
          { label: 'Accessories', link: '/categories/accessories' },
          { label: 'Footwear', link: '/categories/footwear' },
          { label: 'New Arrivals', link: '/products?new=true' },
        ],
      },
      sortOrder: 1,
      isActive: true,
    },
    {
      column: 2,
      title: 'Company',
      contentType: 'links',
      content: {
        links: [
          { label: 'About Us', link: '/about' },
          { label: 'Careers', link: '/about#careers' },
          { label: 'Press', link: '/about#press' },
          { label: 'Sustainability', link: '/about#sustainability' },
        ],
      },
      sortOrder: 2,
      isActive: true,
    },
    {
      column: 3,
      title: 'Customer Care',
      contentType: 'links',
      content: {
        links: [
          { label: 'Contact Us', link: '/contact' },
          { label: 'Shipping Policy', link: '/shipping-policy' },
          { label: 'Returns & Refunds', link: '/refund-policy' },
          { label: 'Size Guide', link: '/size-guide' },
          { label: 'FAQ', link: '/faq' },
        ],
      },
      sortOrder: 3,
      isActive: true,
    },
    {
      column: 4,
      title: 'Connect',
      contentType: 'social',
      content: {
        socialLinks: [
          { platform: 'instagram', url: 'https://instagram.com/nabome' },
          { platform: 'facebook', url: 'https://facebook.com/nabome' },
          { platform: 'twitter', url: 'https://twitter.com/nabome' },
          { platform: 'pinterest', url: 'https://pinterest.com/nabome' },
        ],
      },
      sortOrder: 4,
      isActive: true,
    },
  ];

  for (const section of footerSections) {
    await prisma.footerSection.create({
      data: section,
    });
  }
}
