// Pluggable Grapple Physics Systems
// Switch between systems via tuning.grapple.grappleSystem

const GrappleSystems = {
  
  // ============================================
  // PLAYER CENTERED - Original implementation
  // Victim orbits around fixed player position
  // ============================================
  playerCentered: {
    name: 'Player Centered',
    description: 'Victim orbits around fixed player position (player can move)',
    
    init(player, victim) {
      const dx = victim.position.x - player.position.x;
      const dy = victim.position.y - player.position.y;
      player.grappleAngle = Math.atan2(dy, dx);
      player.grappleAngularVel = 0;
      player.lastStickAngle = null;
      player.wasInSpinState = false;
      player.spinRotations = 0;
    },
    
    update(dt, player, victim, input, tuning) {
      const g = tuning.grapple || {};
      const angularAccel = g.angularAccel ?? 8;
      const angularDrag = g.angularDrag ?? 2;
      const velocityThreshold = g.velocityThreshold ?? 4;
      const grappleMoveSpeed = g.grappleMoveSpeed ?? 0.3;
      
      const absVel = Math.abs(player.grappleAngularVel);
      const aboveThreshold = absVel >= velocityThreshold;
      
      const stickX = input.leftStick.x;
      const stickY = input.leftStick.y;
      const stickMag = Math.sqrt(stickX * stickX + stickY * stickY);
      
      const toVictimX = Math.cos(player.grappleAngle);
      const toVictimY = Math.sin(player.grappleAngle);
      const stickDotVictim = stickX * toVictimX + stickY * toVictimY;
      const awayness = Math.max(0, -stickDotVictim);
      
      let playerPos = player.position.clone();
      let victimPos = victim.position.clone();
      
      if (aboveThreshold) {
        // Spin state - player drifts back
        const backDrift = g.backDrift ?? 0.5;
        const backDriftAngle = (g.backDriftAngle ?? 90) * (Math.PI / 180);
        const baseAwayAngle = player.grappleAngle + Math.PI;
        const spinSign = Math.sign(player.grappleAngularVel);
        const driftAngle = baseAwayAngle + spinSign * backDriftAngle;
        
        playerPos.x += Math.cos(driftAngle) * backDrift * 2;
        playerPos.y += Math.sin(driftAngle) * backDrift * 2;
        
        // Stick rotation maintains/accelerates spin
        if (stickMag > 0.3) {
          const stickAngle = Math.atan2(stickY, stickX);
          if (player.lastStickAngle !== null) {
            let angleDelta = stickAngle - player.lastStickAngle;
            while (angleDelta > Math.PI) angleDelta -= 2 * Math.PI;
            while (angleDelta < -Math.PI) angleDelta += 2 * Math.PI;
            const spinDir = Math.sign(player.grappleAngularVel);
            const rotDir = Math.sign(angleDelta);
            if (rotDir === spinDir && Math.abs(angleDelta) > 0.05) {
              player.grappleAngularVel += spinDir * angularAccel * 0.5 * dt;
            }
          }
          player.lastStickAngle = stickAngle;
        } else {
          player.lastStickAngle = null;
        }
      } else if (stickMag > 0.3) {
        // Below threshold - direct movement + rotation building
        playerPos.x += stickX * grappleMoveSpeed * 60 * dt;
        playerPos.y += stickY * grappleMoveSpeed * 60 * dt;
        
        // Passive drift from lateral movement
        const lateralMovement = stickX * (-toVictimY) + stickY * toVictimX;
        const passiveDrift = g.passiveDrift ?? 1;
        const driftFriction = g.driftFriction ?? 0.8;
        const driftForce = -lateralMovement * passiveDrift * 0.05;
        const maxDrift = (1 - driftFriction) * 0.2;
        const clampedDrift = Math.max(-maxDrift, Math.min(maxDrift, driftForce));
        player.grappleAngle += clampedDrift;
        
        // Rotation from cross product
        const cross = -(Math.cos(player.grappleAngle) * stickY - Math.sin(player.grappleAngle) * stickX);
        const forwardDeadZone = g.forwardDeadZone ?? 0.85;
        const backDeadZone = g.backDeadZone ?? 0.85;
        const inDeadZone = stickDotVictim > forwardDeadZone || stickDotVictim < -backDeadZone;
        
        const baseMultiplier = 0.3;
        const awayBonus = 0.7 * awayness;
        const rotationForce = inDeadZone ? 0 : cross * (baseMultiplier + awayBonus) * angularAccel * 0.1;
        player.grappleAngularVel += rotationForce;
        player.lastStickAngle = null;
      } else {
        player.lastStickAngle = null;
      }
      
      // Apply drag
      const effectiveDrag = aboveThreshold ? angularDrag * 0.1 : angularDrag;
      player.grappleAngularVel *= (1 - effectiveDrag * dt);
      
      // Update angle
      const prevAngle = player.grappleAngle;
      player.grappleAngle += player.grappleAngularVel * dt;
      
      // Track spin rotations
      let spinTimeout = false;
      if (aboveThreshold) {
        if (!player.wasInSpinState) {
          player.spinRotations = 0;
          player.wasInSpinState = true;
        }
        player.spinRotations += Math.abs(player.grappleAngle - prevAngle) / (2 * Math.PI);
        const maxSpins = g.maxSpins ?? 3;
        if (player.spinRotations >= maxSpins) {
          spinTimeout = true;
        }
      } else {
        player.wasInSpinState = false;
      }
      
      // Calculate hold distance (centrifuge effect)
      const currentAbsVel = Math.abs(player.grappleAngularVel);
      const minDist = g.holdDistanceMin ?? 50;
      const maxDist = g.holdDistanceMax ?? 120;
      const velFactor = Math.min(1, currentAbsVel / velocityThreshold);
      const holdDist = minDist + (maxDist - minDist) * velFactor;
      
      // Position victim
      victimPos.x = playerPos.x + Math.cos(player.grappleAngle) * holdDist;
      victimPos.y = playerPos.y + Math.sin(player.grappleAngle) * holdDist;
      
      return { playerPos, victimPos, angularVelocity: player.grappleAngularVel, spinTimeout, aboveThreshold };
    },
    
    release(player, victim, tuning) {
      const g = tuning.grapple || {};
      const throwForce = g.throwForce ?? 1000;
      const velocityThreshold = g.velocityThreshold ?? 4;
      const absVel = Math.abs(player.grappleAngularVel);
      
      const tangentX = -Math.sin(player.grappleAngle) * Math.sign(player.grappleAngularVel);
      const tangentY = Math.cos(player.grappleAngle) * Math.sign(player.grappleAngularVel);
      const spinBonus = Math.min(absVel / velocityThreshold, 2);
      
      return {
        victimVelocity: new Vec2(
          tangentX * throwForce * (0.5 + spinBonus * 0.5),
          tangentY * throwForce * (0.5 + spinBonus * 0.5)
        )
      };
    }
  },
  
  // ============================================
  // SHARED FULCRUM - Hammer Toss Physics
  // Both spin around center of mass between them
  // ============================================
  sharedFulcrum: {
    name: 'Shared Fulcrum (Hammer Toss)',
    description: 'Both spin around center of mass - player leans back to counterbalance',
    
    init(player, victim) {
      const dx = victim.position.x - player.position.x;
      const dy = victim.position.y - player.position.y;
      player.grappleAngle = Math.atan2(dy, dx);
      player.grappleAngularVel = 0;
      player.lastStickAngle = null;
      player.wasInSpinState = false;
      player.spinRotations = 0;
      // Fulcrum position as ratio along player->victim line (0=player, 1=victim)
      player.fulcrumRatio = 0.3; // Starts closer to player
    },
    
    update(dt, player, victim, input, tuning) {
      const g = tuning.grapple || {};
      const angularAccel = g.angularAccel ?? 8;
      const angularDrag = g.angularDrag ?? 2;
      const velocityThreshold = g.velocityThreshold ?? 4;
      const massRatio = g.sharedMassRatio ?? 0.5; // 0.5 = equal mass
      
      const absVel = Math.abs(player.grappleAngularVel);
      const aboveThreshold = absVel >= velocityThreshold;
      
      const stickX = input.leftStick.x;
      const stickY = input.leftStick.y;
      const stickMag = Math.sqrt(stickX * stickX + stickY * stickY);
      
      // Calculate current distance
      const minDist = g.holdDistanceMin ?? 50;
      const maxDist = g.holdDistanceMax ?? 120;
      const velFactor = Math.min(1, absVel / velocityThreshold);
      const totalDist = minDist + (maxDist - minDist) * velFactor;
      
      // Fulcrum shifts toward player as spin increases (player "leans back")
      // At rest: fulcrum at massRatio (e.g., 0.5 = middle)
      // At max spin: fulcrum closer to player (e.g., 0.2)
      const restFulcrum = massRatio;
      const spinFulcrum = massRatio * 0.4; // Shifts toward player under load
      player.fulcrumRatio = restFulcrum - (restFulcrum - spinFulcrum) * velFactor;
      
      // Input handling
      const toVictimX = Math.cos(player.grappleAngle);
      const toVictimY = Math.sin(player.grappleAngle);
      const stickDotVictim = stickX * toVictimX + stickY * toVictimY;
      const awayness = Math.max(0, -stickDotVictim);
      
      if (aboveThreshold) {
        // Spin state - stick rotation maintains/accelerates
        if (stickMag > 0.3) {
          const stickAngle = Math.atan2(stickY, stickX);
          if (player.lastStickAngle !== null) {
            let angleDelta = stickAngle - player.lastStickAngle;
            while (angleDelta > Math.PI) angleDelta -= 2 * Math.PI;
            while (angleDelta < -Math.PI) angleDelta += 2 * Math.PI;
            const spinDir = Math.sign(player.grappleAngularVel);
            const rotDir = Math.sign(angleDelta);
            if (rotDir === spinDir && Math.abs(angleDelta) > 0.05) {
              player.grappleAngularVel += spinDir * angularAccel * 0.5 * dt;
            }
          }
          player.lastStickAngle = stickAngle;
        } else {
          player.lastStickAngle = null;
        }
      } else if (stickMag > 0.3) {
        // Building spin - pull back to accelerate
        const cross = -(Math.cos(player.grappleAngle) * stickY - Math.sin(player.grappleAngle) * stickX);
        const forwardDeadZone = g.forwardDeadZone ?? 0.85;
        const backDeadZone = g.backDeadZone ?? 0.85;
        const inDeadZone = stickDotVictim > forwardDeadZone || stickDotVictim < -backDeadZone;
        
        // Stronger acceleration when pulling away
        const baseMultiplier = 0.3;
        const awayBonus = 1.0 * awayness; // More responsive to pulling
        const rotationForce = inDeadZone ? 0 : cross * (baseMultiplier + awayBonus) * angularAccel * 0.15;
        player.grappleAngularVel += rotationForce;
        player.lastStickAngle = null;
      } else {
        player.lastStickAngle = null;
      }
      
      // Apply drag (less drag when spinning fast)
      const effectiveDrag = aboveThreshold ? angularDrag * 0.1 : angularDrag;
      player.grappleAngularVel *= (1 - effectiveDrag * dt);
      
      // Update angle
      const prevAngle = player.grappleAngle;
      player.grappleAngle += player.grappleAngularVel * dt;
      
      // Track spin rotations
      let spinTimeout = false;
      if (aboveThreshold) {
        if (!player.wasInSpinState) {
          player.spinRotations = 0;
          player.wasInSpinState = true;
        }
        player.spinRotations += Math.abs(player.grappleAngle - prevAngle) / (2 * Math.PI);
        const maxSpins = g.maxSpins ?? 3;
        if (player.spinRotations >= maxSpins) {
          spinTimeout = true;
        }
      } else {
        player.wasInSpinState = false;
      }
      
      // Calculate positions around shared fulcrum
      // Fulcrum is the center of rotation
      const midX = (player.position.x + victim.position.x) / 2;
      const midY = (player.position.y + victim.position.y) / 2;
      
      // Player distance from fulcrum (shorter = leaning back less)
      const playerDist = totalDist * player.fulcrumRatio;
      // Victim distance from fulcrum
      const victimDist = totalDist * (1 - player.fulcrumRatio);
      
      // Position both around the fulcrum
      // Player is opposite to grapple angle
      const playerPos = new Vec2(
        midX - Math.cos(player.grappleAngle) * playerDist,
        midY - Math.sin(player.grappleAngle) * playerDist
      );
      
      // Victim is along grapple angle
      const victimPos = new Vec2(
        midX + Math.cos(player.grappleAngle) * victimDist,
        midY + Math.sin(player.grappleAngle) * victimDist
      );
      
      return { playerPos, victimPos, angularVelocity: player.grappleAngularVel, spinTimeout, aboveThreshold };
    },
    
    release(player, victim, tuning) {
      const g = tuning.grapple || {};
      const throwForce = g.throwForce ?? 1000;
      const velocityThreshold = g.velocityThreshold ?? 4;
      const absVel = Math.abs(player.grappleAngularVel);
      
      // Tangent direction for throw
      const tangentX = -Math.sin(player.grappleAngle) * Math.sign(player.grappleAngularVel);
      const tangentY = Math.cos(player.grappleAngle) * Math.sign(player.grappleAngularVel);
      const spinBonus = Math.min(absVel / velocityThreshold, 2);
      
      return {
        victimVelocity: new Vec2(
          tangentX * throwForce * (0.5 + spinBonus * 0.5),
          tangentY * throwForce * (0.5 + spinBonus * 0.5)
        )
      };
    }
  }
};
