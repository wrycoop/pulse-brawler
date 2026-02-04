// input.js - Keyboard and gamepad input handling

const keys = {};
const keysJustPressed = {};
let lastAttacks = { tri: false, sq: false, cir: false };

// Set up listeners
window.addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  if (!keys[k]) keysJustPressed[k] = true;
  keys[k] = true;
});
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

export function getMovementInput() {
  let x = 0, y = 0;
  
  if (keys['w'] || keys['arrowup']) y -= 1;
  if (keys['s'] || keys['arrowdown']) y += 1;
  if (keys['a'] || keys['arrowleft']) x -= 1;
  if (keys['d'] || keys['arrowright']) x += 1;
  
  const mag = Math.sqrt(x * x + y * y);
  if (mag > 1) { x /= mag; y /= mag; }
  
  const gp = navigator.getGamepads()[0];
  if (gp) {
    const gpX = gp.axes[0] || 0;
    const gpY = gp.axes[1] || 0;
    if (Math.abs(gpX) > 0.05 || Math.abs(gpY) > 0.05) {
      x = gpX;
      y = gpY;
    }
  }
  
  return { x, y };
}

export function getAttackInput() {
  const pressed = { tri: false, sq: false, cir: false };
  const held = { tri: false, sq: false, cir: false };
  
  // Keyboard: I = □, J = △, L = ○
  if (keysJustPressed['i']) pressed.sq = true;
  if (keysJustPressed['j']) pressed.tri = true;
  if (keysJustPressed['l']) pressed.cir = true;
  
  if (keys['i']) held.sq = true;
  if (keys['j']) held.tri = true;
  if (keys['l']) held.cir = true;
  
  // Gamepad: PS layout 0=X, 1=O, 2=□, 3=△
  const gp = navigator.getGamepads()[0];
  if (gp) {
    if (gp.buttons[2]?.pressed) { held.sq = true; if (!lastAttacks.sq) pressed.sq = true; }
    if (gp.buttons[3]?.pressed) { held.tri = true; if (!lastAttacks.tri) pressed.tri = true; }
    if (gp.buttons[1]?.pressed) { held.cir = true; if (!lastAttacks.cir) pressed.cir = true; }
  }
  
  return { pressed, held };
}

export function updateLastAttacks(held) {
  lastAttacks = { sq: held.sq, tri: held.tri, cir: held.cir };
}

export function clearJustPressed() {
  for (const k in keysJustPressed) delete keysJustPressed[k];
}

export function isKeyJustPressed(key) {
  return keysJustPressed[key.toLowerCase()];
}

export function getGamepad() {
  return navigator.getGamepads()[0];
}
