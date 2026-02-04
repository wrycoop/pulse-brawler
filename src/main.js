// main.js - Game loop and initialization
// This file wires together all modules - no game logic here

import { ctx, CX, CY } from './constants.js';
import { tuning, loadTuning } from './tuning.js';
import { Fighter } from './fighter.js';
import { getMovementInput, getAttackInput, updateLastAttacks, clearJustPressed } from './input.js';
import { grapple, updateGrapple, drawGrappleTether, resetGrapple } from './grapple.js';
import { doAttack, updateAttackVisuals, drawAttackVisuals } from './strikes.js';
import { handleFighterCollisions } from './collision.js';
import { drawArena, drawHint } from './arena.js';
import { checkScreenshot, drawScreenshotFlash } from './screenshot.js';

// Game state
let player;
let dummies = [];

function init() {
  player = new Fighter(CX, CY + 100, '#00ff88', '');
  
  // 3 dummies arranged around center
  const r = 150;
  dummies = [
    new Fighter(CX, CY - r, '#ff6666', 'SQ'),
    new Fighter(CX - r * 0.87, CY + r * 0.5, '#6666ff', 'TRI'),
    new Fighter(CX + r * 0.87, CY + r * 0.5, '#ff66ff', 'O'),
  ];
}

function update() {
  const input = getMovementInput();
  const { pressed, held } = getAttackInput();
  
  // Grapple system
  const isGrappling = updateGrapple(player, dummies, input, held);
  
  // Attacks (if not holding for grapple)
  const holdThreshold = tuning.grapple?.holdFrames ?? 10;
  if (!isGrappling && grapple.holdFrames < holdThreshold) {
    if (pressed.sq) doAttack(player, dummies, 0);
    if (pressed.tri) doAttack(player, dummies, 1);
    if (pressed.cir) doAttack(player, dummies, 2);
  }
  
  updateLastAttacks(held);
  
  // Player movement
  if (!isGrappling) {
    player.update(input.x, input.y);
  }
  player.constrainToArena();
  
  // Dummies
  for (let i = 0; i < dummies.length; i++) {
    const d = dummies[i];
    
    if (grapple.active && grapple.victimIdx === i) {
      // Grapple controls position - zero velocity
      d.vx = 0;
      d.vy = 0;
    } else {
      d.update(0, 0);
    }
    
    if (d.isOut()) {
      console.log('RING OUT!');
      d.respawn();
      if (grapple.active && grapple.victimIdx === i) {
        resetGrapple();
      }
    }
  }
  
  // Collisions
  handleFighterCollisions([player, ...dummies]);
  
  // Attack visuals decay
  updateAttackVisuals();
  
  // Clear input state
  clearJustPressed();
}

function draw() {
  drawArena();
  
  // Dummies
  for (const d of dummies) d.draw(ctx);
  
  // Grapple tether
  drawGrappleTether(ctx, player, dummies);
  
  // Attack visuals
  drawAttackVisuals(ctx, player, dummies);
  
  // Player
  player.draw(ctx);
  
  // UI
  drawHint();
  drawScreenshotFlash();
}

function loop() {
  update();
  draw();
  checkScreenshot();
  requestAnimationFrame(loop);
}

// Start
loadTuning().then(() => {
  init();
  loop();
  setInterval(loadTuning, 2000);
});
