import 'progress.dart';

/// Las cosas de Salsa que se desbloquean estudiando.
class ClosetItem {
  const ClosetItem({required this.id, required this.icon, required this.title, required this.how, required this.progress});
  final String id;
  final String icon;
  final Map<String, String> title;
  final Map<String, String> how; // cómo se desbloquea
  final (int, int) Function(Progress p) progress; // (llevas, necesitas)

  bool unlocked(Progress p) {
    final (have, need) = progress(p);
    return have >= need;
  }
}

final closetItems = <ClosetItem>[
  ClosetItem(
    id: 'sweater',
    icon: '🧶',
    title: {'es': 'Suéter de invierno', 'en': 'Winter sweater'},
    how: {'es': 'Llega a una racha de 7 días', 'en': 'Reach a 7-day streak'},
    progress: (p) => (p.bestStreak, 7),
  ),
  ClosetItem(
    id: 'ball',
    icon: '🎾',
    title: {'es': 'Pelotita', 'en': 'Tennis ball'},
    how: {'es': 'Termina 5 lecciones', 'en': 'Finish 5 lessons'},
    progress: (p) => (p.done.length, 5),
  ),
  ClosetItem(
    id: 'glasses_pink',
    icon: '🕶️',
    title: {'es': 'Lentes rosas', 'en': 'Pink sunglasses'},
    how: {'es': 'Cumple 3 misiones del día', 'en': 'Complete 3 daily missions'},
    progress: (p) => (p.missions.length, 3),
  ),
  ClosetItem(
    id: 'glasses_gold',
    icon: '⭐',
    title: {'es': 'Lentes dorados', 'en': 'Gold sunglasses'},
    how: {'es': 'Saca un "Strong hire" en el modo entrevista', 'en': 'Get a "Strong hire" in interview mode'},
    progress: (p) => (p.interviews.where((v) => v == 'strong').length, 1),
  ),
];

/// Premios recién desbloqueados que todavía no te hemos mostrado.
List<ClosetItem> newUnlocks(Progress p) => [for (final i in closetItems) if (i.unlocked(p) && !p.seenUnlocks.contains(i.id)) i];

/// Lo que trae puesto, solo si sigue desbloqueado.
bool wears(Progress p, String id) => p.equipped.contains(id) && closetItems.any((i) => i.id == id && i.unlocked(p));
