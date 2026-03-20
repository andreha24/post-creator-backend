import { jsonrepair } from "jsonrepair";

export function extractJson(str: string) {
    let cleaned = str.replace(/[\x00-\x1F\x7F]/g, "");
  
    cleaned = cleaned.replace(/```[\s\S]*?```/g, "");
  
    const match = cleaned.match(/\{(?:[^{}]|(?:\{[^{}]*\}))*\}/);
  
    if (match) return match[0];
  
    throw new Error("JSON not found");
  }
  
export function safeJsonParse(str: string) {
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