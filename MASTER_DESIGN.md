# Pulse Brawler — Master Design Document

*"Glowing humanoid robots beat the shit out of each other to music. The arena is alive. Hits feel like fireworks."*

**Version**: 1.0  
**Last Updated**: 2026-02-03  
**Authors**: Riley Cooper (Creative Direction), Johnny (Documentation & Implementation)

---

## Table of Contents

1. [Vision & Soul](#1-vision--soul)
   - 1.1 [One-Liner](#11-one-liner)
   - 1.2 [The Fighters](#12-the-fighters)
   - 1.3 [The Deaths](#13-the-deaths)
   - 1.4 [The Arena](#14-the-arena)
   - 1.5 [The Audience](#15-the-audience)
   - 1.6 [Design Pillars](#16-design-pillars)

2. [Game Identity](#2-game-identity)
   - 2.1 [Hybrid Genre](#21-hybrid-genre)
   - 2.2 [Core Philosophy](#22-core-philosophy)
   - 2.3 [2D vs 3D Strategy](#23-2d-vs-3d-strategy)

3. [Movement System (Lean-Driven)](#3-movement-system-lean-driven)
   - 3.1 [Overview](#31-overview)
   - 3.2 [Fighter Visual Model](#32-fighter-visual-model)
   - 3.3 [Lean Model](#33-lean-model)
   - 3.4 [Movement Input](#34-movement-input)
   - 3.5 [Physics Flow](#35-physics-flow)
   - 3.6 [Tuning Parameters](#36-tuning-parameters)
   - 3.7 [Feel Goals](#37-feel-goals)

4. [Combat System](#4-combat-system)
   - 4.1 [Control Scheme](#41-control-scheme)
   - 4.2 [Attack Types](#42-attack-types)
   - 4.3 [Attack Phases](#43-attack-phases)
   - 4.4 [Combo System](#44-combo-system)
   - 4.5 [Attack Outcomes](#45-attack-outcomes)
   - 4.6 [Defense Options](#46-defense-options)
   - 4.7 [Dizzy System](#47-dizzy-system)

5. [Grapple System (Hammer Toss)](#5-grapple-system-hammer-toss)
   - 5.1 [Overview](#51-overview)
   - 5.2 [Initiation](#52-initiation)
   - 5.3 [Orbital Physics](#53-orbital-physics)
   - 5.4 [Input Modes](#54-input-modes)
   - 5.5 [Victim Options](#55-victim-options)
   - 5.6 [Throw (Release)](#56-throw-release)
   - 5.7 [Counter-Grapple](#57-counter-grapple)
   - 5.8 [Collisions & Ring-Outs](#58-collisions--ring-outs)

6. [Arena & Environment](#6-arena--environment)
   - 6.1 [Arena Design](#61-arena-design)
   - 6.2 [Ring-Out Rules](#62-ring-out-rules)
   - 6.3 [Music Reactivity (Future)](#63-music-reactivity-future)

7. [Game Rules & Scoring](#7-game-rules--scoring)
   - 7.1 [Scoring](#71-scoring)
   - 7.2 [Round Structure](#72-round-structure)

8. [Technical Implementation](#8-technical-implementation)
   - 8.1 [Current Stack](#81-current-stack)
   - 8.2 [File Structure](#82-file-structure)
   - 8.3 [Class Architecture](#83-class-architecture)
   - 8.4 [Tuning System](#84-tuning-system)

9. [Development Roadmap](#9-development-roadmap)
   - 9.1 [Current Status](#91-current-status)
   - 9.2 [Phase 1: Combat Core](#92-phase-1-combat-core)
   - 9.3 [Phase 2: Multiplayer](#93-phase-2-multiplayer)
   - 9.4 [Phase 3: Game Loop](#94-phase-3-game-loop)
   - 9.5 [Phase 4: Music Reactivity](#95-phase-4-music-reactivity)

10. [Reference Points](#10-reference-points)

---

## 1. Vision & Soul

### 1.1 One-Liner

**Glowing humanoid robots beat the shit out of each other to music. The arena is alive. Hits feel like fireworks.**

### 1.2 The Fighters

**Grounded futurism.** Not fantasy mechs, not cartoon robots. The logical endpoint of what Tesla Optimus, Boston Dynamics Atlas, and Figure are building right now — but realized, beautiful, and luminous.

- **Humanoid proportions** — human-sized, human-shaped, dancer/athlete build
- **Grace AND power** — they move like martial artists, not action figures
- **Inner glow** — light emits from within; they're alive with energy
- **Aspirational machines** — what robots want to become

*They're almost real. That's what makes it compelling.*

### 1.3 The Deaths

**Fireworks, not gore.**

When a fighter dies, they don't crumple — they *shatter*. Like light-emitting glass breaking into a thousand glowing fragments. A spectacular burst. A celebration of the moment.

No blood. No violence-for-violence's-sake. Just beautiful destruction.

### 1.4 The Arena

**A living colosseum.**

The arena isn't just a space — it's a character. It breathes with the music:

| Sound Element | Arena Response |
|---------------|----------------|
| Bass/beat | Walls pulse inward (speaker cone effect) |
| Sweeping sounds | Blade/wave hazards sweep across |
| Vocals | Energy amplitude, fire, light intensity |
| Everything | The whole world is an instrument |

Clean, futuristic, geometric. Cubes and modular tech. Crisp warning telegraphs before hazards hit.

### 1.5 The Audience

**They're next.**

The arena is surrounded by glass walls — a skyscraper facade, a colosseum. Behind the glass: rows of dim humanoid silhouettes. Waiting. Watching. *Dancing to the beat.*

When a fighter dies:
1. One silhouette in the crowd lights up gold
2. They step through the glass
3. They're the new fighter

The audience isn't passive. They're participants waiting for their turn. Fans and gladiators.

### 1.6 Design Pillars

1. **Music is the heartbeat** — Everything reacts. The world exists inside the song.
2. **Hits feel like fireworks** — Every impact is spectacular. Deaths are celebrations.
3. **Grounded futurism** — Almost-real robots, not fantasy. Aspirational machines.
4. **Ship to learn** — 2D v1 completes the loop. 3D v2 only if earned.
5. **Same soul throughout** — No pivots between versions. Fidelity scales, vision doesn't.

---

## 2. Game Identity

### 2.1 Hybrid Genre

**Fighting game tactics with physics consequences.**

The game is a hybrid:
- Fighting game inputs and mind games (reads, punishes, combos)
- Physics-based outcomes (momentum, knockback, ring-outs)

*"Billiard balls with frame data."*

### 2.2 Core Philosophy

**"True" game** — state-based, consistent, no fudge factors.

| Principle | Meaning |
|-----------|---------|
| If you hit, you hit full | No hidden damage reduction |
| Readable, learnable | No SF6-style liberties |
| State-based | Everything is derivable from current state |
| Deterministic physics | Same input = same output, always |

### 2.3 2D vs 3D Strategy

**Ship 2D v1 first. Prove the concept. Find the audience. Learn from the full loop.**

| Version | Purpose |
|---------|---------|
| **2D v1 (Current)** | The *approximation* that stands on its own |
| **3D v2 (Future, Unreal)** | The *realization*, only if validated |

**2D should feel intentional, not compromised.** "This is cool AND imagine it in full 3D."

---

## 3. Movement System (Lean-Driven)

### 3.1 Overview

Movement is driven by **lean**. The fighter has two parts: a **base** (feet/lower body) and an **upper body** (torso/head). To move, the player leans the upper body; the base follows.

This creates a unified physics layer where:
- **Intentional movement** = controlled lean
- **Hit reactions** = forced lean
- **Dizzy** = uncontrolled lean oscillation
- **Grapple** = external lean input from attacker

### 3.2 Fighter Visual Model

Two stacked circles:

```
Stable:        Leaning right:     Leaning hard:
   o              o                    o
   O            O                  O
```

| Part | Description |
|------|-------------|
| **Base (O)** | Larger circle. Actual position. Where your "feet" are. |
| **Upper (o)** | Smaller circle. Position = base + lean offset. |

**Rendering Params:**
| Param | Description | Current Value |
|-------|-------------|---------------|
| `baseRadius` | Radius of base circle | 25 |
| `upperRadius` | Radius of upper body circle | 15 |

### 3.3 Lean Model

The upper body can offset from the base within constraints.

**State:**
| Property | Type | Description |
|----------|------|-------------|
| `leanAngle` | radians | Direction of lean (0 = right, π/2 = down, etc.) |
| `leanMagnitude` | 0 to maxLean | How far upper is offset from base |

**Upper body position:**
```
upperPosition = base.position + leanOffset
leanOffset = (cos(leanAngle), sin(leanAngle)) × leanMagnitude
```

### 3.4 Movement Input

Stick input sets the target lean.

**Logic:**
```
stickVector = (stickX, stickY)  // -1 to 1 each axis
stickMagnitude = length(stickVector), clamped to 1

targetLeanAngle = atan2(stickY, stickX)
targetLeanMagnitude = stickMagnitude × maxLean
```

When stick is neutral (magnitude ≈ 0):
- Target lean magnitude = 0
- Upper body returns to centered over base

### 3.5 Physics Flow

Each frame:
1. **Target lean** set by input (or external forces)
2. **Lean approaches target** with response curve (smoothed by `leanResponse`)
3. **Lean creates force** on base: `force = leanDirection × leanMagnitude × pullStrength`
4. **Base velocity** updated by force
5. **Base position** updated by velocity
6. **Base velocity** damped by `baseDamping`

### 3.6 Tuning Parameters

**Lean Section:**
| Param | Description | Current Value |
|-------|-------------|---------------|
| `maxLean` | Max upper body offset (px) | 10 |
| `leanResponse` | How fast lean reaches target (0-1) | 0.01 |
| `pullStrength` | Force multiplier | 0.2 |
| `baseDamping` | Velocity decay (0-1, higher = more slide) | 0.85 |

**Movement Section:**
| Param | Description | Current Value |
|-------|-------------|---------------|
| `stickDeadzone` | Ignore input below this | 0.1 |
| `stickCurve` | Response curve (1=linear) | 1.5 |

### 3.7 Feel Goals

What "good" feels like:
- **Responsive but not twitchy** — Lean responds quickly to stick, but has momentum
- **Weighty** — Base has inertia, doesn't snap to lean instantly
- **Smooth stop** — Releasing stick → lean returns to center → base glides to stop
- **Controllable** — Can make precise small movements and big sweeping ones

---

## 4. Combat System

### 4.1 Control Scheme

**4-player, one button per player:**

```
Player 1 = □    Player 2 = △
Player 3 = ○    Player 4 = ✕
```

**Your Button (Defense):**
| Input | Action |
|-------|--------|
| Hold | Block |
| Tap/Release | Parry (trigger on release = deliberate timing) |

**Their Button (Offense):**
| Input | Action |
|-------|--------|
| Tap | Attack (stick direction → jab/hook/kick) |
| Hold | Grapple initiate |

### 4.2 Attack Types

Direction determines attack type:

| Direction | Attack | Description |
|-----------|--------|-------------|
| Toward target | **Jab** | Quick, moderate knockback, combo starter |
| Away from target | **Push Kick** | More reach, bigger push, combo ender |
| Left/Right | **Hook** | Lateral knockback, combo extender |

All attacks affect the **lean system** — they tip the opponent's upper body and apply force to their base.

### 4.3 Attack Phases

Every attack has 3 phases:

| Phase | Description | Cancellable? |
|-------|-------------|--------------|
| **Startup** | Before hitbox appears (committed) | No |
| **Active** | Hitbox is out (can hit) | No |
| **Recovery** | After hitbox, before idle (vulnerable) | Attacks 1&2 only |

**Frame Timing (@60fps):**
| Phase | Frames | Ms | Notes |
|-------|--------|-----|-------|
| Startup | 3 | 50ms | Committed, can't cancel |
| Active | 4 | 67ms | Hitbox out |
| Recovery | 8 | 133ms | Cancel window for attacks 1&2 |
| Finisher Recovery | 12 | 200ms | NO cancel, must wait |

### 4.4 Combo System

Our combo system uses **cancels** (not links):

- During the **recovery phase** of attacks 1 & 2, you can cancel into the next attack
- This skips the remaining recovery and goes straight into the next attack's startup
- Attack 3 (finisher) has NO cancel window — must wait for full recovery

**Frame Budget:**
| Attack | Total Frames | Cancellable After |
|--------|--------------|-------------------|
| Attack 1 | 15 (250ms) | Frame 7 |
| Attack 2 | 15 (250ms) | Frame 7 |
| Attack 3 (Finisher) | 19 (317ms) | Never |

**State Machine:**
```
IDLE → (button press) → STARTUP → ACTIVE → RECOVERY → IDLE
                                              ↓
                                    (button during window)
                                              ↓
                                    STARTUP (next attack)
```

**Design Decisions:**
- Direction still matters — attack type determined by stick
- Whiffs = Finisher treatment — miss = full recovery (no cancel)
- Finisher (hit 3) = Bigger knockback

### 4.5 Attack Outcomes

Best to worst for attacker:

| Outcome | What Happened | Advantage |
|---------|---------------|-----------|
| **Punish Counter** | Hit during their attack | Guaranteed combo, dizzy |
| **Normal Hit** | Clean hit | Advantage, possible follow-up |
| **Blocked** | Hit into block | Contested, slight attacker advantage |
| **Parried** | Hit into parry | Defender gets free punish |
| **Whiff** | Miss entirely | Defender gets big punish |

### 4.6 Defense Options

| Option | Input | Risk/Reward |
|--------|-------|-------------|
| **Block** | Hold your button | Passive, slight disadvantage, loses to grapple + push kick |
| **Parry** | Tap your button | Hard timing, big reward (free counter) |
| **Dodge** | TBD | Escape pressure, reset to neutral, punishable if read |

### 4.7 Dizzy System

**3 hits = dizzy** (stun state)

- Dizzy meter fills from hits
- Threshold triggers stun
- Recovery: TBD (time-based? getting hit again?)
- Grappled while dizzy = free throw

---

## 5. Grapple System (Hammer Toss)

### 5.1 Overview

The grapple is a **player rotation** system, like a real hammer throw. You grab the opponent, then **you spin** — they get dragged around by the tether. Your rotation against their mass creates weight and builds momentum.

**Core mental model:** "I want my back to face my stick direction. To achieve that, I rotate — and the target gets dragged along."

### 5.2 Initiation

| Action | Result |
|--------|--------|
| Hold target's button + in range | Grab |
| Initial grab | Lock target at tether distance, player faces target |

### 5.3 Player Rotation Physics

**The key insight:** The player has **orientation** (facing direction). Orientation is physics, not cosmetic.

**Rotation Engine:**
1. **Stick direction** = where you want your back to face
2. **Desired facing** = opposite of stick direction
3. Player **rotates toward desired facing** (shortest path, CW or CCW)
4. Target is **tethered** at fixed distance
5. Player rotation **drags target around** (they're attached)
6. Target's **mass resists** rotation → weight feel
7. **Centrifugal force** pulls player toward target proportional to spin²

**Building momentum:**
- Keep circling the stick → keep rotating → keep dragging them
- Their velocity accumulates with each revolution
- Mass resistance means you have to **work** for the speed
- Pulling back (resisting centrifugal) helps maintain spin

**Tuning Params:**
| Param | Description |
|-------|-------------|
| `rotationSpeed` | Base rotation rate (before mass resistance) |
| `massResistance` | How much target slows your rotation (weight) |
| `tetherLength` | Distance target orbits |
| `centrifugalPull` | How much spin pulls player toward target |

### 5.4 Input Model

**Continuous rotation:**
- Circle your stick → continuously update desired facing → continuous rotation
- The rotation drags the target, building tangential velocity
- Stop circling → stop rotating → momentum persists but slowly decays

**Why this works:**
- Not "tangent input = spin" (too abstracted)
- Not "lean drives force" (didn't create momentum buildup)
- Player rotation is physically grounded — you spin, they follow

### 5.5 Victim Options

If not stunned:
| Action | Effect |
|--------|--------|
| **Stick input** | Drag (slows momentum buildup, buys time) |
| **Mash grappler's button** | Try to break free |
| **Velocity threshold** | Too fast → can't resist until thrown/slowed |
| **Other face buttons** | Can attack 3rd parties while being swung |

**Mash Out (Escape):**
- Enough button presses within time window = disconnect
- **Mutual knockback, no advantage** — neutral reset
- No punishment to grappler (risk/reward preserved)

### 5.6 Throw (Release)

| Input | Effect |
|-------|--------|
| Release button | Throw |
| Stick direction at release | Throw aim |

Victim arcs to catch up to aim direction (follow-through animation). Small push if releasing from push/walk state.

### 5.7 Counter-Grapple

Both grab each other → locked in yank battle.

| Action | Effect |
|--------|--------|
| Both can yank/counter-yank | Fight for momentum |
| Either can release + mash | Bail and try to escape |

Dangerous for both — not a safe release. Options: both take damage, spiral toward hazard, mash-off, double ring out near edge.

### 5.8 Collisions & Ring-Outs

| Scenario | Result |
|----------|--------|
| Throw into fighter | Both knocked + dizzy (billiards) |
| Swing over edge | Release and they fall (ring-out) |
| Swing into hazard | Hazard affects victim |

**3rd Party Interaction:**
- Grappler is thumb-committed (can't easily press other buttons)
- Victim CAN attack 3rd parties (hands free)
- Both can be hit by hazards / other players

---

## 6. Arena & Environment

### 6.1 Arena Design

- **Shape:** Circular (for now)
- **Size:** 350px radius (tunable)
- **Style:** Clean, futuristic, geometric
- **Boundary:** Ring-out on exit (not wall bounce)

### 6.2 Ring-Out Rules

| Event | Result |
|-------|--------|
| Fighter leaves arena bounds | Death (ring-out) |
| Death | Respawn at starting position |
| Score | See scoring section |

### 6.3 Music Reactivity (Future)

**Deferred to Phase 4.** Core concept:

| Sound Element | Hazard Type |
|---------------|-------------|
| Bass/beat | Walls pulse from sides (speaker effect) |
| Sweeping sounds | Blade/wave sweeps |
| Vocals | Fire/energy amplitude hazards |

Crisp warning telegraphs before hazards hit. Cubes/modular tech aesthetic.

---

## 7. Game Rules & Scoring

### 7.1 Scoring

| Event | Points |
|-------|--------|
| Kill | +1 |
| Death | -1 |
| Suicide | -1 |

### 7.2 Round Structure

TBD. Options:
- Time limit + highest score wins
- First to X kills
- Stock-based (last one standing)

---

## 8. Technical Implementation

### 8.1 Current Stack

| Component | Technology |
|-----------|------------|
| Runtime | Browser (Canvas 2D) |
| Server | Node.js (simple static file server) |
| Future 3D | Unreal Engine 5 |

### 8.2 File Structure

```
brawler-proto/
├── index.html       # Game page (clean, no tuning UI)
├── game.js          # Game logic (~250 lines)
├── lean.js          # LeanModel class
├── movement.js      # MovementInput class
├── tuning.json      # All tunables
├── tuning.html      # Tuning page (save auto-refreshes game)
├── server.js        # Dev server
├── MASTER_DESIGN.md # This document
├── SPEC.md          # Rebuild spec (if everything lost)
├── VISION.md        # Soul of the game
├── DESIGN.md        # Design notes
├── GRAPPLE_DESIGN.md # Grapple system detail
└── LEAN_MOVEMENT_SPEC.md # Movement system detail
```

### 8.3 Class Architecture

**Fighter** — Player-controlled entity
- Position (x, y), velocity (vx, vy)
- LeanModel instance
- MovementInput instance
- Attack state machine

**LeanModel** — Physics for upper body offset
- setTarget(x, y, maxLean)
- update(tuning) → returns force vector
- getOffset() → returns current lean offset

**MovementInput** — Input processing
- update(inputX, inputY, tuning)
- getInput() → returns processed input

**Dummy** — Target to hit (will become full Fighter for multiplayer)
- Position, velocity
- Knockback handling
- Ring-out detection

### 8.4 Tuning System

- All tunables in `tuning.json`
- Separate `tuning.html` page for editing
- BroadcastChannel auto-refreshes game on save
- Game also polls tuning.json every 2 seconds

---

## 9. Development Roadmap

### 9.1 Current Status

**Phase:** Prototype / Combat Core  
**Build Location:** `/Users/johnny/.openclaw/workspace/brawler-proto/`  
**Server:** `node server.js` → http://192.168.50.196:3000

**What's Working:**
- [x] Lean-driven movement
- [x] Two-circle fighter visualization
- [x] Basic jab attack
- [x] Single dummy with ring-out + respawn
- [x] Arena constraint (circular)
- [x] Tuning page with auto-refresh
- [x] Gamepad + keyboard input

### 9.2 Phase 1: Combat Core

- [ ] Tune lean feel (pullStrength, leanResponse)
- [ ] Grapple system (grappler's stick → victim's lean)
- [ ] More attacks (hook, kick)
- [ ] 3 dummies with button assignments (□ △ ○)
- [ ] Combo system
- [ ] Dizzy meter + stun

### 9.3 Phase 2: Multiplayer

- [ ] 4 player input handling (4 controllers)
- [ ] Player vs Player collision/combat
- [ ] AI opponents for solo testing
- [ ] Scoring system

### 9.4 Phase 3: Game Loop

- [ ] Round structure
- [ ] Win conditions
- [ ] Basic UI (health/dizzy meters)
- [ ] Respawn system

### 9.5 Phase 4: Music Reactivity

- [ ] Audio analysis
- [ ] Environmental hazards synced to music
- [ ] Telegraph system for hazards

---

## 10. Reference Points

**Visual:**
- Tesla Optimus / Boston Dynamics Atlas (humanoid robot design)
- Tron Legacy (glow aesthetic, digital world)
- Geometry Wars (particle spectacle, clean geometry)
- Inside/Limbo (silhouette power in 2D)

**Feel:**
- What GTA 1 was to GTA 3
- What Fallout 1 was to Fallout 3
- The 2D version implies the 3D version; the 3D version realizes it without pivoting

**Vibe:**
- Clean, futuristic, not cute
- Spectacular violence without gore
- Music as co-star, not background
- Underground, illicit, electric

---

## Resources

- **GitHub**: https://github.com/wrycoop/pulse-brawler
- **Shared Doc**: https://docs.google.com/document/d/1IWbcKPkykHTNedlrIQQ30R8lqx8WazyBZqhY2QuTT64/edit
- **Tuning Sheet**: https://docs.google.com/spreadsheets/d/1S-kMA5o6hxUvOe1r4KOGu4T50cyRgF8-nfBknDV2Ht8/edit

---

*"The simple version is cool in and of itself, and it begs for the fuller version. The full visual version feels like a realization rather than a direction change."*
