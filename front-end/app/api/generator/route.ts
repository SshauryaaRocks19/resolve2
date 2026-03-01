// import { GoogleGenAI, Type, Schema } from '@google/genai';
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// HARDCODED DUMMY QUESTIONS — Gemini call commented out to save API limits
const DUMMY_QUESTIONS = [
    {
        diagnosed_weakness: "Confuses state functions with path functions when calculating system changes.",
        question: "An ideal gas undergoes a cyclic process and returns to its exact initial state. Which of the following thermodynamic quantities must be exactly zero for the complete cycle?",
        options: [
            "The net heat transferred (Q)",
            "The net work done (W)",
            "The change in internal energy (ΔU)",
            "The total entropy generated in the universe (ΔS_universe)"
        ],
        correct_index: 2,
        conceptual_breakdown: "Internal energy (ΔU) is a state function. Because the system returned to its initial state, the change in internal energy MUST be zero, regardless of the path taken. Heat (Q) and Work (W) are path functions and will not be zero. The total entropy of the universe would only be zero if the cycle was perfectly reversible, which is never guaranteed."
    },
    {
        diagnosed_weakness: "Fails to recognize that adiabatic processes do not automatically mean constant temperature.",
        question: "A gas expands rapidly and adiabatically against a constant external pressure. What happens to the temperature of the gas?",
        options: [
            "It increases because the volume increases.",
            "It remains constant because no heat (Q) is exchanged.",
            "It decreases because the gas does work at the expense of its internal energy.",
            "It cannot be determined without knowing the specific heat capacities."
        ],
        correct_index: 2,
        conceptual_breakdown: "In an adiabatic process, heat transfer (Q) is zero. According to the First Law ($\\Delta U = Q - W$), if the gas expands, it does work on the surroundings (W is positive). Therefore, $\\Delta U$ must be negative. Since internal energy is directly proportional to temperature for an ideal gas, the temperature must drop. 'Adiabatic' means no heat transfer, not constant temperature!"
    },
    {
        diagnosed_weakness: "Misunderstands the Second Law of Thermodynamics regarding the entropy of the system vs. the surroundings.",
        question: "Water freezes into ice at -10°C. The entropy of the water (the system) decreases because the ice structure is more ordered. How does this process not violate the Second Law of Thermodynamics?",
        options: [
            "The Second Law only applies to gases, not phase changes of liquids.",
            "The heat released by the freezing water increases the entropy of the surroundings by a greater amount.",
            "The volume of the ice expands, which compensates for the loss of entropy.",
            "At sub-zero temperatures, the entropy of a system is allowed to decrease naturally."
        ],
        correct_index: 1,
        conceptual_breakdown: "The Second Law states that the entropy of the UNIVERSE (System + Surroundings) must increase for a spontaneous process. While the water's entropy decreases as it becomes ordered ice, the freezing process is exothermic. It releases latent heat into the -10°C surroundings, increasing the surroundings' entropy. This increase is larger than the system's decrease, resulting in a net positive $\\Delta S$ for the universe."
    }
];

export async function POST(request: Request) {
    try {
        const { userId, topic, level, syllabus, numQuestions = 10 } = await request.json();

        console.log('Generator: Returning hardcoded dummy questions (AI bypassed)');
        console.log('Request:', { userId, topic, level, syllabus, numQuestions });

        // Return the dummy questions directly — no Gemini call
        return NextResponse.json(DUMMY_QUESTIONS);

        /* === ORIGINAL GEMINI CODE (uncomment when ready) ===
        const qCount = Math.min(Math.max(numQuestions, 3), 30);

        const { data: weaknesses } = await supabase
            .from('user_concept_mastery')
            .select('micro_concept')
            .eq('user_id', userId)
            .eq('topic', topic)
            .gt('error_weight', 0);

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
      1. Span the Syllabus.
      2. The "Classic Traps".
      3. No Rote Trivia.
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
      ${mathInstruction}
    `;
        }

        const testSchema: Schema = {
            type: Type.ARRAY,
            description: `Exactly ${qCount} multiple choice diagnostic questions`,
            items: {
                type: Type.OBJECT,
                properties: {
                    diagnosed_weakness: { type: Type.STRING },
                    question: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correct_index: { type: Type.INTEGER },
                    conceptual_breakdown: { type: Type.STRING }
                },
                required: ["diagnosed_weakness", "question", "options", "correct_index", "conceptual_breakdown"]
            }
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-lite',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: testSchema,
                temperature: 0.7,
            }
        });

        return NextResponse.json(JSON.parse(response.text!));
        === END ORIGINAL GEMINI CODE === */
    } catch (error: any) {
        console.error('Generator API Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate test' },
            { status: 500 }
        );
    }
}