# BRAWLER PROTOTYPE - DESIGN SPECIFICATION

> Last updated: 2026-02-03
> Version: v3 (Pixi.js 2D, No physics engine)

This document contains rebuild instructions for every system. A developer (AI or human) should be able to recreate each system from scratch without seeing the code.

---

## TABLE OF CONTENTS

1. [Core Architecture](#core-architecture)
2. [Combat System](#combat-system)
3. [Defense System](#defense-system)
4. [Grapple System](#grapple-system)
5. [Physics & Movement](#physics--movement)
6. [Audio System](#audio-system)
7. [Input System](#input-system)
8. [Tuning System](#tuning-system)
9. [Visual Feedback](#visual-feedback)

---

## CORE ARCHITECTURE

### Intent
Top-down 2D brawler with deterministic frame-based timing (locked 60fps). No physics engine - custom collision and knockback. Square arena with ring-out mechanic.

### Key Classes
- **BrawlerGame**: Main game loop, input handling, collision resolution
- **Player**: Human-controlled fighter (green circle, "X" label)
- **Dummy**: AI training dummy (colored circles, PlayStation symbols)
- **Vec2**: 2D vector math utilities
- **SoundFX**: Procedural Web Audio sounds

### Frame Timing
- All timing is frame-based (1 frame = 1/60 second)
- `dt` parameter in update functions is always `1/60` regardless of actual frame rate
- Timers decrement by 1 per frame, not by elapsed time
- This ensures deterministic replay and consistent feel

### Arena
- Square: 800x800 units centered at (0,0)
- Bounds: left=-400, right=400, top=-400, bottom=400
- Ring-out: When center of fighter crosses boundary, they fall off and respawn after 2 seconds
- Visual: Dark blue floor (#16213e) with cyan border (#00ffff)

---

## COMBAT SYSTEM

### Intent
SF6-inspired grounded combat. Attacks root the player, direction determines attack type. 3-hit combos with interruptible windows. Whiffs are punishable.

### Attack Types

| Attack | Input | Force | Reach | Angle | Properties |
|--------|-------|-------|-------|-------|------------|
| Jab | Stick toward target | 600 | 0.9x | 0° | Instant, combo starter, small step forward |
| Hook | Stick lateral | 600 | 0.9x | 90° | Sweeping arc, combo extender |
| Push Kick | Stick away from target | 600 | 1.1x | 0° | Thrust, NO CANCEL, step backward |

### State Machine

```
IDLE → [button press] → STARTUP → ACTIVE → RECOVERY → IDLE
                                    ↓
                           [if hit + cancelable] → STARTUP (combo)
                                    ↓
                           [if whiff OR finisher] → FULL RECOVERY (no cancel)
```

### Frame Data (Tunable)
- **Startup**: 6 frames (can be interrupted by getting hit)
- **Active**: 6 frames (damage window)
- **Recovery**: 12 frames (interruptible on hit)
- **Finisher Recovery**: 24 frames (NOT interruptible)
- **Cooldown**: 9 frames between attacks

### Direction Thresholds
Attack type is determined by stick direction relative to target:
- **Jab**: `dot(stick, toTarget) > 0.5` (pointing toward)
- **Kick**: `dot(stick, toTarget) < -0.5` (pointing away)
- **Hook**: Everything else (lateral)

### Combo System

1. **Combo Counter**: Tracks consecutive hits (0-indexed internally)
2. **Combo Reset Timer**: 60 frames (~1 second) - combo breaks if no follow-up
3. **Finisher**: 3rd hit (comboCount == 2) gets:
   - 1.5x force multiplier
   - Causes DIZZY state on target
   - Full recovery (no cancel)
4. **Whiff Penalty**: Missed attacks = no cancel, combo broken

### Dizzy State
- Duration: 180 frames (3 seconds)
- Visual: Target spins
- Effect: Cannot defend (block/parry bypassed)
- Knockback Multiplier: 3x (can ring-out easily)

### Collision Detection
- **Jabs**: Instant cone check (45° arc from facing direction)
- **Hooks/Kicks**: Animated limb with line-circle intersection tests
  - Limb sweeps from startAngle to endAngle over duration
  - Each dummy can only be hit once per animation (hitDummies Set)

### Movement During Attacks
Each attack has a step component (tunable):
- **Jab**: Step forward ~20 units over 6 frames
- **Hook**: Step diagonally (forward + lateral) ~15 units over 6 frames
- **Kick**: Step backward ~30 units over 9 frames

---

## DEFENSE SYSTEM

### Intent
SF6-style parry (release timing). Block is safe but loses meter. Parry is risky but grants advantage.

### Block (L1 Hold)
- Activated: Holding L1
- Effect: Reduces incoming knockback (per-attack tunable)
- Blockstun: 9 frames of recovery after blocking
- Visual: Blue body (#4488ff)
- Blockstun Visual: Muted blue (#6688cc)
- Cannot block while attacking or grappling

### Parry (L1 Release)
- Activated: Releasing L1 (not during attack/grapple)
- Window: 9 frames after release
- Visual: Cyan body (#00ffff) during window, white flash on trigger
- Success: 
  - Attacker gets knocked back (per-attack parryKnockback, ~400)
  - Attacker stunned (per-attack parryStunFrames, ~30)
  - Defender steps toward attacker (parryStep)
  - Defender gets gold state (parrySuccessTimer)
- Visual on Success: Gold body (#ffd700)
- Sound: Metallic ping

### Per-Attack Parry Tuning
Each attack type can have different parry responses:
- `parryKnockback`: How far attacker is pushed
- `parryAngle`: Direction offset (0=back, 90=side)
- `parryStunFrames`: How long attacker is stunned

---

## GRAPPLE SYSTEM

### Intent
Hammer toss / giant swing mechanic. Hold button to grab, spin victim with stick rotation, release to throw.

### Initiation
1. **Hold Duration**: 30 frames of holding attack button
2. **Range**: Within `touchDistance + 60` units (touching distance = player.radius + target.radius)
3. **Cannot grapple**: While blocking, attacking, already grappling, or target is grappled/respawning
4. **Button Mapping**: □=Dummy[0], △=Dummy[1], ○=Dummy[2]

### State Machine

```
IDLE → [hold button 30f] → GRAPPLE (below threshold)
                                ↓
                [rotate stick fast] → SPIN (above threshold)
                                ↓
                [release button] → THROW
                                ↓
                [victim mash] → ESCAPE (mutual knockback)
                                ↓
                [max rotations] → SPIN FAIL (grappler dizzy)
```

### Physics Model

#### Below Velocity Threshold (|angularVel| < 4 rad/s)
- **Grappler Movement**: Stick moves grappler at `grappleMoveSpeed * 60 * dt`
- **Victim Trails**: Passive drift - victim trails behind like dragging weight
  - Lateral stick input causes victim to swing in opposite direction
  - Drift force: `lateralMovement * passiveDrift * 0.05`
  - Clamped by friction to prevent instant whipping
- **Building Spin**: Cross product of (grappleAngle, stickInput) determines rotation direction
  - Dead zones: Pure forward/back (dot > 0.85 or < -0.85) = no spin force
  - Force = `lateralComponent * (0.3 + 0.7 * awayness) * angularAccel * 0.1`
  - "Awayness" = how much stick points away from victim (0-1 gradient)

#### Above Velocity Threshold (|angularVel| >= 4 rad/s)
- **No Stick Translation**: Grappler locked in place
- **Back Drift**: Grappler drifts perpendicular to spin direction (`backDrift * 2`)
- **Maintain Spin**: Continue rotating stick in spin direction to add momentum
  - Only adds acceleration (0.5x rate) if stick matches spin direction
- **Reduced Drag**: 90% less angular drag (momentum conserved)
- **Spin Counter**: Track total rotations for timeout

#### Hold Distance (Centrifuge Effect)
- Victim distance from grappler scales with angular velocity
- `holdDist = minDist + (maxDist - minDist) * (|angularVel| / threshold)`
- Default: 50-120 units

### Throw
- **Trigger**: Release grapple button
- **Direction**: Tangent to spin circle (direction of travel)
- **Force**: `throwForce * (0.5 + spinBonus * 0.5)`
  - `spinBonus = min(|angularVel| / threshold, 2)` (up to 2x)
- **Default throwForce**: 1000

### Escape (Victim)
- **Escape Meter**: 0-1, fills via mashing
- **AI Mash**: 30% chance per frame to add `escapeRate` (0.01)
- **Decay**: `escapeDecay` per frame (0.005)
- **Breakout**: When meter >= 1
  - Mutual knockback (`escapeForce`, ~400)
  - Both pushed apart in opposite directions
  - Parry sound plays

### Spin Timeout
- **Max Rotations**: 3 full rotations in spin state
- **Consequence**: Grappler gets dizzy (same as being hit by finisher)
- **Victim**: Put down gently (200 force)

### Visual States
- **Grappling (below threshold)**: Gold body (#ffd700)
- **Spinning (above threshold)**: Cyan body (#00ffff)
- **Being Grappled**: Red body (#ff4444)

---

## PHYSICS & MOVEMENT

### Intent
Simple momentum-based knockback with damping. No complex physics - just velocity and position.

### Movement
- **Player Speed**: 300 units/second
- **Cannot move**: While attacking, blocking, or in spin-grapple
- **Grapple movement**: Separate logic (see Grapple System)

### Knockback
- **Application**: `velocity += direction.normalize() * force`
- **Damping**: `velocity *= 0.95` per frame
- **No velocity cap**: Tuning controls distance via force values

### Collision Resolution
- After all position updates, check all fighter pairs
- If circles overlap: push apart 50/50 along collision normal
- Skip collision for grapple pairs
- `overlap = minDist - actualDist; push = overlap * 0.5`

### Ring-Out
- Triggered when fighter center crosses arena boundary
- Respawn after 2 seconds at initial position
- Visual: Fighter disappears, console logs event

---

## AUDIO SYSTEM

### Intent
Procedural sound effects using Web Audio API. No external files needed.

### SoundFX Class Methods

| Sound | Description | Implementation |
|-------|-------------|----------------|
| hit() | Punchy impact | Low sine (150→50Hz) + noise burst |
| whiff() | Air swing | Bandpass-filtered noise (1000→400Hz) |
| block() | Thud | Low sine (100→40Hz), shorter than hit |
| parry() | Metallic ping | Sine (880→440Hz) + triangle overtone (1760Hz) |
| dizzy() | Stars/stunned | Descending bwoop (600→200Hz) + warble |
| ringOut() | Fall off | Sawtooth (400→50Hz), long decay |
| throw() | Whoosh | Bandpass noise (800→200Hz) |

### Audio Context
- Lazy initialization on first sound
- Auto-resume if suspended (browser policy)
- Can be disabled via `sfx.enabled = false`

---

## INPUT SYSTEM

### Intent
Support both PlayStation controller and keyboard. Prefer DualSense/DualShock over virtual Xbox controllers.

### Controller Mapping
- **Left Stick**: Movement / attack direction / grapple control
- **□ (Square)**: Attack Dummy[0] (front, red)
- **△ (Triangle)**: Attack Dummy[1] (left, yellow)
- **○ (Circle)**: Attack Dummy[2] (right, green)
- **L1**: Block (hold) / Parry (release)

### Keyboard Fallback
- **WASD**: Movement
- **J**: □ (Square)
- **I**: △ (Triangle)
- **K**: ○ (Circle)
- **L**: □ (Square) - alternate
- **Shift**: L1 (Block/Parry)

### Deadzone
- Left stick deadzone: 0.15
- Below deadzone: treated as 0

### Button Detection
- **Press**: `btns[x] && !lastBtns[x]`
- **Release**: `!btns[x] && lastBtns[x]`
- **Hold Time**: Track frames held for grapple detection

---

## TUNING SYSTEM

### Intent
External JSON file for all tunable values. Hot-reload on save. In-game panel for quick iteration.

### tuning.json Structure
```json
{
  "dummy": { "guard": "none", "hitReaction": "punishCounter" },
  "movement": { "playerSpeed": 300, "knockbackDamping": 0.95 },
  "attacks": {
    "jab": { "force": 600, "reach": 0.9, "angle": 0, "stepDistance": 20, "stepFrames": 6, "blockKnockback": 0.2, "parryKnockback": 400, "parryAngle": 0, "parryStunFrames": 30 },
    "hook": { "force": 600, "reach": 0.9, "angle": 90, "sweepStart": -60, "sweepEnd": 60, "sweepFrames": 6, "stepDistance": 15, "stepFrames": 6, "stepLateral": 0.5, ... },
    "kick": { "force": 600, "reach": 1.1, "angle": 0, "stepDistance": 30, "stepFrames": 9, "blockKnockback": 1.0, ... }
  },
  "timing": { "startupFrames": 6, "activeFrames": 6, "recoveryFrames": 12, "finisherRecoveryFrames": 24, "cooldownFrames": 9 },
  "combo": { "maxChain": 3, "finisherForceMultiplier": 1.5, "comboResetFrames": 60, "dizzyFrames": 180, "dizzyKnockbackMultiplier": 3 },
  "combat": { "blockstunFrames": 9, "parryStep": 0 },
  "grapple": { "holdFrames": 30, "range": 60, "angularAccel": 8, "angularDrag": 2, "velocityThreshold": 4, "grappleMoveSpeed": 0.3, "holdDistanceMin": 50, "holdDistanceMax": 120, "throwForce": 1000, "maxSpins": 3, ... },
  "arena": { "strikeRange": 120 },
  "inputDirections": { "jabThreshold": 0.5, "kickThreshold": -0.5 }
}
```

### Hot Reload
- BroadcastChannel listener: `'brawler-tuning'` → `'reload'` triggers page reload
- Server can POST updates and broadcast reload signal

### Dummy Settings
- `guard`: 'none' | 'blockAll' | 'parryAll'
- `hitReaction`: 'normal' | 'counterHit' | 'punishCounter'

---

## VISUAL FEEDBACK

### Fighter Colors (Priority Order)

| State | Player Color | Dummy Color |
|-------|--------------|-------------|
| Grappling (spin) | Cyan #00ffff | - |
| Grappling (below) | Gold #ffd700 | - |
| Being Grappled | - | Red #ff4444 |
| Hitstun (no limb) | Red #ff4444 | - |
| Parry Success | Gold #ffd700 | Gold #ffd700 |
| Parry Trigger | White #ffffff | - |
| Parry Window | Cyan #00ffff | Cyan #00ffff |
| Blockstun | Muted Blue #6688cc | Muted Blue #6688cc |
| Blocking | Blue #4488ff | Blue #4488ff |
| Attacking (limb) | Orange #ffaa00 | - |
| Dizzy | - | Orange #ffaa00 + spinning |
| Normal | Green #00ff88 | Original color |

### Flash Effect
- On hit: Target flashes white for 100ms
- Body redraws to white, then back to state color

### Limb Visualization
- **Jab**: White line (4px)
- **Kick**: Orange line (8px)
- **Hook**: Yellow line (5px) with trail effect
- **Parried Attack**: Red line (attack continues but no more hits)

### Strike Range Visualization
- Yellow circle at player position
- 150ms fade-out on attack

### UI Elements
- Controller status (top-left)
- Player position + combo count (top-left)
- FPS counter (top-left)
- Tuning panel (collapsible, right side)

---

## EDGE CASES

### Documented Edge Cases

1. **Grapple during attack**: Cannot initiate - button hold resets if attack succeeds
2. **Grapple vs block**: Grappled fighters cannot block or parry
3. **Parry vs finisher**: Finishers can still be parried
4. **Double grapple**: Target already grappled = cannot be grabbed again
5. **Respawn immunity**: Respawning fighters skip all collision/damage
6. **NaN position**: Safety check resets fighter to initial position
7. **Audio context suspended**: Auto-resume on first sound
8. **Tuning fetch timeout**: Falls back to hardcoded defaults after 5s

### Known Limitations

1. **No networking**: Single-player with AI dummies only
2. **No health/lives**: Pure knockback/ring-out focus
3. **No music reactivity**: Hazards system not implemented yet
4. **Fixed camera**: No zoom or pan
