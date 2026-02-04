// screenshot.js - Screenshot capture functionality

import { canvas, ctx, W, H } from './constants.js';
import { isKeyJustPressed, getGamepad } from './input.js';

let lastL1 = false;
let screenshotFlash = 0;

export function checkScreenshot() {
  let shouldCapture = false;
  
  if (isKeyJustPressed('p')) shouldCapture = true;
  
  const gp = getGamepad();
  const l1Pressed = gp?.buttons[4]?.pressed;
  if (gp && l1Pressed && !lastL1) {
    shouldCapture = true;
  }
  lastL1 = l1Pressed || false;
  
  if (shouldCapture) {
    screenshotFlash = 30;
    const image = canvas.toDataURL('image/png');
    fetch('/screenshot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image })
    }).then(r => r.json()).then(data => {
      console.log('Screenshot saved:', data.filename);
    }).catch(e => console.error('Screenshot failed:', e));
  }
}

export function drawScreenshotFlash() {
  if (screenshotFlash > 0) {
    ctx.fillStyle = `rgba(255, 255, 255, ${screenshotFlash / 30 * 0.5})`;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#00ff00';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('📸 SCREENSHOT SAVED', W/2, 50);
    screenshotFlash--;
  }
}
