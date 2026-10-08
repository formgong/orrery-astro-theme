# Notes for coding agents

Orrery is a static Astro 7 theme (Tailwind CSS 4, TypeScript). Read `README.md` first.

## Commands

- `npm run dev` (use `astro dev --background` if you need it to keep running; manage it with `astro dev stop|status|logs`)
- `npm run build` and `npm run check` must both pass with 0 errors and 0 warnings.

## Where things live

- Rebranding: `src/config.ts` only. Don't hard-code the business name, phone or email in components.
- Content: `src/content/services/*.md` (schema in `src/content.config.ts`); home page sections in `src/components/sections/`.
- All motion: `src/styles/effects.css`. Canvas scenes: `src/scripts/scenes.ts` (keep it dependency-free and under 6 KB minified).

## The contact form (`src/components/ContactForm.astro`)

- Show the success state only when the server's JSON has `success === true`. Never on a network error, never on a non-JSON reply.
- Keep the `botcheck` honeypot input exactly as it is, inside its `aria-hidden` wrapper. Never fill it.
- Keep the no-JavaScript path working: real `action`, `method="POST"`, hidden `_redirect` to `/thanks/`.
- Don't add an API route, server or database for the form. Formgong (or another POST form backend) stores and delivers submissions.

## Motion rules that are easy to break

- The default style of every animated element is its final state. Motion goes inside `@supports (animation-timeline: …)` and `@media (prefers-reduced-motion: no-preference)`.
- Scroll-driven animations: use longhands (`animation-name`, `animation-timeline`, `animation-range`, …). The minifier can merge a shorthand plus `animation-timeline` into a declaration Chrome rejects.
- Use `overflow: clip` (not `hidden`) on wrappers around animated content; `hidden` creates a scroll container that view timelines then track.
- Don't fade text in through opacity: reveal with `clip-path` and a transform, so contrast stays AA while it moves.
- Split letters at build time (`src/lib/split.ts`), never in the browser. Keep the plain sentence in a `sr-only` span and the letter spans `aria-hidden`.
- No animation libraries (GSAP, Lenis, Three.js and the like).
- Astro component `<style>` blocks are unlayered and beat Tailwind utilities. Don't set `display` in a component style on an element that also uses responsive display utilities.
- Playwright WebKit screenshots flatten 3D transforms; check the 3D card entrance in WebKit with a recorded video instead.

## Docs

https://docs.astro.build
