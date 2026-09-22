// Builds the copy-paste ready image prompts for a set of exercises.
//
//   node scripts/build-exercise-prompts.mjs docs/prompts/ejercicios-21-43.json
//
// The fixed style block lives here, so every exercise gets exactly the same wording and only the
// pose, muscles, equipment and camera change (see docs/05-imagenes-y-video-ia.md).

import { readFileSync, writeFileSync } from 'node:fs';

const CONTINUITY =
  'Keep the exact same mannequin, camera angle, framing and lighting as the start image earlier in this chat; only the pose changes.';

function prompt({ exercise, position, pose, muscles, equipment, camera }) {
  const gear = equipment
    ? `Equipment: ${equipment}, realistically proportioned, in dark charcoal and brushed steel, clearly readable against the background, never mint.`
    : 'No equipment: the figure is on the bare studio floor.';

  return [
    '3D render for a fitness app exercise illustration: a stylized faceless mannequin (smooth featureless head, no hair), gender-neutral athletic build, matte graphite grey surface with softly sculpted muscles,',
    `performing ${exercise}, shown in the ${position} position.`,
    pose,
    `Target muscles glowing soft mint green (#4CC38A), lit from within the muscle surface with clean edges: ${muscles}.`,
    'Every other muscle stays matte graphite grey.',
    gear,
    `${camera}, full body and all equipment in frame, figure centered with margin around it.`,
    'Seamless dark studio background (#0E1116), hard rim light from the left, soft fill light, soft floor shadow, clean minimal high-contrast look, square 1:1 image.',
    'Correct anatomy: two arms, two legs, five fingers on each hand.',
    'No text, numbers or logos, no halo or neon outline, no gym clutter, no other people.',
    position === 'end' ? CONTINUITY : null,
  ]
    .filter(Boolean)
    .join(' ');
}

const [, , source] = process.argv;
if (!source) {
  console.error('Usage: node scripts/build-exercise-prompts.mjs <data.json>');
  process.exit(1);
}

const data = JSON.parse(readFileSync(source, 'utf8'));
const lines = [`# ${data.title}`, '', data.intro, ''];

data.exercises.forEach((item, index) => {
  const number = data.firstNumber + index;
  lines.push(
    `## ${number}. ${item.name}`,
    '',
    `- **Slug:** \`${item.slug}\``,
    `- **Archivos:** \`ex_${item.slug}_start_v1.png\` · \`ex_${item.slug}_end_v1.png\``,
    `- **Iluminar en menta:** ${item.mintEs}`,
    `- **Secundarios (quedan en gris):** ${item.secondaryEs}`,
    '',
    '### Inicio',
    '',
    '```text',
    prompt({ ...item, position: 'start', pose: item.start }),
    '```',
    '',
    '### Final',
    '',
    '```text',
    prompt({ ...item, position: 'end', pose: item.end }),
    '```',
    '',
    '**Revisa especialmente**',
    '',
    ...item.checks.map((check) => `- ${check}`),
    '',
    '---',
    '',
  );
});

const out = source.replace(/\.json$/, '.md');
writeFileSync(out, `${lines.join('\n').trimEnd()}\n`, 'utf8');
console.log(`Wrote ${out} with ${data.exercises.length} exercises`);
