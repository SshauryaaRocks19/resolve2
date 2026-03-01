// Types matching the generator API response schema
export type GeneratedQuestion = {
    diagnosed_weakness: string;
    question: string;
    options: string[];
    correct_index: number;
    conceptual_breakdown: string;
};

// What gets stored in sessionStorage for the take-test page
export type TestSession = {
    questions: GeneratedQuestion[];
    topic: string;
    level: string;
    syllabus: string;
    startedAt: string;
    timeLimitMinutes: number | null; // null = no time limit
};

// What the user builds during the test, stored in localStorage for results page
export type TestResult = {
    answers: Record<number, number>;   // questionIndex → selected optionIndex
    times: Record<number, number>;     // questionIndex → ms spent
    topic: string;
};
