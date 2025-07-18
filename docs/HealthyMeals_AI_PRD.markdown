# Healthy Meals AI App Product Requirements Document (PRD)

## Overview

The Healthy Meals AI App is a web-based platform designed to empower users to create healthy, high-protein meals using ingredients they have on hand. By leveraging advanced AI technology through Vercel's AI SDK and Vercel's AI Gateway for centralized AI model management, the app provides personalized meal suggestions tailored to users' dietary preferences and restrictions, such as allergies. The app aims to simplify meal planning, promote nutritious eating, and enhance user wellness by offering detailed recipes and nutritional information. Integrated with LemonSqueezy for a token-based payment system, the app ensures accessibility with 5 free generations for new users and affordable token purchases.

## Success Metrics

- Achieve 10,000 active users within the first 6 months of launch.
- Maintain an 80% user retention rate after the first month.
- Generate $10,000 in monthly revenue from token sales within the first year.
- Receive a 4.5-star rating on app stores and review platforms.

## Messaging

"Transform your pantry into a gourmet kitchen with Healthy Meals AI. Get personalized, high-protein meal plans tailored to your ingredients and dietary needs. Save time, eat healthy, and enjoy delicious meals every day."

## Timeline/Release Planning

- **MVP Development**: August 2025 - October 2025
  - Basic meal generation based on text input of available ingredients.
  - Integration with Vercel's AI SDK and Vercel's AI Gateway for centralized AI model management.
  - Basic user authentication and profile management.
  - LemonSqueezy integration for token purchases.
- **Beta Testing**: November 2025 - December 2025
  - Invite beta testers to provide feedback.
  - Iterate on the app based on user feedback.
- **Official Launch**: January 2026
  - Full release with additional features like allergy considerations and photo input for pantry items.
- **Future Enhancements**: Ongoing
  - Multi-day meal planning.
  - Nutritional analysis and community sharing features.

## Current Implementation Status

- **Planned Features**:
  - Meal generation based on text input of ingredients.
  - Integration with Vercel's AI SDK and Vercel's AI Gateway for centralized AI model management.
  - User authentication and profile management.
  - Lemon Squeezy payment processing for token purchases.
  - Basic web interface for user interaction.
  - Rate limiting non-logged in users using local storage. Logged in users get more, paid users get even more.
- **In Development**:
  - Allergy and dietary preference filtering.
  - Photo input for pantry items (advanced feature).
- **Future Features**:
  - Multi-day meal planning.
  - Community sharing and rating of meals.

## Personas

- **Primary User**: Alex, a 30-year-old fitness enthusiast who wants to maintain a high-protein diet but struggles with meal planning.
- **Secondary User**: Jamie, a busy parent who needs quick, healthy meal options for their family using available ingredients.
- **Tertiary User**: Sarah, a person with specific dietary restrictions (e.g., gluten-free, vegan) who requires safe and nutritious meal plans.

## User Scenarios

- **Alex**: Inputs ingredients like chicken, quinoa, and broccoli, receiving a high-protein meal suggestion with a recipe and macros that align with fitness goals.
- **Jamie**: Uploads a pantry photo, and the app identifies ingredients like pasta and tomatoes, suggesting quick family-friendly meals.
- **Sarah**: Specifies gluten and dairy allergies, receiving meal plans that are safe and meet her nutritional needs.

## User Stories/Features/Requirements

- **Meal Generation**
  - Users can input a list of ingredients manually.
  - The app generates meal suggestions, prioritizing high-protein options.
  - Users can filter by dietary preferences (e.g., high-protein, low-carb, vegan).
  - Users can specify allergies or intolerances to exclude certain ingredients.
  - Option to include ingredients not in the user's pantry for creative suggestions.
- **Photo Input (Advanced)**
  - Users can upload a pantry photo for ingredient identification (costs additional tokens).
  - The app uses image recognition to identify ingredients and generate meal suggestions.
- **Token System**
  - Each meal generation costs 1 token.
  - Users can purchase 100 tokens for $1 via LemonSqueezy.
  - New users receive 5 free generations upon signup.
