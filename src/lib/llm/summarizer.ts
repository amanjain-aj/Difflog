import { OpenAI } from "openai";
import { StructuredChangelogOutput } from "@/lib/db/types";

export const CHANGELOG_PROMPT = `
You are an expert technical writer and developer advocate for high-scale API products (like Stripe and Twilio).
You will be provided with:
1. Git commit message
2. The raw output from an OpenAPI diff tool (endpoints added, removed, modified, parameters changed)
3. A list of breaking changes, if any.

Your task is to generate a release note in JSON format.
Rules:
- Never hallucinate endpoints not present in the diff.
- Prioritize developer ergonomics: explain *why* the change matters and *how* to adapt.
- Distinguish strictly between [NEW], [CHANGED], [DEPRECATED], and [BREAKING].
- Tone: Crisp, technical, objective.
`;

export const JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    title: {
      type: "string",
      description: "Concise release headline (max 10 words)",
    },
    summary: {
      type: "string",
      description:
        "2-3 sentence markdown summary of changes and actions required",
    },
    has_breaking_changes: { type: "boolean" },
    items: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          tag: {
            type: "string",
            enum: ["BREAKING", "NEW", "CHANGED", "DEPRECATED"],
          },
          endpoint: {
            type: "string",
            description: "e.g. POST /v1/payments",
          },
          description: {
            type: "string",
            description: "1-sentence description of the route change",
          },
        },
        required: ["tag", "endpoint", "description"],
      },
    },
  },
  required: ["title", "summary", "has_breaking_changes", "items"],
} as const;

export interface SummarizeDiffInput {
  commit_hash: string;
  commit_message?: string;
  version_tag?: string;
  diff: unknown;
  breaking?: unknown;
}

const VALID_TAGS = new Set(["BREAKING", "NEW", "CHANGED", "DEPRECATED"]);

export async function summarizeOpenApiDiff(
  input: SummarizeDiffInput
): Promise<StructuredChangelogOutput> {
  const apiKey = process.env.GROQ_API_KEY?.trim();

  if (!apiKey || apiKey === "gsk_...") {
    const err = new Error(
      "Missing live GROQ_API_KEY. Set a valid GROQ_API_KEY in .env.local (from https://console.groq.com/keys) to process OpenAPI diff ingestion requests."
    );
    (err as Error & { code?: string }).code = "MISSING_GROQ_API_KEY";
    throw err;
  }

  const groq = new OpenAI({
    apiKey,
    baseURL: "https://api.groq.com/openai/v1",
  });

  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

  const userPayload = JSON.stringify(
    {
      commit_hash: input.commit_hash,
      commit_message: input.commit_message || "(no commit message provided)",
      version_tag: input.version_tag || null,
      oasdiff_changelog: input.diff,
      oasdiff_breaking: input.breaking || [],
    },
    null,
    2
  );

  const schemaInstruction = `
You MUST respond with a single valid JSON object matching this exact JSON Schema:
${JSON.stringify(JSON_SCHEMA, null, 2)}
`;

  const response = await groq.chat.completions.create({
    model,
    temperature: 0.1,
    messages: [
      {
        role: "system",
        content: `${CHANGELOG_PROMPT.trim()}\n\n${schemaInstruction.trim()}`,
      },
      {
        role: "user",
        content: `Generate a structured API release note in JSON format from the following commit and oasdiff output:\n\n${userPayload}`,
      },
    ],
    response_format: {
      type: "json_object",
    },
  });

  const rawContent = response.choices[0]?.message?.content;
  if (!rawContent) {
    throw new Error("Groq returned an empty completion response.");
  }

  const parsed = JSON.parse(rawContent) as StructuredChangelogOutput;

  // Validate and normalize output against JSON_SCHEMA contract
  const items = Array.isArray(parsed.items)
    ? parsed.items.map((item) => ({
        tag: VALID_TAGS.has(item.tag) ? item.tag : ("CHANGED" as const),
        endpoint: String(item.endpoint || "API Schema"),
        description: String(item.description || ""),
      }))
    : [];

  return {
    title: String(parsed.title || "API Schema Release"),
    summary: String(parsed.summary || ""),
    has_breaking_changes:
      Boolean(parsed.has_breaking_changes) ||
      items.some((i) => i.tag === "BREAKING"),
    items,
  };
}
