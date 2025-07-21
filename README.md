# Healthy Meals AI

An AI-powered recipe generation app that creates personalized, high-protein meals using your available ingredients. Built with Next.js, TypeScript, Tailwind CSS, and **Vercel AI SDK v5 (beta)**.

## Features

- 🤖 **AI-Powered Recipe Generation**: Uses DeepSeek through Vercel AI Gateway with **Vercel AI SDK v5 (beta)** to generate structured recipe responses
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
- **AI**: **Vercel AI SDK v5 (beta)**, DeepSeek, Vercel AI Gateway
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

# Anonymous Recipe Storage & Migration System

This guide describes how to implement a system that allows free/anonymous users to generate recipes, persist them locally, and migrate them to their account upon signup or login.

---

## 1. **Overview & Rationale**

- **Goal:** Let users generate and keep recipes before signing up, then save those recipes to their account if they register.
- **Why local storage?**
  - Simple to implement
  - No backend changes for anonymous users
  - Data persists across reloads (but not across devices)

---

## 2. **Implementation Steps**

### **A. Saving Recipes Locally**

1. **When a recipe is generated, save it to local storage:**

```ts
function saveRecipeLocally(recipe) {
  const recipes = JSON.parse(localStorage.getItem("localRecipes") || "[]");
  recipes.push(recipe);
  localStorage.setItem("localRecipes", JSON.stringify(recipes));
}
```

2. **To retrieve all locally saved recipes:**

```ts
function getLocalRecipes() {
  return JSON.parse(localStorage.getItem("localRecipes") || "[]");
}
```

3. **To clear local recipes (after migration):**

```ts
function clearLocalRecipes() {
  localStorage.removeItem("localRecipes");
}
```

---

### **B. Prompting Users to Sign Up**

- Show a banner, modal, or call-to-action: _"Sign up to save your recipes!"_
- Optionally, show a preview of their saved recipes.

---

### **C. Migrating Recipes on Signup/Login**

1. **After successful signup/login:**
   - Retrieve recipes from local storage.
   - Send them to your backend to be saved under the user's account.
   - Clear local storage.

```ts
async function migrateLocalRecipesToAccount(userId) {
  const recipes = getLocalRecipes();
  if (recipes.length > 0) {
    await fetch("/api/save-recipes", {
      method: "POST",
      body: JSON.stringify({ userId, recipes }),
      headers: { "Content-Type": "application/json" },
    });
    clearLocalRecipes();
  }
}
```

- Call this function after authentication is complete.

---

### **D. Backend Endpoint Example**

- Create an API route (e.g., `/api/save-recipes`) that accepts a list of recipes and associates them with the authenticated user.
- Ensure proper authentication and validation.

---

### **E. User Experience Considerations**

- After signup/login and migration, show a confirmation: _"Your recipes have been saved to your account!"_
- Allow users to manage (edit/delete) their local recipes before signup.
- If the user already has recipes in their account, decide whether to merge, overwrite, or prompt for action.

---

## 3. **Security & Privacy**

- Do **not** store sensitive data in local storage.
- Recipes are fine, but never store authentication tokens or PII.

---

## 4. **Advanced: Anonymous Backend Storage (Optional)**

- For cross-device persistence, consider assigning an anonymous ID and storing recipes in the backend, then merging on signup. This is more complex and not required for most use cases.

---

## 5. **Summary**

- Use local storage for anonymous recipe persistence.
- Migrate recipes to the user account on signup/login.
- Provide clear UX cues and confirmations.

---

_This approach is simple, user-friendly, and easy to implement for most web apps._