- **User Profiles**
  - Users can create accounts to save preferences, allergies, and meal history.
  - Option to save favorite meals for quick access.
- **Nutritional Information**
  - Each generated meal includes full macros (calories, protein, carbs, fat).
  - Detailed nutritional breakdown available on request.
- **Recipe Output**
  - Each meal includes a complete recipe with ingredients and step-by-step instructions.
- **Community Features (Future)**
  - Users can share meals and recipes with the community.
  - Rate and review generated meals for feedback.

## Database Schema

| Table           | Fields                                                                                                                                                     |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Users**       | `user_id` (primary key), `email`, `password_hash`, `tokens_balance`, `free_generations_left`                                                               |
| **Meals**       | `meal_id` (primary key), `user_id` (foreign key), `ingredients` (text or JSON), `recipe` (text), `macros` (JSON: calories, protein, carbs, fat), timestamp |
| **Preferences** | `preference_id` (primary key), `user_id` (foreign key), `dietary_preferences` (JSON), `allergies` (JSON)                                                   |

## Technical Requirements

- **Frontend**
  - Framework: Next.js
  - Language: TypeScript
  - Styling: Tailwind CSS
  - UI Components: Shadcn UI
- **Backend**
  - Database: Supabase (PostgreSQL)
  - Authentication: Supabase Auth
  - Functions: Supabase Functions or Vercel Functions
- **AI Integration**
  - Vercel AI SDK for seamless AI model integration
  - Vercel AI Gateway for centralized AI model management and billing
  - Support for multiple AI models (Deepseek, OpenAI, Anthropic, etc.) through single gateway
- **Payment Processing**
  - LemonSqueezy for token purchases
- **Image Recognition (for photo input)**
  - Vercel AI SDK with AI Gateway for image recognition across multiple models
- **Language**: American English for all content
- **Package Manager**: pnpm (use pnpm dlx for executions)

## AI Gateway Benefits

The use of Vercel's AI Gateway provides several key advantages:

- **Centralized Billing**: Single payment method for all AI model usage, eliminating the need to manage credits across multiple vendors
- **Model Flexibility**: Easy switching between different AI models (Deepseek, OpenAI, Anthropic, etc.) without code changes
- **Cost Optimization**: Ability to route requests to the most cost-effective model for each use case
- **Simplified Management**: Single dashboard for monitoring usage, costs, and performance across all AI models
- **Future-Proofing**: Easy integration of new AI models as they become available

## Infrastructure & DevOps

- Hosting: Vercel
- Database: Supabase
- CI/CD: Husky for running all tests + linting + pnpm build before a git commit can be made
- Monitoring: Vercel Analytics + Vercel Speed Insights

## Features Out of Scope

- Mobile app development (initially web-only)
- Real-time collaboration or sharing features
- Integration with external recipe databases

## Open Issues & Future Enhancements

- Improve accuracy of ingredient recognition from pantry photos.
- Expand support for additional dietary preferences and restrictions.
- Implement a rating + sharing system for generated meals.
- Develop a mobile app version for broader accessibility.

## Q&A

- **Q: Can I use the app without purchasing tokens?**
  - **A**: Yes, new users receive 5 free generations to try the app.
- **Q: How does the photo input work?**
  - **A**: Users upload a pantry photo, and the app uses AI to identify ingredients and suggest meals, costing additional tokens.
- **Q: Is the app safe for users with allergies?**
  - **A**: Yes, users can specify allergies, and the app will exclude those ingredients from meal suggestions.

## Other Considerations

- **Accessibility**: Follow WCAG guidelines to ensure the app is accessible to users with disabilities.
- **Scalability**: Design for a large user base, leveraging Vercel AI Gateway's centralized model management and cost optimization.
- **Security**: Implement robust authentication and authorization, especially for payment processing.
- **Internationalization**: Plan for future support of multiple languages.

## Citations

- Vercel AI SDK Documentation
- Vercel AI Gateway Documentation
- DeepSeek API Docs - Pricing
- OpenAI Pricing
- Anthropic API Documentation
