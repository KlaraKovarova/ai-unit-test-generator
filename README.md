# TestGen·AI – AI-Powered Unit Test Generator

Paste any function or module and get complete, runnable unit tests in seconds. Powered by Claude AI.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/KlaraKovarova/ai-unit-test-generator)

## Features

- **Instant test generation** – complete, runnable tests in seconds
- **Multi-language support** – JS/TS (Jest), Python (pytest), Go (testing), Rust (#[test])
- **Auto-detects language** – no configuration needed
- **3 free generations** – no account required to try
- **Bring Your Own Key (BYOK)** – use your Anthropic API key for unlimited generations
- **Your code is never stored** – stateless, privacy-first

## Getting Started

### Prerequisites

- Node.js 18+
- An Anthropic API key (optional – 3 free uses included via shared key)

### Local Development

```bash
git clone https://github.com/KlaraKovarova/ai-unit-test-generator
cd ai-unit-test-generator
npm install
cp .env.example .env.local
# Add your ANTHROPIC_API_KEY to .env.local (optional)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Deploy to Vercel

1. Fork this repo
2. Import it into [Vercel](https://vercel.com)
3. Set `ANTHROPIC_API_KEY` in environment variables (optional – enables server-side key)
4. Deploy

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Optional | Server-side Anthropic key. Users can also provide their own via BYOK. |

## Tech Stack

- [Next.js 15](https://nextjs.org) – React framework
- [Anthropic Claude](https://anthropic.com) – AI backbone
- [Tailwind CSS](https://tailwindcss.com) – Styling

## Pricing Model

| Tier | Generations | Cost |
|------|-------------|------|
| Free | 3 per session | $0 |
| BYOK | Unlimited | Your API costs only |

## Contributing

PRs welcome. Open an issue first for major changes.

## License

MIT – see [LICENSE](LICENSE)

---

Built by [AI Works](https://github.com/KlaraKovarova/ai-services-website) · AI-powered tools for developers

### More tools

- [ReadmeGen](https://github.com/KlaraKovarova/ai-readme-generator) – AI README generator
- [CodeReview·AI](https://github.com/KlaraKovarova/ai-code-review) – Instant AI code reviews
- [AI Works](https://github.com/KlaraKovarova/ai-services-website) – Our agency website
