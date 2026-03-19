import Anthropic from "@anthropic-ai/sdk";

function getClient(apiKey?: string) {
  return new Anthropic({ apiKey: apiKey ?? process.env.ANTHROPIC_API_KEY });
}

export type SupportedLanguage = "javascript" | "typescript" | "python" | "go" | "rust";

const FRAMEWORK_MAP: Record<SupportedLanguage, string> = {
  javascript: "Jest",
  typescript: "Jest with TypeScript",
  python: "pytest",
  go: "Go's built-in testing package",
  rust: "Rust's built-in #[test] attribute",
};

const SYSTEM_PROMPT = `You are an expert software engineer specialising in test-driven development. Your task is to generate complete, runnable unit tests for the provided code.

Requirements:
- Use the idiomatic testing framework for the detected language (Jest for JS/TS, pytest for Python, testing package for Go, #[test] for Rust)
- Cover: happy path, edge cases, error cases, and boundary conditions
- Tests must be self-contained and runnable with no manual setup
- Use descriptive test names that explain what is being tested
- Mock external dependencies (HTTP calls, database, file I/O) where necessary
- Include necessary imports at the top
- For TypeScript: include proper type annotations in tests
- Output ONLY the test file content — no explanation, no markdown fences, no preamble`;

export async function generateTests(
  code: string,
  language: SupportedLanguage,
  apiKey?: string
): Promise<string> {
  const framework = FRAMEWORK_MAP[language];

  const message = await getClient(apiKey).messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Language: ${language}\nFramework: ${framework}\n\nCode to test:\n\`\`\`${language}\n${code}\n\`\`\`\n\nGenerate complete unit tests.`,
      },
    ],
  });

  const block = message.content[0];
  if (block.type !== "text") throw new Error("Unexpected response from Claude");
  return block.text;
}

export function detectLanguage(code: string): SupportedLanguage {
  const trimmed = code.trim();

  // Rust signals
  if (/\bfn\s+\w+|let\s+mut\b|println!\(|#\[derive|impl\s+\w+/.test(trimmed)) return "rust";
  // Go signals
  if (/\bfunc\s+\w+|package\s+\w+|:=\s|fmt\./.test(trimmed)) return "go";
  // Python signals
  if (/\bdef\s+\w+\(|import\s+\w+|from\s+\w+\s+import|\bself\b|"""/.test(trimmed)) return "python";
  // TypeScript signals (before JS so TS wins if both match)
  if (/:\s*(string|number|boolean|void|any|never|Record|Array)\b|interface\s+\w+|type\s+\w+\s*=|<\w+>/.test(trimmed)) return "typescript";
  // Default to JS
  return "javascript";
}
