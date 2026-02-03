# GAMEPLAY GUIDE - Brawler Proto

## What You're Testing

This is a **strike mechanics sandbox**. Your job is to feel how strikes land and iterate on what feels good.

### The Arena

- **Fixed top-down view** - You can see the entire arena at once
- **3 Dummies** positioned around you (Square, Triangle, Circle)
- **Green boundary** - The arena edges (dummies bounce off)
- **Green cone** - That's you (the player)

### Your Objective

Strike the dummies and feel the knockback. Experiment with:

1. **Different approach angles** - How does the attack change?
2. **Distance** - How close/far do you need to be?
3. **Timing** - Is the 0.3s cooldown right?
4. **Feedback** - Can you clearly see when you hit and how hard?

## How to Play

### Getting Started

1. Connect a PS4 or PS5 controller to your computer
2. Open http://localhost:3000 in a browser
3. Wait for the UI to show "✓ Controller: Connected"

### Movement & Targeting

- **Move**: Left analog stick (WASD on keyboard)
- **Select Target**: Face buttons (Square/Triangle/Circle)

### Attacking

Press a face button while moving in different directions:

- **Move TOWARDS dummy + Press button** = Jab (light, fast)
- **Move AWAY FROM dummy + Press button** = Push Kick (heavy, far)
- **Move LEFT/RIGHT + Press button** = Hook (lateral knockback)
- **Stand still + Press button** = Neutral (basic knockback toward dummy)

### Attack Feedback

Each strike gives feedback:
- **Flash** - Dummy flashes white on hit
- **Knockback** - Dummy gets knocked in hit direction
- **Particles** - Colorful burst from impact point
- **Console log** - "JAB!" / "PUSH_KICK!" / "HOOK!" (open F12 to see)

## What to Observe

### Feel Questions

- [ ] Do jabs feel snappy and responsive?
- [ ] Do push kicks feel heavy and impactful?
- [ ] Do hooks feel like they have lateral momentum?
- [ ] Is the knockback distance reasonable?
- [ ] Do dummies recover too fast or too slow?
- [ ] Is the attack cooldown too tight or too loose?

### Visual Clarity Questions

- [ ] Can you clearly see when you hit?
- [ ] Is the dummy feedback clear enough?
- [ ] Do you understand which attack type you performed?
- [ ] Is the particle effect helpful or distracting?

## Iteration Workflow

1. **Play for 2-3 minutes** - Get a feel for the current tuning
2. **Note what feels off** - Knockback too strong? Too weak? Feedback unclear?
3. **Open `game.js`** and adjust parameters (see TUNING section below)
4. **Reload page** - Changes apply immediately
5. **Test again** - Repeat until it feels good

## Tuning Parameters

Edit these numbers in `game.js` (search for the values):

### Player Movement

```javascript
this.player.speed = 8;              // Higher = faster movement
this.player.attackCooldown = 0.3;   // Seconds between attacks
```

### Knockback Forces

```javascript
// In performAttack() function:
knockbackForce = 4;     // Jab force
knockbackForce = 8;     // Push kick force
knockbackForce = 6;     // Hook force
```

### Dummy Physics

```javascript
dummy.knockbackDamping = 0.92;  // How quickly dummy stops sliding
                                // Higher (0.99) = slides longer
                                // Lower (0.80) = stops quickly
```

### Attack Cooldown Direction Thresholds

```javascript
// In performAttack(), these thresholds determine attack type:
if (dotProduct > 0.5)      // Towards = Jab
if (dotProduct < -0.5)     // Away = Push Kick
if (Math.abs(crossProduct) > 0.5)  // Left/Right = Hook
```

## Testing Checklist

- [ ] Can connect controller and see "Connected" on screen
- [ ] Can move player with left stick
- [ ] Each face button targets the correct dummy
- [ ] Attacks create visible knockback
- [ ] Different movement directions produce different attacks
- [ ] Dummies don't fly off screen
- [ ] No console errors (F12)

## Feedback Format

When testing, note:

```
Attack Type: [Jab/Push Kick/Hook]
Distance from dummy: [Close/Medium/Far]
Movement speed: [Slow/Normal/Fast]
Knockback feeling: [Too light / Just right / Too heavy]
Duration: [Too quick / Just right / Too long]
Visual clarity: [Can't see it / Clear / Over the top]
```

## Known Issues & Limitations

- **No dummy AI** - They just sit there until hit
- **No reset button** - Dummies stay where they land
- **Single knockback damping** - Same for all hits
- **No damage model** - Dummies don't "break" or show health
- **Controller required** - Keyboard can move but can't attack
- **Cooldown is global** - All attacks share one timer

These are intentional for v0.1. We can add them if needed.

---

**Remember**: This is about *feeling*. If something doesn't feel right, we change it. No compromise on feel.

Enjoy testing! 🎮
