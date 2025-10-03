import { GOOGLE_VISION_KEY as GOOGLE_KEY } from "./env";

export interface VisionResponse {
	responses: {
		labelAnnotations?: { description: string; score: number }[];
		textAnnotations?: { description: string }[];
	}[];
}

export async function analyzeImage(base64: string): Promise<VisionResponse> {
	if (!GOOGLE_KEY) {
		throw new Error("Missing GOOGLE_VISION_KEY. Ensure it is set in your .env and the app is rebuilt.");
	}

	const url = `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_KEY}`;
	const body = {
		requests: [
			{
				image: { content: base64 },
				features: [
					{ type: "LABEL_DETECTION", maxResults: 5 },
					{ type: "TEXT_DETECTION" },
				],
			},
		],
	};

	const res = await fetch(url, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});

	if (!res.ok) {
		throw new Error(`Vision API error: ${res.status}`);
	}
	return res.json() as Promise<VisionResponse>;
}


