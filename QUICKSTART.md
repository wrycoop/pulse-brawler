# ⚡ QUICKSTART - Brawler Proto

## 30 Seconds to Playing

```bash
cd /Users/johnny/.openclaw/workspace/brawler-proto
node server.js
```

Then:
1. Open http://localhost:3000 in Chrome/Firefox
2. Connect a PS4 or PS5 controller
3. Move with **Left Stick**
4. Press **Square/Triangle/Circle** buttons to attack

Done. You're playing.

---

## Controller Not Working?

- Make sure the controller is **paired to your computer** (not just plugged in)
- Open browser **console** (F12) - look for "Gamepad connected" message
- Try Firefox if Chrome doesn't work

## Want to Tweak Feel?

1. Open `game.js` in your editor
2. Search for one of these:
   - `this.player.speed = 8` (faster/slower movement)
   - `knockbackForce = 4` (stronger/weaker hits)
   - `attackCooldown = 0.3` (faster/slower attack rate)
3. Change the number
4. Reload the browser (Cmd+R)
5. Test immediately

---

## What the Game Does

- ✅ Player in arena, 3 dummies to punch
- ✅ Movement direction + button = different attacks
- ✅ Dummies get knocked around
- ✅ Real-time feedback (flashes, particles, knockback)
- ✅ Fully playable prototype

## What It Doesn't Do Yet

- ❌ No combos
- ❌ No AI
- ❌ No blocking
- ❌ No damage/health
- ❌ Dummies don't reset automatically

---

## Next: Test & Iterate

Play for 5 minutes. Tell me:
1. Does the knockback feel right?
2. Can you clearly see when you hit?
3. Does movement feel responsive?
4. What would make it feel better?

Everything is tunable. Let's make it feel amazing.

---

**Server is already running at http://localhost:3000**

Go play. 🎮
