// Runs a learner's edited code region in a controlled scope.
// See specs/001-als-map-explorer/contracts/sandbox-scope.md.
//
// We use `new Function(...names, code)` rather than eval: the compiled function
// runs in the GLOBAL scope, not this module's closure, so the only things the
// snippet can reach are the arguments we explicitly inject. Errors are caught and
// returned so a bad edit never blanks or freezes the app (SC-006).

export type SandboxResult = { ok: true } | { ok: false; error: string };

export function runSnippet(code: string, scope: Record<string, unknown>): SandboxResult {
  const names = Object.keys(scope);
  const values = Object.values(scope);
  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function(...names, code);
    fn(...values);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}
