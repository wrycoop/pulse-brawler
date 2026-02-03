// Lean Movement Prototype - Clean rebuild
// One fighter, lean-driven movement, simple canvas

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;
const CX = W / 2;
const CY = H / 2;

// Tuning - read from UI
function getTuning() {
  return {
    lean: {
      maxLean: parseFloat(document.getElementById('t_maxLean').value) || 20,
      leanResponse: parseFloat(document.getElementById('t_leanResponse').value) || 0.15,
      pullStrength: parseFloat(document.getElementById('t_pullStrength').value) || 0.5,
      baseDamping: parseFloat(document.getElementById('t_baseDamping').value) || 0.85
    },
    movement: {
      stickDeadzone: parseFloat(document.getElementById('t_stickDeadzone').value) || 0.1,
      stickCurve: parseFloat(document.getElementById('t_stickCurve').value) || 1.5
    }
  };
}

// Fighter class - lean-driven movement
class Fighter {
  constructor(x, y, color) {
    // Base (feet) position
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    
    // Visual
    this.baseRadius = 25;
    this.upperRadius = 15;
    this.color = color;
    
    // Lean model
    this.lean = new LeanModel();
    
    // Movement input
    this.movement = new MovementInput();
    
    // Attack state
    this.attackTimer = 0;
  }
  
  update(inputX, inputY, tuning) {
    // Process input
    this.movement.update(inputX, inputY, tuning.movement);
    const processed = this.movement.getInput();
    
    // Set lean target from input
    this.lean.setTarget(processed.x, processed.y, tuning.lean.maxLean);
    
    // Update lean physics, get force
    const force = this.lean.update(tuning.lean);
    
    // Apply force to velocity
    this.vx += force.x;
    this.vy += force.y;
    
    // Apply damping
    this.vx *= tuning.lean.baseDamping;
    this.vy *= tuning.lean.baseDamping;
    
    // Update position
    this.x += this.vx;
    this.y += this.vy;
    
    // Update attack timer
    if (this.attackTimer > 0) this.attackTimer--;
  }
  
  // Apply external force (hit, throw, etc.)
  applyForce(fx, fy) {
    this.vx += fx;
    this.vy += fy;
  }
  
  // Keep inside arena
  constrainToArena(arenaRadius) {
    const dx = this.x - CX;
    const dy = this.y - CY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxDist = arenaRadius - this.baseRadius;
    
    if (dist > maxDist && dist > 0) {
      // Push back inside
      const nx = dx / dist;
      const ny = dy / dist;
      this.x = CX + nx * maxDist;
      this.y = CY + ny * maxDist;
      
      // Kill outward velocity
      const dot = this.vx * nx + this.vy * ny;
      if (dot > 0) {
        this.vx -= nx * dot;
        this.vy -= ny * dot;
      }
    }
  }
  
  // Check ring-out
  isOut(arenaRadius) {
    const dx = this.x - CX;
    const dy = this.y - CY;
    return Math.sqrt(dx * dx + dy * dy) > arenaRadius;
  }
  
  draw(ctx) {
    const offset = this.lean.getOffset();
    
    // Upper body position
    const upperX = this.x + offset.x;
    const upperY = this.y + offset.y;
    
    // Color (flash during attack)
    let color = this.color;
    if (this.attackTimer > 0) {
      color = '#ffaa00';
    }
    
    // Connection line
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(upperX, upperY);
    ctx.stroke();
    
    // Base circle (larger, darker)
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.baseRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Upper body (smaller, brighter)
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(upperX, upperY, this.upperRadius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.globalAlpha = 1;
  }
}

// Dummy (target to hit)
class Dummy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.radius = 25;
    this.hitFlash = 0;
  }
  
  update() {
    // Apply velocity
    this.x += this.vx;
    this.y += this.vy;
    
    // Damping
    this.vx *= 0.92;
    this.vy *= 0.92;
    
    // Decay flash
    if (this.hitFlash > 0) this.hitFlash--;
  }
  
  applyKnockback(dx, dy, force) {
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    this.vx += (dx / dist) * force;
    this.vy += (dy / dist) * force;
    this.hitFlash = 10;
  }
  
  isOut(arenaRadius) {
    const dx = this.x - CX;
    const dy = this.y - CY;
    return Math.sqrt(dx * dx + dy * dy) > arenaRadius;
  }
  
  respawn() {
    this.x = CX;
    this.y = CY - 150;
    this.vx = 0;
    this.vy = 0;
  }
  
  draw(ctx) {
    ctx.fillStyle = this.hitFlash > 0 ? '#ffffff' : '#ff6666';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Label
    ctx.fillStyle = '#000';
    ctx.font = '20px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('□', this.x, this.y);
  }
}

// Input state
const keys = {};
window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

function getInput() {
  let x = 0, y = 0;
  let attack = false;
  
  // Keyboard
  if (keys['w'] || keys['arrowup']) y -= 1;
  if (keys['s'] || keys['arrowdown']) y += 1;
  if (keys['a'] || keys['arrowleft']) x -= 1;
  if (keys['d'] || keys['arrowright']) x += 1;
  if (keys[' ']) attack = true;
  
  // Normalize
  const mag = Math.sqrt(x * x + y * y);
  if (mag > 1) { x /= mag; y /= mag; }
  
  // Gamepad
  const gp = navigator.getGamepads()[0];
  if (gp) {
    const gpX = gp.axes[0] || 0;
    const gpY = gp.axes[1] || 0;
    if (Math.abs(gpX) > 0.1 || Math.abs(gpY) > 0.1) {
      x = gpX;
      y = gpY;
    }
    if (gp.buttons[0]?.pressed) attack = true;
  }
  
  return { x, y, attack };
}

// Game state
const ARENA_RADIUS = 350;
let player, dummy;
let lastAttack = false;

function init() {
  player = new Fighter(CX, CY + 100, '#00ff88');
  dummy = new Dummy(CX, CY - 150);
}

function update() {
  const tuning = getTuning();
  const input = getInput();
  
  // Update player
  player.update(input.x, input.y, tuning);
  player.constrainToArena(ARENA_RADIUS);
  
  // Attack (on press, not hold)
  if (input.attack && !lastAttack && player.attackTimer <= 0) {
    player.attackTimer = 15; // 15 frames attack duration
    
    // Check hit
    const dx = dummy.x - player.x;
    const dy = dummy.y - player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist < 100) { // Hit range
      dummy.applyKnockback(dx, dy, 15);
      console.log('HIT!');
    } else {
      console.log('WHIFF');
    }
  }
  lastAttack = input.attack;
  
  // Update dummy
  dummy.update();
  if (dummy.isOut(ARENA_RADIUS)) {
    console.log('RING OUT!');
    dummy.respawn();
  }
}

function draw() {
  // Clear
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, W, H);
  
  // Arena
  ctx.strokeStyle = '#4a4a6a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(CX, CY, ARENA_RADIUS, 0, Math.PI * 2);
  ctx.stroke();
  
  // Dummy
  dummy.draw(ctx);
  
  // Player
  player.draw(ctx);
  
  // Attack range indicator when attacking
  if (player.attackTimer > 0) {
    ctx.strokeStyle = 'rgba(255,170,0,0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 100, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

init();
loop();
