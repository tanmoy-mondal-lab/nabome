import { describe, expect, it } from 'vitest';

import { createBrowserLogger } from './browser.ts';
import { createLogger } from './logger.ts';

describe('logging', () => {
  it('creates an edge-compatible pino logger', () => {
    const logger = createLogger({ level: 'info', requestId: 'req_1' });
    expect(logger).toBeTruthy();
    logger.info({ event: 'test' }, 'hello');
  });

  it('filters levels below threshold in the browser logger', () => {
    const seen: Array<[string, string]> = [];
    const logger = createBrowserLogger({ level: 'warn' }, [
      (level, record) => {
        seen.push([level, String(record.message)]);
      },
    ]);
    logger.info('hidden');
    logger.warn('shown');
    expect(seen).toEqual([['warn', 'shown']]);
  });

  it('propagates child bindings', () => {
    const seen: Array<Record<string, unknown>> = [];
    const logger = createBrowserLogger({ service: 'customer' }, [
      (_level, record) => {
        seen.push(record);
      },
    ]);
    logger.child({ feature: 'cart' }).info('added');
    expect(seen[0]).toMatchObject({ service: 'customer', feature: 'cart' });
  });
});
