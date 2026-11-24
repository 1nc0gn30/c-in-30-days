import type { DayContent } from './curriculum';

export const curriculumPart2: DayContent[] = [
  {
    day: 16,
    week: 3,
    title: "Pointers: The Basics",
    summary: "Store memory addresses with &, read/write targets with *, and guard NULL pointers.",
    concepts: ["address-of &", "dereference *", "NULL guard", "void * / %p"],
    lessonMarkdown: `# Day 16: Pointers — The Basics

A pointer is simply a variable whose value is a **memory address**. Two operators unlock direct memory access:
- \`&x\` (address-of): produces the memory address where \`x\` lives.
- \`*p\` (dereference): reads or writes the value stored at address \`p\`.

\`\`\`c
#include <stdio.h>

int main(void) {
    int x = 42;
    int *p = &x;      // p holds the stack address of x
    *p = 99;          // modifies x indirectly through p

    printf("x=%d *p=%d addr=%p\\n", x, *p, (void *)p);
    return 0;
}
\`\`\`

> **Golden Rule:** Initialize pointers immediately to a valid address or \`NULL\`, and never dereference a \`NULL\` or uninitialized pointer. Open the **Memory Lab** tab above to step through this visually!`,
    quiz: [
      {
        question: "After `int x = 10; int *p = &x; *p = 25;`, what is the value of `x`?",
        options: ["10", "25", "The address of p", "Undefined"],
        correctAnswerIndex: 1,
        explanation: "Because p points to x, assigning through *p writes 25 directly into x's memory slot."
      },
      {
        question: "Which specifier and cast prints a pointer address portably in C11?",
        options: ["%d and (int)p", "%p and (void *)p", "%x and p", "%s and p"],
        correctAnswerIndex: 1,
        explanation: "The C standard requires %p with a (void *) cast to print memory addresses portably."
      }
    ],
    exercise: {
      description: "Create `int val = 10;`, point `int *ptr = &val;`, update `val` to `77` through `*ptr`, and print `val=77`.",
      initialCode: `#include <stdio.h>\n\nint main(void) {\n    int val = 10;\n    // Point ptr at val and update val via *ptr\n    \n    printf("val=%d\\n", val);\n    return 0;\n}\n`,
      solutionCode: `#include <stdio.h>\n\nint main(void) {\n    int val = 10;\n    int *ptr = &val;\n    *ptr = 77;\n    printf("val=%d\\n", val);\n    return 0;\n}\n`,
      expectedOutput: "val=77",
      hint: "Declare int *ptr = &val; then write *ptr = 77;.",
      rules: [
        { label: "Declares pointer int *ptr = &val", pattern: "int\\s*\\*\\s*ptr\\s*=\\s*&\\s*val\\s*;", hint: "Declare int *ptr = &val;." },
        { label: "Dereferences *ptr to assign 77", pattern: "\\*\\s*ptr\\s*=\\s*77\\s*;", hint: "Assign *ptr = 77;." }
      ]
    }
  },
  {
    day: 17,
    week: 3,
    title: "Pointers and Arrays",
    summary: "Understand array-to-pointer decay and scaled pointer arithmetic.",
    concepts: ["pointer decay", "p + i stride", "*(arr + i)", "const int *"],
    lessonMarkdown: `# Day 17: Pointers and Arrays

In most expressions, an array name \`arr\` **decays** into a pointer to its first element \`&arr[0]\`. Pointer arithmetic automatically scales by \`sizeof(*p)\`:
- If \`int *p = arr;\` and \`sizeof(int) == 4\`, then \`p + 2\` advances by **8 bytes**, landing cleanly on \`arr[2]\`.

\`\`\`c
#include <stdio.h>

int main(void) {
    int nums[4] = {10, 20, 30, 40};
    int *p = nums;

    printf("third=%d\\n", *(p + 2)); // 30
    return 0;
}
\`\`\`

- \`arr[i]\` is literally syntactic sugar for \`*(arr + i)\`.
- When passing an array to a function, it decays to a pointer—so always pass \`size_t len\` alongside it!`,
    quiz: [
      {
        question: "If `int *p` holds address `0x1000` and `sizeof(int) == 4`, what address does `p + 3` represent?",
        options: ["0x1003", "0x100C", "0x1004", "0x1012"],
        correctAnswerIndex: 1,
        explanation: "Pointer arithmetic scales by sizeof(int): 3 * 4 = 12 bytes = 0xC, giving 0x100C."
      },
      {
        question: "Inside `void f(int arr[])`, what does `sizeof(arr)` return on a 64-bit platform?",
        options: ["The total bytes of the caller's array", "8 (the size of an int * pointer)", "4", "0"],
        correctAnswerIndex: 1,
        explanation: "Array parameters decay to pointers, so sizeof(arr) returns sizeof(int *), not the array byte count."
      }
    ],
    exercise: {
      description: "Given `int a[4] = {5, 15, 25, 35};`, use a pointer `int *p = a;` and pointer arithmetic `*(p + 3)` to print `last=35`.",
      initialCode: `#include <stdio.h>\n\nint main(void) {\n    int a[4] = {5, 15, 25, 35};\n    // Declare int *p = a and print *(p + 3)\n    \n    return 0;\n}\n`,
      solutionCode: `#include <stdio.h>\n\nint main(void) {\n    int a[4] = {5, 15, 25, 35};\n    int *p = a;\n    printf("last=%d\\n", *(p + 3));\n    return 0;\n}\n`,
      expectedOutput: "last=35",
      hint: "Write int *p = a; and printf(\"last=%d\\n\", *(p + 3));.",
      rules: [
        { label: "Declares int *p = a", pattern: "int\\s*\\*\\s*p\\s*=\\s*(a|&\\s*a\\s*\\[\\s*0\\s*\\])\\s*;", hint: "Assign int *p = a;." },
        { label: "Uses pointer arithmetic *(p + 3)", pattern: "\\*\\s*\\(\\s*p\\s*\\+\\s*3\\s*\\)", hint: "Dereference with *(p + 3)." },
        { label: "Prints last=35", pattern: "printf\\s*\\([^;]*last=%d", hint: "Print using printf(\"last=%d\\n\", *(p + 3));." }
      ]
    }
  },
  {
    day: 18,
    week: 3,
    title: "Pointers and Functions (Pass by Reference)",
    summary: "Mutate caller state and return multiple outputs via pointer parameters.",
    concepts: ["pass pointer", "swap(int *, int *)", "out parameters", "const correctness"],
    lessonMarkdown: `# Day 18: Pass by Pointer (Simulated Pass-by-Reference)

Because C passes arguments by value, a function needs a **pointer to the caller's variable** in order to mutate it—or to return multiple results cleanly.

\`\`\`c
#include <stdio.h>

void swap(int *a, int *b) {
    int tmp = *a;
    *a = *b;
    *b = tmp;
}

int main(void) {
    int x = 3, y = 9;
    swap(&x, &y);
    printf("x=%d y=%d\\n", x, y); // x=9 y=3
    return 0;
}
\`\`\`

- Use \`const int *p\` when a function only needs to *read* through a pointer; it lets the compiler reject accidental mutations.`,
    quiz: [
      {
        question: "Why does `swap(&x, &y)` succeed where `swap(x, y)` fails?",
        options: [
          "&x copies x onto the heap",
          "Passing addresses allows swap() to dereference and write into x and y directly",
          "C automatically swaps arguments prefixed with &",
          "Pointers skip stack frame allocation"
        ],
        correctAnswerIndex: 1,
        explanation: "Passing &x and &y hands swap() the exact stack locations to overwrite via *a and *b."
      },
      {
        question: "What does `void inspect(const int *p)` guarantee?",
        options: [
          "p cannot be NULL",
          "inspect() cannot modify the integer value through *p",
          "p is stored in ROM",
          "The caller cannot modify their variable later"
        ],
        correctAnswerIndex: 1,
        explanation: "const int * makes the pointed-to value read-only through p."
      }
    ],
    exercise: {
      description: "Implement `void swap(int *a, int *b)` to exchange `x = 4` and `y = 9`, then print `x=9 y=4`.",
      initialCode: `#include <stdio.h>\n\nvoid swap(int *a, int *b) {\n    // Swap the values pointed to by a and b\n}\n\nint main(void) {\n    int x = 4, y = 9;\n    swap(&x, &y);\n    printf("x=%d y=%d\\n", x, y);\n    return 0;\n}\n`,
      solutionCode: `#include <stdio.h>\n\nvoid swap(int *a, int *b) {\n    int tmp = *a;\n    *a = *b;\n    *b = tmp;\n}\n\nint main(void) {\n    int x = 4, y = 9;\n    swap(&x, &y);\n    printf("x=%d y=%d\\n", x, y);\n    return 0;\n}\n`,
      expectedOutput: "x=9 y=4",
      hint: "Store int tmp = *a; then *a = *b; then *b = tmp;.",
      rules: [
        { label: "Dereferences *a and *b", pattern: "\\*\\s*a[\\s\\S]*\\*\\s*b", hint: "Read/write through *a and *b." },
        { label: "Uses a temporary variable", pattern: "int\\s+\\w+\\s*=\\s*\\*\\s*[ab]\\s*;", hint: "Save *a in a temp variable before overwriting it." },
        { label: "Calls swap(&x, &y)", pattern: "swap\\s*\\(\\s*&\\s*x\\s*,\\s*&\\s*y\\s*\\)", hint: "Pass addresses swap(&x, &y)." }
      ]
    }
  },
  {
    day: 19,
    week: 4,
    title: "Dynamic Memory Allocation (malloc, free)",
    summary: "Allocate runtime-sized buffers on the heap, check NULL, and free cleanly.",
    concepts: ["malloc / calloc", "NULL check", "free()", "dangling pointer"],
    lessonMarkdown: `# Day 19: Dynamic Memory Allocation (Heap)

Stack arrays require compile-time sizes and vanish when a function returns. For dynamic sizes or long-lived data, request memory from the **heap** via \`<stdlib.h>\`.

\`\`\`c
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    size_t n = 3;
    int *arr = malloc(n * sizeof(*arr));
    if (!arr) {
        return 1; // always check allocation failure
    }
    arr[0] = 10; arr[1] = 20; arr[2] = 30;
    printf("sum=%d\\n", arr[0] + arr[1] + arr[2]);

    free(arr);
    arr = NULL; // neutralize dangling pointer
    return 0;
}
\`\`\`

- Prefer \`malloc(n * sizeof(*arr))\` over repeating the type name—if the type changes, the allocation stays right.
- Every \`malloc\`/\`calloc\` must be paired with exactly one \`free\`. Never cast the return of \`malloc\` in C.`,
    quiz: [
      {
        question: "What does `malloc()` return if the OS cannot satisfy the allocation?",
        options: ["0xFFFFFFFF", "NULL", "Throws an exception", "An empty array"],
        correctAnswerIndex: 1,
        explanation: "malloc returns NULL on failure; checking if (!ptr) prevents an immediate NULL dereference."
      },
      {
        question: "Why set `ptr = NULL;` immediately after `free(ptr);`?",
        options: [
          "To tell the OS to reclaim the bytes faster",
          "To prevent accidental use-after-free or double-free bugs",
          "Because free() requires it to compile",
          "To zero out the heap memory"
        ],
        correctAnswerIndex: 1,
        explanation: "free(NULL) is a safe no-op, and dereferencing NULL fails loudly instead of silently corrupting reused heap memory."
      }
    ],
    exercise: {
      description: "Allocate an `int` array of 3 elements with `malloc`, check for `NULL`, store `10, 20, 30`, print `sum=60`, and `free` it.",
      initialCode: `#include <stdio.h>\n#include <stdlib.h>\n\nint main(void) {\n    // Allocate 3 ints with malloc, check NULL, sum them, and free\n    \n    return 0;\n}\n`,
      solutionCode: `#include <stdio.h>\n#include <stdlib.h>\n\nint main(void) {\n    int *arr = malloc(3 * sizeof(*arr));\n    if (arr == NULL) {\n        return 1;\n    }\n    arr[0] = 10;\n    arr[1] = 20;\n    arr[2] = 30;\n    printf("sum=%d\\n", arr[0] + arr[1] + arr[2]);\n    free(arr);\n    arr = NULL;\n    return 0;\n}\n`,
      expectedOutput: "sum=60",
      hint: "Allocate int *arr = malloc(3 * sizeof(*arr));, check if (!arr) return 1;, fill 10/20/30, print sum, and call free(arr);.",
      rules: [
        { label: "Includes <stdlib.h>", pattern: "#include\\s*<stdlib\\.h>", hint: "Include <stdlib.h> for malloc and free." },
        { label: "Calls malloc", pattern: "\\bmalloc\\s*\\(", hint: "Allocate heap memory with malloc(...)." },
        { label: "Checks for NULL", pattern: "if\\s*\\(\\s*(!\\s*\\w+|\\w+\\s*==\\s*NULL|NULL\\s*==\\s*\\w+)\\s*\\)", hint: "Check if (arr == NULL) or if (!arr) before using the pointer." },
        { label: "Frees allocated memory", pattern: "\\bfree\\s*\\(\\s*\\w+\\s*\\)\\s*;", hint: "Call free(arr); before exiting." }
      ]
    }
  },
  {
    day: 20,
    week: 4,
    title: "Structures (struct)",
    summary: "Group heterogeneous fields into composite records and access them via . and ->.",
    concepts: ["struct", "designated initializers", "arrow ->", "struct padding"],
    lessonMarkdown: `# Day 20: Structures (struct)

A \`struct\` packs related fields of different types into a single composite value. C11 designated initializers (\`.field = value\`) make initialization self-documenting and zero-fill omitted fields.

\`\`\`c
#include <stdio.h>

struct Point {
    int x;
    int y;
};

void move(struct Point *p, int dx, int dy) {
    p->x += dx; // shorthand for (*p).x
    p->y += dy;
}

int main(void) {
    struct Point pt = {.x = 3, .y = 4};
    move(&pt, 2, -1);
    printf("(%d, %d)\\n", pt.x, pt.y); // (5, 3)
    return 0;
}
\`\`\`

- Pass large structs by \`const struct Foo *\` pointer instead of copying the entire struct onto the stack.`,
    quiz: [
      {
        question: "Which operator accesses field `x` through a struct pointer `struct Point *p`?",
        options: ["p.x", "p->x", "p::x", "&p.x"],
        correctAnswerIndex: 1,
        explanation: "The arrow operator p->x dereferences p and accesses member x (equivalent to (*p).x)."
      },
      {
        question: "Why can `sizeof(struct S)` be larger than the sum of its field sizes?",
        options: [
          "C adds a hidden virtual table pointer",
          "The compiler inserts alignment padding bytes for CPU memory access rules",
          "Structs always allocate 64 bytes minimum",
          "sizeof counts field names"
        ],
        correctAnswerIndex: 1,
        explanation: "Compilers align fields to word boundaries (e.g., 4 or 8 bytes), inserting padding as needed."
      }
    ],
    exercise: {
      description: "Define `struct Rect { int w; int h; };`, initialize `{.w = 6, .h = 7}`, and print `area=42`.",
      initialCode: `#include <stdio.h>\n\n// Define struct Rect with int w and int h\n\nint main(void) {\n    // Initialize Rect and print area\n    \n    return 0;\n}\n`,
      solutionCode: `#include <stdio.h>\n\nstruct Rect {\n    int w;\n    int h;\n};\n\nint main(void) {\n    struct Rect r = {.w = 6, .h = 7};\n    printf("area=%d\\n", r.w * r.h);\n    return 0;\n}\n`,
      expectedOutput: "area=42",
      hint: "Define struct Rect { int w; int h; };, create struct Rect r = {.w = 6, .h = 7};, and print r.w * r.h.",
      rules: [
        { label: "Defines struct Rect", pattern: "struct\\s+Rect\\s*\\{[\\s\\S]*int\\s+w[\\s\\S]*int\\s+h[\\s\\S]*\\}\\s*;", hint: "Define struct Rect { int w; int h; };." },
        { label: "Multiplies width and height fields", pattern: "\\w+\\.w\\s*\\*\\s*\\w+\\.h|\\w+->w\\s*\\*\\s*\\w+->h", hint: "Compute area with r.w * r.h." },
        { label: "Prints area=42", pattern: "printf\\s*\\([^;]*area=%d", hint: "Print using printf(\"area=%d\\n\", r.w * r.h);." }
      ]
    }
  },
  {
    day: 21,
    week: 4,
    title: "Unions and Typedef",
    summary: "Create concise type aliases and memory-sharing tagged unions.",
    concepts: ["typedef", "union", "tagged union", "enum"],
    lessonMarkdown: `# Day 21: Unions, Enums, and Typedef

A \`union\` overlays all its fields at the **exact same memory offset**—its size equals the largest member. Pair a \`union\` with an \`enum\` tag to build type-safe **tagged unions** (the foundation of AST nodes, JSON values, and network packets).

\`\`\`c
#include <stdio.h>

typedef enum { VAL_INT, VAL_FLOAT } ValueKind;

typedef struct {
    ValueKind kind;
    union {
        int i;
        double f;
    } as;
} Value;

int main(void) {
    Value v = {.kind = VAL_INT, .as.i = 404};
    if (v.kind == VAL_INT) {
        printf("int=%d\\n", v.as.i);
    }
    return 0;
}
\`\`\`

- \`typedef\` creates clean type aliases so you can write \`Value\` instead of \`struct Value\`.`,
    quiz: [
      {
        question: "How is memory allocated for a `union { char c; int i; double d; }`?",
        options: [
          "Sum of all members (13+ bytes)",
          "Only enough for the largest member (8 bytes for double), shared by all members",
          "Heap-allocated per field",
          "4 bytes fixed"
        ],
        correctAnswerIndex: 1,
        explanation: "All union fields overlap starting at byte offset 0, so sizeof(union) >= max member size."
      },
      {
        question: "Why wrap a `union` inside a `struct` with an `enum` tag?",
        options: [
          "To make it compile in C11",
          "So code always knows which union member is currently active",
          "To compress strings automatically",
          "To allow reading all union members at once"
        ],
        correctAnswerIndex: 1,
        explanation: "A union does not record which field was written last; a tag field tracks the active variant."
      }
    ],
    exercise: {
      description: "Define a `typedef union { int i; float f; } Number;`, set `n.i = 256;`, and print `i=256`.",
      initialCode: `#include <stdio.h>\n\n// Define typedef union Number\n\nint main(void) {\n    // Set n.i = 256 and print it\n    \n    return 0;\n}\n`,
      solutionCode: `#include <stdio.h>\n\ntypedef union {\n    int i;\n    float f;\n} Number;\n\nint main(void) {\n    Number n;\n    n.i = 256;\n    printf("i=%d\\n", n.i);\n    return 0;\n}\n`,
      expectedOutput: "i=256",
      hint: "Write typedef union { int i; float f; } Number; then Number n; n.i = 256; printf(\"i=%d\\n\", n.i);",
      rules: [
        { label: "Defines typedef union Number", pattern: "typedef\\s+union[\\s\\S]*\\}\\s*Number\\s*;", hint: "Create typedef union { int i; float f; } Number;." },
        { label: "Assigns and prints n.i", pattern: "\\.i\\s*=\\s*256", hint: "Assign n.i = 256; and print with %d." }
      ]
    }
  },
  {
    day: 22,
    week: 4,
    title: "File Handling: Reading Files",
    summary: "Open buffered FILE streams, read lines safely with fgets, and always fclose.",
    concepts: ["FILE *", "fopen / tmpfile", "fgets", "fclose"],
    lessonMarkdown: `# Day 22: Reading Files Safely (<stdio.h>)

C performs buffered file I/O through \`FILE *\` handles. Always check for \`NULL\` after \`fopen()\`, read bounded lines with \`fgets()\`, and close handles with \`fclose()\`.

\`\`\`c
#include <stdio.h>

int main(void) {
    FILE *fp = tmpfile(); // portable temporary stream
    if (!fp) return 1;

    fputs("line-1\\n", fp);
    rewind(fp);

    char line[64];
    if (fgets(line, sizeof(line), fp) != NULL) {
        printf("read=%s", line);
    }
    fclose(fp);
    return 0;
}
\`\`\`

- Never use \`gets()\` (removed from C11 due to guaranteed buffer overflow vulnerability); always use \`fgets(buf, sizeof(buf), fp)\`.`,
    quiz: [
      {
        question: "Why was `gets()` removed from ISO C11 in favor of `fgets()`?",
        options: [
          "gets() was too slow",
          "gets() takes no buffer size and allows unbounded buffer overflows",
          "fgets() parses JSON automatically",
          "gets() only works on binary files"
        ],
        correctAnswerIndex: 1,
        explanation: "fgets(buf, sizeof(buf), stream) caps the number of bytes written to prevent buffer overflows."
      },
      {
        question: "What does `fopen(\"missing.txt\", \"r\")` return if the file does not exist?",
        options: ["An empty file handle", "NULL", "EOF", "-1"],
        correctAnswerIndex: 1,
        explanation: "fopen returns NULL on failure and sets errno to indicate the OS error reason."
      }
    ],
    exercise: {
      description: "Write `\"hello-file\\n\"` to a `tmpfile()` stream, `rewind(fp)`, read it back with `fgets`, print it, and call `fclose(fp)`.",
      initialCode: `#include <stdio.h>\n\nint main(void) {\n    FILE *fp = tmpfile();\n    if (!fp) return 1;\n    fputs("hello-file\\n", fp);\n    rewind(fp);\n\n    char buf[32];\n    // Read from fp with fgets, print buf, and fclose(fp)\n    \n    return 0;\n}\n`,
      solutionCode: `#include <stdio.h>\n\nint main(void) {\n    FILE *fp = tmpfile();\n    if (!fp) return 1;\n    fputs("hello-file\\n", fp);\n    rewind(fp);\n\n    char buf[32];\n    if (fgets(buf, sizeof(buf), fp) != NULL) {\n        printf("%s", buf);\n    }\n    fclose(fp);\n    return 0;\n}\n`,
      expectedOutput: "hello-file",
      hint: "Use if (fgets(buf, sizeof(buf), fp) != NULL) { printf(\"%s\", buf); } then fclose(fp);.",
      rules: [
        { label: "Reads with bounded fgets", pattern: "fgets\\s*\\(\\s*buf\\s*,\\s*sizeof\\s*\\(\\s*buf\\s*\\)\\s*,\\s*fp\\s*\\)", hint: "Read with fgets(buf, sizeof(buf), fp)." },
        { label: "Closes the FILE handle", pattern: "fclose\\s*\\(\\s*fp\\s*\\)\\s*;", hint: "Always call fclose(fp); when finished." }
      ]
    }
  },
  {
    day: 23,
    week: 4,
    title: "File Handling: Writing Files",
    summary: "Write structured records with fprintf/fwrite and verify flush & close status.",
    concepts: ["fprintf", "fwrite", "w / a / wb modes", "ferror"],
    lessonMarkdown: `# Day 23: Writing Files & Flushing Streams

Opening a file with \`"w"\` truncates/creates it, \`"a"\` appends to the end, and adding \`"b"\` (\`"wb"\`) disables Windows newline translation for binary formats.

\`\`\`c
#include <stdio.h>

int main(void) {
    FILE *fp = tmpfile();
    if (!fp) return 1;

    fprintf(fp, "day=%d status=%s\\n", 23, "ok");
    fflush(fp);
    rewind(fp);

    char out[64];
    if (fgets(out, sizeof(out), fp)) {
        printf("%s", out);
    }
    fclose(fp);
    return 0;
}
\`\`\`

- Standard I/O is buffered in user space for speed. Calling \`fclose(fp)\` flushes remaining bytes to the OS and releases the file descriptor.`,
    quiz: [
      {
        question: "What is the difference between `fopen(path, \"w\")` and `fopen(path, \"a\")`?",
        options: [
          "\"w\" is read-only; \"a\" is write-only",
          "\"w\" truncates an existing file to 0 bytes; \"a\" appends to the end",
          "\"a\" opens in binary mode",
          "There is no difference"
        ],
        correctAnswerIndex: 1,
        explanation: "Write mode (\"w\") overwrites existing content from byte 0; append mode (\"a\") preserves existing bytes."
      },
      {
        question: "Which function writes formatted text directly into an open `FILE *fp`?",
        options: ["sprintf", "fprintf", "fgetc", "fseek"],
        correctAnswerIndex: 1,
        explanation: "fprintf works like printf but targets the specified FILE * stream."
      }
    ],
    exercise: {
      description: "Use `fprintf` to write `\"written=ok\\n\"` into a `tmpfile()`, rewind, read with `fgets`, print it, and `fclose`.",
      initialCode: `#include <stdio.h>\n\nint main(void) {\n    FILE *fp = tmpfile();\n    if (!fp) return 1;\n    // Write formatted text using fprintf, rewind, read back, and fclose\n    \n    return 0;\n}\n`,
      solutionCode: `#include <stdio.h>\n\nint main(void) {\n    FILE *fp = tmpfile();\n    if (!fp) return 1;\n    fprintf(fp, "written=%s\\n", "ok");\n    rewind(fp);\n    char line[32];\n    if (fgets(line, sizeof(line), fp) != NULL) {\n        printf("%s", line);\n    }\n    fclose(fp);\n    return 0;\n}\n`,
      expectedOutput: "written=ok",
      hint: "Call fprintf(fp, \"written=%s\\n\", \"ok\");, rewind(fp);, read into a buffer with fgets, print, and fclose(fp);.",
      rules: [
        { label: "Writes with fprintf", pattern: "fprintf\\s*\\(\\s*fp\\s*,", hint: "Use fprintf(fp, ...) to write to the stream." },
        { label: "Rewinds and reads back", pattern: "rewind\\s*\\(\\s*fp\\s*\\)", hint: "Call rewind(fp); before reading back." },
        { label: "Closes the stream", pattern: "fclose\\s*\\(\\s*fp\\s*\\)\\s*;", hint: "Call fclose(fp); before returning." }
      ]
    }
  },
  {
    day: 24,
    week: 4,
    title: "Command Line Arguments",
    summary: "Parse CLI flags and positional arguments with argc, argv, and strtol.",
    concepts: ["int argc", "char *argv[]", "argv[0]", "strtol"],
    lessonMarkdown: `# Day 24: Command Line Arguments (argc & argv)

Unix tools receive CLI arguments through \`int main(int argc, char *argv[])\`:
- \`argc\` is the argument count (always \`>= 1\`).
- \`argv[0]\` is the program name/path; user arguments start at \`argv[1]\`.

\`\`\`c
#include <stdio.h>

int main(int argc, char *argv[]) {
    printf("argc=%d prog=%s\\n", argc, argv[0]);
    for (int i = 1; i < argc; i++) {
        printf("arg[%d]=%s\\n", i, argv[i]);
    }
    return 0;
}
\`\`\`

> **Parsing Integers:** Prefer \`strtol(argv[1], &end, 10)\` over \`atoi()\` because \`strtol\` detects invalid non-numeric input and overflow.`,
    quiz: [
      {
        question: "If you invoke `./tool --port 8080`, what are `argc` and `argv[1]`?",
        options: [
          "argc=2, argv[1]=\"8080\"",
          "argc=3, argv[1]=\"--port\"",
          "argc=3, argv[1]=\"./tool\"",
          "argc=2, argv[1]=\"--port\""
        ],
        correctAnswerIndex: 1,
        explanation: "argv[0] is \"./tool\", argv[1] is \"--port\", and argv[2] is \"8080\", making argc == 3."
      },
      {
        question: "Why is `strtol()` preferred over `atoi()` for CLI integers?",
        options: [
          "atoi() cannot parse negative numbers",
          "strtol() reports parse errors and overflow via endptr and errno",
          "strtol() works without #include <stdlib.h>",
          "atoi() allocates heap memory"
        ],
        correctAnswerIndex: 1,
        explanation: "atoi(\"abc\") silently returns 0 with no way to distinguish an error from an actual zero."
      }
    ],
    exercise: {
      description: "Write `int main(int argc, char *argv[])` that prints `args=0` if `argc == 1`, or prints `argv[1]` when provided.",
      initialCode: `#include <stdio.h>\n\nint main(int argc, char *argv[]) {\n    // Check argc and print either args=0 or argv[1]\n    \n    return 0;\n}\n`,
      solutionCode: `#include <stdio.h>\n\nint main(int argc, char *argv[]) {\n    if (argc < 2) {\n        printf("args=0\\n");\n    } else {\n        printf("arg1=%s\\n", argv[1]);\n    }\n    return 0;\n}\n`,
      expectedOutput: "args=0",
      hint: "Use if (argc < 2) { printf(\"args=0\\n\"); } else { printf(\"arg1=%s\\n\", argv[1]); }",
      rules: [
        { label: "Accepts argc and argv", pattern: "int\\s+main\\s*\\(\\s*int\\s+argc\\s*,\\s*char\\s*\\*\\s*argv\\s*\\[\\s*\\]\\s*\\)", hint: "Use int main(int argc, char *argv[])." },
        { label: "Checks argc count", pattern: "argc\\s*(<|==|>)", hint: "Check argc before reading argv[1]." },
        { label: "References argv[1]", pattern: "argv\\s*\\[\\s*1\\s*\\]", hint: "Print argv[1] in the else branch." }
      ]
    }
  },
  {
    day: 25,
    week: 5,
    title: "The Preprocessor (#define, #include)",
    summary: "Understand macro expansion, include guards, and conditional compilation.",
    concepts: ["#define", "macro parentheses", "#ifndef guard", "static inline"],
    lessonMarkdown: `# Day 25: The C Preprocessor

Before compilation begins, the preprocessor (\`cpp\`) performs textual substitution for \`#include\`, \`#define\`, and \`#ifdef\`.

\`\`\`c
#include <stdio.h>

#define MAX_NODES 64
#define SQUARE(x) ((x) * (x))

int main(void) {
    printf("max=%d sq=%d\\n", MAX_NODES, SQUARE(3 + 2)); // 25
    return 0;
}
\`\`\`

- **Always parenthesize** macro parameters AND the whole expansion: without outer/inner parens, \`SQUARE(3 + 2)\` would expand to \`3 + 2 * 3 + 2 = 11\`!
- Never pass expressions with side effects like \`SQUARE(i++)\` to a macro—use a \`static inline\` function instead.
- Guard header files with \`#ifndef MY_HDR_H / #define MY_HDR_H / #endif\`.`,
    quiz: [
      {
        question: "If `#define MUL(a, b) a * b` (missing parentheses), what does `MUL(2 + 3, 4)` evaluate to?",
        options: ["20", "14", "24", "Compile error"],
        correctAnswerIndex: 1,
        explanation: "Textual substitution produces 2 + 3 * 4, which evaluates as 2 + 12 = 14 due to precedence!"
      },
      {
        question: "Why use include guards (`#ifndef ... #define ... #endif`) in `.h` header files?",
        options: [
          "To encrypt header code",
          "To prevent duplicate-definition errors when a header is included multiple times",
          "To speed up runtime loops",
          "To link static libraries"
        ],
        correctAnswerIndex: 1,
        explanation: "Include guards ensure the header's contents are processed at most once per translation unit."
      }
    ],
    exercise: {
      description: "Define a parenthesized macro `#define DOUBLE(x) ((x) * 2)` and print `DOUBLE(4 + 1)` as `res=10`.",
      initialCode: `#include <stdio.h>\n\n// Define parenthesized macro DOUBLE(x)\n\nint main(void) {\n    printf("res=%d\\n", DOUBLE(4 + 1));\n    return 0;\n}\n`,
      solutionCode: `#include <stdio.h>\n\n#define DOUBLE(x) ((x) * 2)\n\nint main(void) {\n    printf("res=%d\\n", DOUBLE(4 + 1));\n    return 0;\n}\n`,
      expectedOutput: "res=10",
      hint: "Add #define DOUBLE(x) ((x) * 2) above main().",
      rules: [
        { label: "Defines macro DOUBLE(x)", pattern: "#define\\s+DOUBLE\\(\\s*x\\s*\\)", hint: "Define #define DOUBLE(x) ((x) * 2)." },
        { label: "Parenthesizes macro parameter (x)", pattern: "\\(\\s*x\\s*\\)", hint: "Wrap x in parentheses so 4 + 1 evaluates before multiplying." }
      ]
    }
  },
  {
    day: 26,
    week: 5,
    title: "Advanced Pointers (Function Pointers)",
    summary: "Pass callbacks and build dispatch tables with typed function pointers.",
    concepts: ["function pointer", "typedef callback", "qsort comparator", "dispatch table"],
    lessonMarkdown: `# Day 26: Function Pointers & Callbacks

Functions live at concrete addresses in the text segment, so pointers can point to code just like data. Function pointers power \`qsort()\`, event loops, and Linux kernel virtual-file-system ops tables.

\`\`\`c
#include <stdio.h>

typedef int (*BinaryOp)(int, int);

int add(int a, int b) { return a + b; }
int mul(int a, int b) { return a * b; }

int apply(BinaryOp op, int x, int y) {
    return op(x, y);
}

int main(void) {
    printf("add=%d mul=%d\\n", apply(add, 3, 4), apply(mul, 3, 4));
    return 0;
}
\`\`\`

- Wrapping a function pointer signature in a \`typedef\` keeps parameter lists clean and readable.`,
    quiz: [
      {
        question: "Which standard library function takes a function pointer comparator to sort arbitrary arrays?",
        options: ["memcpy", "qsort", "strcmp", "malloc"],
        correctAnswerIndex: 1,
        explanation: "qsort() in <stdlib.h> accepts a callback int (*compar)(const void *, const void *)."
      },
      {
        question: "What does `int (*fn)(int, int)` declare?",
        options: [
          "A function returning an int pointer",
          "A pointer to a function taking two ints and returning an int",
          "An array of two int pointers",
          "Invalid C syntax"
        ],
        correctAnswerIndex: 1,
        explanation: "Parentheses around (*fn) bind * to fn first, making it a pointer to a function."
      }
    ],
    exercise: {
      description: "Define `typedef int (*Op)(int, int);`, implement `int add(int a, int b)`, assign `Op fn = add;`, and print `sum=11` for `fn(5, 6)`.",
      initialCode: `#include <stdio.h>\n\n// Define typedef int (*Op)(int, int); and int add(int a, int b)\n\nint main(void) {\n    // Assign Op fn = add and call fn(5, 6)\n    \n    return 0;\n}\n`,
      solutionCode: `#include <stdio.h>\n\ntypedef int (*Op)(int, int);\n\nint add(int a, int b) {\n    return a + b;\n}\n\nint main(void) {\n    Op fn = add;\n    printf("sum=%d\\n", fn(5, 6));\n    return 0;\n}\n`,
      expectedOutput: "sum=11",
      hint: "Write typedef int (*Op)(int, int);, int add(int a, int b) { return a + b; }, then Op fn = add; printf(\"sum=%d\\n\", fn(5, 6));.",
      rules: [
        { label: "Declares function pointer type Op", pattern: "typedef\\s+int\\s*\\(\\s*\\*\\s*Op\\s*\\)\\s*\\(\\s*int\\s*,\\s*int\\s*\\)\\s*;", hint: "Add typedef int (*Op)(int, int);." },
        { label: "Defines add function", pattern: "int\\s+add\\s*\\(\\s*int\\s+\\w+\\s*,\\s*int\\s+\\w+\\s*\\)", hint: "Define int add(int a, int b)." },
        { label: "Invokes through function pointer", pattern: "Op\\s+\\w+\\s*=\\s*add", hint: "Assign Op fn = add; and call fn(5, 6)." }
      ]
    }
  },
  {
    day: 27,
    week: 5,
    title: "Error Handling in C",
    summary: "Propagate errors cleanly with status enums, errno, stderr, and goto cleanup.",
    concepts: ["status codes", "errno / strerror", "stderr", "goto cleanup"],
    lessonMarkdown: `# Day 27: Error Handling in C

C has no \`try/catch\` exceptions—errors are explicit return values. Systems code combines typed error enums with \`errno\` and \`stderr\` for clear diagnostics.

\`\`\`c
#include <stdio.h>

typedef enum {
    ERR_OK = 0,
    ERR_DIV_ZERO = -1
} Status;

Status safe_div(int a, int b, int *out) {
    if (b == 0 || !out) return ERR_DIV_ZERO;
    *out = a / b;
    return ERR_OK;
}

int main(void) {
    int q = 0;
    if (safe_div(10, 0, &q) != ERR_OK) {
        fprintf(stderr, "error: division by zero\\n");
        printf("handled=ERR_DIV_ZERO\\n");
    }
    return 0;
}
\`\`\`

- Always print error diagnostics to \`stderr\` so callers piping \`stdout\` never receive corrupt data.`,
    quiz: [
      {
        question: "Why should C CLI tools write error messages to `stderr` instead of `stdout`?",
        options: [
          "stderr is buffered faster",
          "So errors remain visible to humans without polluting piped stdout data",
          "printf cannot print error strings",
          "stderr automatically exits the process"
        ],
        correctAnswerIndex: 1,
        explanation: "Keeping data on stdout and diagnostics on stderr lets Unix pipelines stay clean."
      },
      {
        question: "In C systems APIs, what return code conventionally signals success?",
        options: ["1", "0", "-1", "200"],
        correctAnswerIndex: 1,
        explanation: "0 universally signals success in POSIX/C APIs, while non-zero values encode specific error codes."
      }
    ],
    exercise: {
      description: "Implement `int safe_div(int a, int b, int *out)` returning `-1` when `b == 0` and `0` on success; print `ok=5` for `safe_div(15, 3, &res)`.",
      initialCode: `#include <stdio.h>\n\nint safe_div(int a, int b, int *out) {\n    // Guard b == 0 or !out, else write *out = a / b and return 0\n    return -1;\n}\n\nint main(void) {\n    int res = 0;\n    if (safe_div(15, 3, &res) == 0) {\n        printf("ok=%d\\n", res);\n    }\n    return 0;\n}\n`,
      solutionCode: `#include <stdio.h>\n\nint safe_div(int a, int b, int *out) {\n    if (b == 0 || out == NULL) {\n        return -1;\n    }\n    *out = a / b;\n    return 0;\n}\n\nint main(void) {\n    int res = 0;\n    if (safe_div(15, 3, &res) == 0) {\n        printf("ok=%d\\n", res);\n    }\n    return 0;\n}\n`,
      expectedOutput: "ok=5",
      hint: "Check if (b == 0 || !out) return -1; then assign *out = a / b; and return 0;.",
      rules: [
        { label: "Guards division by zero", pattern: "b\\s*==\\s*0", hint: "Check if (b == 0 ...) before dividing." },
        { label: "Writes result through *out", pattern: "\\*\\s*out\\s*=\\s*a\\s*/\\s*b\\s*;", hint: "Store quotient via *out = a / b;." },
        { label: "Returns 0 on success", pattern: "return\\s+0\\s*;", hint: "Return 0 after setting *out." }
      ]
    }
  },
  {
    day: 28,
    week: 5,
    title: "Data Structures: Linked Lists Basics",
    summary: "Build a self-referential Node struct, push nodes, traverse, and free the whole chain.",
    concepts: ["self-referential struct", "head pointer", "traversal", "safe free loop"],
    lessonMarkdown: `# Day 28: Singly Linked Lists

A linked list chains heap-allocated \`Node\` structs using a \`struct Node *next\` pointer—allowing O(1) insertion at the head without shifting elements.

\`\`\`c
#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    int value;
    struct Node *next;
} Node;

Node *push_front(Node *head, int value) {
    Node *n = malloc(sizeof(*n));
    if (!n) return head;
    n->value = value;
    n->next = head;
    return n;
}

int main(void) {
    Node *head = NULL;
    head = push_front(head, 10);
    head = push_front(head, 20);

    for (Node *cur = head; cur != NULL; cur = cur->next) {
        printf("%d ", cur->value);
    }
    printf("\\n");

    while (head) {
        Node *next = head->next; // save next BEFORE free!
        free(head);
        head = next;
    }
    return 0;
}
\`\`\`

> **Critical Pattern:** When freeing a linked list, always save \`head->next\` in a temporary pointer **before** calling \`free(head)\`.`,
    quiz: [
      {
        question: "Why must you save `Node *next = cur->next;` BEFORE calling `free(cur);`?",
        options: [
          "free() returns the next pointer",
          "Reading cur->next after free(cur) is a use-after-free bug",
          "C forbids dereferencing inside while loops",
          "next is a reserved keyword"
        ],
        correctAnswerIndex: 1,
        explanation: "Once cur is freed, its memory is invalid to read; save the link pointer first."
      },
      {
        question: "What is the time complexity of inserting a new node at the head of a singly linked list?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n^2)"],
        correctAnswerIndex: 0,
        explanation: "Head insertion only allocates one node and updates two pointers regardless of list length."
      }
    ],
    exercise: {
      description: "Create two linked `Node`s (`20 -> 10 -> NULL`) on the heap, traverse and print their sum `sum=30`, then free both nodes cleanly.",
      initialCode: `#include <stdio.h>\n#include <stdlib.h>\n\ntypedef struct Node {\n    int value;\n    struct Node *next;\n} Node;\n\nint main(void) {\n    // Allocate two nodes, link n1->next = n2, sum them, print sum=30, and free both\n    \n    return 0;\n}\n`,
      solutionCode: `#include <stdio.h>\n#include <stdlib.h>\n\ntypedef struct Node {\n    int value;\n    struct Node *next;\n} Node;\n\nint main(void) {\n    Node *n1 = malloc(sizeof(*n1));\n    Node *n2 = malloc(sizeof(*n2));\n    if (!n1 || !n2) {\n        free(n1);\n        free(n2);\n        return 1;\n    }\n    n1->value = 20;\n    n1->next = n2;\n    n2->value = 10;\n    n2->next = NULL;\n\n    int sum = 0;\n    for (Node *cur = n1; cur != NULL; cur = cur->next) {\n        sum += cur->value;\n    }\n    printf("sum=%d\\n", sum);\n\n    Node *cur = n1;\n    while (cur != NULL) {\n        Node *next = cur->next;\n        free(cur);\n        cur = next;\n    }\n    return 0;\n}\n`,
      expectedOutput: "sum=30",
      hint: "Allocate n1 and n2 with malloc(sizeof(*n1)), set n1->value = 20; n1->next = n2; n2->value = 10; n2->next = NULL;, traverse to sum, then free in a loop.",
      rules: [
        { label: "Allocates Nodes with malloc", pattern: "\\bmalloc\\s*\\(", hint: "Allocate Node structs using malloc(sizeof(*n1))." },
        { label: "Links nodes via ->next", pattern: "->\\s*next", hint: "Link and traverse nodes with ->next." },
        { label: "Frees allocated nodes", pattern: "\\bfree\\s*\\(", hint: "Free all heap nodes before exiting." }
      ]
    }
  },
  {
    day: 29,
    week: 5,
    title: "Memory Leaks and Debugging Tools",
    summary: "Hunt leaks, buffer overruns, and UB with AddressSanitizer, UBSan, and Valgrind.",
    concepts: ["-fsanitize=address", "-fsanitize=undefined", "valgrind", "gdb"],
    lessonMarkdown: `# Day 29: Sanitizers, Valgrind & Memory Hygiene

Never guess where a memory bug lives—let compiler instrumentation catch it on the exact failing line.

## Essential Debugging Commands

\`\`\`bash
# Compile with AddressSanitizer + UndefinedBehaviorSanitizer + debug symbols
gcc -Wall -Wextra -std=c11 -g -fsanitize=address,undefined app.c -o app
./app

# Or inspect heap leaks & uninitialized reads with Valgrind
valgrind --leak-check=full --error-exitcode=1 ./app
\`\`\`

## The 4 Classic Memory Bugs Sanitizers Catch
1. **Heap buffer overflow** — writing 1 byte past \`malloc(n)\`.
2. **Use-after-free** — reading memory after \`free(p)\`.
3. **Memory leak** — losing the last pointer to a heap block without calling \`free\`.
4. **Signed integer overflow / NULL dereference** — caught immediately by \`-fsanitize=undefined\`.`,
    quiz: [
      {
        question: "Which GCC flag enables AddressSanitizer to catch heap/stack buffer overflows and leaks at runtime?",
        options: ["-O3", "-fsanitize=address", "-static", "-E"],
        correctAnswerIndex: 1,
        explanation: "-fsanitize=address (ASan) instruments memory accesses and reports exact stack traces on bounds errors or leaks."
      },
      {
        question: "Why pass `-g` when compiling a program for `gdb` or `valgrind`?",
        options: [
          "It enables GPU acceleration",
          "It embeds DWARF debug symbols mapping machine addresses to source file lines",
          "It disables optimizations permanently",
          "It strips symbol names"
        ],
        correctAnswerIndex: 1,
        explanation: "-g preserves source filenames, line numbers, and variable names for readable stack traces."
      }
    ],
    exercise: {
      description: "Fix the classic memory-leak + off-by-one bug: allocate `4` ints with `calloc`, fill indices `0..3` with `1,2,3,4`, print `clean=10`, and `free` cleanly.",
      initialCode: `#include <stdio.h>\n#include <stdlib.h>\n\nint main(void) {\n    // Allocate 4 ints with calloc, fill 0..3 safely (no off-by-one!), sum & free\n    \n    return 0;\n}\n`,
      solutionCode: `#include <stdio.h>\n#include <stdlib.h>\n\nint main(void) {\n    size_t n = 4;\n    int *buf = calloc(n, sizeof(*buf));\n    if (!buf) return 1;\n\n    int total = 0;\n    for (size_t i = 0; i < n; i++) {\n        buf[i] = (int)(i + 1);\n        total += buf[i];\n    }\n    printf("clean=%d\\n", total);\n    free(buf);\n    buf = NULL;\n    return 0;\n}\n`,
      expectedOutput: "clean=10",
      hint: "Use calloc(4, sizeof(*buf)), loop with i < n (strict <), accumulate total, print clean=10, and call free(buf);.",
      rules: [
        { label: "Allocates zeroed memory with calloc", pattern: "\\bcalloc\\s*\\(", hint: "Use calloc(n, sizeof(*buf))." },
        { label: "Uses strict upper bound <", pattern: "i\\s*<\\s*(n|4)", hint: "Use i < 4 (not <=) to avoid heap buffer overflow." },
        { label: "Frees heap buffer", pattern: "\\bfree\\s*\\(\\s*\\w+\\s*\\)\\s*;", hint: "Free the allocated buffer so ASan/Valgrind reports 0 bytes leaked." }
      ]
    }
  },
  {
    day: 30,
    week: 5,
    title: "Final Project & Wrap-up",
    summary: "Combine structs, dynamic arrays, functions, and memory hygiene into a mini Task Ledger.",
    concepts: ["capstone architecture", "dynamic array", "realloc", "clean ownership"],
    lessonMarkdown: `# Day 30: Capstone — Dynamic Task Ledger

Congratulations on reaching Day 30! Real C programs combine everything you practiced: **structs**, **dynamic heap capacity**, **pointer ownership**, **clean APIs**, and **zero-warning compilation**.

## Capstone Architecture

\`\`\`c
#include <stdio.h>
#include <stdlib.h>

typedef struct {
    int id;
    int done;
} Task;

typedef struct {
    Task *items;
    size_t len;
    size_t cap;
} Ledger;

int ledger_push(Ledger *l, int id, int done) {
    if (l->len == l->cap) {
        size_t next_cap = l->cap ? l->cap * 2 : 4;
        Task *grown = realloc(l->items, next_cap * sizeof(*grown));
        if (!grown) return -1;
        l->items = grown;
        l->cap = next_cap;
    }
    l->items[l->len++] = (Task){.id = id, .done = done};
    return 0;
}
\`\`\`

- Notice how \`realloc\` stores into a temporary \`grown\` pointer first—if \`realloc\` fails and returns \`NULL\`, the original \`l->items\` pointer is not lost!

> **Next Steps:** Build a tiny HTTP server, a bytecode VM, or a CLI JSON parser in C11 with \`-Wall -Wextra -Werror -fsanitize=address,undefined\`.`,
    quiz: [
      {
        question: "Why should you assign `realloc(ptr, new_size)` to a temporary pointer before overwriting `ptr`?",
        options: [
          "realloc requires two pointers",
          "If realloc returns NULL on OOM, overwriting ptr directly leaks the original block",
          "Temporary pointers skip copying bytes",
          "C11 forbids assigning realloc to struct fields"
        ],
        correctAnswerIndex: 1,
        explanation: "On failure, realloc leaves the original allocation intact; assigning directly to ptr overwrites your only handle to it."
      },
      {
        question: "What does a complete C11 systems workflow verify before shipping a binary?",
        options: [
          "Only that it compiles without syntax errors",
          "Clean -Wall -Wextra -std=c11 build, automated tests, and 0-leak sanitizer run",
          "Removing all free() calls for speed",
          "Disabling warnings with -w"
        ],
        correctAnswerIndex: 1,
        explanation: "Strict compiler warnings + unit tests + ASan/UBSan form the gold standard for reliable C software."
      }
    ],
    exercise: {
      description: "Build a mini `Task` ledger: allocate 2 `Task` structs on the heap, mark 1 complete (`done = 1`), count completed tasks, print `done=1/2`, and free.",
      initialCode: `#include <stdio.h>\n#include <stdlib.h>\n\ntypedef struct {\n    int id;\n    int done;\n} Task;\n\nint main(void) {\n    // Allocate 2 Tasks, set task[0].done = 1, task[1].done = 0, count done, print done=1/2, free\n    \n    return 0;\n}\n`,
      solutionCode: `#include <stdio.h>\n#include <stdlib.h>\n\ntypedef struct {\n    int id;\n    int done;\n} Task;\n\nint main(void) {\n    size_t count = 2;\n    Task *tasks = calloc(count, sizeof(*tasks));\n    if (!tasks) return 1;\n\n    tasks[0] = (Task){.id = 1, .done = 1};\n    tasks[1] = (Task){.id = 2, .done = 0};\n\n    size_t completed = 0;\n    for (size_t i = 0; i < count; i++) {\n        if (tasks[i].done) completed++;\n    }\n    printf("done=%zu/%zu\\n", completed, count);\n    free(tasks);\n    tasks = NULL;\n    return 0;\n}\n`,
      expectedOutput: "done=1/2",
      hint: "Allocate Task *tasks = calloc(2, sizeof(*tasks));, set tasks[0].done = 1, count completed in a loop, print done=%zu/%zu, and free(tasks);.",
      rules: [
        { label: "Allocates Task array on heap", pattern: "\\b(malloc|calloc)\\s*\\(", hint: "Allocate tasks on the heap with malloc or calloc." },
        { label: "Checks allocation failure", pattern: "if\\s*\\(\\s*(!\\s*\\w+|\\w+\\s*==\\s*NULL)", hint: "Check if (!tasks) return 1;." },
        { label: "Prints done=1/2 summary", pattern: "printf\\s*\\([^;]*done=", hint: "Print the completed count formatted as done=1/2." },
        { label: "Frees heap memory", pattern: "\\bfree\\s*\\(\\s*\\w+\\s*\\)\\s*;", hint: "Call free(tasks); before returning." }
      ]
    }
  }
];
