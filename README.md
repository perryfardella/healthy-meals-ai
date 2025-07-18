# Healthy Meals AI

An AI-powered recipe generation app that creates personalized, high-protein meals using your available ingredients. Built with Next.js, TypeScript, Tailwind CSS, and Vercel AI SDK.

## Features

- 🤖 **AI-Powered Recipe Generation**: Uses DeepSeek through Vercel AI Gateway to generate structured recipe responses
- 🥗 **High-Protein Focus**: Prioritizes healthy, protein-rich meals
- 🎯 **Personalized**: Considers dietary preferences, allergies, and available ingredients
- 📱 **Responsive Design**: Beautiful, mobile-first interface with Shadcn UI components
- 🔐 **Authentication**: Secure user authentication with Supabase
- 💳 **Token System**: Lemon Squeezy integration for token purchases

## Getting Started

1. **Install dependencies:**

```bash
pnpm install
```

2. **Set up environment variables:**
   Add the following to your `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
VERCEL_AI_GATEWAY_API_KEY=your_vercel_ai_gateway_api_key
```

3. **Run the development server:**

```bash
pnpm dev
```

4. **Open [http://localhost:3000](http://localhost:3000)** to see the app

## Usage

1. **Landing Page**: Visit the homepage to try the basic meal generation
2. **Recipe Book**: Sign up/login and visit `/recipe-book` for the full AI-powered experience
3. **Authentication**: Use the sign-up/login pages to create an account
4. **Token System**: Purchase tokens to generate more recipes

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Supabase (PostgreSQL, Authentication)
- **AI**: Vercel AI SDK, DeepSeek, Vercel AI Gateway
- **Payments**: Lemon Squeezy
- **Deployment**: Vercel

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
