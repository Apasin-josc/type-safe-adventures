import 'dart:convert';

import 'package:chispa/data/models.dart';
import 'package:chispa/data/progress.dart';
import 'package:chispa/main.dart';
import 'package:chispa/screens/lesson_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  testWidgets('recorre la lección 1 completa, con un error a propósito', (tester) async {
    tester.view.physicalSize = const Size(390 * 3, 844 * 3);
    tester.view.devicePixelRatio = 3;
    addTearDown(tester.view.reset);
    SharedPreferences.setMockInitialValues({'chispa-progress': jsonEncode({'lang': 'es'})});
    final prefs = await SharedPreferences.getInstance();
    final courses = await tester.runAsync(() => loadCourses(rootBundle));

    await tester.pumpWidget(ProviderScope(
      overrides: [prefsProvider.overrideWithValue(prefs), coursesProvider.overrideWithValue(courses!)],
      child: const ChispaApp(),
    ));
    Future<void> settle() async {
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 500));
    }

    Future<void> tap(Finder f) async {
      await tester.ensureVisible(f.first);
      await settle();
      await tester.tap(f.first, warnIfMissed: false);
      await settle();
    }

    Finder rich(String s) => find.text(s, findRichText: true);
    String code(String s) => ' $s ';
    await settle();

    // Inicio: Salsa saluda y se escoge el curso.
    expect(find.text('¡Hola! ¿Qué aprendemos hoy?'), findsOneWidget);
    expect(find.text('JavaScript a fondo'), findsOneWidget);
    await tap(find.text('Empezar'));
    // El camino del curso y la tarjeta de la primera lección.
    expect(find.text('Algoritmos con intuición'), findsWidgets);
    await tap(find.text('🗄️'));
    expect(find.text('LECCIÓN 1'), findsOneWidget);
    await tap(find.text('Empezar').last);

    // 0 · leer
    await tap(find.text('Continuar'));
    // 1 · tocar food[2]
    await tap(find.text('🌮'));
    await tap(find.text('Comprobar'));
    expect(find.text('Continuar'), findsOneWidget);
    await tap(find.text('Continuar'));
    // 2 · length: primero mal, luego bien
    await tap(rich(code('3')));
    await tap(find.text('Comprobar'));
    expect(find.text('No exactamente'), findsOneWidget);
    expect(rich('3 es el índice del último elemento, no la cantidad de elementos.'), findsOneWidget);
    await tap(find.text('Intentar de nuevo'));
    await tap(rich(code('4')));
    await tap(find.text('Comprobar'));
    await tap(find.text('Continuar'));
    // 3 · el último casillero
    await tap(find.text('6'));
    await tap(find.text('Comprobar'));
    await tap(find.text('Continuar'));
    // 4 · undefined
    await tap(rich(code('undefined')));
    await tap(find.text('Comprobar'));
    await tap(find.text('Continuar'));
    // 5 · completar el loop con <
    await tap(find.text('<'));
    await tap(find.text('Comprobar'));
    await tap(find.text('Continuar'));
    // 6 · seguir el código hasta el final
    for (var i = 0; i < 8; i++) {
      await tap(find.text('Paso ▶'));
    }
    expect(find.text('9 / 9'), findsOneWidget);
    await tap(find.text('Continuar'));
    // 7 · número
    await tester.enterText(find.byType(TextField), '20');
    await settle();
    await tap(find.text('Comprobar'));
    await tap(find.text('Continuar'));

    // Fin: 5 de 6 al primer intento = 83 %, y se guardó con el salto de Salsa pendiente.
    expect(find.text('Lección completada'), findsOneWidget);
    expect(find.text('83%'), findsOneWidget);
    await tester.pump(const Duration(seconds: 3));
    expect(find.text('¡Empezaste tu racha!'), findsOneWidget);
    final saved = jsonDecode(prefs.getString('chispa-progress')!) as Map<String, dynamic>;
    expect(saved['done']['algos/arrays']['acc'], 83);
    expect(saved['hop'], {'course': 'algos', 'from': 0, 'to': 1});

    // Lección nueva: el botón principal es la siguiente.
    expect(find.text('Siguiente lección →'), findsOneWidget);

    // De vuelta al camino: la lección 2 queda abierta y el salto se consume.
    await tap(find.text('Volver al camino'));
    await tester.pump(const Duration(seconds: 2));
    expect(find.text('✓ 83%'), findsOneWidget);
    final container = ProviderScope.containerOf(tester.element(find.byType(ChispaApp)));
    expect(container.read(progressProvider).hop, isNull);
    await tester.runAsync(() => Future<void>.delayed(const Duration(milliseconds: 50)));
    expect(jsonDecode(prefs.getString('chispa-progress')!)['hop'], isNull);
    await tester.pumpWidget(const SizedBox());
  });

  testWidgets('pista de Salsa y regresar a repasar una pantalla', (tester) async {
    tester.view.physicalSize = const Size(390 * 3, 844 * 3);
    tester.view.devicePixelRatio = 3;
    addTearDown(tester.view.reset);
    SharedPreferences.setMockInitialValues({'chispa-progress': jsonEncode({'lang': 'es'})});
    final prefs = await SharedPreferences.getInstance();
    final courses = await tester.runAsync(() => loadCourses(rootBundle));
    await tester.pumpWidget(ProviderScope(
      overrides: [prefsProvider.overrideWithValue(prefs), coursesProvider.overrideWithValue(courses!)],
      child: const ChispaApp(),
    ));
    Future<void> settle() async {
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 500));
    }

    Future<void> tap(Finder f) async {
      await tester.ensureVisible(f.first);
      await settle();
      await tester.tap(f.first, warnIfMissed: false);
      await settle();
    }

    await settle();
    GoRouter.of(tester.element(find.byType(Scaffold).first)).go('/lesson/algos/arrays');
    await settle();
    await tap(find.text('Continuar'));

    // 1 · tocar: Salsa tacha casillas que no son, y la pista se usa una sola vez.
    expect(find.text('🐾 Pista'), findsOneWidget);
    await tap(find.text('🐾 Pista'));
    expect(find.text('Taché las casillas que seguro no son. 🐾', findRichText: true), findsOneWidget);
    expect(find.text('🐾 Pista'), findsNothing);
    await tap(find.text('🌮'));
    await tap(find.text('Comprobar'));
    await tap(find.text('Continuar'));

    // 2 · opción múltiple: empiezo a contestar y me regreso a ver la pantalla anterior.
    await tap(find.text('\u20093\u2009', findRichText: true));
    await tap(find.byTooltip('Pantalla anterior'));
    expect(find.text('REPASANDO · PANTALLA 2 DE 8'), findsOneWidget);
    expect(find.text('Comprobar'), findsNothing);
    await tap(find.text('Volver a donde ibas'));
    expect(find.text('REPASANDO · PANTALLA 2 DE 8'), findsNothing);
    // Lo que había escogido sigue ahí: el botón de comprobar está activo.
    await tap(find.text('Comprobar'));
    expect(find.text('No exactamente'), findsOneWidget);

    // La pantalla con pista no cuenta "a la primera".
    final state = tester.state(find.byType(LessonScreen)) as dynamic;
    expect(state.firstTry, 0);
    await tester.pumpWidget(const SizedBox());
  });

  testWidgets('JavaScript a fondo: lección de variables con la pantalla de clasificar', (tester) async {
    tester.view.physicalSize = const Size(390 * 3, 844 * 3);
    tester.view.devicePixelRatio = 3;
    addTearDown(tester.view.reset);
    // Como si ya fueras más adelante y regresaras a repasar: al terminar, te lleva a donde ibas.
    final ahead = {'acc': 90, 'at': 1};
    SharedPreferences.setMockInitialValues({
      'chispa-progress': jsonEncode({'lang': 'es', 'done': {'js/types': ahead, 'js/conversions': ahead}}),
    });
    final prefs = await SharedPreferences.getInstance();
    final courses = await tester.runAsync(() => loadCourses(rootBundle));
    await tester.pumpWidget(ProviderScope(
      overrides: [prefsProvider.overrideWithValue(prefs), coursesProvider.overrideWithValue(courses!)],
      child: const ChispaApp(),
    ));
    Future<void> settle() async {
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 500));
    }

    Future<void> tap(Finder f) async {
      await tester.ensureVisible(f);
      await settle();
      await tester.tap(f, warnIfMissed: false);
      await settle();
    }

    Finder rich(String s) => find.text(s, findRichText: true);
    String code(String s) => '\u2009$s\u2009';
    Future<void> checkAndGo() async {
      await tap(find.text('Comprobar'));
      expect(find.text('No exactamente'), findsNothing);
      await tap(find.text('Continuar'));
    }

    await settle();
    // El router es uno solo para toda la app: lo regresamos al inicio por si otra prueba lo movió.
    GoRouter.of(tester.element(find.byType(Scaffold).first)).go('/');
    await settle();
    expect(find.text('JavaScript a fondo'), findsOneWidget);
    await tap(find.text('JavaScript a fondo'));
    await tap(find.text('📦').first);
    await tap(find.text('Empezar').last);

    await tap(find.text('Continuar')); // leer
    await tap(rich(code('2')));
    await checkAndGo();
    await tap(rich('Error: no se puede reasignar una constante'));
    await checkAndGo();
    await tap(rich(code("'Luz'")));
    await checkAndGo();
    // clasificar: userName ✓, 2nd ✗, $price ✓, _count ✓, my-name ✗, let ✗
    const valid = [true, false, true, true, false, false];
    var v = 0, nv = 0;
    for (final ok in valid) {
      if (ok) {
        await tap(find.text('Válido').at(v));
      } else {
        await tap(find.text('No válido').at(nv));
      }
      v++;
      nv++;
    }
    await checkAndGo();
    await tap(rich('Error'));
    await checkAndGo();
    await tap(find.text('let'));
    await checkAndGo();
    await tester.enterText(find.byType(TextField), '15');
    await settle();
    await checkAndGo();

    expect(find.text('Lección completada'), findsOneWidget);
    expect(find.text('100%'), findsOneWidget);
    expect(find.text('📖 Para leer más'), findsOneWidget);
    await tester.pump(const Duration(seconds: 3));

    // "Seguir donde ibas" abre de verdad la otra lección (antes se quedaba en esta pantalla).
    await tap(find.text('Seguir donde ibas: 🚪 El portero de la fiesta →'));
    await tester.pump(const Duration(seconds: 1));
    expect(find.text('Lección completada'), findsNothing);
    expect(find.text('Regresan un valor, no un sí o un no'), findsOneWidget);
    await tester.pumpWidget(const SizedBox());
  });

  testWidgets('misión del día y práctica abren y se pueden contestar', (tester) async {
    tester.view.physicalSize = const Size(390 * 3, 844 * 3);
    tester.view.devicePixelRatio = 3;
    addTearDown(tester.view.reset);
    SharedPreferences.setMockInitialValues({
      'chispa-progress': jsonEncode({
        'lang': 'es',
        'done': {'algos/arrays': {'acc': 83, 'at': 1}},
      }),
    });
    final prefs = await SharedPreferences.getInstance();
    final courses = await tester.runAsync(() => loadCourses(rootBundle));
    await tester.pumpWidget(ProviderScope(
      overrides: [prefsProvider.overrideWithValue(prefs), coursesProvider.overrideWithValue(courses!)],
      child: const ChispaApp(),
    ));
    Future<void> settle() async {
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 500));
    }

    await settle();
    final router = GoRouter.of(tester.element(find.byType(Scaffold).first));
    router.go('/');
    await settle();
    expect(find.text('Misión del día'), findsOneWidget);
    expect(find.text('Empezar misión'), findsOneWidget);

    router.go('/mission');
    await settle();
    expect(find.text('Comprobar'), findsOneWidget);
    expect(find.textContaining('Una fila de casilleros'), findsOneWidget); // de qué lección viene

    router.go('/practice/algos/arrays');
    await settle();
    expect(find.text('Comprobar'), findsOneWidget);
    expect(tester.takeException(), isNull);
    await tester.pumpWidget(const SizedBox());
  });
}
