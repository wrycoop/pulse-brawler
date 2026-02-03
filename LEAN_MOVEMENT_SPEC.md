# Lean-Driven Movement Spec

## Overview

Movement is driven by lean. The fighter has two parts: a **base** (feet/lower body) and an **upper body** (torso/head). To move, the player leans the upper body; the base follows.

This creates a unified physics layer where:
- Intentional movement = controlled lean
- Hit reactions = forced lean
- Dizzy = uncontrolled lean oscillation
- Grapple = external lean input

## Scope (Phase 1)

- One player-controlled fighter
- Arena (existing)
- Lean-driven movement only
- No combat, no other players, no states

---

## Fighter Visual

Two stacked circles:

```
Stable:        Leaning right:     Leaning hard:
   o              o                    o
   O            O                  O
```

- **Base (O)**: Larger circle. Actual position. Where your "feet" are.
- **Upper (o)**: Smaller circle. Position = base + lean offset.

### Rendering Params
| Param | Description |
|-------|-------------|
| `baseRadius` | Radius of base circle |
| `upperRadius` | Radius of upper body circle |
| `upperOffsetZ` | Visual "height" of upper (for later 3D, ignored in 2D) |

---

## Lean Model

The upper body can offset from the base within constraints.

### State
| Property | Type | Description |
|----------|------|-------------|
| `leanAngle` | radians | Direction of lean (0 = right, π/2 = down, etc.) |
| `leanMagnitude` | 0 to maxLean | How far upper is offset from base |

### Physics

Each frame:
1. **Target lean** set by input (or external forces)
2. **Lean approaches target** with response curve (not instant snap)
3. **Lean creates force** on base: `force = leanDirection × leanMagnitude × pullStrength`
4. **Base velocity** updated by force
5. **Base position** updated by velocity
6. **Base velocity** damped

Upper body position is always: `base.position + leanOffset`

Where: `leanOffset = (cos(leanAngle), sin(leanAngle)) × leanMagnitude`

### Tuning Params (lean section)
| Param | Description | Suggested Start |
|-------|-------------|-----------------|
| `maxLean` | Maximum lean distance (pixels) | 20 |
| `leanResponse` | How fast lean approaches target (0-1, 1=instant) | 0.15 |
| `pullStrength` | Force multiplier from lean to base movement | 0.5 |
| `baseDamping` | Velocity damping on base (0-1, 1=no damping) | 0.85 |

---

## Movement Input

Stick input sets the target lean.

### Logic

```
stickVector = (stickX, stickY)  // -1 to 1 each axis
stickMagnitude = length(stickVector), clamped to 1

targetLeanAngle = atan2(stickY, stickX)
targetLeanMagnitude = stickMagnitude × maxLean
```

When stick is neutral (magnitude ≈ 0):
- Target lean magnitude = 0
- Upper body returns to centered over base

### Tuning Params (movement section)
| Param | Description | Suggested Start |
|-------|-------------|-----------------|
| `stickDeadzone` | Ignore stick input below this magnitude | 0.1 |
| `stickCurve` | Response curve exponent (1=linear, 2=quadratic) | 1.5 |

---

## Feel Goals

What "good" feels like:
- **Responsive but not twitchy**: Lean responds quickly to stick, but has momentum
- **Weighty**: Base has inertia, doesn't snap to lean instantly
- **Smooth stop**: Releasing stick → lean returns to center → base glides to stop
- **Controllable**: Can make precise small movements and big sweeping ones

---

## Files

| File | Purpose |
|------|---------|
| `lean.js` | LeanModel class |
| `movement.js` | MovementInput class |
| `game.js` | Main loop, rendering, wiring |
| `tuning.json` | Lean + movement params |
| `tuning.html` | Lean + movement sections only |

---

## Phase 2 (later)

Once movement feels good:
- Add combat back (attacks apply force to lean)
- Add dizzy (lean oscillates on its own)
- Add grapple (external lean input from tether)
- Add other players

---

## Questions to Resolve During Tuning

1. Should lean response be different for "leaning into movement" vs "returning to center"?
2. Should base damping change based on lean magnitude (more lean = more committed)?
3. Arena boundary behavior - does it stop base, or create opposing lean force?
