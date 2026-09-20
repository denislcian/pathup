/**
 * Draws PathUp's placeholder app icon: the rising lime path on the dark background.
 * Pure Node (zlib + a small PNG writer) so it needs no image dependencies.
 *
 *   node scripts/generate-icons.mjs
 *
 * Replace these files once the real icon is generated with AI (see docs/05-imagenes-y-video-ia.md).
 */
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BG = [0x0e, 0x11, 0x16];
const ACCENT = [0x4c, 0xc3, 0x8a];

/** Normalised polyline of the logo: a path climbing to the right. */
const PATH = [
  [0.16, 0.74],
  [0.42, 0.58],
  [0.58, 0.62],
  [0.8, 0.3],
];
const STROKE = 0.085;
const ARROW = { tip: [0.87, 0.2], size: 0.2 };

function distanceToSegment(px, py, [ax, ay], [bx, by]) {
  const dx = bx - ax;
  const dy = by - ay;
  const lengthSquared = dx * dx + dy * dy;
  const t =
    lengthSquared === 0
      ? 0
      : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lengthSquared));
  const cx = ax + t * dx;
  const cy = ay + t * dy;
  return Math.hypot(px - cx, py - cy);
}

/** Arrow head: a triangle at the tip, pointing along the last segment of the path. */
function insideArrow(px, py) {
  const [tx, ty] = ARROW.tip;
  const [fx, fy] = PATH[PATH.length - 2];
  const length = Math.hypot(tx - fx, ty - fy);
  const dx = (tx - fx) / length;
  const dy = (ty - fy) / length;
  const baseX = tx - dx * ARROW.size;
  const baseY = ty - dy * ARROW.size;
  const half = ARROW.size * 0.6;
  const a = [tx, ty];
  const b = [baseX - dy * half, baseY + dx * half];
  const c = [baseX + dy * half, baseY - dx * half];

  const sign = (p1, p2, p3) =>
    (p1[0] - p3[0]) * (p2[1] - p3[1]) - (p2[0] - p3[0]) * (p1[1] - p3[1]);
  const d1 = sign([px, py], a, b);
  const d2 = sign([px, py], b, c);
  const d3 = sign([px, py], c, a);
  const hasNegative = d1 < 0 || d2 < 0 || d3 < 0;
  const hasPositive = d1 > 0 || d2 > 0 || d3 > 0;
  return !(hasNegative && hasPositive);
}

function coverage(px, py) {
  let distance = Infinity;
  for (let i = 0; i < PATH.length - 1; i++) {
    distance = Math.min(distance, distanceToSegment(px, py, PATH[i], PATH[i + 1]));
  }
  if (insideArrow(px, py)) return 1;

  const edge = STROKE / 2;
  const soft = 0.006;
  if (distance <= edge - soft) return 1;
  if (distance >= edge + soft) return 0;
  return (edge + soft - distance) / (2 * soft);
}

function renderPng(size) {
  const bytesPerRow = size * 3 + 1;
  const raw = Buffer.alloc(bytesPerRow * size);

  for (let y = 0; y < size; y++) {
    raw[y * bytesPerRow] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      const alpha = coverage((x + 0.5) / size, (y + 0.5) / size);
      const offset = y * bytesPerRow + 1 + x * 3;
      for (let channel = 0; channel < 3; channel++) {
        raw[offset + channel] = Math.round(BG[channel] * (1 - alpha) + ACCENT[channel] * alpha);
      }
    }
  }

  return buildPng(size, raw);
}

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData));
  return Buffer.concat([length, typeAndData, crc]);
}

function buildPng(size, raw) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8; // bit depth
  header[9] = 2; // colour type: truecolour
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const targets = [
  ['public/icons/icon-192.png', 192],
  ['public/icons/icon-512.png', 512],
  ['public/icons/apple-touch-icon.png', 180],
  ['assets/images/icon.png', 1024],
  ['assets/images/android-icon-foreground.png', 1024],
  ['assets/images/splash-icon.png', 512],
  ['assets/images/favicon.png', 48],
];

for (const [target, size] of targets) {
  const file = join(ROOT, target);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, renderPng(size));
  console.log(`${target} (${size}x${size})`);
}
