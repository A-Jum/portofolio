# 刃の道 · The Way of the Blade — design plan

A six-chapter jidaigeki short film that happens to be a portfolio. Content lives in
`src/data/profile.js`; everything visual and audible is drawn or synthesised in code.

## Tokens

| Token | Hex | Use |
|---|---|---|
| `--yoru` | `#1f0507` | page ground (a real dark red, not black) |
| `--urushi` | `#3b0a0d` | scrolls, racks, panels |
| `--chi` | `#8e1219` | moon, kanji, primary button |
| `--shu` | `#d23a2a` | hover, slash glow, embers — sparingly |
| `--kin` | `#c8a24a` | stamps, rim light, focus ring — very sparingly |
| `--washi` | `#ecdfc7` | body text (≈14:1 on yoru) |
| `--hai` | `#a08f86` | secondary text (≈6:1 on yoru) |
| `--hinoki` | `#c9a477` / `#8a6440` | dojo name boards (text on boards is `--sumi` #1a0a06, ≈8:1) |
| `#000` | | letterbox and deepest silhouettes only |

Page ground: `radial-gradient(ellipse at 60% 20%, #4a0b0f, var(--yoru) 55%, #0e0203)`.

Motion tokens: `--ease-blade: cubic-bezier(.7,0,.2,1)` (fast-in, long settle), `--ease-ink: cubic-bezier(.2,.7,.2,1)`.

## Typography

- Display: Shippori Mincho B1 800 (name, chapter titles), 500 (sub-titles, objective).
- Body/UI: Zen Kaku Gothic New 400/500.
- Ornamental kanji: Yuji Syuku — never for Latin text.
- Modular scale 1.333 on an 18px base: 13.5 · 18 · 24 · 32 · 42.6 · 56.8 · 75.7 px.
  Name card uses `clamp(3rem, 9vw, 9rem)`. Body line-height 1.6 (sans) / 1.7 (serif), measure ≤ 65ch.

## Wireframes

```
序 PROLOGUE (pinned, 2.39:1 frame, letterbox)
┌──────────────────────────────────────────────────────────┐
│████████████████████ letterbox ███████████████████████████│
│        ( blood moon )            castle  ⛩              │
│  ~~~ sumi-e ridges ~~~~~~~~~~~~~~~~~~~~~~~~~~   bamboo  人│
│        ANDREAS JUMAGA                         pagoda   工│
│        AI Engineer in Bandung, Indonesia      ninja    知│
│   ronin on hill ▲                                      能│
│ ▓▓ foreground grass (blurred) ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│              "subtitle line, word by word"               │
│████████████████████ letterbox ███████████████████████████│
└──────────────────────────────────────────────────────────┘

第一章 志 THE CREED                                    │第│
┌────────────┐   The Creed                            │一│
│ kakejiku   │   objective (serif 21px, 60ch)          │章│
│  [photo]   │   ───────                               │ │
│  duotone   │   Now  · AI Engineer, PT IGS (dl list)  │志│
└────────────┘   Base · Kabupaten Bandung              │ │
                 Degree · Sarjana Informatika          │ │

第二章 戦歴 BATTLES (pinned, horizontal emaki)
 ninja runs along top edge ─────────────►
┌~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~┐
│ Title │ IGS 2023–now  ink glyph+deed ×5  [誉 stamp] │ MEA part-time │ MEA intern │ 
└~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~┘

第三章 修行 TRAINING (dojo wall, hanging boards)
 ═════════════ beam ═════════════
  │ITHB │ │GAIPC│ │AWS │ │SAP │ │TOEFL│   (boards swing on scroll velocity)

第四章 武器 ARSENAL (weapon rack, one tier per category)
 ┃ Programming languages ┃ ▬Java ▬Python ▬C++ …
 ┃ Frameworks…           ┃ ▬Gin ▬Laravel …

終章 縁 EPILOGUE
       credits rolling up (scrubbed)
       [Send an email] [Message on WhatsApp]  Kabupaten Bandung
              終   (kamon hanko)
          Back to the beginning
```

## Principles

1. **Ma before motion.** Every chapter has one signature move; the rest is still. The hero is where the budget goes.
2. **Red is the night, not the accent.** Surfaces step through yoru → urushi → chi; gold appears only where a stamp or rim light would catch a moon.
3. **Facts are HTML; the film is decoration.** Canvas/SVG are `aria-hidden`; all CV facts are real, selectable text in reading order.
4. **Objects, not cards.** Each chapter borrows a physical artefact (kakejiku, emaki, nafuda, katana-kake, credit roll) so no two sections share a layout.
5. **Silence is the default.** Sound only after an explicit choice; music sits under the SFX and leaves gaps.

## Anti-cliché review

| Risk in first draft | Revision |
|---|---|
| Battles as three identical rounded "job cards" with drop shadows | One continuous emaki with torn paper edges; jobs are regions of the same scroll separated by ink brush dividers, no boxes. |
| Eyebrow labels ("EXPERIENCE") above every heading | Removed. Chapter identity is carried by the vertical kanji column; Latin titles stand alone in mincho. |
| Meta line "Jakarta · Full time · 2023" with middots | Written as a sentence-like `<p>`: "Jakarta, December 2023 to present" and role on its own line. |
| "Send email →" arrows | Buttons use plain verbs; the email button gets a small brush underline instead. |
| Skill chips with percentage bars | Engraved labels on lacquer blades, no levels — CV gives none. |
| Same fade-up on every section | Creed: scroll unrolls (clip-path). Battles: horizontal pin + running ninja. Training: pendulum swing. Arsenal: hover sheen. Epilogue: scrubbed credit roll. Nothing else animates on enter. |
| Coloured single word in headings | Not used; colour lives in kanji and stamps. |
| ALL-CAPS | Only the name on the title card. |
