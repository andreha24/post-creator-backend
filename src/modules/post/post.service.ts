import { OpenRouter } from "@openrouter/sdk";
import { env } from "prisma/config";
import { CreatePostInput, PostResponse } from "./post.schema";
import FormData from "form-data";
import axios from "axios";

const openRouter = new OpenRouter({
  apiKey: env("AI_GATEWAY_API_KEY"),
});

import prisma from "../../utils/prisma";
import { safeJsonParse } from "../../utils/json-helpers";

async function pollMysticTask(
  taskId: string,
  maxAttempts = 30,
  intervalMs = 3000,
): Promise<string> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise((res) => setTimeout(res, intervalMs));

    const response = await axios.get(
      `https://api.freepik.com/v1/ai/mystic/${taskId}`,
      {
        headers: {
          "x-freepik-api-key": env("FREEPIK_API_KEY"),
        },
      },
    );

    const { status, generated } = response.data.data;

    if (status === "COMPLETED") {
      const imageUrl = generated?.[0];
      if (!imageUrl)
        throw new Error("COMPLETED but no image URL in generated[]");
      return imageUrl;
    }

    if (status === "FAILED") {
      throw new Error("Mystic task failed");
    }
  }

  throw new Error(`Mystic task did not complete after ${maxAttempts} attempts`);
}

async function generateImage(textForImage: string): Promise<string> {
  try {
    const response = await axios.post(
      "https://api.freepik.com/v1/ai/mystic",
      {
        prompt: textForImage,
        aspect_ratio: "widescreen_16_9",
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "x-freepik-api-key": env("FREEPIK_API_KEY"),
        },
      },
    );

    const { task_id, status } = response.data.data;
    console.log(`[Mystic] Task created: ${task_id}, status: ${status}`);

    if (status === "COMPLETED") {
      const imageUrl = response.data.data.generated?.[0];
      if (imageUrl) return imageUrl;
    }

    return await pollMysticTask(task_id);
  } catch (error) {
    console.error("Error generating image:", error);
    throw new Error("Failed to generate image");
  }
}

// async function generateImage(textForImage: string) {
//   try {
//   const formData = new FormData();
//   formData.append("prompt", 'cat on the moon');
//   formData.append("style", "realistic");
//   formData.append("aspect_ratio", "1:1");
//   formData.append("seed", "5");

//   formData.append(
//     "negative_prompt",
//     "text, letters, typography, watermark, caption, logo, words, numbers, writing",
//   );

//   const response = await axios.post(
//     "https://api.vyro.ai/v2/image/generations",
//     formData,
//     {
//       headers: {
//         Authorization: process.env.IMAGINE_KEY!,
//         ...formData.getHeaders(),
//       },
//       responseType: "arraybuffer",
//     },
//   );

//     const base64 = Buffer.from(response.data).toString("base64");
//     console.log("base64", base64);
//     return `data:image/png;base64,${base64}`;
//   } catch (error) {
//     console.error("Error generating image:", error);
//     throw new Error("Failed to generate image");
//   }
// }

export const createPost = async (data: CreatePostInput) => {
  const { socialMedia, topic, additionals, size, style, tags, userId } = data;

  try {
    const completion = await openRouter.chat.send({
      model: "arcee-ai/trinity-large-preview:free",
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
      maxTokens: 800,
      stream: false,
    });

    const raw = completion.choices[0].message.content as string;

    const result = safeJsonParse(raw);
    const imageUrl = await generateImage(result.imageText);

    const created = await prisma.post.create({
      data: {
        title: result.postTitle,
        text: result.postText,
        image: imageUrl,
        tags: result.postTags || null,
        platform: socialMedia,
        creatorId: userId,
      },
      select: {
        id: true,
        createAt: true,
        image: true,
        title: true,
        text: true,
        tags: true,
        platform: true,
      },
    });

    return created;
  } catch (err: any) {
    console.error("OpenRouter error:", err.message);
    throw new Error("AI generation failed");
  }
};

export const getPosts = async (userId: number) => {
  return prisma.post.findMany({
    where: {
      creatorId: userId,
    },
    orderBy: {
      createAt: "desc",
    },
    select: {
      id: true,
      createAt: true,
      image: true,
      title: true,
      text: true,
      tags: true,
      platform: true,
    },
  });
};

export const getPostById = async (id: number) => {
  return prisma.post.findUnique({
    where: { id },
    include: {
      creator: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });
};

export const updatePost = async (
  id: number,
  data: Partial<{
    title: string;
    text: string;
    image: string;
    tags: string;
    isPublished: boolean;
  }>,
) => {
  return prisma.post.update({
    where: { id },
    data,
  });
};

export const deletePost = async (id: number) => {
  return prisma.post.delete({
    where: { id },
  });
};
