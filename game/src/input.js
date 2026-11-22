// Keyboard + mouse input for Night Vault.
export function createInput(canvas) {
  const keys = new Set();
  const mouse = { x: 0, y: 0, clicked: false, clickX: 0, clickY: 0 };
  const pressed = new Set();

  function keyOf(e) {
    return e.key.toLowerCase();
  }

  window.addEventListener('keydown', (e) => {
    const k = keyOf(e);
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
      e.preventDefault();
    }
    if (!e.repeat) pressed.add(k);
    keys.add(k);
  });
  window.addEventListener('keyup', (e) => keys.delete(keyOf(e)));
  window.addEventListener('blur', () => keys.clear());

  canvas.addEventListener('mousemove', (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = (e.clientX - r.left) * (canvas.width / r.width);
    mouse.y = (e.clientY - r.top) * (canvas.height / r.height);
  });
  canvas.addEventListener('click', (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.clicked = true;
    mouse.clickX = (e.clientX - r.left) * (canvas.width / r.width);
    mouse.clickY = (e.clientY - r.top) * (canvas.height / r.height);
  });

  return {
    keys,
    mouse,
    // True once per physical key press; consumed by the caller each frame.
    wasPressed(k) {
      return pressed.has(k.toLowerCase());
    },
    endFrame() {
      pressed.clear();
      mouse.clicked = false;
    },
  };
}
