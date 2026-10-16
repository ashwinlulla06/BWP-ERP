# UI guide (all 4 modules)

The look is the **UniReserve template** — see `docs/design-reference/`
(`screen.png` = how it should look, `code.html` = exact classes/tokens, `DESIGN.md` = written rules).
If something is unclear, match the screenshot.

## Rules
1. **Colors, fonts, spacing, radius come from `client/src/styles/theme.css`.** Never hardcode a hex value in your module.
2. **Use the shared components** in `client/src/components/` — don't write your own buttons, cards, inputs or badges:
   `Button`, `Card`, `Badge`, `Input`, `Icon`, `Layout`.
3. **Icons:** `<Icon name="search" />` — names from https://fonts.google.com/icons (Material Symbols Outlined).
4. **Page skeleton** (copy from `pages/books/BookCatalog.js`):
   eyebrow label -> `<h1>` -> muted subtitle -> content in `Card`s.
5. **Add your sidebar link** in the `NAV` array in `components/Layout.js`.

## Quick reference
| Need | Use |
|---|---|
| Main action | `<Button>` (navy) |
| Secondary action | `<Button variant="tonal">` or `variant="outline"` |
| Cancel / delete | `<Button variant="danger">` (outlined red) · `danger-solid` for final confirm |
| Status chip | `<Badge status="available|pending|approved|rejected|reserved|cancelled" />` |
| Search / text field | `<Input icon="search" size="lg" />` |
| List row (like "Upcoming Reservations") | `.row-card` + `.thumb` (see `MyReservations.js`) |
| Grid of cards | `.card-grid` + `<Card interactive className="resource-card">` |
| Empty state / error | `.empty-state` / `.alert alert--error` |

## Tokens at a glance
Primary `#000f3f` · Primary hover `#172554` · Secondary (links, active, focus) `#0051d5` ·
Page bg `#f8f9ff` · Card `#ffffff` · Text `#0b1c30` · Muted `#45464f` ·
Fonts: Plus Jakarta Sans (headings), Inter (body) · Card radius 12px · Button/input radius 8px · Badge pill.
