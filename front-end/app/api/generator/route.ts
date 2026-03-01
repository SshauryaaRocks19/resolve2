import { GoogleGenAI, Type, Schema } from '@google/genai';
import { connectDB } from '@/lib/mongodb';
import { ConceptMastery } from '@/lib/models';
import { NextResponse } from 'next/server';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: Request) {
    try {
        const { userId, topic, level, syllabus, numQuestions = 10 } = await request.json();
        const qCount = Math.min(Math.max(numQuestions, 3), 30);

        await connectDB();

        const weaknesses = await ConceptMastery.find({
            user_id: userId,
            topic,
            error_weight: { $gt: 0 },
        }).lean();

        const mathInstruction = `
      MATH FORMATTING: If the topic involves mathematics, physics, or any scientific notation:
      - Use LaTeX notation wrapped in $ for inline math (e.g., $\\frac{d}{dx} x^2 = 2x$)
      - Use $$ for display math in longer expressions
      - Always use proper LaTeX for fractions (\\frac{}{}), integrals (\\int), summations (\\sum), limits (\\lim), Greek letters (\\alpha, \\beta), etc.
      - Do NOT use plain text for math expressions like "x^2" or "dy/dx" — always use LaTeX.
    `;

        let prompt = "";

        if (!weaknesses || weaknesses.length === 0) {
            prompt = `
      You are a Master Diagnostic Assessor. The user is taking their VERY FIRST test on this topic.
      Topic: ${topic}
      Level: ${level}
      Syllabus Range: ${syllabus}

      YOUR GOAL: Build a ${qCount}-question Broad-Spectrum Diagnostic Test.
      
      CRITICAL INSTRUCTIONS:
      1. Span the Syllabus: Start Question 1 at the most fundamental basics. Gradually scale up so Question ${qCount} hits advanced topics.
      2. The "Classic Traps": Design distractors around historically common conceptual misunderstandings.
      3. No Rote Trivia: Every question must test a "why" or "how", not just a memorized formula.
      ${mathInstruction}
    `;
        } else {
            const weaknessString = weaknesses.map((w: any) => w.micro_concept).join(" | ");
            prompt = `
      You are a Master Curriculum Designer.
      Generate a ${qCount}-question multiple-choice test.
      Topic: ${topic}
      Level: ${level}
      Syllabus Context: ${syllabus}
      
      CRITICAL INSTRUCTIONS:
      The student currently struggles with these exact concepts: ${weaknessString}.
      Heavily target these specific weaknesses. Include plausible distractors that a student would choose if they have these exact misunderstandings.
      ${mathInstruction}
    `;
        }

        const testSchema: Schema = {
            type: Type.ARRAY,
            description: `Exactly ${qCount} multiple choice diagnostic questions`,
            items: {
                type: Type.OBJECT,
                properties: {
                    diagnosed_weakness: { type: Type.STRING, description: "The specific concept this question tests" },
                    question: { type: Type.STRING, description: "The question text. Use LaTeX ($...$) for math." },
                    options: { type: Type.ARRAY, items: { type: Type.STRING, description: "Option text. Use LaTeX for math." } },
                    correct_index: { type: Type.INTEGER },
                    conceptual_breakdown: { type: Type.STRING, description: "Explanation of the correct answer. Use LaTeX for math." }
                },
                required: ["diagnosed_weakness", "question", "options", "correct_index", "conceptual_breakdown"]
            }
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: testSchema,
                temperature: 0.7,
            }
        });

        return NextResponse.json(JSON.parse(response.text!));

    } catch (error: any) {
        console.error('Generator API Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate test' },
            { status: 500 }
        );
    }
}

/* === HARDCODED DUMMY QUESTIONS (swap return statement above to use these) ===
const DUMMY_QUESTIONS = [
    { diagnosed_weakness: "Confuses state vs path functions.", question: "Cyclic process: which quantity is zero?", options: ["Q", "W", "$\\Delta U$", "$\\Delta S_{univ}$"], correct_index: 2, conceptual_breakdown: "$\\Delta U$ is a state function." },
    { diagnosed_weakness: "Adiabatic ≠ isothermal.", question: "Adiabatic expansion: temperature?", options: ["Increases", "Constant", "Decreases", "Indeterminate"], correct_index: 2, conceptual_breakdown: "$Q=0$, gas does work, $\\Delta U < 0$." },
    { diagnosed_weakness: "System vs universe entropy.", question: "Water freezes: 2nd Law?", options: ["Only gases", "Surroundings entropy up", "Volume compensates", "Sub-zero allows"], correct_index: 1, conceptual_breakdown: "$\\Delta S_{univ} \\geq 0$." },
];
=== END HARDCODED === */