// collision.js - Fighter collision handling

import { tuning } from './tuning.js';

export function handleFighterCollisions(allFighters) {
  for (let i = 0; i < allFighters.length; i++) {
    for (let j = i + 1; j < allFighters.length; j++) {
      const a = allFighters[i];
      const b = allFighters[j];
      
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const minDist = a.baseRadius + b.baseRadius;
      
      if (dist < minDist && dist > 0) {
        // Push apart
        const overlap = minDist - dist;
        const nx = dx / dist;
        const ny = dy / dist;
        
        a.x -= nx * overlap * 0.5;
        a.y -= ny * overlap * 0.5;
        b.x += nx * overlap * 0.5;
        b.y += ny * overlap * 0.5;
        
        // Bounce velocities
        const relVel = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
        if (relVel > 0) {
          a.vx -= nx * relVel * 0.5;
          a.vy -= ny * relVel * 0.5;
          b.vx += nx * relVel * 0.5;
          b.vy += ny * relVel * 0.5;
          
          // Collision causes lean destabilization
          const collisionLean = (tuning.collision?.leanForce ?? 50) / 20;
          const leanImpact = relVel * collisionLean;
          a.applyLeanForce(-nx * leanImpact, -ny * leanImpact);
          b.applyLeanForce(nx * leanImpact, ny * leanImpact);
        }
      }
    }
  }
}
