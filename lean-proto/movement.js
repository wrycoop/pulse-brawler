// movement.js - Movement input processing
// Converts stick input to lean target

class MovementInput {
  constructor() {
    this.rawX = 0;
    this.rawY = 0;
    this.processedX = 0;
    this.processedY = 0;
  }

  // Update with raw input (-1 to 1 on each axis)
  update(rawX, rawY, tuning) {
    const { stickDeadzone, stickCurve } = tuning;

    this.rawX = rawX;
    this.rawY = rawY;

    // Calculate magnitude
    let mag = Math.sqrt(rawX * rawX + rawY * rawY);

    // Apply deadzone
    if (mag < stickDeadzone) {
      this.processedX = 0;
      this.processedY = 0;
      return;
    }

    // Normalize direction
    const dirX = rawX / mag;
    const dirY = rawY / mag;

    // Remap magnitude from deadzone-1 to 0-1
    mag = (mag - stickDeadzone) / (1 - stickDeadzone);
    mag = Math.min(mag, 1); // Clamp

    // Apply response curve (power function)
    mag = Math.pow(mag, stickCurve);

    // Output processed input
    this.processedX = dirX * mag;
    this.processedY = dirY * mag;
  }

  // Get processed input vector
  getInput() {
    return { x: this.processedX, y: this.processedY };
  }

  // Check if there's meaningful input
  hasInput() {
    return Math.abs(this.processedX) > 0.001 || Math.abs(this.processedY) > 0.001;
  }
}

// Export for use in game.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MovementInput };
}
