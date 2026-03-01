import { GoogleGenAI } from "@google/genai";

const systemPrompt = `You are a very first principle based curriculum curator. You have to find highly conceptual, in depth resources for the requested topic.
Prioritize websites/videos from KhanAcademy, MITOCW, 3Blue1Brown, Mathmaniacs, and also use reddit to find highly 
recommended sources on reddit.

You MUST respond with ONLY a valid JSON array of objects, no markdown, no explanation. Each object must have these exact keys:
- "title": string (name of the resource)
- "url": string (direct link)
- "platform": string (e.g. "Khan Academy", "YouTube", "MIT OCW", "Reddit", "3Blue1Brown")
- "conceptual_summary": string (brief description of what concept it covers)

Example format:
[{"title": "...", "url": "...", "platform": "...", "conceptual_summary": "..."}]`;

export async function POST(request: Request) {
    const { topic } = await request.json();
    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

    try {
        const response = await genAI.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Find conceptual resources for: ${topic}`,
            config: {
                systemInstruction: systemPrompt,
                tools: [{ googleSearch: {} }],
            },
        });

        // Strip markdown code fences if the model wraps the JSON in them
        let text = response.text ?? '';
        text = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();

        return Response.json({ result: text });
    } catch (error) {
        console.error(error);
        return Response.json({ error: "Failed to generate content" }, { status: 500 });
    }
}
