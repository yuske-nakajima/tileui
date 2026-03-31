# tileui

[![CI](https://github.com/yuske-nakajima/tileui/actions/workflows/ci.yml/badge.svg)](https://github.com/yuske-nakajima/tileui/actions/workflows/ci.yml)

A grid-tile GUI panel with SVG rotary knobs for creative coding.

## Install

```bash
npm install tileui
```

## Usage

```ts
import TileUI from 'tileui';

const params = { speed: 0.5, color: '#ff0000', enabled: true };

const gui = new TileUI({ title: 'Controls' });
gui.add(params, 'speed', 0, 1, 0.01);
gui.addColor(params, 'color');
gui.addBoolean(params, 'enabled');
```

## License

MIT
