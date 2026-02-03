# Brawler Design Notes
*Johnny's reference doc — Tim has this in his head already*

## Core Philosophy
- **"True" game** — state-based, consistent, no fudge factors
- If you hit, you hit full. No hidden damage reduction.
- Readable, learnable, no SF6-style liberties

## Controls (4-player, one button per player)
```
Player 1 = □    Player 2 = △
Player 3 = ○    Player 4 = ✕
```

### Your Button (Defense)
- **Hold** = Block
- **Tap/Release** = Parry (trigger on release = deliberate timing)

### Their Button (Offense)
- **Tap** = Attack (stick direction → jab/hook/kick)
- **Hold** = Grapple initiate

## Attack Outcomes (best to worst for attacker)
1. **Punish Counter** — hit during their attack, guaranteed combo, dizzy
2. **Normal Hit** — advantage, possible follow-up
3. **Blocked** — contested, slight attacker advantage (blocking is passive)
4. **Parried** — defender gets free punish (attacker stunned 0.5s)
5. **Whiff** — defender gets big punish (full recovery, no cancel)

## Block vs Parry vs Dodge
- **Block** = passive, slight disadvantage, loses to grapple + push kick
- **Parry** = hard timing, big reward (free counter)
- **Dodge** = escape pressure, reset to neutral, punishable if read (TBD: invincible or just fast?)

## Push Kick vs Grapple (both beat block)
| | Push Kick | Grapple |
|---|-----------|---------|
| Direction | Away only | Your choice |
| Outcome | Fixed knockback | Throw toward hazard/player/edge |
| Commitment | Lower | Higher |
| If countered | N/A | Counter-grapple ("eagle fuck") |

## Counter-Grapple (both grab each other)
- Dangerous for both (not a safe release)
- Options: both take damage, spiral toward hazard, mash-off, double ring out near edge

## What Beats What
- Grapple beats Block
- Push kick beats Block  
- Parry beats Attack
- Attack beats Grapple startup?
- Dodge beats continued pressure

## Tuning Philosophy
- Tune by feel with real animations, not theoretical
- Add params when hitting a wall, not preemptively
- Keep it simple until complexity is needed
