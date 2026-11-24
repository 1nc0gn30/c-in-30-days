import type { Exercise } from '../data/curriculum';

export interface CheckItem {
  label: string;
  passed: boolean;
  hint?: string;
}

export interface LocalEvalResult {
  passed: boolean;
  feedback: string;
  checks: CheckItem[];
  simulatedOutput: string | null;
}

/**
 * Strips C block comments and line comments while preserving string literals.
 */
export function stripCComments(source: string): string {
  let out = '';
  let i = 0;
  let inString = false;
  let inChar = false;

  while (i < source.length) {
    const ch = source[i];
    const next = source[i + 1];

    if (inString) {
      out += ch;
      if (ch === '\\' && next !== undefined) {
        out += next;
        i += 2;
        continue;
      }
      if (ch === '"') inString = false;
      i++;
      continue;
    }

    if (inChar) {
      out += ch;
      if (ch === '\\' && next !== undefined) {
        out += next;
        i += 2;
        continue;
      }
      if (ch === "'") inChar = false;
      i++;
      continue;
    }

    if (ch === '"') {
      inString = true;
      out += ch;
      i++;
      continue;
    }
    if (ch === "'") {
      inChar = true;
      out += ch;
      i++;
      continue;
    }

    if (ch === '/' && next === '/') {
      while (i < source.length && source[i] !== '\n') i++;
      continue;
    }

    if (ch === '/' && next === '*') {
      i += 2;
      while (i < source.length && !(source[i] === '*' && source[i + 1] === '/')) {
        if (source[i] === '\n') out += '\n';
        i++;
      }
      i += 2;
      continue;
    }

    out += ch;
    i++;
  }
  return out;
}

/**
 * Verifies balanced (), {}, [] ignoring string and char literals.
 */
export function checkBalancedDelimiters(code: string): { ok: boolean; error?: string } {
  const stack: { ch: string; line: number }[] = [];
  const pairs: Record<string, string> = { ')': '(', '}': '{', ']': '[' };
  let inString = false;
  let inChar = false;
  let line = 1;

  for (let i = 0; i < code.length; i++) {
    const ch = code[i];
    if (ch === '\n') line++;

    if (inString) {
      if (ch === '\\') { i++; continue; }
      if (ch === '"') inString = false;
      continue;
    }
    if (inChar) {
      if (ch === '\\') { i++; continue; }
      if (ch === "'") inChar = false;
      continue;
    }
    if (ch === '"') { inString = true; continue; }
    if (ch === "'") { inChar = true; continue; }

    if (ch === '(' || ch === '{' || ch === '[') {
      stack.push({ ch, line });
    } else if (ch === ')' || ch === '}' || ch === ']') {
      const top = stack.pop();
      if (!top || top.ch !== pairs[ch]) {
        return { ok: false, error: `Unmatched '${ch}' on line ${line}.` };
      }
    }
  }

  if (inString) return { ok: false, error: 'Unterminated string literal (missing closing `"`).' };
  if (inChar) return { ok: false, error: "Unterminated character literal (missing closing `'`)." };
  if (stack.length > 0) {
    const unclosed = stack[stack.length - 1];
    return { ok: false, error: `Unclosed '${unclosed.ch}' opened on line ${unclosed.line}.` };
  }
  return { ok: true };
}

/**
 * Deterministic client-side C11 static and structural verifier.
 * Runs 100% locally in the browser with zero network or API key requirements.
 */
export function evaluateCCodeLocally(exercise: Exercise, userCode: string): LocalEvalResult {
  const stripped = stripCComments(userCode).trim();
  const checks: CheckItem[] = [];

  if (!stripped) {
    return {
      passed: false,
      checks: [{ label: 'Non-empty C source', passed: false, hint: 'Write your C11 solution in the editor.' }],
      feedback: 'The editor is empty. Start by filling in the comments inside `main()`.',
      simulatedOutput: null,
    };
  }

  // 1. Balanced delimiters check
  const balance = checkBalancedDelimiters(stripped);
  checks.push({
    label: 'Balanced braces, brackets & quotes',
    passed: balance.ok,
    hint: balance.error,
  });

  // 2. Entry point check
  if (exercise.requiresMain !== false) {
    const hasMain = /\bint\s+main\s*\(/.test(stripped);
    checks.push({
      label: 'Defines int main(...) entry point',
      passed: hasMain,
      hint: hasMain ? undefined : 'Ensure your program defines `int main(void)` or `int main(int argc, char *argv[])`.',
    });
  }

  // 3. Ensure user modified starter meaningfully (not unchanged boilerplate)
  const normalizedUser = stripped.replace(/\s+/g, ' ');
  const normalizedStarter = stripCComments(exercise.initialCode).trim().replace(/\s+/g, ' ');
  const modifiedStarter = normalizedUser !== normalizedStarter;
  checks.push({
    label: 'Implements exercise logic beyond starter template',
    passed: modifiedStarter,
    hint: modifiedStarter ? undefined : 'Complete the TODO comment in the starter code before running checks.',
  });

  // 4. Exercise-specific semantic/structural rules
  for (const rule of exercise.rules) {
    const regex = new RegExp(rule.pattern, rule.flags || '');
    const ok = regex.test(stripped);
    checks.push({
      label: rule.label,
      passed: ok,
      hint: ok ? undefined : rule.hint,
    });
  }

  const failed = checks.filter((c) => !c.passed);
  const passed = failed.length === 0;

  if (passed) {
    return {
      passed: true,
      checks,
      simulatedOutput: exercise.expectedOutput,
      feedback: `All ${checks.length} local C11 checks passed. Compile locally with \`gcc -Wall -Wextra -std=c11\` to verify on your native toolchain.`,
    };
  }

  const firstHints = failed
    .slice(0, 3)
    .map((f) => `- **${f.label}**: ${f.hint || 'Check syntax and requirements.'}`)
    .join('\n');

  return {
    passed: false,
    checks,
    simulatedOutput: null,
    feedback: `${failed.length} of ${checks.length} checks need attention:\n\n${firstHints}`,
  };
}
