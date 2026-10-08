# Orrery

A free Astro theme for consultants and small B2B service firms: a dark site with large light type, one lime accent and a home page that moves as you scroll.

The demo business is **Quillmoor Analytics**, a fictional five-person data and strategy consultancy in the fictional town of Port Alder. Everything on the site is sample content: phone numbers use the 555-01xx range reserved for fiction, every email and link uses `example.com`, and the team is described by role, not by name.

- **One file to rebrand.** Name, contact details, hours, the hero counters, the accent color and the form key live in `src/config.ts`. Services are Markdown files.
- **Thirteen scroll and load effects, no animation library.** Text that fills letter by letter, cards that swing up in 3D, a panel that grows out of the screen edge, titles that straighten as they arrive. All of it is CSS scroll-driven animation, plus one 2.6 KB canvas script for the particle network, the drifting lines and the dot wave.
- **A contact form that never fakes success.** It shows "Message received" only when the form backend answers `success: true`. Errors and lost connections show an error. Without JavaScript it still works as a plain HTML form.
- **Fast and accessible.** Static pages, one self-hosted variable font, three small scripts (the canvas scenes, the form, closing the mobile menu). Labels on every field, visible focus, AA contrast for every text color, including the grey of text that has not filled yet, and `prefers-reduced-motion` respected everywhere.

Built with Astro 7, Tailwind CSS 4 and TypeScript.

## Quick start

```sh
npm create astro@latest -- --template formgong/orrery-astro-theme
cd your-project
npm run dev
```

Or clone the repository and run `npm install`, then `npm run dev`. Node 22.12 or newer is required.

| Command           | What it does                                   |
| ----------------- | ---------------------------------------------- |
| `npm run dev`     | Local dev server at `http://localhost:4321`    |
| `npm run build`   | Static site in `dist/`                         |
| `npm run preview` | Serve the built site locally                   |
| `npm run check`   | Type-check `.astro` and `.ts` files            |

## Rebrand it

Open `src/config.ts`. The main fields:

| Field                                     | Used for                                                                                   |
| ----------------------------------------- | ------------------------------------------------------------------------------------------ |
| `name`, `shortName`, `tagline`, `description` | Logo (two-line wordmark: `shortName`, then the rest of `name`), page titles, meta description, JSON-LD |
| `url`                                     | Canonical URLs, Open Graph, sitemap, robots.txt and the form's redirect                    |
| `schemaType`                              | schema.org type, e.g. `ProfessionalService`, `AccountingService`, `LegalService`           |
| `phone`, `email`, `address`, `areaServed` | Header menu, footer, contact page, JSON-LD                                                 |
| `hours`, `hoursNote`                      | Contact page, JSON-LD opening hours                                                        |
| `social`                                  | Footer icons. Real profile URLs are also added to JSON-LD `sameAs`                         |
| `stats`, `statsNote`                      | The four counters in the hero. Sample values: replace them, then clear `statsNote`         |
| `theme.accent`, `theme.accentText`        | The one accent (key words, buttons, cards, the process panel) and the text color on it (keep 4.5:1) |
| `formgong`                                | Fallback access key, endpoint and email subject for the contact form                      |
| `nav`, `cta`                              | Header links and the accent button in the header and footer                               |

Replace the logo mark in `src/components/Logo.astro` and `public/favicon.svg`, and regenerate `public/og.png` (1200×630) and `public/apple-touch-icon.png` (180×180).

The JSON-LD block has no star rating on purpose: search engines ignore ratings a business publishes about itself.

## Set up the form

