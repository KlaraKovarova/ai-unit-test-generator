"use client";

import { useState, useCallback } from "react";
import { DEMO_CODE, DEMO_LANGUAGE, DEMO_TESTS } from "@/lib/demo";

const STORAGE_KEY = "unit_test_gen_usage";
const FREE_LIMIT = 3;

type Language = "auto" | "javascript" | "typescript" | "python" | "go" | "rust";

const LANGUAGES: { value: Language; label: string; ext: string }[] = [
  { value: "auto", label: "Auto-detect", ext: "" },
  { value: "javascript", label: "JavaScript", ext: ".test.js" },
  { value: "typescript", label: "TypeScript", ext: ".test.ts" },
  { value: "python", label: "Python", ext: "_test.py" },
  { value: "go", label: "Go", ext: "_test.go" },
  { value: "rust", label: "Rust", ext: " (inline mod tests)" },
];

const FRAMEWORK_LABELS: Record<string, string> = {
  javascript: "Jest",
  typescript: "Jest + TypeScript",
  python: "pytest",
  go: "testing",
  rust: "#[test]",
};

function getUsage(): number {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem(STORAGE_KEY) ?? "0", 10);
}

function incrementUsage(): number {
  const next = getUsage() + 1;
  localStorage.setItem(STORAGE_KEY, String(next));
  return next;
}

function copyText(text: string) {
  navigator.clipboard.writeText(text).catch(() => {});
}

