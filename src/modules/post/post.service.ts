import { OpenRouter } from "@openrouter/sdk";
import { env } from "prisma/config";
import { CreatePostInput, PostResponse } from "./post.schema";
import FormData from "form-data";
import axios from "axios";
import { jsonrepair } from "jsonrepair";
const openRouter = new OpenRouter({
  apiKey: env("AI_GATEWAY_API_KEY"),
});

async function generateImage(textForImage: string) {
  const formData = new FormData();
  formData.append("prompt", textForImage);
  formData.append("style", "realistic");
  formData.append("aspect_ratio", "1:1");
  formData.append("seed", "5");

  formData.append(
    "negative_prompt",
    "text, letters, typography, watermark, caption, logo, words, numbers, writing"
  );

  const response = await axios.post("https://api.vyro.ai/v2/image/generations", formData, {
    headers: {
      Authorization: process.env.IMAGINE_KEY!,
      ...formData.getHeaders(),
    },
    responseType: "arraybuffer",
  });

  const base64 = Buffer.from(response.data).toString("base64");
  return `data:image/png;base64,${base64}`;
}

function extractJson(str: string) {
  // Remove control characters except whitespace
  let cleaned = str.replace(/[\x00-\x1F\x7F]/g, "");

  // Remove markdown fences like ```json ... ```
  cleaned = cleaned.replace(/```[\s\S]*?```/g, "");

  // Try to find the first JSON object
  const match = cleaned.match(/\{(?:[^{}]|(?:\{[^{}]*\}))*\}/);

  if (match) return match[0];

  throw new Error("JSON not found");
}

function safeJsonParse(str: string) {
  try {
    const extracted = extractJson(str);
    return JSON.parse(extracted);
  } catch (e1) {
    try {
      return jsonrepair(str);
    } catch (e2) {
      console.error("RAW AI OUTPUT:", str);
      throw new Error("Failed to parse AI JSON");
    }
  }
}

export const createPost = async (data: CreatePostInput): Promise<PostResponse> => {
  console.log("data", data);
  const { socialMedia, topic, additionals, size, style, tags } = data;

  try {
    const completion = await openRouter.chat.send({
      model: "google/gemma-2-9b-it",
      // model: "x-ai/grok-4.1-fast:free",
      messages: [
        {
          role: "user",
          content: `
You MUST return **valid JSON only**.
Rules you must follow:
- Output ONLY a JSON object. No text before or after.
- Do NOT add markdown, comments, explanations, notes.
- Escape all newlines inside JSON using \\n.
- Never include unescaped quotes inside strings.
- Do NOT include trailing commas.
- Do NOT break JSON structure.
- All fields must be strings only.

Return EXACTLY this JSON shape:

{
  "postTitle": "",
  "postText": "",
  "imageText": "",
  "postTags": ""
}

Now generate the content based on the following parameters:
- Social media: ${socialMedia}
- Topic: ${topic}
- Size: ${size}
- Style: ${style}
- Extra: ${additionals}
- Tags required: ${tags ? "yes" : "no"}

Remember:
- Only JSON output, no surrounding text allowed.
- Tags must start with # and must NOT appear inside postText.
- If exercise options are required, each option starts from a new line.
`,
        },
      ],
      maxTokens: 200,
      stream: false,
    });

    const raw = completion.choices[0].message.content as string;
    const result = safeJsonParse(raw);
    const imageUrl = (await generateImage(result.imageText)) as any;

    return {
      tags: result.postTags,
      title: result.postTitle,
      text: result.postText,
      image: imageUrl,
    };
  } catch (err: any) {
    console.error("OpenRouter error:", err.message);
    throw new Error("AI generation failed");
  }
};
