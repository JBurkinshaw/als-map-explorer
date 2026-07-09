import { describe, expect, it } from 'vitest';
import { runSnippet } from '../../src/panels/sandbox';

describe('runSnippet', () => {
  it('runs the code with the injected scope', () => {
    let captured = 0;
    const result = runSnippet('record(42)', { record: (n: number) => (captured = n) });
    expect(result.ok).toBe(true);
    expect(captured).toBe(42);
  });

  it('isolates thrown errors instead of propagating them', () => {
    const result = runSnippet('throw new Error("boom")', {});
    expect(result).toEqual({ ok: false, error: 'boom' });
  });

  it('only exposes injected names (runs in global scope)', () => {
    let injectedType = '';
    let otherType = '';
    runSnippet('record(typeof injected, typeof runSnippet)', {
      injected: 1,
      record: (a: string, b: string) => {
        injectedType = a;
        otherType = b;
      },
    });
    expect(injectedType).toBe('number');
    expect(otherType).toBe('undefined'); // module imports are not reachable
  });
});
