import 'dart:math' as math;

import 'models.dart';
import 'progress.dart';

/// Tipos de pantalla que sirven para repasar rápido (sin código largo ni retos de explorar).
const reviewTypes = {'choice', 'tap', 'number', 'fill', 'classify'};

/// Repaso espaciado: si aciertas una pregunta que fallaste, vuelve en 1, 2 y luego 5 días.
/// Después de eso se da por dominada.
const reviewGaps = [1, 2, 5];
const missionSize = 3;

/// Una pantalla concreta de una lección: "curso/lección#índice".
class StepRef {
  const StepRef(this.course, this.lesson, this.index);
  final Course course;
  final Lesson lesson;
  final int index;
  String get key => '${course.id}/${lesson.id}#$index';
  Map<String, dynamic> get step => lesson.steps[index];

  static StepRef? parse(String key, List<Course> courses) {
    final m = RegExp(r'^([\w-]+)/([\w-]+)#(\d+)$').firstMatch(key);
    if (m == null) return null;
    final c = courses.where((x) => x.id == m[1]).firstOrNull;
    final l = c?.lessons.where((x) => x.id == m[2]).firstOrNull;
    final i = int.parse(m[3]!);
    if (c == null || l == null || i >= l.steps.length) return null;
    return StepRef(c, l, i);
  }
}

String stepKey(Course c, Lesson l, int i) => '${c.id}/${l.id}#$i';

int dayNumber(DateTime d) => DateTime.utc(d.year, d.month, d.day).millisecondsSinceEpoch ~/ 86400000;

/// La misión de hoy: primero lo que fallaste y ya toca repasar; luego, para completar,
/// preguntas al azar (pero las mismas todo el día) de lecciones que ya terminaste.
List<StepRef> buildMission(List<Course> courses, Progress p, [DateTime? now]) {
  final today = dayNumber(now ?? DateTime.now());
  final due = <StepRef>[];
  final entries = p.missed.entries.toList()..sort((a, b) => a.value.due.compareTo(b.value.due));
  for (final e in entries) {
    if (e.value.due > today) continue;
    final ref = StepRef.parse(e.key, courses);
    if (ref != null && reviewTypes.contains(ref.step['type'])) due.add(ref);
  }
  final picked = due.take(missionSize).toList();
  if (picked.length < missionSize) {
    final pool = <StepRef>[
      for (final c in courses)
        for (final l in c.lessons)
          if (p.isDone(c, l))
            for (var i = 0; i < l.steps.length; i++)
              if (reviewTypes.contains(l.steps[i]['type']) && !picked.any((r) => r.key == stepKey(c, l, i))) StepRef(c, l, i),
    ];
    pool.shuffle(math.Random(today));
    picked.addAll(pool.take(missionSize - picked.length));
  }
  return picked;
}

/// Una copia de la pantalla con las opciones en otro orden (para practicar sin memorizar posiciones).
Map<String, dynamic> shuffledStep(Map<String, dynamic> step, math.Random rnd) {
  final s = Map<String, dynamic>.from(step);
  switch (s['type']) {
    case 'choice':
      final opts = s['options'] as List;
      final perm = List.generate(opts.length, (i) => i)..shuffle(rnd);
      s['options'] = [for (final i in perm) opts[i]];
      s['answer'] = perm.indexOf((s['answer'] as num).toInt());
      if (s['why'] is Map) {
        final why = s['why'] as Map;
        s['why'] = {for (final e in why.entries) '${perm.indexOf(int.parse('${e.key}'))}': e.value};
      }
    case 'classify':
      s['items'] = List.of(s['items'] as List)..shuffle(rnd);
    case 'fill':
      s['chips'] = List.of(s['chips'] as List)..shuffle(rnd);
  }
  return s;
}
