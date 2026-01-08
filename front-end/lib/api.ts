export const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function analyzeGap(data: any) {
    if (!API_BASE_URL) {
        throw new Error("NEXT_PUBLIC_BACKEND_URL is not defined");
    }

    const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error("Failed to analyze gap");
    }

    return response.json();
}

export async function prioritizeTopics(data: FormData) {
    // Fallback to localhost:8000 if env var is missing, for dev convenience
    // explicitly forcing the port 8000 if the env var seems to be pointing to nextjs/api proxy or is undefined
    const baseUrl = 'http://localhost:8000';

    const response = await fetch(`${baseUrl}/prioritize`, {
        method: "POST",
        body: data,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to prioritize: ${errorText}`);
    }

    return response.json();
}

export async function generateRevisionContent(data: FormData) {
    const baseUrl = 'http://localhost:8000';

    const response = await fetch(`${baseUrl}/revision-tool`, {
        method: "POST",
        body: data,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to generate revision content: ${errorText}`);
    }

    return response.json();
}
