# Grapple System Design

## Initiation
- Hold target's button + in range → Grab
- Initial **yank** (step back + pull) to off-balance / jumpstart momentum

## Input Modes (based on velocity)

### Below Velocity Threshold (starting up)
- **Stick direction = movement direction**
- Back-left/right = pull, builds spin momentum
- Forward = push/walk them that direction (into hazard, off ledge)
- Forward-left/right = reorient, pull them into line with that direction
- Grappler drifts back slightly (shows weight)

### Above Velocity Threshold (spinning fast)
- **Stick rotation = maintain spin**
- Binary check: rotating same direction fast enough? 
  - YES = accelerate / maintain max
  - NO = decelerate
- When spin drops below threshold → return to directional mode
- Hold distance increases with velocity (centrifuge effect)

## Victim Options (if not stunned)
- **Stick input** = drag (slows momentum buildup, buys time)
- **Mash grappler's button** = try to break free
- **Velocity threshold** = too fast → can't resist until thrown/slowed
- **Other face buttons** = can attack 3rd parties while being swung

## Mash Out (Escape)
- Enough button presses within time window = disconnect
- **Mutual knockback, no advantage** — neutral reset
- No punishment to grappler (risk/reward preserved)

## Counter-Grapple
- Victim grabs back → both locked in yank battle
- Both can yank/counter-yank for momentum
- Either can **release + mash** to bail and try to escape
- No stalemate — someone commits or bails

## Throw (Release)
- **Release button** = throw
- **Stick direction at release** = throw aim
- Victim arcs to catch up to aim direction (follow-through animation)
- Small push if releasing from push/walk state

## Collisions
- **Throw into fighter** = both knocked + dizzy (billiards)
- **Swing over edge** = release and they fall (ring-out)
- **Swing into hazard** = hazard affects victim

## 3rd Party Interaction
- Grappler is thumb-committed (can't easily press other buttons)
- Victim CAN attack 3rd parties (hands free)
- Both can be hit by hazards / other players
- Grappler is vulnerable while committed

## Limits
- No time limit (for now — discover problems before solving)
- Grapple ends via: release, escape, ring-out, or external hit

## Tunables (to discover)
- Grapple initiation range
- Hold distance (min/max based on velocity)
- Velocity threshold for mode switch
- Stick rotation speed threshold
- Mash window / presses required
- Momentum decay rate
- Yank initial momentum
- Throw force
- Drag from victim resistance
