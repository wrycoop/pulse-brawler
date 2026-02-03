# Brawler Prototype — Rebuild Spec

*If everything is lost, rebuild from this.*

---

## What It Is

4-player local brawler. Ring-outs for kills. Music-reactive hazards (later). 2D first, 3D if validated.

**Identity:** Fighting game tactics with physics consequences. "Billiard balls with frame data."

---

## Core Mechanic: Lean-Driven Movement

Fighter has two parts:
- **Base** (feet) — actual position, larger circle
- **Upper body** — smaller circle, offsets from base by lean

### How It Works

1. Stick input → sets **lean target** (direction + magnitude)
2. Lean approaches target (smoothed by `leanResponse`)
3. Lean creates **force** on base: `force = direction × magnitude × pullStrength`
4. Force adds to velocity
5. Velocity moves position
6. Velocity damped by `baseDamping`

### Tuning (lean section)
| Param | What it does | Current |
|-------|--------------|---------|
| maxLean | Max upper body offset (px) | 20 |
| leanResponse | How fast lean reaches target (0-1) | 0.15 |
| pullStrength | Force multiplier | 0.5 |
| baseDamping | Velocity decay (0-1, higher = more slide) | 0.85 |

### Tuning (movement section)
| Param | What it does | Current |
|-------|--------------|---------|
| stickDeadzone | Ignore input below this | 0.1 |
| stickCurve | Response curve (1=linear) | 1.5 |

---

## Attack (Phase 1: One Jab)

Press attack button → check range → apply knockback to target.

| Param | What it does | Current |
|-------|--------------|---------|
| range | Hit distance | 100 |
| force | Knockback strength | 15 |
| frames | Attack duration | 15 |

---

## Arena

Circular. Fall off = ring out = respawn.

| Param | Current |
|-------|---------|
| radius | 350 |

---

## Files

| File | Purpose |
|------|---------|
| index.html | Game page (clean, no tuning UI) |
| game.js | Game logic (~250 lines) |
| lean.js | LeanModel class |
| movement.js | MovementInput class |
| tuning.json | All tunables |
| tuning.html | Tuning page (save auto-refreshes game) |

---

## Next To Build

1. **Grapple** — hold button, grappler's stick controls victim's lean
2. **More attacks** — hook (sweep), kick (combo ender)
3. **Dummies** — 3 targets with button assignments (□△○)
4. **Dizzy** — meter fills from hits, threshold triggers stun

---

## Not Yet

- Music reactivity
- 4 human players
- AI opponents
- Visual polish
- Sound

---

*Last updated: 2026-02-03*