export default function Generator() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState<Language>("auto");
  const [apiKey, setApiKey] = useState("");
  const [showByok, setShowByok] = useState(false);
  const [tests, setTests] = useState("");
  const [detectedLang, setDetectedLang] = useState("");
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [usage, setUsage] = useState<number | null>(null);

  const generate = useCallback(
    async (overrideCode?: string) => {
      const target = (overrideCode ?? code).trim();
      if (!target) return;

      const currentUsage = getUsage();
      if (currentUsage >= FREE_LIMIT && !apiKey.trim()) {
        setShowUpgrade(true);
        return;
      }

      setLoading(true);
      setError("");
      setTests("");
      setIsDemo(false);
      setDetectedLang("");

      try {
        const body: { code: string; language: string; apiKey?: string } = {
          code: target,
          language,
        };
        if (apiKey.trim()) body.apiKey = apiKey.trim();

        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = (await res.json()) as {
          tests?: string;
          language?: string;
          error?: string;
          demo?: boolean;
        };

        if (!res.ok) throw new Error(data.error ?? "Generation failed");

        setTests(data.tests ?? "");
        setDetectedLang(data.language ?? "");
        setIsDemo(data.demo ?? false);
        const newUsage = incrementUsage();
        setUsage(newUsage);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    },
    [code, language, apiKey]
  );

  function tryDemo() {
    setCode(DEMO_CODE);
    setLanguage(DEMO_LANGUAGE as Language);
    // Directly show demo output without an API call
    setTests(DEMO_TESTS);
    setDetectedLang(DEMO_LANGUAGE);
    setIsDemo(true);
    setError("");
  }

  function handleCopy() {
    copyText(tests);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function download() {
    const ext = LANGUAGES.find((l) => l.value === detectedLang)?.ext ?? ".test.ts";
    const blob = new Blob([tests], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tests${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const usageCount = usage ?? getUsage();
  const remaining = Math.max(0, FREE_LIMIT - usageCount);
  const frameworkLabel = detectedLang ? FRAMEWORK_LABELS[detectedLang] ?? detectedLang : null;

  return (
    <>
      {/* Upgrade overlay */}
      {showUpgrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-sm w-full shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-2">Free limit reached</h2>
            <p className="text-gray-400 text-sm mb-6">
              You&apos;ve used all 3 free generations. Paste your own Anthropic API key to
              generate unlimited tests — your key is never stored.
            </p>
            <button
              onClick={() => {
                setShowUpgrade(false);
                setShowByok(true);
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl font-semibold text-sm transition-colors mb-3"
            >
              Use my API key
            </button>
            <button
              onClick={() => setShowUpgrade(false)}
              className="w-full text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Before/after demo */}
      <div className="mb-12">
        <div className="text-center mb-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
            See it in action
          </span>
          <h2 className="text-xl font-semibold text-white mt-1">
            Source code → complete test suite
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Paste any function, class, or module and get runnable tests in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-2xl overflow-hidden border border-gray-800">
          {/* Left: source */}
          <div className="bg-gray-900 p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span className="text-xs text-gray-500 ml-2 font-mono">utils/cart.ts</span>
            </div>
            <pre className="text-xs text-gray-400 font-mono leading-relaxed overflow-auto max-h-72 whitespace-pre">
              {DEMO_CODE}
            </pre>
          </div>

          {/* Right: generated tests */}
          <div className="bg-gray-900 border-l border-gray-800 p-5 flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-mono text-gray-500">utils/cart.test.ts</span>
              <span className="ml-auto text-xs bg-emerald-900/60 text-emerald-300 px-2 py-0.5 rounded-full">
                AI generated
              </span>
            </div>
            <pre className="text-xs text-gray-300 font-mono leading-relaxed overflow-auto max-h-72 whitespace-pre-wrap flex-1">
              {DEMO_TESTS.slice(0, 700)}…
            </pre>
            <button
              onClick={tryDemo}
              className="mt-4 w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl font-semibold text-sm transition-colors"
            >
              View full demo output →
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Input */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-gray-400" htmlFor="code-input">
              Paste your code
            </label>
            {/* Language selector */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-emerald-600 transition-colors"
            >
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          <textarea
            id="code-input"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={`// Paste a function, class, or module here\n// Example: a TypeScript utility, Python class, Go function…`}
            rows={12}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-emerald-600 transition-colors text-sm font-mono leading-relaxed resize-y"
            spellCheck={false}
          />

          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-gray-600">
              {remaining > 0
                ? `${remaining} free generation${remaining !== 1 ? "s" : ""} remaining`
                : "Free limit reached — "}
              {remaining === 0 && !apiKey.trim() && (
                <button
                  onClick={() => setShowUpgrade(true)}
                  className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
                >
                  add API key for unlimited
                </button>
              )}
            </p>
            <button
              onClick={() => generate()}
              disabled={loading || !code.trim()}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors whitespace-nowrap flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating…
                </>
              ) : (
                "Generate tests"
              )}
            </button>
          </div>

          {/* BYOK */}
          <div className="mt-4 border-t border-gray-800 pt-4">
            <button
              type="button"
              onClick={() => setShowByok((v) => !v)}
              className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1.5 transition-colors"
            >
              <span className={`transition-transform ${showByok ? "rotate-90" : ""}`}>▶</span>
              Use your own Anthropic API key
            </button>

            {showByok && (
              <div className="mt-3 space-y-2">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-ant-…"
                  autoComplete="off"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-emerald-600 transition-colors text-sm font-mono"
                />
                <p className="text-xs text-gray-600 leading-relaxed">
                  Your key is sent directly to the API for this request only — it is never
                  logged, stored, or shared. Using your own key bypasses the free-generation
                  limit.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-950 border border-red-800 rounded-xl px-4 py-3 text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Output */}
        {tests && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-300">Generated tests</span>
                {frameworkLabel && (
                  <span className="text-xs bg-emerald-900/60 text-emerald-300 border border-emerald-700/50 px-2 py-0.5 rounded-full">
                    {frameworkLabel}
                  </span>
                )}
                {isDemo && (
                  <span className="text-xs bg-amber-900/60 text-amber-300 border border-amber-700/50 px-2 py-0.5 rounded-full">
                    Demo · add API key to generate from your code
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition-colors"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={download}
                  className="text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition-colors"
                >
                  ↓ Download
                </button>
              </div>
            </div>
            <textarea
              value={tests}
              onChange={(e) => setTests(e.target.value)}
              className="w-full bg-transparent text-gray-300 font-mono text-xs leading-relaxed p-6 min-h-[500px] resize-y focus:outline-none"
              spellCheck={false}
            />
          </div>
        )}

        {/* Cross-promote other tools */}
        <div className="border border-gray-800 rounded-2xl p-6 bg-gray-900/50">
          <p className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wider">
            More AI developer tools
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://readme-gen.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-indigo-400 hover:text-indigo-300 bg-indigo-950/50 border border-indigo-800/50 px-3 py-1.5 rounded-lg transition-colors"
            >
              ReadmeGen — AI README generator
            </a>
            <a
              href="https://codereview-ai.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-violet-400 hover:text-violet-300 bg-violet-950/50 border border-violet-800/50 px-3 py-1.5 rounded-lg transition-colors"
            >
              CodeReview·AI — instant code review
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
