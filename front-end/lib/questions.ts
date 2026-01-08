export type Question = {
    id: number;
    text: string;
    options: string[];
    correct: number; // Index 0-3
    difficulty: "Easy" | "Medium" | "Hard";
    isConceptual: boolean;
    conceptTag: string; // The "To the dot" precise concept
    explanation: string;
};

// 10 Pure Calculus Questions (High Quality, Conceptual)
export const CALCULUS_QUESTIONS: Question[] = [
    {
        id: 1,
        text: "Which condition is NOT required for f(x) to be continuous at x=a?",
        options: [
            "f(a) is defined",
            "lim(x->a) f(x) exists",
            "f(x) is differentiable at a",
            "lim(x->a) f(x) = f(a)"
        ],
        correct: 2,
        difficulty: "Easy",
        isConceptual: true,
        conceptTag: "Continuity vs Differentiability Hierarchy",
        explanation: "Differentiability is a stronger condition. Continuous functions (like |x| at 0) need not be differentiable."
    },
    {
        id: 2,
        text: "Evaluate lim(x->0) (sin(3x) / x)",
        options: ["0", "1", "3", "Undefined"],
        correct: 2,
        difficulty: "Easy",
        isConceptual: false,
        conceptTag: "Special Trig Limits Application",
        explanation: "Uses lim(u->0) sin(u)/u = 1. Multiply/divide by 3 -> 3 * 1 = 3."
    },
    {
        id: 3,
        text: "If f'(c) = 0 and f''(c) > 0, what happens at x=c?",
        options: ["Local Maximum", "Local Minimum", "Inflection Point", "Inconclusive"],
        correct: 1,
        difficulty: "Easy",
        isConceptual: true,
        conceptTag: "Second Derivative Test Logic",
        explanation: "Positive concavity (f''>0) at a critical point (f'=0) implies a local minimum."
    },
    {
        id: 4,
        text: "True or False: If lim(n->inf) a_n = 0, then sum(a_n) converges.",
        options: ["True", "False", "Only if alternating", "Only if bounded"],
        correct: 1,
        difficulty: "Hard",
        isConceptual: true,
        conceptTag: "Nth Term Divergence Test Misconception",
        explanation: "False. The Harmonic Series (1/n) terms go to 0, but the series diverges."
    },
    {
        id: 5,
        text: "d/dx integral(a to x) of sin(t^2) dt equals:",
        options: ["sin(t^2)", "sin(x^2)", "2x cos(x^2)", "cos(x^2)"],
        correct: 1,
        difficulty: "Medium",
        isConceptual: true,
        conceptTag: "Fundamental Theorem of Calculus (Part 1)",
        explanation: "FTC1 states d/dx Int(a to x) f(t)dt = f(x)."
    },
    {
        id: 6,
        text: "For the Mean Value Theorem to apply on [a,b], f(x) must be:",
        options: [
            "Continuous on [a,b]",
            "Differentiable on (a,b)",
            "Both Continuous on [a,b] and Differentiable on (a,b)",
            "Integrable on [a,b]"
        ],
        correct: 2,
        difficulty: "Medium",
        isConceptual: true,
        conceptTag: "MVT Prerequisites Precision",
        explanation: "MVT requires strict continuity on the closed interval and differentiability on the open interval."
    },
    {
        id: 7,
        text: "What does the definite integral of velocity v(t) from t=a to t=b represent?",
        options: ["Total Distance Traveled", "Net Displacement", "Acceleration", "Average Velocity"],
        correct: 1,
        difficulty: "Medium",
        isConceptual: true,
        conceptTag: "Physical Interpretation of Definite Integrals",
        explanation: "Integral of velocity (vector) is Net Displacement. Integral of |velocity| (speed) is Distance."
    },
    {
        id: 8,
        text: "Which method is best for integrating x*e^x?",
        options: ["U-Substitution", "Integration by Parts", "Partial Fractions", "Trig Substitution"],
        correct: 1,
        difficulty: "Medium",
        isConceptual: false,
        conceptTag: "Integration Technique Selection Strategy",
        explanation: "Product of distinct algebraic and exponential functions usually requires By Parts (LIATE rule)."
    },
    {
        id: 9,
        text: "The radius of convergence for sum(x^n) is:",
        options: ["0", "1", "Infinity", "Undefined"],
        correct: 1,
        difficulty: "Hard",
        isConceptual: false,
        conceptTag: "Geometric Series Convergence Interval",
        explanation: "Geometric series converges for |r| < 1. Here r=x, so |x| < 1. Radius is 1."
    },
    {
        id: 10,
        text: "Does the limit lim(x,y -> 0,0) (x^2-y^2)/(x^2+y^2) exist?",
        options: ["Yes, approaches 0", "Yes, approaches 1", "No, path dependent", "Yes, approaches infinity"],
        correct: 2,
        difficulty: "Hard",
        isConceptual: true,
        conceptTag: "Multivariable Limit Path Dependency",
        explanation: "Approaching along x=0 gives -1. Along y=0 gives 1. Different limits => DNE."
    }
];
