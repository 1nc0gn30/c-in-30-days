export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface Exercise {
  description: string;
  initialCode: string;
}

export interface DayContent {
  day: number;
  title: string;
  lessonMarkdown?: string;
  quiz?: QuizQuestion[];
  exercise?: Exercise;
}

export const curriculum: DayContent[] = [
  {
    day: 1,
    title: "Introduction and Setup",
    lessonMarkdown: `
# Welcome to Day 1: Introduction to C!
C is a powerful general-purpose programming language. It is fast, portable, and heavily used in system programming, embedded systems, and game development.

## The Basic Structure of a C Program
Every C program needs a \`main\` function. This is where the execution begins.

\`\`\`c
#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}
\`\`\`

- \`#include <stdio.h>\`: Tells the compiler to include the Standard Input/Output library.
- \`int main()\`: The main function that returns an integer.
- \`printf\`: A function to print text to the screen.
- \`return 0;\`: Indicates that the program executed successfully.
    `,
    quiz: [
      {
         question: "Which function is the entry point of a C program?",
         options: ["start()", "main()", "init()", "execute()"],
         correctAnswerIndex: 1,
         explanation: "Every C program begins execution from the main() function."
      },
      {
         question: "Which library must be included to use printf?",
         options: ["<stdlib.h>", "<string.h>", "<stdio.h>", "<math.h>"],
         correctAnswerIndex: 2,
         explanation: "<stdio.h> stands for Standard Input Output header and handles printing to the console."
      }
    ],
    exercise: {
      description: "Write a program that prints 'Welcome to C!' to the console.",
      initialCode: `#include <stdio.h>\n\nint main() {\n    // Print your message here\n    \n    return 0;\n}`
    }
  },
  {
    day: 2,
    title: "Variables and Data Types",
    lessonMarkdown: `
# Day 2: Variables and Data Types
In C, you must declare the type of a variable before you use it. This is called strong typing.

## Primitive Data Types
- **int**: Integer numbers (e.g., 42, -7)
- **float**: Floating-point numbers (e.g., 3.14)
- **double**: Double precision floating-point numbers
- **char**: Single characters (e.g., 'a', 'Z')

## Declaring and Initializing

\`\`\`c
int age = 25;
float price = 19.99;
char initial = 'J';

printf("Age: %d\\n", age);
printf("Price: %f\\n", price);
printf("Initial: %c\\n", initial);
\`\`\`
 Notice the format specifiers \`%d\` (int), \`%f\` (float), and \`%c\` (char).
    `,
    quiz: [
      {
         question: "Which data type is used to store 'H'?",
         options: ["int", "char", "string", "float"],
         correctAnswerIndex: 1,
         explanation: "The char data type stores a single character."
      }
    ],
    exercise: {
      description: "Declare an integer variable named year initialized to 2024, and print it using printf.",
      initialCode: `#include <stdio.h>\n\nint main() {\n    // Declare and initialize\n    \n    // Print\n    \n    return 0;\n}`
    }
  },
  { day: 3, title: "Operators and Expressions" },
  { day: 4, title: "Control Flow: If/Else Statements" },
  { day: 5, title: "Control Flow: Switch Statement" },
  { day: 6, title: "Loops: The While Loop" },
  { day: 7, title: "Loops: The For Loop" },
  { day: 8, title: "Loops: Do-While and Loop Control" },
  { day: 9, title: "Functions: Basics" },
  { day: 10, title: "Functions: Parameters and Return Types" },
  { day: 11, title: "Variable Scope and Lifetimes" },
  { day: 12, title: "Arrays: Introduction" },
  { day: 13, title: "Arrays: Multi-dimensional Arrays" },
  { day: 14, title: "Strings: Arrays of Characters" },
  { day: 15, title: "String Manipulation Functions" },
  { day: 16, title: "Pointers: The Basics" },
  { day: 17, title: "Pointers and Arrays" },
  { day: 18, title: "Pointers and Functions (Pass by Reference)" },
  { day: 19, title: "Dynamic Memory Allocation (malloc, free)" },
  { day: 20, title: "Structures (struct)" },
  { day: 21, title: "Unions and Typedef" },
  { day: 22, title: "File Handling: Reading Files" },
  { day: 23, title: "File Handling: Writing Files" },
  { day: 24, title: "Command Line Arguments" },
  { day: 25, title: "The Preprocessor (#define, #include)" },
  { day: 26, title: "Advanced Pointers (Function Pointers)" },
  { day: 27, title: "Error Handling in C" },
  { day: 28, title: "Data Structures: Linked Lists Basics" },
  { day: 29, title: "Memory Leaks and Debugging Tools" },
  { day: 30, title: "Final Project & Wrap-up" },
];
