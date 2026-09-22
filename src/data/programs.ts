import type { Program, ProgramWeek } from '@/domain/programs';

/**
 * The four PathUp programmes. Written for the app: the exercises come from our own catalogue and
 * the structure follows what the evidence says works for most people (two sessions per muscle a
 * week, 10-20 hard sets per muscle, 1-3 reps in reserve and a deload).
 */

const EIGHT_WEEKS: ProgramWeek[] = [
  {
    number: 1,
    phase: 'aprender',
    rir: 3,
    setsDelta: 0,
    note: 'Semana de aprender. Quédate lejos del fallo: deja 3 repeticiones en la recámara y céntrate en la técnica.',
  },
  {
    number: 2,
    phase: 'aprender',
    rir: 3,
    setsDelta: 0,
    note: 'Mismos pesos que la semana 1. Si te salieron todas las repeticiones, sube una o dos en cada serie.',
  },
  {
    number: 3,
    phase: 'acumular',
    rir: 2,
    setsDelta: 0,
    note: 'Ya controlas los movimientos: aprieta un poco más y deja 2 repeticiones en la recámara.',
  },
  {
    number: 4,
    phase: 'acumular',
    rir: 2,
    setsDelta: 1,
    note: 'Una serie más en cada ejercicio. Es la forma más simple de subir el volumen semanal.',
  },
  {
    number: 5,
    phase: 'apretar',
    rir: 2,
    setsDelta: 1,
    note: 'Semana dura. Mantén las series y sigue subiendo repeticiones o peso.',
  },
  {
    number: 6,
    phase: 'descarga',
    rir: 4,
    setsDelta: -1,
    note: 'Descarga: una serie menos y pesos cómodos. Recuperar forma parte del plan, no es perder tiempo.',
  },
  {
    number: 7,
    phase: 'apretar',
    rir: 1,
    setsDelta: 1,
    note: 'Vuelves con más fuerza: acércate al fallo dejando 1 repetición en la recámara.',
  },
  {
    number: 8,
    phase: 'apretar',
    rir: 1,
    setsDelta: 1,
    note: 'Última semana. Comprueba lo que has ganado y apunta tus récords.',
  },
];

const SIX_WEEKS: ProgramWeek[] = [
  { ...EIGHT_WEEKS[0], number: 1 },
  { ...EIGHT_WEEKS[1], number: 2 },
  { ...EIGHT_WEEKS[2], number: 3 },
  { ...EIGHT_WEEKS[3], number: 4 },
  { ...EIGHT_WEEKS[4], number: 5 },
  { ...EIGHT_WEEKS[5], number: 6 },
];

const PLANK_NOTE = 'Apunta los segundos que aguantas en el hueco de repeticiones.';
const PER_SIDE = 'Las repeticiones son por lado.';

