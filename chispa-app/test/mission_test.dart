import 'dart:math' as math;

import 'package:chispa/data/mission.dart';
import 'package:chispa/data/models.dart';
import 'package:chispa/data/progress.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  late List<Course> courses;
  setUpAll(() async => courses = await loadCourses(rootBundle));

  test('al revolver una opción múltiple, la respuesta y los "por qué" siguen a su opción', () {
    final step = courses.first.lessons.first.steps.firstWhere((s) => s['type'] == 'choice');
    final right = (step['options'] as List)[(step['answer'] as num).toInt()];
    for (var seed = 0; seed < 20; seed++) {
      final s = shuffledStep(step, math.Random(seed));
      expect((s['options'] as List)[s['answer'] as int], right);
      final why = step['why'] as Map;
      for (final e in why.entries) {
        final original = (step['options'] as List)[int.parse('${e.key}')];
        final newIndex = (s['options'] as List).indexOf(original);
        expect((s['why'] as Map)['$newIndex'], e.value);
      }
    }
  });

  test('la misión: primero lo fallado que ya toca, luego al azar pero igual todo el día', () {
    final algos = courses.firstWhere((c) => c.id == 'algos');
    final today = dayNumber(DateTime(2026, 11, 20));
    final p = Progress(
      done: {'algos/arrays': const LessonResult(acc: 80, at: 0)},
      missed: {'algos/arrays#2': ReviewItem(box: 0, due: today), 'algos/arrays#4': ReviewItem(box: 1, due: today + 3)},
    );
    final m1 = buildMission(courses, p, DateTime(2026, 11, 20));
    expect(m1.length, 3);
    expect(m1.first.key, 'algos/arrays#2'); // el que ya toca va primero
    expect(m1.every((r) => r.course == algos && reviewTypes.contains(r.step['type'])), isTrue);
    expect(m1.map((r) => r.key).toSet().length, 3); // sin repetir
    final again = buildMission(courses, p, DateTime(2026, 11, 20, 23));
    expect(again.map((r) => r.key), m1.map((r) => r.key)); // misma misión todo el día
    expect(buildMission(courses, const Progress()), isEmpty); // sin lecciones terminadas no hay misión
  });

  test('cajas del repaso espaciado: aciertos suben de caja, fallos regresan a la 0', () async {
    SharedPreferences.setMockInitialValues({});
    final prefs = await SharedPreferences.getInstance();
    final c = ProviderContainer(overrides: [prefsProvider.overrideWithValue(prefs), coursesProvider.overrideWithValue(courses)]);
    addTearDown(c.dispose);
    final n = c.read(progressProvider.notifier);
    final today = dayNumber(DateTime.now());
    n.noteMiss('k');
    expect(c.read(progressProvider).missed['k']!.box, 0);
    expect(c.read(progressProvider).missed['k']!.due, today + 1);
    n.reviewResult('k', true);
    expect(c.read(progressProvider).missed['k']!.box, 1);
    expect(c.read(progressProvider).missed['k']!.due, today + 2);
    n.reviewResult('k', false);
    expect(c.read(progressProvider).missed['k']!.box, 0);
    n.reviewResult('k', true);
    n.reviewResult('k', true);
    n.reviewResult('k', true);
    expect(c.read(progressProvider).missed.containsKey('k'), isFalse); // dominada
    n.winMission();
    expect(c.read(progressProvider).missionDoneToday, isTrue);
    expect(c.read(progressProvider).streak(), 1);
  });
}
