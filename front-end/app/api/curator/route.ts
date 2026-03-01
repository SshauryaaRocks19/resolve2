import { GoogleGenAI } from "@google/genai";

const systemPrompt = `You are a very first principle based curriculum curator. You have to find highly conceptual, in depth resources for the requested topic.
Prioritize websites/videos from KhanAcademy, MITOCW, 3Blue1Brown, Mathmaniacs, and also use reddit to find highly 
recommended sources on reddit.

You MUST respond with ONLY a valid JSON array of objects, no markdown, no explanation, no text before or after. Each object must have these exact keys:
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

        let text = response.text ?? '[]';

        // Strip markdown code fences if present
        text = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();

        // Parse server-side to catch errors here instead of on the client
        let parsed;
        try {
            parsed = JSON.parse(text);
        } catch {
            console.error('Raw curator response (first 500 chars):', text.slice(0, 500));
            // If JSON is malformed, try to extract just the array portion
            const match = text.match(/\[[\s\S]*\]/);
            if (match) {
                try {
                    parsed = JSON.parse(match[0]);
                } catch {
                    console.error('Regex extraction also failed');
                    parsed = [];
                }
            } else {
                parsed = [];
            }
        }

        return Response.json({ result: parsed });
    } catch (error) {
        console.error('Curator error:', error);
        return Response.json({ error: "Failed to generate content" }, { status: 500 });
    }
}