export const PROGRAMS: Program[] = [
  {
    slug: 'primeros-pasos',
    name: 'Primeros pasos · cuerpo completo',
    tagline: 'Tres días a la semana para aprender a entrenar y ganar músculo desde cero.',
    place: 'gym',
    level: 'beginner',
    daysPerWeek: 3,
    minutesPerSession: 55,
    goals: ['muscle', 'health', 'fat_loss'],
    equipment: ['gym'],
    why: [
      'Cuerpo completo tres días por semana: cada músculo se entrena tres veces, y entrenar un músculo 2-3 veces por semana funciona mejor que una sola para ganar músculo y fuerza.',
      'Pocos ejercicios por sesión y muchas máquinas y mancuernas: es más fácil aprender la técnica y repetir el mismo movimiento semana a semana.',
      'Empiezas lejos del fallo (3 repeticiones en la recámara) y te vas acercando: así aprendes sin acabar roto ni con agujetas que te hagan faltar.',
      'Subes de peso cuando llegas al tope de repeticiones en todas las series (doble progresión), no cuando te apetece.',
    ],
    references: [
      {
        text: 'Schoenfeld, Ogborn y Krieger (2016): entrenar cada músculo dos veces por semana da mejores resultados que una.',
        url: 'https://pubmed.ncbi.nlm.nih.gov/27102172/',
      },
      {
        text: 'Schoenfeld, Grgic, Ogborn y Krieger (2017): con la misma carga, las repeticiones altas y bajas hacen crecer el músculo de forma parecida.',
        url: 'https://pubmed.ncbi.nlm.nih.gov/28834797/',
      },
    ],
    sessions: [
      {
        key: 'a',
        name: 'Día A · Cuerpo completo',
        focus: 'Sentadilla, empuje horizontal y tirón',
        exercises: [
          { slug: 'sentadilla-goblet', sets: 3, repMin: 8, repMax: 12 },
          { slug: 'press-banca-barra', sets: 3, repMin: 6, repMax: 10 },
          { slug: 'remo-polea-sentado', sets: 3, repMin: 8, repMax: 12 },
          { slug: 'press-militar-mancuernas', sets: 2, repMin: 8, repMax: 12 },
          { slug: 'plancha', sets: 3, repMin: 20, repMax: 45, note: PLANK_NOTE },
        ],
      },
      {
        key: 'b',
        name: 'Día B · Cuerpo completo',
        focus: 'Prensa, empuje inclinado y jalón',
        exercises: [
          { slug: 'prensa-piernas', sets: 3, repMin: 10, repMax: 15 },
          { slug: 'press-inclinado-mancuernas', sets: 3, repMin: 8, repMax: 12 },
          { slug: 'jalon-pecho', sets: 3, repMin: 8, repMax: 12 },
          { slug: 'curl-femoral-sentado', sets: 3, repMin: 10, repMax: 15 },
          { slug: 'elevaciones-laterales', sets: 2, repMin: 12, repMax: 20 },
        ],
      },
      {
        key: 'c',
        name: 'Día C · Cuerpo completo',
        focus: 'Bisagra de cadera, pecho y brazos',
        exercises: [
          { slug: 'peso-muerto-rumano', sets: 3, repMin: 8, repMax: 12 },
          { slug: 'press-pecho-maquina', sets: 3, repMin: 8, repMax: 12 },
          { slug: 'remo-mancuerna-una-mano', sets: 3, repMin: 8, repMax: 12, note: PER_SIDE },
          { slug: 'curl-biceps-mancuernas', sets: 2, repMin: 10, repMax: 15 },
          { slug: 'extension-triceps-polea', sets: 2, repMin: 10, repMax: 15 },
          { slug: 'elevacion-gemelos', sets: 3, repMin: 10, repMax: 15 },
        ],
      },
    ],
    weeks: EIGHT_WEEKS,
  },
  {
    slug: 'torso-pierna',
    name: 'Torso / Pierna',
    tagline: 'Cuatro días repartidos en torso y pierna, el reparto clásico para ganar músculo.',
    place: 'gym',
    level: 'intermediate',
    daysPerWeek: 4,
    minutesPerSession: 70,
    goals: ['muscle', 'strength'],
    equipment: ['gym'],
    why: [
      'Cuatro días en torso y pierna dejan cada músculo entrenado dos veces por semana con series suficientes: entre 10 y 20 series duras por músculo y semana, que es donde está el mejor equilibrio entre resultados y recuperación.',
      'Cada sesión empieza con un ejercicio pesado de 5-8 repeticiones y sigue con trabajo de 8-20: ganas fuerza y tamaño sin tener que elegir.',
      'Los ejercicios se repiten cada semana a propósito: así la progresión es medible y la app puede sugerirte el peso.',
      'La semana 6 es de descarga. Bajar el volumen unos días deja que se acumule menos fatiga y que la fuerza suba después.',
    ],
    references: [
      {
        text: 'Schoenfeld, Ogborn y Krieger (2017): a más series semanales, más músculo, con rendimientos decrecientes.',
        url: 'https://pubmed.ncbi.nlm.nih.gov/27433992/',
      },
      {
        text: 'Grgic y colaboradores (2018): la frecuencia importa sobre todo porque permite repartir el volumen.',
        url: 'https://pubmed.ncbi.nlm.nih.gov/29470825/',
      },
    ],
    sessions: [
      {
        key: 'a',
        name: 'Torso A',
        focus: 'Empuje horizontal y remo pesado',
        exercises: [
          { slug: 'press-banca-barra', sets: 4, repMin: 5, repMax: 8 },
          { slug: 'remo-barra', sets: 4, repMin: 6, repMax: 10 },
          { slug: 'press-militar-mancuernas', sets: 3, repMin: 8, repMax: 12 },
          { slug: 'jalon-pecho', sets: 3, repMin: 8, repMax: 12 },
          { slug: 'elevaciones-laterales', sets: 3, repMin: 12, repMax: 20 },
          { slug: 'curl-biceps-mancuernas', sets: 2, repMin: 8, repMax: 12 },
          { slug: 'extension-triceps-sobre-cabeza', sets: 2, repMin: 8, repMax: 12 },
        ],
      },
      {
        key: 'b',
        name: 'Pierna A',
        focus: 'Sentadilla y cadena posterior',
        exercises: [
          { slug: 'sentadilla-trasera-barra', sets: 4, repMin: 5, repMax: 8 },
          { slug: 'peso-muerto-rumano', sets: 3, repMin: 6, repMax: 10 },
          { slug: 'prensa-piernas', sets: 3, repMin: 10, repMax: 15 },
          { slug: 'curl-femoral-tumbado', sets: 3, repMin: 10, repMax: 15 },
          { slug: 'elevacion-gemelos', sets: 4, repMin: 8, repMax: 12 },
          { slug: 'plancha', sets: 3, repMin: 30, repMax: 60, note: PLANK_NOTE },
        ],
      },
      {
        key: 'c',
        name: 'Torso B',
        focus: 'Empuje inclinado y espalda con más repeticiones',
        exercises: [
          { slug: 'press-inclinado-mancuernas', sets: 4, repMin: 8, repMax: 12 },
          { slug: 'dominadas-asistidas', sets: 4, repMin: 6, repMax: 10 },
          { slug: 'remo-polea-sentado', sets: 3, repMin: 8, repMax: 12 },
          { slug: 'face-pull', sets: 3, repMin: 12, repMax: 20 },
          { slug: 'elevaciones-laterales', sets: 3, repMin: 12, repMax: 20 },
          { slug: 'curl-martillo', sets: 2, repMin: 8, repMax: 12 },
          { slug: 'press-frances', sets: 2, repMin: 8, repMax: 12 },
        ],
      },
      {
        key: 'd',
        name: 'Pierna B',
        focus: 'Glúteo, unilateral y cuádriceps',
        exercises: [
          { slug: 'hip-thrust', sets: 4, repMin: 8, repMax: 12 },
          { slug: 'sentadilla-bulgara', sets: 3, repMin: 8, repMax: 12, note: PER_SIDE },
          { slug: 'extension-cuadriceps', sets: 3, repMin: 10, repMax: 15 },
          { slug: 'curl-femoral-sentado', sets: 3, repMin: 10, repMax: 15 },
          { slug: 'elevacion-gemelos', sets: 4, repMin: 10, repMax: 15 },
          { slug: 'crunch-polea', sets: 3, repMin: 10, repMax: 15 },
        ],
      },
    ],
    weeks: EIGHT_WEEKS,
  },
  {
    slug: 'en-casa-mancuernas',
    name: 'En casa con mancuernas',
    tagline: 'Tres días con un par de mancuernas, una silla y el suelo.',
    place: 'home',
    level: 'any',
    daysPerWeek: 3,
    minutesPerSession: 45,
    goals: ['muscle', 'health', 'fat_loss'],
    equipment: ['dumbbells'],
    why: [
      'Con mancuernas se puede ganar músculo igual que con máquinas: lo que manda es llevar las series cerca del fallo y subir la carga con el tiempo, no el aparato.',
      'Cada sesión toca todo el cuerpo, así que si una semana solo entrenas dos días no te quedas sin entrenar medio cuerpo.',
      'Cuando las mancuernas se quedan cortas, la progresión sigue por repeticiones y por ejercicios a una pierna o un brazo.',
      'Las series de 8 a 20 repeticiones funcionan igual de bien para el músculo, y en casa son más seguras que ir muy pesado.',
    ],
    references: [
      {
        text: 'Schoenfeld y colaboradores (2021): cerca del fallo, cargas bajas y altas hacen crecer el músculo de forma similar.',
        url: 'https://pubmed.ncbi.nlm.nih.gov/34593159/',
      },
    ],
    sessions: [
      {
        key: 'a',
        name: 'Día A · Cuerpo completo',
        focus: 'Sentadilla, empuje y remo',
        exercises: [
          { slug: 'sentadilla-goblet', sets: 3, repMin: 8, repMax: 12 },
          { slug: 'press-suelo-mancuernas', sets: 3, repMin: 8, repMax: 12 },
          { slug: 'remo-mancuerna-una-mano', sets: 3, repMin: 8, repMax: 12, note: PER_SIDE },
          { slug: 'press-militar-mancuernas', sets: 3, repMin: 8, repMax: 12 },
          { slug: 'plancha', sets: 3, repMin: 20, repMax: 45, note: PLANK_NOTE },
        ],
      },
      {
        key: 'b',
        name: 'Día B · Cuerpo completo',
        focus: 'Bisagra de cadera, flexiones y hombro posterior',
        exercises: [
          { slug: 'peso-muerto-rumano-mancuernas', sets: 3, repMin: 8, repMax: 12 },
          { slug: 'flexiones', sets: 3, repMin: 6, repMax: 15 },
          { slug: 'zancada-inversa', sets: 3, repMin: 8, repMax: 12, note: PER_SIDE },
          { slug: 'elevaciones-posteriores-mancuernas', sets: 3, repMin: 12, repMax: 20 },
          { slug: 'curl-martillo', sets: 2, repMin: 10, repMax: 15 },
          { slug: 'elevacion-talones-pie', sets: 3, repMin: 12, repMax: 20 },
        ],
      },
      {
        key: 'c',
        name: 'Día C · Cuerpo completo',
        focus: 'Pierna a una pierna y brazos',
        exercises: [
          { slug: 'sentadilla-bulgara', sets: 3, repMin: 8, repMax: 12, note: PER_SIDE },
          { slug: 'puente-gluteo', sets: 3, repMin: 10, repMax: 15 },
          { slug: 'remo-mancuerna-una-mano', sets: 3, repMin: 8, repMax: 12, note: PER_SIDE },
          { slug: 'fondos-banco', sets: 3, repMin: 8, repMax: 12 },
          { slug: 'elevaciones-laterales', sets: 3, repMin: 12, repMax: 20 },
          { slug: 'bird-dog', sets: 3, repMin: 8, repMax: 10, note: PER_SIDE },
        ],
      },
    ],
    weeks: SIX_WEEKS,
  },
  {
    slug: 'empezar-suave',
    name: 'Empezar suave',
    tagline: 'Dos sesiones de 40 minutos para volver a moverte sin agujetas que te frenen.',
    place: 'both',
    level: 'beginner',
    daysPerWeek: 2,
    minutesPerSession: 40,
    goals: ['health', 'endurance'],
    equipment: ['bodyweight', 'bands', 'dumbbells', 'gym'],
    why: [
      'Dos días por semana ya mejoran la fuerza y la salud en quien viene de estar parado: lo difícil es mantenerlo, no hacer más.',
      'Movimientos de la vida diaria (levantarse de una silla, empujar, tirar, levantar del suelo) con apoyos que puedes regular según el día.',
      'Series lejos del fallo y sin saltos grandes de carga: se progresa de verdad cuando no tienes que faltar por dolor.',
      'Cada sesión termina con 10-15 minutos de caminata suave, que suma la mayor parte del beneficio para la salud con el menor esfuerzo.',
    ],
    references: [
      {
        text: 'Organización Mundial de la Salud (2020): dos días de fuerza por semana, además de la actividad aeróbica, para cualquier edad adulta.',
        url: 'https://www.who.int/publications/i/item/9789240015128',
      },
    ],
    sessions: [
      {
        key: 'a',
        name: 'Sesión A · Suave',
        focus: 'Piernas, empuje y core',
        exercises: [
          { slug: 'sentadilla-silla', sets: 3, repMin: 8, repMax: 12 },
          { slug: 'flexiones-inclinadas', sets: 3, repMin: 6, repMax: 12 },
          { slug: 'remo-banda', sets: 3, repMin: 10, repMax: 15 },
          { slug: 'puente-gluteo', sets: 3, repMin: 10, repMax: 15 },
          { slug: 'bird-dog', sets: 3, repMin: 8, repMax: 10, note: PER_SIDE },
          { slug: 'elevacion-talones-pie', sets: 2, repMin: 12, repMax: 20 },
        ],
      },
      {
        key: 'b',
        name: 'Sesión B · Suave',
        focus: 'Equilibrio, hombro y core lateral',
        exercises: [
          { slug: 'zancada-inversa', sets: 2, repMin: 6, repMax: 10, note: PER_SIDE },
          { slug: 'press-militar-mancuernas', sets: 3, repMin: 8, repMax: 12 },
          { slug: 'remo-banda', sets: 3, repMin: 10, repMax: 15 },
          { slug: 'puente-gluteo', sets: 3, repMin: 10, repMax: 15 },
          { slug: 'plancha-lateral', sets: 3, repMin: 15, repMax: 30, note: PLANK_NOTE },
          { slug: 'sentadilla-silla', sets: 3, repMin: 8, repMax: 12 },
        ],
      },
    ],
    weeks: SIX_WEEKS,
  },
];

export function getProgram(slug: string): Program | undefined {
  return PROGRAMS.find((program) => program.slug === slug);
}