The contact form posts to [Formgong](https://formgong.com), a hosted form backend, so you don't need a server. It appears on the contact page and at the bottom of the home page.

1. Create a free form at [formgong.com/new](https://formgong.com/new?name=Website%20contact%20form) (or from the dashboard if you already have an account).
2. Copy the form's access key. It starts with `fk_` and is public by design: it only lets visitors send submissions to that one form.
3. Add it to a `.env` file in the project root:

   ```sh
   PUBLIC_FORMGONG_ACCESS_KEY=fk_your_access_key
   ```

   or set `formgong.accessKey` in `src/config.ts`. While the placeholder key is in use, the dev server shows a reminder above the form.
4. Set `url` in `src/config.ts` to your real domain. Visitors without JavaScript are redirected to `/thanks/` on that domain. Formgong only follows a redirect on the site that sent the form, so on `localhost` you land on Formgong's own thank-you page instead.

Submissions arrive by email and, if you connect it, in Telegram. The free plan covers 300 submissions a month.

**How the form behaves**

- Without JavaScript: a normal `POST` to `https://formgong.com/submit`. The hidden `_redirect` field sends the visitor to `/thanks/` afterwards.
- With JavaScript: the same fields are sent with `fetch` and `Accept: application/json`. The button is disabled while sending. The success state, with its checkmark animation, appears only when the JSON response has `success === true`. Any other response shows the server's `message`. A network failure shows an error and your email address.
- The hidden `botcheck` field is a spam honeypot. Keep it empty and keep it in the markup.

**Using another form backend.** Any service that accepts a standard form `POST` works. Set `PUBLIC_FORMGONG_ENDPOINT` (or `formgong.endpoint`) to its URL and rename the hidden fields to what that service expects. If its JSON response is shaped differently, change the single `reply?.success === true` check in `src/components/ContactForm.astro`.

## Edit the content

- **Services:** one Markdown file per service in `src/content/services/`. Frontmatter: `title`, `tags` (the short line on the card), `summary`, `order`, `priceFrom`, `duration`, `deliverables` (list) and `art`, the card's line animation: `grid`, `bars`, `forecast`, `curve`, `bells` or `clusters` (see `src/components/ServiceArt.astro`). The body is shown on the services page.
- **Key words in the accent:** wrap them in asterisks, for example `title="Our *services*"`. This works in section headings, page headers and the text that fills on scroll.
- **Home page copy:** one file per section in `src/components/sections/`. The process steps are at the top of `Process.astro`.
- **About page:** roles and terms at the top of `src/pages/about.astro`.

## The effects

Numbers match the comments in the code.

| #  | Effect | Where |
| -- | ------ | ----- |
| 1  | Fixed header: logo, three links, accent button, a 1px divider from the content edge to the screen edge | `Header.astro` |
| 2  | Hero heading and counters fade up on load; a 3D particle network turns slowly on the right | `sections/Hero.astro`, `scripts/scenes.ts` (`plexus`) |
| 3  | Counters count up from 0 in the accent color | `.count` in `effects.css` |
| 4  | The network is clipped into a shrinking band and drifts down as you scroll away | `.hero-net` |
| 5  | A statement fills letter by letter, grey to white, key words to the accent | `FillText.astro`, `.fill` |
| 6  | Line-art orbits turn slowly, each ring at its own speed | `Orbits.astro`, `.orbit-ring` |
| 7  | A large rounded panel of drifting lines scales up to full width; its quote fades from grey to white | `sections/MediaPanel.astro`, `.media`, `scenes.ts` (`flow`) |
| 8  | Two-tone section heading with a short accent rule | `SectionHeading.astro` |
| 9  | Service cards swing up from a 3D tilt, dark and offset down and to the right column by column, then light up and lock into the grid; each card loops its own line drawing | `ServiceCard.astro`, `ServiceArt.astro`, `.svc-card` |
| 10 | Split section: the visual and the ridgeline chart inside it move at different speeds | `sections/Split.astro`, `Ridgelines.astro`, `.par` |
| 11 | An accent panel grows out of the left edge of the screen next to sticky turning orbits; each step title enters warped and straightens, then its paragraph is revealed | `sections/Process.astro`, `WarpTitle.astro`, `.process-panel`, `.warp` |
| 12 | The closing heading fills letter by letter, like 5 | `sections/FinalCta.astro` |
| 13 | Footer over a rolling 3D field of dots | `Footer.astro`, `scenes.ts` (`wave`) |

How it is built:

- **Scroll-linked effects are CSS.** They use `animation-timeline: view()` and `scroll()` (scroll-driven animations), so the browser runs them off the scroll position, with no scroll listeners. They are all in `src/styles/effects.css`.
- **Letters are split at build time.** `FillText.astro` and `WarpTitle.astro` wrap each letter in a span with its index while Astro renders the page; nothing is split in the browser. Screen readers and search engines get each sentence once, as plain text; the letter spans are `aria-hidden`.
- **One canvas script** (`src/scripts/scenes.ts`, 2.6 KB minified, no dependencies) draws the particle network, the drifting lines and the dot wave. It caps the device pixel ratio at 2, draws only while a canvas is on screen and the tab is visible, and draws a single still frame when the visitor prefers reduced motion.
- **The counters are CSS too:** a registered integer property animated from 0 and printed with `counter()`. The real numbers are in the HTML for screen readers and search engines.

Browsers without scroll-driven animations and visitors who prefer reduced motion see every section in its final state: text filled, cards flat and lit, the panel at full width, titles straight. Nothing is hidden. The scroll version was checked in Chrome and in Safari's engine (WebKit, via Playwright).

Three CSS details that keep it working:

- Scroll-driven rules use longhand properties (`animation-name`, `animation-timeline`, …). A minifier can merge a shorthand and `animation-timeline` into one declaration that Chrome rejects.
- Wrappers around animated content use `overflow: clip`, not `overflow: hidden`. `overflow: hidden` creates a scroll container, and a view timeline inside it would track that box instead of the page.
- Text never fades in through low opacity. Reveals use a mask (`clip-path`) and a slide, and unfilled text is a grey that still has 5.9:1 contrast, so text stays readable while it animates, not only at the end. The one exception is the service cards: while they swing up they are dimmed with a brightness filter, for the few hundred pixels of scrolling the entrance takes.

## Look

Navy-black ground (`--c-bg`), near-white type, a mid grey (`--c-dim`) for text that has not filled yet, and one accent from `theme.accent` with near-black text on it. Display type is Outfit at a light weight. Rounded 20px corners, thin 1px dividers. Colors are tokens at the top of `src/styles/global.css`.

## Project structure

```text
src/
├── components/
│   ├── sections/       Hero, Statement, MediaPanel, Services, Split, Process, FinalCta (the home page, in order)
│   ├── ContactForm.astro   The form and its script
│   ├── FillText.astro      Letter-by-letter fill (5, 12)
│   ├── WarpTitle.astro     Warped step titles (11)
│   ├── Orbits.astro        Line-art orbits (6, 11)
│   ├── Ridgelines.astro    Build-time ridgeline chart (10)
│   ├── ServiceCard.astro, ServiceArt.astro   Service cards and their line drawings (9)
│   ├── Head.astro          Meta tags, Open Graph, JSON-LD
│   └── Header, Footer, Logo, Icon, PageHeader, SectionHeading, Highlight
├── content/services/   One Markdown file per service
├── layouts/            BaseLayout.astro
├── lib/                schema.ts (JSON-LD), split.ts (letter splitting), highlight.ts
├── pages/              index, services/, about, contact, thanks, 404, robots.txt.ts
├── scripts/scenes.ts   The canvas scenes
├── styles/             global.css (tokens, components), effects.css (all motion)
├── config.ts           Everything you rebrand
└── content.config.ts   Collection schema
public/                 favicon.svg, og.png, apple-touch-icon.png
```

## Deploy

`npm run build` produces a static site in `dist/` that any static host can serve. Set `url` in `src/config.ts` first so canonical links, the sitemap and the form redirect point at your domain.

## License

MIT, see `LICENSE`. The illustrations, line drawings and icons were drawn for this theme and are covered by the same license. The font is Outfit, licensed under the SIL Open Font License 1.1 and installed from `@fontsource-variable/outfit`.
