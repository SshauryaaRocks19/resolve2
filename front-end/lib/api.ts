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
