---
name: version-bump
description: "Bump the app version in app.json after any code change. Use whenever: fixing bugs, adding features, updating dependencies, changing auth logic, modifying screens, or any other change that warrants a new build."
---

# Version Bump

## Rule
**Every change to the codebase must be followed by a patch version bump in `app.json`.**

## Version Format
`MAJOR.MINOR.PATCH` — always increment **PATCH** unless the user specifies otherwise.

Examples:
- `1.1.1` → `1.1.2` (bug fix / small change)
- `1.1.x` → `1.2.0` (new feature, user-facing)
- `1.x.x` → `2.0.0` (breaking change, major rewrite)

## File to Update
`app.json` — the `"version"` field at the top level:

```json
{
  "expo": {
    "version": "1.1.2"
  }
}
```

## When to Bump
- After any bug fix
- After any new screen or component
- After any auth / backend change
- After any translation update
- After any dependency or config change
- After any change to `convex/`, `lib/`, `app/`, `components/`

## When NOT to Bump
- Pure documentation changes (README, markdown files only)
- Changes only to `.env` files (no rebuild needed)
- User explicitly says to skip

## How to Apply
At the end of completing any task, update `app.json`:

```
"version": "X.Y.Z"  →  "version": "X.Y.Z+1"
```

Always confirm the bump in your completion message, e.g.:
> "Also bumped version to 1.1.2."
