// Capturas de las pantallas nuevas en el simulador (necesita el servidor de pistas prendido):
//   flutter drive -d <simulador> --driver=test_driver/integration_test.dart \
//     --target=integration_test/screens_test.dart --dart-define=STEP=4 \
//     --dart-define=HINT_TOKEN=$(cat hint-server/.token)
// Las imágenes quedan en build/screens/.
import 'dart:convert';

import 'package:chispa/data/closet.dart';
import 'package:chispa/data/models.dart';
import 'package:chispa/data/progress.dart';
import 'package:chispa/main.dart';
import 'package:chispa/ui/salsa_fetch.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:integration_test/integration_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  final binding = IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('pantallas nuevas: inicio, clóset, entrevista y pista de Salsa', (tester) async {
    final now = DateTime.now();
    String day(int back) {
      final d = now.subtract(Duration(days: back));
      return '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
    }

    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('chispa-progress', jsonEncode({
      'version': 1,
      'lang': 'es',
      'theme': 'light',
      'sound': false,
      'voice': false,
      'done': {
        for (final id in ['arrays', 'steps', 'binary', 'two-pointers', 'sliding-window', 'hash-maps'])
          'algos/$id': {'acc': 90, 'at': now.millisecondsSinceEpoch},
      },
      'days': [for (var i = 7; i >= 0; i--) day(i)],
      'missions': [day(1), day(2), day(3)],
      'interviews': ['strong'],
      'equipped': ['sweater', 'ball', 'glasses_gold'],
      'seenUnlocks': [for (final i in closetItems) i.id],
    }));
    final courses = await loadCourses(rootBundle);
    await tester.pumpWidget(ProviderScope(
      overrides: [prefsProvider.overrideWithValue(prefs), coursesProvider.overrideWithValue(courses)],
      child: const ChispaApp(),
    ));

    Future<void> wait([int ms = 700]) async {
      for (var i = 0; i < ms ~/ 50; i++) {
        await tester.pump(const Duration(milliseconds: 50));
      }
    }

    Future<void> shot(String name) async {
      await wait(400);
      await binding.takeScreenshot(name);
    }

    void go(String route) => GoRouter.of(tester.element(find.byType(Scaffold).first)).go(route);

    await wait(1200);
    await shot('01-home');
    await tester.drag(find.byType(Scrollable).first, const Offset(0, -420));
    await shot('02-home-interview');

    go('/closet');
    await wait();
    await shot('03-closet');

    go('/interview');
    await wait();
    await shot('04-interview-intro');
    await tester.tap(find.text('Empezar ⏱'));
    await wait();
    await shot('05-interview-coding');

    // Reto de dos punteros (STEP=4) con un error a propósito: nunca mueve `right`.
    go('/lesson/algos/two-pointers');
    await wait(1000);
    await tester.enterText(find.byType(TextField).first, '''function pairSum(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  while (left < right) {
    if (arr[left] + arr[right] === target) return [left, right];
    left++;
  }
  return null;
}''');
    FocusManager.instance.primaryFocus?.unfocus();
    await wait();
    await tester.tap(find.text('Comprobar'));
    await wait(1500);
    await shot('06-hint-button');
    await tester.tap(find.text('🐾 Pedirle una pista a Salsa').last);
    // La pista tarda unos segundos: Claude la piensa en tu Mac.
    await wait(300);
    for (var i = 0; i < 60 && find.text('Salsa está olfateando tu código…').evaluate().isNotEmpty; i++) {
      await Future<void>.delayed(const Duration(milliseconds: 500));
      await wait(100);
    }
    await wait(800);
    await shot('07-hint');

    // Pista en una pregunta de opción múltiple (STEP=4 en arreglos) y repasar la pantalla anterior.
    go('/lesson/algos/arrays');
    await wait(1000);
    // Salsa escarba por la pista: capturas a media carrera, escarbando y de regreso con el hueso.
    SalsaFetch.forceKind = FetchKind.dig;
    await tester.tap(find.text('🐾 Pista'));
    await wait(500);
    await binding.takeScreenshot('08a-run');
    await wait(900);
    await binding.takeScreenshot('08b-dig');
    await wait(1100);
    await binding.takeScreenshot('08c-back');
    await wait(1400);
    await shot('08-sniff');
    await tester.tap(find.byTooltip('Pantalla anterior'));
    await wait(900);
    await shot('09-review');
  });
}
