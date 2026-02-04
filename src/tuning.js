// tuning.js - Tuning state loaded from Google Sheet

export let tuning = {
  lean: { maxLean: 20, leanSpeed: 50, moveForce: 50, friction: 50 },
  movement: { deadzone: 10, curve: 15 },
  attack: { range: 80, force: 50, leanForce: 30 },
  arena: { radius: 350 },
  grapple: { range: 80, holdFrames: 10, tetherLength: 60, spinForce: 50, spinDrag: 50, throwForce: 50 }
};

export async function loadTuning() {
  try {
    const res = await fetch('/tuning.json?' + Date.now());
    tuning = await res.json();
  } catch (e) {
    console.warn('Using default tuning');
  }
}
