# 🎮 BRAWLER PROTO - Fight Game Prototype

A minimalist browser-based strike mechanics sandbox built with Three.js and Gamepad API support.

## Quick Start

```bash
cd brawler-proto
node server.js
```

Then open http://localhost:3000 in a web browser.

## What You Get

✅ **One-Player Arena** - Fixed top-down view  
✅ **3 Dummy Targets** - Labeled Square, Triangle, Circle (PS button correspondence)  
✅ **Strike Mechanics** - Attack direction relative to target determines hit type  
✅ **Physics** - Dummies respond to knockback with decay  
✅ **Controller Support** - PS4/PS5 gamepad via Gamepad API  
✅ **Keyboard Fallback** - WASD movement + number keys  

## Controls

### PS4/PS5 Controller
- **Left Analog Stick** - Move player
- **Square Button** - Attack Square dummy (red)
- **Triangle Button** - Attack Triangle dummy (yellow)
- **Circle Button** - Attack Circle dummy (green)

### Keyboard (Fallback)
- **WASD** - Move player
- Note: Button inputs currently require a gamepad

## Attack Types (Direction-Based)

Your movement direction relative to the target determines what attack you perform:

| Direction | Attack | Effect |
|-----------|--------|--------|
| **Towards target** | **Jab** | Fast, light knockback (4 units) |
| **Away from target** | **Push Kick** | Heavy knockback (8 units), more reach |
| **Left/Right** | **Hook** | Lateral knockback (6 units) in that direction |
| **Stationary** | **Neutral** | Default knockback towards dummy |

## Game Feel Parameters (Tunable)

Located in `game.js`:

```javascript
// Player movement speed
this.player.speed = 8;

// Attack cooldown
this.player.attackCooldown = 0.3;

// Dummy knockback damping (0-1, lower = more sliding)
dummy.knockbackDamping = 0.92;

// Base knockback forces by attack type
attackForce = {
  jab: 4,
  push_kick: 8,
  hook: 6
}
```

## Technical Stack

- **Renderer**: Three.js r128 (CDN)
- **Physics**: Vector-based knockback (no external physics engine)
- **Input**: Native Gamepad API + Keyboard
- **Server**: Node.js HTTP server
- **Rendering**: WebGL with orthographic camera (top-down)

## Current Limitations

- No combo system
- No blocking
- No AI dummy behavior
- Dummies always reset to start position after coming to rest
- Single attack cooldown (not per-dummy)
- Particle effects are simple vector bursts

## Next Iterations

1. **Feel Tuning**: Adjust knockback distances/speeds based on Riley's feedback
2. **Visual Clarity**: Add hit markers, damage numbers, screen shake
3. **Dummy Reset**: Auto-return to start position or click-to-reset
4. **Audio**: Impact sounds for different attack types
5. **Combo Detection**: Track input sequences for future combo system
6. **Arena Variety**: Different arena sizes/layouts for testing

## Browser Compatibility

- Chrome/Chromium (primary target)
- Firefox (Gamepad API support)
- Safari (limited Gamepad support)

Requires WebGL support.

## Architecture

```
brawler-proto/
├── server.js          # HTTP server (Node.js)
├── index.html         # UI + Three.js canvas
├── game.js            # Game logic (all-in-one for speed)
├── package.json       # Node dependencies
└── README.md          # This file
```

## Debugging

Open browser console (F12) for logs:
- Controller connection status
- Attack type feedback
- FPS counter
- Player position

The UI overlay shows:
- Controller connection state
- Current FPS
- Player position in arena

---

**Priority**: Get strikes feeling good. Everything else is tunable.
