/**
 * Seed system entry point
 * Imports all seed modules and runs the orchestrator
 */

// Import all seed modules to register them
import './settings';
import './roles';
import './permissions';
import './navigation';
import './footer';
import './users';
import './brands';
import './categories';
import './collections';
import './labels';
import './sizes';
import './colors';
import './materials';
import './products';
import './inventory';
import './media';
import './homepage';
import './hero';
import './cms';
import './faq';
import './announcements';
import './blogs';
import './lookbooks';
import './sellers';
import './customers';
import './addresses';
import './wishlist';
import './cart';
import './coupons';
import './orders';
import './payments';
import './shipping';
import './returns';
import './reviews';
import './notifications';
import './support';
import './seo';
import './search';
import './analytics';
import './verification';

// Run the orchestrator
import { main } from './orchestrator';

main().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
