# tileui

[![CI](https://github.com/yuske-nakajima/tileui/actions/workflows/ci.yml/badge.svg)](https://github.com/yuske-nakajima/tileui/actions/workflows/ci.yml)

[Demo](https://tileui.yuske.app)

> A grid-tile GUI panel library with SVG rotary knobs

<!-- TODO: Add screenshot -->

## Features

- Square tile layout powered by CSS Grid
- Intuitive numeric control with SVG rotary knobs (270° range)
- Zero dependencies, lightweight
- Theme customization via CSS variables
- Simple API inspired by lil-gui / dat.gui
- ESM / UMD dual output with TypeScript definitions

## Install

```bash
npm install @yuske-nakajima/tileui
```

### CDN

```html
<!-- UMD -->
<script src="https://unpkg.com/@yuske-nakajima/tileui"></script>
<script>
  const gui = new TileUI();
</script>

<!-- ESM -->
<script type="module">
  import TileUI from 'https://cdn.jsdelivr.net/npm/@yuske-nakajima/tileui/dist/tileui.js';
</script>
```

## Quick Start

```ts
import TileUI from '@yuske-nakajima/tileui';

const params = { speed: 0.5, volume: 80, color: '#ff0000', enabled: true };

const gui = new TileUI({ title: 'Controls' });

// Number (knob): specify min, max, step
gui.add(params, 'speed', 0, 1, 0.01).onChange((v) => console.log('speed:', v));

// Number (input field): no min/max
gui.add(params, 'volume');

// Color picker
gui.addColor(params, 'color');

// Toggle switch
gui.addBoolean(params, 'enabled');

// Button
gui.addButton('Reset', () => console.log('reset!'));

// Folder (sub-grid)
const folder = gui.addFolder('Advanced');
folder.add(params, 'speed', 0, 1, 0.01);
```

## API Reference

### `new TileUI(options?)`

Creates a GUI panel.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `container` | `HTMLElement` | `document.body` | Container element |
| `columns` | `number` | auto-fill | Number of grid columns |
| `title` | `string` | — | Panel title |

### `gui.add(obj, prop, min?, max?, step?)`

Adds a numeric controller. Renders as an SVG knob when `min`/`max` are provided, otherwise as a number input field.

### `gui.addBoolean(obj, prop)`

Adds a toggle switch.

### `gui.addColor(obj, prop)`

Adds a color picker.

### `gui.addButton(label, callback)`

Adds a clickable button tile.

### `gui.addFolder(title)`

Adds a sub-grid (folder). Returns a new `TileUI` instance.

### `gui.updateDisplay()`

Syncs all controller displays with current object values.

### `gui.dispose()`

Cleans up all controllers and DOM elements.

### `controller.onChange(callback)`

Sets a callback for value changes. Supports method chaining.

```ts
gui.add(params, 'speed', 0, 1).onChange((v) => {
  // v: number
});
```

## Theme Customization

Override CSS variables to customize the panel appearance.

```css
:root {
  --tileui-tile-size: 120px;
  --tileui-bg: #1a1a2e;
  --tileui-tile-bg: #16213e;
  --tileui-tile-bg-hover: #1c2a4a;
  --tileui-border: #0f3460;
  --tileui-text: #e0e0e0;
  --tileui-text-muted: #8a8a9a;
  --tileui-accent: #0ea5e9;
  --tileui-knob-track: #2a2a4a;
  --tileui-knob-value: var(--tileui-accent);
  --tileui-knob-thumb: #ffffff;
  --tileui-toggle-off: #3a3a5a;
  --tileui-toggle-on: var(--tileui-accent);
  --tileui-radius: 4px;
  --tileui-font-size: 11px;
  --tileui-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
```

## License

[MIT](./LICENSE)

[日本語](./README.md)
