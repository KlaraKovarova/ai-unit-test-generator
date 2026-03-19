import { NextRequest, NextResponse } from "next/server";
import { generateTests, detectLanguage, type SupportedLanguage } from "@/lib/claude";
import { DEMO_TESTS, DEMO_LANGUAGE } from "@/lib/demo";

export const maxDuration = 60;

const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  "javascript",
  "typescript",
  "python",
  "go",
  "rust",
];

function isSupported(lang: string): lang is SupportedLanguage {
  return SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage);
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      code?: string;
      language?: string;
      apiKey?: string;
    };

    const { code, language: rawLang, apiKey } = body;

    if (!code || typeof code !== "string" || !code.trim()) {
      return NextResponse.json({ error: "code is required" }, { status: 400 });
    }

    if (code.length > 20_000) {
      return NextResponse.json(
        { error: "Code is too long (max 20,000 characters)" },
        { status: 400 }
      );
    }

    // Resolve language — use provided, validate, or auto-detect
    let language: SupportedLanguage;
    if (rawLang && typeof rawLang === "string" && rawLang !== "auto") {
      if (!isSupported(rawLang)) {
        return NextResponse.json(
          { error: `Unsupported language: ${rawLang}` },
          { status: 400 }
        );
      }
      language = rawLang;
    } else {
      language = detectLanguage(code);
    }

    const resolvedKey =
      apiKey && typeof apiKey === "string" && apiKey.trim()
        ? apiKey.trim()
        : process.env.ANTHROPIC_API_KEY;

    // Graceful fallback: return demo tests if no API key configured
    if (!resolvedKey) {
      return NextResponse.json({ tests: DEMO_TESTS, language: DEMO_LANGUAGE, demo: true });
    }

    const tests = await generateTests(code, language, resolvedKey);

    return NextResponse.json({ tests, language });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
