import type { DayContent } from './curriculum';

export const curriculumPart1: DayContent[] = [
  {
    day: 1,
    week: 1,
    title: "Introduction and Setup",
    summary: "Understand the C11 compilation pipeline, entry point, and standard output.",
    concepts: ["gcc -Wall -Wextra", "int main(void)", "stdio.h", "printf"],
    lessonMarkdown: `# Day 1: Introduction and Setup

C compiles directly to native machine instructions with no garbage collector or runtime VM. That gives you predictable memory layout and microsecond latency, which is why operating systems, databases, and embedded firmware rely on C.

## Anatomy of a Minimal C11 Program

\`\`\`c
#include <stdio.h>

int main(void) {
    printf("Hello, World!\\n");
    return 0;
}
\`\`\`

- \`#include <stdio.h>\` pulls in declarations for \`printf\`, \`puts\`, and buffered streams.
- \`int main(void)\` is the standard C11 entry point taking zero arguments.
- \`return 0;\` reports exit status \`0\` (success) to the operating system.

## Compile With Warnings Enabled

Always compile with strict flags so the compiler catches bugs before runtime:

\`\`\`bash
gcc -Wall -Wextra -std=c11 day01.c -o day01 && ./day01
\`\`\`

> **Systems Habit:** Never ignore compiler warnings. Adding \`-Wall -Wextra\` turns silent undefined behavior into immediate diagnostics.`,
    quiz: [
      {
        question: "Which function is the mandatory entry point of a hosted C program?",
        options: ["start()", "main()", "init()", "run()"],
        correctAnswerIndex: 1,
        explanation: "Every hosted C program starts execution at main(), which returns an int exit status to the OS."
      },
      {
        question: "Why do systems programmers compile with `-Wall -Wextra -std=c11`?",
        options: [
          "It runs C code inside a virtual machine",
          "It enables broad diagnostics and locks syntax to ISO C11",
          "It automatically frees heap allocations",
          "It disables linking with libc"
        ],
        correctAnswerIndex: 1,
        explanation: "-Wall -Wextra surfaces suspicious constructs at compile time, and -std=c11 enforces ISO C11 semantics."
      }
    ],
    exercise: {
      description: "Write a C11 program that prints `Welcome to C!` followed by a newline using `printf`.",
      initialCode: `#include <stdio.h>\n\nint main(void) {\n    // Print Welcome to C! followed by a newline\n    \n    return 0;\n}\n`,
      solutionCode: `#include <stdio.h>\n\nint main(void) {\n    printf("Welcome to C!\\n");\n    return 0;\n}\n`,
      expectedOutput: "Welcome to C!",
      hint: "Call printf(\"Welcome to C!\\n\"); inside main() before return 0;.",
      rules: [
        { label: "Includes <stdio.h>", pattern: "#include\\s*<stdio\\.h>", hint: "Add #include <stdio.h> at the top." },
        { label: "Calls printf with Welcome to C!", pattern: "printf\\s*\\(\\s*\"Welcome to C!\\\\n\"", hint: "Use printf(\"Welcome to C!\\n\");." },
        { label: "Returns 0 from main", pattern: "return\\s+0\\s*;", hint: "Return 0 at the end of main()." }
      ]
    }
  },
  {
    day: 2,
    week: 1,
    title: "Variables and Data Types",
    summary: "Declare strongly typed primitives, inspect byte sizes with sizeof, and format output.",
    concepts: ["int / double / char", "sizeof", "format specifiers", "stdint.h"],
    lessonMarkdown: `# Day 2: Variables and Data Types

Every variable in C has a fixed compile-time type and byte width. Knowing exact sizes lets you reason about RAM usage and binary protocols.

## Core Primitive Types

| Type | Typical Width (LP64) | Format Specifier | Example |
| --- | --- | --- | --- |
| \`char\` | 1 byte | \`%c\` | \`'C'\` |
| \`int\` | 4 bytes | \`%d\` | \`2026\` |
| \`double\` | 8 bytes | \`%.2f\` | \`3.14\` |
| \`size_t\` | 8 bytes | \`%zu\` | \`sizeof(int)\` |

\`\`\`c
#include <stdio.h>

int main(void) {
    int year = 2026;
    double pi = 3.14159;
    char grade = 'A';

    printf("Year: %d | Pi: %.2f | Grade: %c\\n", year, pi, grade);
    printf("sizeof(int) = %zu bytes\\n", sizeof(year));
    return 0;
}
\`\`\`

> **Watch Out:** Mismatched \`printf\` specifiers (like passing a \`double\` to \`%d\`) cause undefined behavior. Always use \`%zu\` for \`sizeof\`.`,
    quiz: [
      {
        question: "Which format specifier safely prints the result of `sizeof(int)` in C11?",
        options: ["%d", "%zu", "%c", "%f"],
        correctAnswerIndex: 1,
        explanation: "sizeof evaluates to type size_t, whose standard printf specifier is %zu."
      },
      {
        question: "Which type stores a single ASCII character like `'K'`?",
        options: ["string", "char", "byte", "rune"],
        correctAnswerIndex: 1,
        explanation: "C has no built-in string keyword; single characters use the 1-byte char type."
      }
    ],
    exercise: {
      description: "Declare an `int year = 2026;` and a `char tier = 'C';`, then print `C-2026` using `printf`.",
      initialCode: `#include <stdio.h>\n\nint main(void) {\n    // Declare int year and char tier\n    \n    // Print using %c and %d\n    \n    return 0;\n}\n`,
      solutionCode: `#include <stdio.h>\n\nint main(void) {\n    int year = 2026;\n    char tier = 'C';\n    printf("%c-%d\\n", tier, year);\n    return 0;\n}\n`,
      expectedOutput: "C-2026",
      hint: "Declare int year = 2026; and char tier = 'C'; then call printf(\"%c-%d\\n\", tier, year);",
      rules: [
        { label: "Declares int year = 2026", pattern: "int\\s+year\\s*=\\s*2026\\s*;", hint: "Add int year = 2026;." },
        { label: "Declares char tier = 'C'", pattern: "char\\s+tier\\s*=\\s*'C'\\s*;", hint: "Add char tier = 'C';." },
        { label: "Prints formatted tier and year", pattern: "printf\\s*\\([^;]*%c[^;]*%d[^;]*tier[^;]*year", hint: "Use printf(\"%c-%d\\n\", tier, year);." }
      ]
    }
  },
  {
    day: 3,
    week: 1,
    title: "Operators and Expressions",
    summary: "Master integer division, modulo, bitwise masks, and operator precedence.",
    concepts: ["integer division", "modulo %", "bitwise & | <<", "precedence"],
    lessonMarkdown: `# Day 3: Operators and Expressions

C operators map nearly 1-to-1 to CPU ALU instructions. Two behaviors trip up beginners most often: **truncating integer division** and **bitwise vs. logical operators**.

## Arithmetic vs. Bitwise Operators

\`\`\`c
#include <stdio.h>

int main(void) {
    int a = 17, b = 5;
    printf("div=%d rem=%d\\n", a / b, a % b);   // 3 and 2
    printf("float=%.2f\\n", (double)a / b);    // 3.40

    unsigned int flags = 0;
    flags |= (1u << 2);                        // Set bit 2 (value 4)
    printf("bit2=%u\\n", (flags & (1u << 2)) != 0);
    return 0;
}
\`\`\`

- \`17 / 5\` evaluates to \`3\`, not \`3.4\`. Cast at least one operand to \`double\` for floating-point division.
- \`&\` is bitwise AND; \`&&\` is short-circuit logical AND.

> **Tip:** Parenthesize mixed bitwise and comparison expressions—\`==\` binds tighter than \`&\` in C!`,
    quiz: [
      {
        question: "What does the C expression `7 / 2` evaluate to?",
        options: ["3.5", "3", "4", "Compile error"],
        correctAnswerIndex: 1,
        explanation: "Dividing two integers performs truncating integer division, discarding the fractional part."
      },
      {
        question: "Which expression sets bit 3 of an `unsigned int mask` without clearing other bits?",
        options: ["mask &= (1u << 3)", "mask |= (1u << 3)", "mask == (1u << 3)", "mask >> 3"],
        correctAnswerIndex: 1,
        explanation: "Bitwise OR assignment (|=) turns on the target bit while preserving all existing bits."
      }
    ],
    exercise: {
      description: "Compute the quotient and remainder of `19` divided by `4` using `/` and `%`, and print `q=4 r=3`.",
      initialCode: `#include <stdio.h>\n\nint main(void) {\n    int n = 19;\n    int d = 4;\n    // Compute quotient and remainder\n    \n    return 0;\n}\n`,
      solutionCode: `#include <stdio.h>\n\nint main(void) {\n    int n = 19;\n    int d = 4;\n    int q = n / d;\n    int r = n % d;\n    printf("q=%d r=%d\\n", q, r);\n    return 0;\n}\n`,
      expectedOutput: "q=4 r=3",
      hint: "Compute int q = n / d; and int r = n % d; then print with printf(\"q=%d r=%d\\n\", q, r);.",
      rules: [
        { label: "Uses integer division /", pattern: "n\\s*/\\s*d", hint: "Compute quotient with n / d." },
        { label: "Uses modulo operator %", pattern: "n\\s*%\\s*d", hint: "Compute remainder with n % d." },
        { label: "Prints q and r", pattern: "printf\\s*\\([^;]*q=%d\\s+r=%d", hint: "Print using printf(\"q=%d r=%d\\n\", q, r);." }
      ]
    }
  },
  {
    day: 4,
    week: 1,
    title: "Control Flow: If/Else Statements",
    summary: "Branch safely with relational logic, boolean headers, and guard clauses.",
    concepts: ["if / else if", "stdbool.h", "short-circuit && ||", "guard clauses"],
    lessonMarkdown: `# Day 4: Control Flow — If / Else

In C, \`0\` is false and **any non-zero integer** is true. Including \`<stdbool.h>\` gives you readable \`bool\`, \`true\`, and \`false\`.

## Branching & Short-Circuit Evaluation

\`\`\`c
#include <stdio.h>
#include <stdbool.h>

int main(void) {
    int temp = 82;
    bool fan_ok = true;

    if (temp >= 85 || !fan_ok) {
        printf("CRITICAL\\n");
    } else if (temp >= 70) {
        printf("WARM\\n");
    } else {
        printf("NOMINAL\\n");
    }
    return 0;
}
\`\`\`

- \`a && b\` stops evaluating \`b\` if \`a\` is false—critical for null-pointer guards like \`if (ptr != NULL && *ptr > 0)\`.
- Always use braces \`{ }\` even for one-line branches to prevent dangling-else bugs.

> **Classic Bug:** Writing \`if (x = 5)\` assigns \`5\` instead of comparing. \`-Wall\` warns you immediately.`,
    quiz: [
      {
        question: "How does C evaluate `if (-1)`?",
        options: ["False, because it is negative", "True, because any non-zero value is truthy", "Compile-time error", "Undefined behavior"],
        correctAnswerIndex: 1,
        explanation: "Only 0 (and NULL) is false in C; every non-zero scalar evaluates to true."
      },
      {
        question: "Why is `if (p != NULL && *p == 10)` safe when `p` is `NULL`?",
        options: [
          "C ignores NULL dereferences inside if conditions",
          "&& short-circuits and never evaluates *p when p != NULL is false",
          "The compiler reorders the operands",
          "NULL equals 10 on 64-bit systems"
        ],
        correctAnswerIndex: 1,
        explanation: "Logical AND guarantees left-to-right short-circuiting: if the left side is false, the right side is skipped."
      }
    ],
    exercise: {
      description: "Given `int score = 88;`, print `PASS` if `score >= 70`, otherwise print `RETRY`.",
      initialCode: `#include <stdio.h>\n\nint main(void) {\n    int score = 88;\n    // Write your if / else branch\n    \n    return 0;\n}\n`,
      solutionCode: `#include <stdio.h>\n\nint main(void) {\n    int score = 88;\n    if (score >= 70) {\n        printf("PASS\\n");\n    } else {\n        printf("RETRY\\n");\n    }\n    return 0;\n}\n`,
      expectedOutput: "PASS",
      hint: "Use if (score >= 70) { printf(\"PASS\\n\"); } else { printf(\"RETRY\\n\"); }",
      rules: [
        { label: "Checks score >= 70", pattern: "if\\s*\\(\\s*score\\s*>=\\s*70\\s*\\)", hint: "Check if (score >= 70)." },
        { label: "Has an else branch", pattern: "\\belse\\b", hint: "Include an else branch for RETRY." },
        { label: "Prints PASS and RETRY", pattern: "PASS[\\s\\S]*RETRY|RETRY[\\s\\S]*PASS", hint: "Print PASS in the true branch and RETRY in the false branch." }
      ]
    }
  },
  {
    day: 5,
    week: 1,
    title: "Control Flow: Switch Statement",
    summary: "Dispatch integral states cleanly with switch/case, break, and default.",
    concepts: ["switch / case", "break", "fallthrough", "default"],
    lessonMarkdown: `# Day 5: Switch Statements

When dispatching on an integer or \`enum\`, \`switch\` communicates intent more clearly than a chain of \`else if\` blocks—and compilers can lower dense cases into a constant-time jump table.

\`\`\`c
#include <stdio.h>

int main(void) {
    char cmd = 'r';
    switch (cmd) {
        case 'r':
            printf("READ\\n");
            break;
        case 'w':
            printf("WRITE\\n");
            break;
        default:
            printf("UNKNOWN\\n");
            break;
    }
    return 0;
}
\`\`\`

- Always end each case with \`break;\` (or \`return;\`) unless fallthrough is intentional.
- Always include a \`default:\` branch to catch unexpected inputs.

> **Constraint:** C \`switch\` cases must be compile-time integer constants (\`int\`, \`char\`, \`enum\`)—never strings.`,
    quiz: [
      {
        question: "What happens if you omit `break;` at the end of a matched `case`?",
        options: [
          "The switch exits automatically",
          "Execution falls through into the next case body",
          "The program crashes with SIGSEGV",
          "It triggers a mandatory compiler error"
        ],
        correctAnswerIndex: 1,
        explanation: "C switch cases fall through sequentially until a break, return, or end of the switch block."
      },
      {
        question: "Which type is NOT valid as a `switch` expression in C?",
        options: ["int", "char", "enum", "char * (string)"],
        correctAnswerIndex: 3,
        explanation: "switch only operates on integer types; strings must be compared with strcmp()."
      }
    ],
    exercise: {
      description: "Use a `switch` statement on `int code = 2;` to print `OK` for `1`, `WARN` for `2`, and `ERR` in `default`.",
      initialCode: `#include <stdio.h>\n\nint main(void) {\n    int code = 2;\n    // Switch on code\n    \n    return 0;\n}\n`,
      solutionCode: `#include <stdio.h>\n\nint main(void) {\n    int code = 2;\n    switch (code) {\n        case 1:\n            printf("OK\\n");\n            break;\n        case 2:\n            printf("WARN\\n");\n            break;\n        default:\n            printf("ERR\\n");\n            break;\n    }\n    return 0;\n}\n`,
      expectedOutput: "WARN",
      hint: "Write switch (code) with case 1:, case 2:, default:, and break; in each case.",
      rules: [
        { label: "Uses switch (code)", pattern: "switch\\s*\\(\\s*code\\s*\\)", hint: "Start with switch (code) { ... }." },
        { label: "Handles case 1, case 2, and default", pattern: "case\\s+1\\s*:[\\s\\S]*case\\s+2\\s*:[\\s\\S]*default\\s*:", hint: "Include case 1:, case 2:, and default:." },
        { label: "Includes break statements", pattern: "\\bbreak\\s*;", hint: "Add break; to prevent fallthrough." }
      ]
    }
  },
  {
    day: 6,
    week: 1,
    title: "Loops: The While Loop",
    summary: "Repeat condition-driven work safely while guaranteeing loop termination.",
    concepts: ["while loop", "loop invariant", "termination", "countdown"],
    lessonMarkdown: `# Day 6: The While Loop

A \`while\` loop evaluates its condition **before** every iteration. Use it when the number of steps depends on runtime state (reading bytes from a socket, draining a queue, or counting down).

\`\`\`c
#include <stdio.h>

int main(void) {
    int n = 5;
    int sum = 0;

    while (n > 0) {
        sum += n;
        n--;
    }
    printf("sum=%d\\n", sum); // 15
    return 0;
}
\`\`\`

- Verify two invariants on every \`while\`: the condition variable is **initialized before entry** and **progresses toward termination** inside the body.

> **Pitfall:** Putting a stray semicolon after \`while (n > 0);\` creates an infinite empty loop.`,
    quiz: [
      {
        question: "If a `while` condition is false on entry, how many times does the loop body run?",
        options: ["0 times", "1 time", "Infinitely", "Depends on compiler flags"],
        correctAnswerIndex: 0,
        explanation: "while is a pre-test loop; if the condition starts false, the body never executes."
      },
      {
        question: "What causes an infinite `while` loop most frequently?",
        options: [
          "Using int instead of double",
          "Forgetting to update the state variable tested by the condition",
          "Putting printf inside the loop",
          "Returning 0 after the loop"
        ],
        correctAnswerIndex: 1,
        explanation: "If the loop condition can never transition to false, the loop never terminates."
      }
    ],
    exercise: {
      description: "Use a `while` loop to sum integers from `1` to `5` into `sum` and print `sum=15`.",
      initialCode: `#include <stdio.h>\n\nint main(void) {\n    int i = 1;\n    int sum = 0;\n    // Add 1..5 using a while loop\n    \n    printf("sum=%d\\n", sum);\n    return 0;\n}\n`,
      solutionCode: `#include <stdio.h>\n\nint main(void) {\n    int i = 1;\n    int sum = 0;\n    while (i <= 5) {\n        sum += i;\n        i++;\n    }\n    printf("sum=%d\\n", sum);\n    return 0;\n}\n`,
      expectedOutput: "sum=15",
      hint: "Loop with while (i <= 5) { sum += i; i++; }",
      rules: [
        { label: "Uses a while loop", pattern: "while\\s*\\([^)]*i[^)]*\\)", hint: "Use while (i <= 5)." },
        { label: "Accumulates into sum", pattern: "sum\\s*(\\+=|=\\s*sum\\s*\\+)", hint: "Add i into sum each iteration." },
        { label: "Increments i", pattern: "(\\+\\+\\s*i|i\\s*\\+\\+|i\\s*\\+=\\s*1|i\\s*=\\s*i\\s*\\+\\s*1)", hint: "Increment i inside the loop so it terminates." }
      ]
    }
  },
  {
    day: 7,
    week: 2,
    title: "Loops: The For Loop",
    summary: "Write tight counted iterations with C11 loop-scoped index variables.",
    concepts: ["for (init; cond; step)", "loop scope", "off-by-one", "half-open [0, n)"],
    lessonMarkdown: `# Day 7: The For Loop

The \`for\` loop keeps initialization, continuation check, and step increment on a single scannable line. Since C99/C11, you can declare the loop counter right inside the header so it stays tightly scoped.

\`\`\`c
#include <stdio.h>

int main(void) {
    int product = 1;
    for (int i = 1; i <= 5; i++) {
        product *= i;
    }
    printf("5! = %d\\n", product); // 120
    return 0;
}
\`\`\`

- Prefer half-open ranges \`for (int i = 0; i < n; i++)\` when iterating arrays—it runs exactly \`n\` times and prevents off-by-one buffer overruns.

> **Style:** Keep the counter \`i\` scoped inside \`for (int i = 0; ...)\` so it cannot leak into surrounding code.`,
    quiz: [
      {
        question: "How many iterations does `for (int i = 0; i < 10; i++)` execute?",
        options: ["9", "10", "11", "0"],
        correctAnswerIndex: 1,
        explanation: "i takes values 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 — exactly 10 iterations."
      },
      {
        question: "Where is `i` accessible when declared as `for (int i = 0; i < 5; i++)` in C11?",
        options: ["Globally across the file", "Throughout main()", "Only inside the for loop", "Only after the loop"],
        correctAnswerIndex: 2,
        explanation: "Loop-header declarations have block scope restricted to the for statement itself."
      }
    ],
    exercise: {
      description: "Use a `for` loop to compute `5!` (factorial of 5) and print `fact=120`.",
      initialCode: `#include <stdio.h>\n\nint main(void) {\n    int fact = 1;\n    // Multiply fact by 1..5 using a for loop\n    \n    printf("fact=%d\\n", fact);\n    return 0;\n}\n`,
      solutionCode: `#include <stdio.h>\n\nint main(void) {\n    int fact = 1;\n    for (int i = 1; i <= 5; i++) {\n        fact *= i;\n    }\n    printf("fact=%d\\n", fact);\n    return 0;\n}\n`,
      expectedOutput: "fact=120",
      hint: "Use for (int i = 1; i <= 5; i++) { fact *= i; }",
      rules: [
        { label: "Uses a for loop", pattern: "for\\s*\\([^;]+;[^;]+;[^)]+\\)", hint: "Write a for (init; cond; step) loop." },
        { label: "Multiplies into fact", pattern: "fact\\s*(\\*=|=\\s*fact\\s*\\*)", hint: "Update fact *= i; inside the loop." },
        { label: "Prints fact=120", pattern: "printf\\s*\\([^;]*fact=%d", hint: "Keep printf(\"fact=%d\\n\", fact);." }
      ]
    }
  },
  {
    day: 8,
    week: 2,
    title: "Loops: Do-While and Loop Control",
    summary: "Control loop flow with post-test do-while, break, and continue.",
    concepts: ["do-while", "break", "continue", "early exit"],
    lessonMarkdown: `# Day 8: Do-While, Break, and Continue

A \`do-while\` loop executes its body **at least once** before checking the condition—ideal for menus, retry loops, or parsing at least one digit of an integer.

\`\`\`c
#include <stdio.h>

int main(void) {
    int sum = 0;
    for (int i = 1; i <= 10; i++) {
        if (i % 2 == 0) {
            continue; // skip even numbers
        }
        if (i > 7) {
            break;    // stop early after 7
        }
        sum += i;     // 1 + 3 + 5 + 7 = 16
    }
    printf("odd_sum=%d\\n", sum);
    return 0;
}
\`\`\`

- \`continue\` jumps straight to the next iteration's step/condition check.
- \`break\` exits only the **innermost** enclosing loop or \`switch\`.`,
    quiz: [
      {
        question: "What is the key difference between `while` and `do-while`?",
        options: [
          "do-while is faster on x86 CPUs",
          "do-while always executes its body at least once before testing the condition",
          "while cannot use break",
          "do-while omits the trailing semicolon"
        ],
        correctAnswerIndex: 1,
        explanation: "do-while checks its condition at the bottom of the loop and ends with a required semicolon."
      },
      {
        question: "What does `continue;` do inside a `for` loop?",
        options: [
          "Terminates the entire function",
          "Exits the loop immediately",
          "Skips the rest of the body and runs the loop's increment step",
          "Resets the loop counter to 0"
        ],
        correctAnswerIndex: 2,
        explanation: "continue skips remaining statements in the current iteration and proceeds to the for-loop update expression."
      }
    ],
    exercise: {
      description: "Sum odd numbers from `1` to `7` using a loop with `continue` to skip evens, then print `odd_sum=16`.",
      initialCode: `#include <stdio.h>\n\nint main(void) {\n    int odd_sum = 0;\n    for (int i = 1; i <= 10; i++) {\n        // Skip evens with continue and stop after 7 with break\n        \n    }\n    printf("odd_sum=%d\\n", odd_sum);\n    return 0;\n}\n`,
      solutionCode: `#include <stdio.h>\n\nint main(void) {\n    int odd_sum = 0;\n    for (int i = 1; i <= 10; i++) {\n        if (i % 2 == 0) {\n            continue;\n        }\n        if (i > 7) {\n            break;\n        }\n        odd_sum += i;\n    }\n    printf("odd_sum=%d\\n", odd_sum);\n    return 0;\n}\n`,
      expectedOutput: "odd_sum=16",
      hint: "Use if (i % 2 == 0) continue; and if (i > 7) break; before odd_sum += i;.",
      rules: [
        { label: "Uses continue to skip even numbers", pattern: "\\bcontinue\\s*;", hint: "Skip even numbers with continue;." },
        { label: "Uses break to stop early", pattern: "\\bbreak\\s*;", hint: "Exit the loop after 7 with break;." },
        { label: "Accumulates odd_sum", pattern: "odd_sum\\s*\\+=", hint: "Add i into odd_sum." }
      ]
    }
  },
  {
    day: 9,
    week: 2,
    title: "Functions: Basics",
    summary: "Decompose programs into prototypes and small single-purpose functions.",
    concepts: ["function prototype", "void", "call stack", "modular code"],
    lessonMarkdown: `# Day 9: Functions — Prototypes & Structure

C reads source files top-to-bottom. Declaring a **function prototype** above \`main()\` tells the compiler each function's signature before it is called.

\`\`\`c
#include <stdio.h>

void print_banner(void); // prototype

int main(void) {
    print_banner();
    return 0;
}

void print_banner(void) {
    printf("=== C11 WORKBENCH ===\\n");
}
\`\`\`

- In C, \`void foo(void)\` explicitly means "takes zero parameters", whereas \`void foo()\` in older C meant "unspecified parameters".
- Each function call pushes a **stack frame** holding its locals and return address, then pops it on return.`,
    quiz: [
      {
        question: "Why should you declare a function prototype before `main()` if the definition is below `main()`?",
        options: [
          "To make the binary smaller",
          "So the compiler can type-check calls before seeing the full definition",
          "Because C forbids defining functions after main()",
          "To allocate the function on the heap"
        ],
        correctAnswerIndex: 1,
        explanation: "The C compiler performs single-pass name/type checking; prototypes announce signatures up front."
      },
      {
        question: "What does the return type `void` signify on a function?",
        options: ["It returns 0", "It returns a NULL pointer", "It returns no value", "It cannot take arguments"],
        correctAnswerIndex: 2,
        explanation: "A void function performs side effects (like printing) and yields no return value."
      }
    ],
    exercise: {
      description: "Define a `void greet(void)` helper function that prints `Ready to compile!` and call it from `main()`.",
      initialCode: `#include <stdio.h>\n\n// Declare prototype and implement greet(void)\n\nint main(void) {\n    // Call greet()\n    \n    return 0;\n}\n`,
      solutionCode: `#include <stdio.h>\n\nvoid greet(void) {\n    printf("Ready to compile!\\n");\n}\n\nint main(void) {\n    greet();\n    return 0;\n}\n`,
      expectedOutput: "Ready to compile!",
      hint: "Define void greet(void) { printf(\"Ready to compile!\\n\"); } above main() and call greet(); inside main().",
      rules: [
        { label: "Defines void greet(void)", pattern: "void\\s+greet\\s*\\(\\s*(void)?\\s*\\)", hint: "Declare void greet(void)." },
        { label: "Prints Ready to compile!", pattern: "Ready to compile!", hint: "Print Ready to compile! inside greet()." },
        { label: "Calls greet() from main", pattern: "greet\\s*\\(\\s*\\)\\s*;", hint: "Invoke greet(); inside main()." }
      ]
    }
  },
  {
    day: 10,
    week: 2,
    title: "Functions: Parameters and Return Types",
    summary: "Pass arguments by value, return typed results, and write pure helpers.",
    concepts: ["pass-by-value", "return value", "pure functions", "const params"],
    lessonMarkdown: `# Day 10: Parameters and Return Values

In C, all function arguments are **passed by value**—the callee receives a private copy on its stack frame. Mutating a parameter inside the function never alters the caller's variable (until you pass a pointer on Day 18!).

\`\`\`c
#include <stdio.h>

int clamp(int value, int low, int high) {
    if (value < low) return low;
    if (value > high) return high;
    return value;
}

int main(void) {
    printf("clamped=%d\\n", clamp(140, 0, 100)); // 100
    return 0;
}
\`\`\`

- Pure functions that map inputs solely to a return value are trivial to unit-test and reason about.`,
    quiz: [
      {
        question: "If `void bump(int x) { x += 1; }` is called as `bump(n)` where `n = 5`, what is `n` afterward?",
        options: ["6", "5", "0", "Undefined"],
        correctAnswerIndex: 1,
        explanation: "C passes scalars by value, so bump() only modifies its own copy of x; n remains 5."
      },
      {
        question: "What happens if a non-void function reaches its closing brace without executing a `return`?",
        options: [
          "It automatically returns 0",
          "Using the returned value causes undefined behavior",
          "It returns NULL",
          "It retries the function"
        ],
        correctAnswerIndex: 1,
        explanation: "Falling off the end of a non-void function (except main) yields undefined behavior if the caller uses the result."
      }
    ],
    exercise: {
      description: "Write `int max_int(int a, int b)` returning the larger of two integers, then print `max=42` for `max_int(17, 42)`.",
      initialCode: `#include <stdio.h>\n\n// Define int max_int(int a, int b)\n\nint main(void) {\n    printf("max=%d\\n", max_int(17, 42));\n    return 0;\n}\n`,
      solutionCode: `#include <stdio.h>\n\nint max_int(int a, int b) {\n    return (a > b) ? a : b;\n}\n\nint main(void) {\n    printf("max=%d\\n", max_int(17, 42));\n    return 0;\n}\n`,
      expectedOutput: "max=42",
      hint: "Implement int max_int(int a, int b) { return (a > b) ? a : b; }",
      rules: [
        { label: "Defines int max_int(int a, int b)", pattern: "int\\s+max_int\\s*\\(\\s*int\\s+\\w+\\s*,\\s*int\\s+\\w+\\s*\\)", hint: "Define int max_int(int a, int b)." },
        { label: "Returns the larger value", pattern: "return\\s+[^;]+;", hint: "Return the larger parameter using if/else or ternary ? :." },
        { label: "Calls max_int(17, 42)", pattern: "max_int\\s*\\(\\s*17\\s*,\\s*42\\s*\\)", hint: "Print max_int(17, 42) inside main()." }
      ]
    }
  },
  {
    day: 11,
    week: 2,
    title: "Variable Scope and Lifetimes",
    summary: "Control visibility and storage duration with block scope, static, and const.",
    concepts: ["block scope", "static local", "file-scope static", "storage duration"],
    lessonMarkdown: `# Day 11: Scope and Storage Duration

Every identifier in C has two orthogonal properties:
1. **Scope** — where in source code the name is visible (block vs. file).
2. **Storage duration** — how long the bytes stay alive in memory (automatic stack vs. static data segment vs. heap).

\`\`\`c
#include <stdio.h>

int next_id(void) {
    static int counter = 0; // initialized once, persists across calls
    counter++;
    return counter;
}

int main(void) {
    printf("%d %d %d\\n", next_id(), next_id(), next_id()); // 1 2 3
    return 0;
}
\`\`\`

- Automatic locals live on the stack and are **uninitialized garbage** until assigned.
- \`static\` locals live in the static data segment, default to \`0\`, and retain their value between calls.
- \`static\` at file scope restricts a function or global to the current \`.c\` translation unit (private linkage).`,
    quiz: [
      {
        question: "How many times is `static int counter = 0;` inside a function initialized?",
        options: [
          "Every time the function is called",
          "Once before program startup",
          "Only when counter reaches 0",
          "Never"
        ],
        correctAnswerIndex: 1,
        explanation: "A static local variable has static storage duration and is initialized exactly once."
      },
      {
        question: "What does placing `static` in front of a file-scope helper function do?",
        options: [
          "Makes it thread-safe",
          "Gives it internal linkage so other .c files cannot call it",
          "Allocates its stack frame on the heap",
          "Prevents recursion"
        ],
        correctAnswerIndex: 1,
        explanation: "File-scope static hides the symbol from the linker outside its own translation unit."
      }
    ],
    exercise: {
      description: "Implement `int next_ticket(void)` using a `static int` counter starting at `100`, and print the first two calls as `101 102`.",
      initialCode: `#include <stdio.h>\n\nint next_ticket(void) {\n    // Use a static int initialized to 100 and increment it\n    return 0;\n}\n\nint main(void) {\n    int a = next_ticket();\n    int b = next_ticket();\n    printf("%d %d\\n", a, b);\n    return 0;\n}\n`,
      solutionCode: `#include <stdio.h>\n\nint next_ticket(void) {\n    static int ticket = 100;\n    ticket++;\n    return ticket;\n}\n\nint main(void) {\n    int a = next_ticket();\n    int b = next_ticket();\n    printf("%d %d\\n", a, b);\n    return 0;\n}\n`,
      expectedOutput: "101 102",
      hint: "Inside next_ticket(), write static int ticket = 100; ticket++; return ticket;.",
      rules: [
        { label: "Uses a static int local variable", pattern: "static\\s+int\\s+\\w+\\s*=\\s*100\\s*;", hint: "Declare static int ticket = 100; inside next_ticket()." },
        { label: "Increments the static counter", pattern: "(\\+\\+|\\+=\\s*1)", hint: "Increment the static counter on each call." },
        { label: "Calls next_ticket() twice", pattern: "next_ticket\\s*\\(\\s*\\)[\\s\\S]*next_ticket\\s*\\(\\s*\\)", hint: "Call next_ticket() twice in main()." }
      ]
    }
  },
  {
    day: 12,
    week: 2,
    title: "Arrays: Introduction",
    summary: "Store contiguous homogeneous elements, compute array length safely, and avoid bounds errors.",
    concepts: ["contiguous memory", "0-based indexing", "sizeof(a)/sizeof(a[0])", "bounds safety"],
    lessonMarkdown: `# Day 12: Arrays — Contiguous Memory

An array \`int nums[5]\` allocates \`5 * sizeof(int)\` (20 bytes) back-to-back on the stack. Because elements are contiguous, indexing \`nums[i]\` is a single pointer-offset instruction: \`*(nums + i)\`.

\`\`\`c
#include <stdio.h>

int main(void) {
    int readings[] = {12, 18, 25, 31};
    size_t len = sizeof(readings) / sizeof(readings[0]);
    int total = 0;

    for (size_t i = 0; i < len; i++) {
        total += readings[i];
    }
    printf("len=%zu total=%d\\n", len, total);
    return 0;
}
\`\`\`

> **Danger:** C performs **zero runtime bounds checking**. Writing to \`readings[4]\` silently corrupts adjacent stack memory! Always track array length explicitly.`,
    quiz: [
      {
        question: "What is the valid index range for `int buf[8];`?",
        options: ["1 to 8", "0 to 7", "0 to 8", "-1 to 7"],
        correctAnswerIndex: 1,
        explanation: "C arrays are zero-indexed, so an 8-element array has indices 0 through 7."
      },
      {
        question: "How do you compute the number of elements in a local array `int a[6]`?",
        options: ["a.length", "len(a)", "sizeof(a) / sizeof(a[0])", "strlen(a)"],
        correctAnswerIndex: 2,
        explanation: "Dividing total byte size by one element's byte size gives the element count (only before pointer decay!)."
      }
    ],
    exercise: {
      description: "Sum all elements of `int vals[4] = {10, 20, 30, 40};` using a loop and print `sum=100`.",
      initialCode: `#include <stdio.h>\n\nint main(void) {\n    int vals[4] = {10, 20, 30, 40};\n    int sum = 0;\n    // Loop over vals and accumulate sum\n    \n    printf("sum=%d\\n", sum);\n    return 0;\n}\n`,
      solutionCode: `#include <stdio.h>\n\nint main(void) {\n    int vals[4] = {10, 20, 30, 40};\n    int sum = 0;\n    for (size_t i = 0; i < 4; i++) {\n        sum += vals[i];\n    }\n    printf("sum=%d\\n", sum);\n    return 0;\n}\n`,
      expectedOutput: "sum=100",
      hint: "Iterate i from 0 to 3 with for (size_t i = 0; i < 4; i++) { sum += vals[i]; }",
      rules: [
        { label: "Iterates with a loop", pattern: "\\b(for|while)\\s*\\(", hint: "Use a for or while loop over the array." },
        { label: "Indexes vals[...]", pattern: "vals\\s*\\[\\s*\\w+\\s*\\]", hint: "Access each element with vals[i]." },
        { label: "Accumulates into sum", pattern: "sum\\s*\\+=", hint: "Add vals[i] into sum." }
      ]
    }
  },
  {
    day: 13,
    week: 3,
    title: "Arrays: Multi-dimensional Arrays",
    summary: "Traverse 2D row-major matrices efficiently with nested loops.",
    concepts: ["row-major layout", "2D matrices", "cache locality", "nested loops"],
    lessonMarkdown: `# Day 13: Multi-Dimensional Arrays & Cache Locality

C stores 2D arrays in **row-major order**: every element of row \`0\` is laid out sequentially in RAM before row \`1\` begins.

\`\`\`c
#include <stdio.h>

int main(void) {
    int grid[2][3] = {
        {1, 2, 3},
        {4, 5, 6}
    };
    int trace = 0;
    for (int r = 0; r < 2; r++) {
        for (int c = 0; c < 3; c++) {
            trace += grid[r][c];
        }
    }
    printf("sum=%d\\n", trace); // 21
    return 0;
}
\`\`\`

> **Performance Insight:** Iterating row-by-row (\`r\` outer, \`c\` inner) walks sequentially through CPU L1 cache lines, often 3–10× faster on large matrices than column-major traversal.`,
    quiz: [
      {
        question: "In C, how is `int m[2][3]` laid out in memory?",
        options: [
          "Column-major: m[0][0], m[1][0], m[0][1]...",
          "Row-major: m[0][0], m[0][1], m[0][2], m[1][0]...",
          "As separate heap pointers per row",
          "Reverse order from the last element"
        ],
        correctAnswerIndex: 1,
        explanation: "C arrays are strictly row-major: the rightmost index varies fastest in contiguous memory."
      },
      {
        question: "How many bytes does `int m[3][4]` occupy when `sizeof(int) == 4`?",
        options: ["12 bytes", "28 bytes", "48 bytes", "64 bytes"],
        correctAnswerIndex: 2,
        explanation: "3 rows × 4 columns = 12 ints × 4 bytes = 48 bytes."
      }
    ],
    exercise: {
      description: "Compute the diagonal sum (`m[0][0] + m[1][1]`) of `int m[2][2] = {{5, 2}, {3, 9}};` using a loop and print `diag=14`.",
      initialCode: `#include <stdio.h>\n\nint main(void) {\n    int m[2][2] = {{5, 2}, {3, 9}};\n    int diag = 0;\n    // Sum m[i][i] for i = 0, 1\n    \n    printf("diag=%d\\n", diag);\n    return 0;\n}\n`,
      solutionCode: `#include <stdio.h>\n\nint main(void) {\n    int m[2][2] = {{5, 2}, {3, 9}};\n    int diag = 0;\n    for (int i = 0; i < 2; i++) {\n        diag += m[i][i];\n    }\n    printf("diag=%d\\n", diag);\n    return 0;\n}\n`,
      expectedOutput: "diag=14",
      hint: "Loop i from 0 to 1 and add m[i][i] to diag.",
      rules: [
        { label: "Declares 2x2 array m", pattern: "int\\s+m\\s*\\[\\s*2\\s*\\]\\s*\\[\\s*2\\s*\\]", hint: "Keep int m[2][2] = {{5, 2}, {3, 9}};." },
        { label: "Indexes 2D diagonal m[i][i]", pattern: "m\\s*\\[\\s*\\w+\\s*\\]\\s*\\[\\s*\\w+\\s*\\]", hint: "Access diagonal elements with m[i][i]." },
        { label: "Prints diag=14", pattern: "printf\\s*\\([^;]*diag=%d", hint: "Print diag with printf(\"diag=%d\\n\", diag);." }
      ]
    }
  },
  {
    day: 14,
    week: 3,
    title: "Strings: Arrays of Characters",
    summary: "Work with null-terminated char arrays and understand why '\\0' matters.",
    concepts: ["NUL terminator '\\0'", "char[] vs char*", "mutable buffers", "sizeof vs strlen"],
    lessonMarkdown: `# Day 14: C Strings — Null-Terminated Char Arrays

C has no native string object. A C string is simply a contiguous \`char\` array ending with the NUL byte \`'\\0'\` (ASCII 0).

\`\`\`c
#include <stdio.h>

int main(void) {
    char lang[] = "C11"; // 4 bytes: 'C', '1', '1', '\\0'
    size_t len = 0;
    while (lang[len] != '\\0') {
        len++;
    }
    printf("%s has %zu chars (%zu bytes)\\n", lang, len, sizeof(lang));
    return 0;
}
\`\`\`

- \`sizeof("C11")\` is \`4\` (includes \`'\\0'\`), while the string length is \`3\`.
- \`char s[] = "hi";\` copies bytes onto the writable stack. \`const char *s = "hi";\` points to read-only memory—never mutate a string literal!`,
    quiz: [
      {
        question: "How many bytes does `char s[] = \"Hi\";` occupy in memory?",
        options: ["2 bytes", "3 bytes", "4 bytes", "8 bytes"],
        correctAnswerIndex: 1,
        explanation: "It holds 'H', 'i', and the implicit terminating NUL character '\\0' — 3 bytes total."
      },
      {
        question: "What happens if you pass a `char` array without `'\\0'` to `printf(\"%s\", buf)`?",
        options: [
          "printf stops at sizeof(buf)",
          "printf reads past the array boundary (buffer over-read / UB)",
          "It prints an empty string",
          "The compiler inserts '\\0' automatically"
        ],
        correctAnswerIndex: 1,
        explanation: "%s scans forward until it encounters a 0 byte, reading arbitrary adjacent memory if none exists."
      }
    ],
    exercise: {
      description: "Count the characters in `char word[] = \"kernel\";` using a `while` loop checking `'\\0'`, then print `len=6`.",
      initialCode: `#include <stdio.h>\n\nint main(void) {\n    char word[] = "kernel";\n    size_t len = 0;\n    // Count until word[len] == '\\0'\n    \n    printf("len=%zu\\n", len);\n    return 0;\n}\n`,
      solutionCode: `#include <stdio.h>\n\nint main(void) {\n    char word[] = "kernel";\n    size_t len = 0;\n    while (word[len] != '\\0') {\n        len++;\n    }\n    printf("len=%zu\\n", len);\n    return 0;\n}\n`,
      expectedOutput: "len=6",
      hint: "Use while (word[len] != '\\0') { len++; }",
      rules: [
        { label: "Checks for NUL terminator '\\0'", pattern: "word\\s*\\[\\s*len\\s*\\]\\s*!=\\s*'\\\\0'", hint: "Check word[len] != '\\0' in your loop condition." },
        { label: "Increments len", pattern: "len\\s*\\+\\+|\\+\\+\\s*len", hint: "Increment len inside the loop." },
        { label: "Prints len with %zu", pattern: "printf\\s*\\([^;]*len=%zu", hint: "Print len using %zu." }
      ]
    }
  },
  {
    day: 15,
    week: 3,
    title: "String Manipulation Functions",
    summary: "Use <string.h> safely with strlen, strcmp, and bounded snprintf instead of unsafe strcpy.",
    concepts: ["<string.h>", "strlen / strcmp", "snprintf", "buffer overflow defense"],
    lessonMarkdown: `# Day 15: Safe String Manipulation (<string.h>)

Never compare C strings with \`==\` (that compares memory addresses, not characters!). Use \`strcmp\`, \`strlen\`, and bounded formatting with \`snprintf\`.

\`\`\`c
#include <stdio.h>
#include <string.h>

int main(void) {
    char dst[32];
    const char *a = "gcc";
    const char *b = "gcc";

    snprintf(dst, sizeof(dst), "compiler=%s", a);
    if (strcmp(a, b) == 0) {
        printf("%s (len=%zu)\\n", dst, strlen(dst));
    }
    return 0;
}
\`\`\`

- \`strcmp(a, b) == 0\` means the strings are equal (\`< 0\` or \`> 0\` indicates lexicographical order).
- Prefer \`snprintf(dst, sizeof(dst), ...)\` over \`strcpy\`/\`strcat\` because \`snprintf\` **always** respects buffer capacity and guarantees NUL termination.`,
    quiz: [
      {
        question: "What does `strcmp(\"abc\", \"abc\")` return?",
        options: ["1 (true)", "0", "-1", "3"],
        correctAnswerIndex: 1,
        explanation: "strcmp returns 0 when both strings have identical characters."
      },
      {
        question: "Why is `snprintf(dst, sizeof(dst), \"%s\", src)` safer than `strcpy(dst, src)`?",
        options: [
          "snprintf dynamically grows dst with malloc",
          "snprintf bounds writes to sizeof(dst) and always NUL-terminates",
          "strcpy does not copy ASCII letters",
          "snprintf skips the NUL terminator"
        ],
        correctAnswerIndex: 1,
        explanation: "strcpy has no destination size parameter and overflows buffers on long input; snprintf enforces the limit."
      }
    ],
    exercise: {
      description: "Use `snprintf` to format `\"C11\"` into `char buf[16]` as `\"std=C11\"` and verify equality with `strcmp`, printing `std=C11`.",
      initialCode: `#include <stdio.h>\n#include <string.h>\n\nint main(void) {\n    char buf[16];\n    // Format \"std=C11\" into buf using snprintf and check with strcmp\n    \n    return 0;\n}\n`,
      solutionCode: `#include <stdio.h>\n#include <string.h>\n\nint main(void) {\n    char buf[16];\n    snprintf(buf, sizeof(buf), "std=%s", "C11");\n    if (strcmp(buf, "std=C11") == 0) {\n        printf("%s\\n", buf);\n    }\n    return 0;\n}\n`,
      expectedOutput: "std=C11",
      hint: "Call snprintf(buf, sizeof(buf), \"std=%s\", \"C11\"); then check if (strcmp(buf, \"std=C11\") == 0) printf(\"%s\\n\", buf);",
      rules: [
        { label: "Includes <string.h>", pattern: "#include\\s*<string\\.h>", hint: "Keep #include <string.h>." },
        { label: "Uses bounded snprintf", pattern: "snprintf\\s*\\(\\s*buf\\s*,\\s*sizeof\\s*\\(\\s*buf\\s*\\)", hint: "Use snprintf(buf, sizeof(buf), ...)." },
        { label: "Compares strings with strcmp", pattern: "strcmp\\s*\\([^)]*\\)\\s*==\\s*0", hint: "Verify with strcmp(buf, \"std=C11\") == 0." }
      ]
    }
  }
];
