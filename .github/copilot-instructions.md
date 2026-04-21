# Bloom (Planera AI) — Copilot Instructions

## Project Overview
Bloom is a full-stack Expo/React Native travel planning app with a Convex backend. It features AI-powered trip itineraries, Duffel flight bookings, community insights, low-fare radar deals, and freemium monetization via Apple IAP.

## Tech Stack
- **Frontend**: Expo (React Native 0.81.5), React 19, Expo Router (file-based routing)
- **Backend**: Convex (queries, mutations, actions, crons)
- **Auth**: Native JWT-based (Google/Apple/email-password), token stored in SecureStore
- **APIs**: Duffel (flights), OpenAI (itinerary generation), Unsplash (images), Postmark (email)
- **i18n**: i18next with 6 languages (EN, EL, ES, FR, DE, AR)
- **Payments**: Apple IAP + Stripe

## Key Conventions

### Authentication
- All Convex queries/mutations accept `token: v.string()` as an explicit arg (headers unreliable in RN)
- Use `authQuery`, `authMutation`, `authAction` wrappers from `convex/functions.ts`
- User data is on `ctx.user` (a `userSettings` doc) inside auth handlers
- userId is a `string`, not a Convex document ID

### Convex
- Schema lives in `convex/schema.ts`; auto-generated types in `convex/_generated/`
- Always add `by_user` index on tables with `userId`
- External API calls must go through Convex actions (not queries/mutations)
- Use `v.float64()` for numbers, `v.optional()` for nullable fields

### Frontend
- Use `useTheme()` from `lib/ThemeContext.tsx` for colors (supports dark mode)
- Use `useTranslation()` and `t('key')` for all user-facing text — never hardcode strings
- Navigation: `useRouter()` from `expo-router`
- Styles: `StyleSheet.create()` with dynamic theme colors
- Images: `OptimizedImage` component or `useImages()` hook

### Translations
- All 6 language files in `lib/i18n/` must stay in sync
- Add English first, then all other languages
- Arabic (ar) is RTL — consider layout implications

### Version Bumping
- **After every code change**, increment the PATCH version in `app.json` (`"version"` field)
- Format: `MAJOR.MINOR.PATCH` — always bump PATCH unless a feature (MINOR) or breaking change (MAJOR)
- Always confirm the bump in the completion message, e.g. "Also bumped version to 1.1.2."
- Skip only for pure documentation (markdown-only) changes
