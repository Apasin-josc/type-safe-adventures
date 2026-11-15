// Logros. Cada uno tiene un ícono, texto en ES/EN y una prueba que mira tu progreso.
// `ctx.gained` es true cuando la revisión viene de completar algo (para los de horario).
(function () {
  'use strict';

  const doneKeys = (p) => Object.keys(p.done);

  window.ACHIEVEMENTS = [
    {
      id: 'first_lesson',
      icon: '📖',
      t: { es: 'Primer paso', en: 'First Step' },
      d: { es: 'Completa tu primera lección.', en: 'Complete your first lesson.' },
      test: ({ p }) => doneKeys(p).some((k) => /\/l\d+$/.test(k)),
    },
    {
      id: 'first_blood',
      icon: '🗡️',
      t: { es: 'Primera sangre', en: 'First Blood' },
      d: { es: 'Derrota tu primer ejercicio.', en: 'Beat your first exercise.' },
      test: ({ p, course }) =>
        course.modules.some((m) => [...m.exercises, ...m.boss].some((e) => p.done[`${m.id}/${e.id}`])),
    },
    {
      id: 'perfect_quiz',
      icon: '🎯',
      t: { es: 'Francotirador', en: 'Sharpshooter' },
      d: { es: 'Saca un quiz perfecto.', en: 'Get a perfect quiz.' },
      test: ({ p }) => Object.keys(p.awards).some((k) => k.endsWith(':perfect')),
    },
    {
      id: 'untouchable',
      icon: '🛡️',
      t: { es: 'Intocable', en: 'Untouchable' },
      d: {
        es: 'Termina todas las lecciones de un módulo sin daño y su quiz perfecto.',
        en: "Finish all of a module's lessons without damage and ace its quiz.",
      },
      test: ({ p, course }) =>
        course.modules.some(
          (m) => m.lessons.every((_, i) => p.awards[`${m.id}/l${i + 1}:flawless`]) && p.awards[`${m.id}/quiz:perfect`]
        ),
    },
    {
      id: 'combo_5',
      icon: '⚡',
      t: { es: 'En racha', en: 'On Fire' },
      d: { es: 'Encadena un combo de 5 aciertos.', en: 'Chain a 5-answer combo.' },
      test: ({ p }) => (p.stats.bestCombo || 0) >= 5,
    },
    {
      id: 'combo_10',
      icon: '🌩️',
      t: { es: 'Imparable', en: 'Unstoppable' },
      d: { es: 'Encadena un combo de 10 aciertos.', en: 'Chain a 10-answer combo.' },
      test: ({ p }) => (p.stats.bestCombo || 0) >= 10,
    },
    {
      id: 'streak_3',
      icon: '🔥',
      t: { es: 'Calentando', en: 'Warming Up' },
      d: { es: 'Racha de 3 días.', en: '3-day streak.' },
      test: ({ p, Core }) => Core.bestStreak(p.days) >= 3,
    },
    {
      id: 'streak_7',
      icon: '☄️',
      t: { es: 'Semana de fuego', en: 'Week on Fire' },
      d: { es: 'Racha de 7 días.', en: '7-day streak.' },
      test: ({ p, Core }) => Core.bestStreak(p.days) >= 7,
    },
    {
      id: 'streak_30',
      icon: '🌋',
      t: { es: 'Disciplina de acero', en: 'Iron Discipline' },
      d: { es: 'Racha de 30 días.', en: '30-day streak.' },
      test: ({ p, Core }) => Core.bestStreak(p.days) >= 30,
    },
    {
      id: 'early_bird',
      icon: '🌅',
      t: { es: 'Madrugador', en: 'Early Bird' },
      d: { es: 'Completa algo antes de las 9 de la mañana.', en: 'Complete something before 9 AM.' },
      test: ({ ctx }) => ctx.gained && new Date().getHours() >= 4 && new Date().getHours() < 9,
    },
    {
      id: 'night_owl',
      icon: '🦉',
      t: { es: 'Búho nocturno', en: 'Night Owl' },
      d: { es: 'Completa algo entre la medianoche y las 4.', en: 'Complete something between midnight and 4 AM.' },
      test: ({ ctx }) => ctx.gained && new Date().getHours() < 4,
    },
    {
      id: 'first_potion',
      icon: '🧪',
      t: { es: 'Salud', en: 'Cheers' },
      d: { es: 'Tómate tu primera poción.', en: 'Drink your first potion.' },
      test: ({ p }) => p.potionsUsed >= 1,
    },
    {
      id: 'no_hints',
      icon: '🧠',
      t: { es: 'Sin ayuda', en: 'No Hand-Holding' },
      d: { es: 'Derrota un ejercicio jefe sin pedir pistas.', en: 'Beat a boss exercise without any hints.' },
      test: ({ p, course }) => course.modules.some((m) => m.boss.some((e) => p.done[`${m.id}/${e.id}`] && !p.hints[`${m.id}/${e.id}`])),
    },
    {
      id: 'boss_slayer',
      icon: '👑',
      t: { es: 'Matajefes', en: 'Boss Slayer' },
      d: { es: 'Despeja tu primera zona.', en: 'Clear your first zone.' },
      test: ({ p, course, Core }) => course.modules.some((m) => Core.moduleState(m, p).cleared),
    },
    {
      id: 'mission_1',
      icon: '🧰',
      t: { es: 'Buscatesoros', en: 'Treasure Hunter' },
      d: { es: 'Abre tu primer cofre de misión diaria.', en: 'Open your first daily mission chest.' },
      test: ({ p, Core }) => Core.missionsWon(p) >= 1,
    },
    {
      id: 'mission_7',
      icon: '💎',
      t: { es: 'Coleccionista', en: 'Collector' },
      d: { es: 'Abre 7 cofres de misión diaria.', en: 'Open 7 daily mission chests.' },
      test: ({ p, Core }) => Core.missionsWon(p) >= 7,
    },
    {
      id: 'level_5',
      icon: '⭐',
      t: { es: 'Veterano', en: 'Veteran' },
      d: { es: 'Llega al nivel 5.', en: 'Reach level 5.' },
      test: ({ p, course, Core }) => Core.levelInfo(Core.totalXp(course, p)).level >= 5,
    },
    {
      id: 'act1',
      icon: '🏆',
      t: { es: 'Fin del Acto I', en: 'Act I Complete' },
      d: { es: 'Despeja las cuatro zonas del Acto I.', en: 'Clear all four zones of Act I.' },
      test: ({ p, course, Core }) => course.modules.every((m) => Core.moduleState(m, p).cleared),
    },
  ];
})();
