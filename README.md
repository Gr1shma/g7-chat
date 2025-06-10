# g7-chat

g7-chat is a fast, minimalist AI chat interface built for power users who value ownership, efficiency, and full control over their conversations.

# Table of Contents

* [Demo](#demo)
* [What It Does](#what-it-does)
* [Tech Stack 🛠️](#tech-stack)
* [Features ✨](#features-)
* [Optimizations ⚡](#optimizations-)
* [Lessons Learned 📚](#lessons-learned-)
* [Getting Started 🚀](#getting-started-)

    * [Prerequisites](#prerequisites)
    * [Installation](#installation)
    * [Build for Production](#build-for-production)
* [Environment Variables](#environment-variables)

    * [Example `.env`](#example-env)
    * [Generating `AUTH_SECRET`](#how-to-generate-auth-secret)
    * [Setting Up Google OAuth Credentials](#setting-up-google-oauth-credentials)
* [AI Model Providers 🧠](#ai-model-providers-)
* [Adding More Models or Providers ⚒️](#adding-more-models-or-providers)
* [Roadmap 🧭](#roadmap-)
* [Acknowledgements 🌟](#acknowledgements-)
* [License 📄](#license-)

## Demo

**🔗 Live Demo:** [https://g7-chat.vercel.app](https://g7-chat.vercel.app)

**Preview:**

![g7-chat preview](./assets/preview.png)

## What It Does

g7-chat provides a distraction-free interface to interact with AI assistants, giving users full visibility and management of their chat threads. It’s designed with performance, privacy, and user experience in mind—no unnecessary clutter, no data lock-in.

## Tech Stack

* **[Next.js](https://nextjs.org/)** – React framework for fast, full-stack web apps.
* **[tRPC](https://trpc.io/)** – End-to-end typesafe APIs without needing REST or GraphQL.
* **[Auth.js](https://authjs.dev/)** – Flexible authentication for Next.js apps.
* **[Vercel AI SDK](https://ai-sdk.dev/)** – Seamless integration of AI models and streaming into your frontend.
* **[Tailwind CSS](https://tailwindcss.com/)** – Utility-first CSS for rapid and consistent styling.
* **[shadcn/ui](https://ui.shadcn.com/)** – Accessible, customizable component library built on Radix UI and Tailwind.
* **[Drizzle ORM](https://orm.drizzle.team/)** – Type-safe SQL ORM for schema-first, declarative database access.
* **[PostgreSQL](https://www.postgresql.org/)** – Powerful, open-source relational database system.
* **[Zod](https://zod.dev/)** – Runtime schema validation and type inference.

g7-chat is built to be snappy and lightweight, with a focus on developer experience and maintainability. Thread management is optimized with smart local state and React Query and styles are custom-built for a distraction-free experience.

---

## Features ✨

* **📁 Project Management**

  * Organize conversations into **Projects** (groups of threads).
  * Easily **edit** or **delete** projects to keep things tidy.

* **💬 Thread Control**

    * Full control over each thread:

        * **Edit**, **delete**, or **pin** important threads.
        * Toggle **visibility** between **private** and **public**.
        * **Move threads** between projects for better organization.
        * **Export threads** in the json format for other use.

* **📨 Message Tools**

    * Interact deeply with each message:

        * **Edit** your own messages.
        * **Copy** content easily.
        * Use **Redo/Retry** to ask AI to regenerate responses.

* **🧠 Personalizing the Assistant**

    * Personalize your AI assistant:

        * Set your **display name** and how the **AI refers to you**.
        * Define **AI personality traits**, tone, and response style.
        * Specify your **profession or role** to guide context-aware replies.
        * All preferences are used in a dynamic **system prompt**.

* **📦 Model Selection**

    * Choose from a range of available AI models:

        * Use a searchable popover and selector powered by shadcn/ui.
        * Models are grouped by provider with clean headings.
        * Instantly switch between models.

* **🎨 Clean & Dynamic UI**

    * Built with **shadcn/ui** for accessible and elegant components.
    * Code blocks are beautifully rendered for easy reading and copying.
    * Fast, reactive updates using **tRPC**—no unnecessary reloads.

* **🙋 User-Friendly Design**

    * Minimalist interface that puts your content first.
    * Built for speed, clarity, and efficient navigation.

## Optimizations ⚡

- **[tRPC](https://trpc.io/)** + [React Query](https://tanstack.com/query/latest/) Integration  
    Leveraged `tRPC` with `React Query` to enable:
    - **Automatic caching** of API responses to reduce redundant requests.
    - **Background refetching** for real-time freshness without interrupting the user.
    - **Optimistic updates** and smart invalidation for a snappy UI experience.

- **Minimal Overhead Architecture**  
    The full-stack type safety and tightly coupled frontend/backend model reduce bugs and eliminate unnecessary data handling layers.

- **Fast UI Rendering**  
    Thanks to efficient data fetching and state management, the UI remains highly responsive—even with complex thread/project structures.

- **Incremental Loading**  
    Designed for fast initial load with lazy fetching where possible, ensuring minimal delay during navigation.

## Lessons Learned 📚

* Gained deep understanding of **Next.js** routing and API handling for building full-stack features efficiently.
* Learned how **AI integrations** work across frontend and backend, including prompt handling and streaming responses.
* Faced and overcame challenges in **database schema design** and migration management for scalable systems.
* Realized the power of **TypeScript** in ensuring type safety, reducing runtime errors, and improving developer experience.

---

## Getting Started 🚀

### Prerequisites

* Node.js (v16 or higher)
* pnpm, npm, or yarn package manager
* Git
* PostgreSQL database (for local development)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/Gr1shma/g7-chat.git
cd g7-chat
```

2. **Install dependencies**

Using pnpm (recommended):

```bash
pnpm install
```

Or using npm:

```bash
npm install
```

Or using yarn:

```bash
yarn install
```

3. **Set up environment variables**

Copy the example env file and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env` and provide values for:

* `AUTH_SECRET` (random secure string)
* Google OAuth credentials: `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`
* `DATABASE_URL` (your PostgreSQL connection string)

4. **Run the development server**

```bash
pnpm dev
# or
npm run dev
# or
yarn dev
```

Open your browser and visit [http://localhost:3000](http://localhost:3000) to see the app live.

### Build for Production

Build the app with:

```bash
pnpm build
# or
npm run build
# or
yarn build
```

Then start the production server with:

```bash
pnpm start
# or
npm start
# or
yarn start
```

> Note: Next.js outputs the production build in the `.next` folder.

## Environment Variables

g7-chat requires several environment variables to run properly, especially for authentication, database connection, and AI integration. Below is a description of each variable in the `.env` file:

| Variable                       | Description                                                                  | Example / Notes                                                                                   |
| ------------------------------ | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `AUTH_SECRET`                  | A secret string used to encrypt session data and cookies for authentication. | Generate a strong random string (e.g., `openssl rand -hex 32`)                                    |
| `AUTH_GOOGLE_ID`               | Client ID for Google OAuth provider, used for user login via Google.         | Obtain from [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials) |
| `AUTH_GOOGLE_SECRET`           | Client Secret for Google OAuth provider.                                     | Obtain from [Google Cloud Console](https://console.cloud.google.com/apis/credentials) alongside the client ID                                          |
| `DATABASE_URL`                 | Connection string to your PostgreSQL database instance.                      | Format: `postgresql://username:password@host:port/database`                                       |

### Example `.env`

```env
AUTH_SECRET="your-random-secret-string"
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"
DATABASE_URL="postgresql://postgres:password@localhost:5432/g7-chat"
```

### How to generate auth secret 

You can generate a strong secret using command-line tools like:

```bash
openssl rand -hex 22
```

or refer [Auth.js Setup Environment](https://authjs.dev/getting-started/installation#setup-environment)

### Setting Up Google OAuth Credentials

1. Visit the [Google Cloud Console - Credentials page](https://console.cloud.google.com/apis/credentials).
2. Click **Create Credentials** and select **OAuth 2.0 Client ID**.
3. Choose **Web application** as the application type.
4. Under **Authorized JavaScript origins**, add:

    * `http://localhost:3000` (for local development)
    * Your production URL (e.g., `https://yourdomain.com`)
5. Under **Authorized redirect URIs**, add:

    * `http://localhost:3000/api/auth/callback/google`
    * The corresponding production callback URL (e.g., `https://yourdomain.com/api/auth/callback/google`)
6. Save and copy the generated **Client ID** and **Client Secret** into your `.env` file as `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`.

---

## AI Model Providers 🧠

g7-chat supports multiple AI model providers with a clean, type-safe integration using the [Vercel AI SDK](https://ai-sdk.dev/). You can switch between different models at runtime using a unified `provider:model` string format.

### Supported Providers and Models ✅

| Provider | Model Key                       | Description          |
| -------- | ------------------------------- | -------------------- |
| `google` | `gemini-2.0-flash-001`          | Gemini 2.0 Flash     |
| `google` | `gemini-1.5-flash`              | Gemini 1.5 Flash     |
| `groq`   | `llama-3.1-8b-instant`          | Llama 3.1 8B Instant |
| `groq`   | `deepseek-r1-distill-llama-70b` | Deepseek R1 70B      |

### How It Works 🧩

All models are defined and accessed using a type-safe registry:

```ts
const PROVIDER_MODELS = {
    google: {
        "gemini-2.0-flash-001": google("gemini-2.0-flash-001"),
        "gemini-1.5-flash": google("gemini-1.5-flash"),
    },
    groq: {
        "llama-3.1-8b-instant": groq("llama-3.1-8b-instant"),
        "deepseek-r1-distill-llama-70b": groq("deepseek-r1-distill-llama-70b"),
    },
};
```

You can get a model instance with:

```ts
const model = AIProvider("google:gemini-2.0-flash-001");
```

If the input string is dynamic or user-provided, use the safe wrapper:

```ts
const model = AIProviderSafe(userInput); // returns null if invalid
```

### Default Model 🧾

The default model used in the app is:

```ts
getDefaultModel(); // => Gemini 2.0 Flash
```

To change this, modify the `getDefaultModel()` function in `src/lib/ai/providers.ts`.

## Adding More Models or Providers

To add more models or providers (like `openai`, `anthropic`, etc.), follow these steps:

### 1. Check Provider Support and Get API Keys

You can view the list of supported providers and model identifiers, as well as how to obtain API keys, at:

🔗 [AI SDK Providers and Models Documentation](https://ai-sdk.dev/docs/foundations/providers-and-models#ai-sdk-providers)

### 2. Extend `PROVIDER_MODELS`

To register a new provider and its models, update the `PROVIDER_MODELS` in `src/lib/ai/providers.ts` object:

```ts
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";

const PROVIDER_MODELS = {
    // Existing providers...

    openai: {
        "gpt-4": openai("gpt-4"),
        "gpt-3.5-turbo": openai("gpt-3.5-turbo"),
    },
    anthropic: {
        "claude-3-opus-20240229": anthropic("claude-3-opus-20240229"),
        "claude-3-sonnet-20240229": anthropic("claude-3-sonnet-20240229"),
    },
} as const;
```

### 3. Update `VALID_MODELS` (Optional Constants)

These constants are helpful for referencing models in a type-safe and readable way:

```ts
export const VALID_MODELS = {
    // Existing providers...

    OPENAI: {
        GPT_4: "openai:gpt-4",
        GPT_3_5_TURBO: "openai:gpt-3.5-turbo",
    },
    ANTHROPIC: {
        CLAUDE_3_OPUS: "anthropic:claude-3-opus-20240229",
        CLAUDE_3_SONNET: "anthropic:claude-3-sonnet-20240229",
    },
} as const satisfies Record<string, Record<string, ValidModelString>>;
```

### 4. Add Display Names for Models

To show clean names in the UI or logs, extend the `formatModelDisplayName()` function:

```ts
function formatModelDisplayName(model: string): string {
    const nameMap: Readonly<Record<string, string>> = {
        // Existing providers...

        "gpt-4": "OpenAI GPT-4",
        "gpt-3.5-turbo": "OpenAI GPT-3.5 Turbo",

        "claude-3-opus-20240229": "Claude 3 Opus (2024-02)",
        "claude-3-sonnet-20240229": "Claude 3 Sonnet (2024-02)",
    } as const;

    return nameMap[model] || model;
}
```

---

## Acknowledgements 🌟

* **[t3.chat](https://t3.chat/)** – The core inspiration behind g7-chat. Much of the UI and architecture are modeled after this powerful and elegant chat experience.
* **[T3 Stack](https://create.t3.gg/)** – A robust and opinionated Next.js starter kit that accelerated development with best-in-class tools.
* **[shadcn/ui](https://ui.shadcn.com/)** – For beautifully designed, headless UI components that made building clean, accessible interfaces effortless.

## License 📄

MIT License – see the [LICENSE](LICENSE) file.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

***Empowering users with speed, control, and efficiency.***
