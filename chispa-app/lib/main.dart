import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'data/models.dart';
import 'data/progress.dart';
import 'screens/course_screen.dart';
import 'screens/closet_screen.dart';
import 'screens/home_screen.dart';
import 'screens/interview_screen.dart';
import 'screens/lesson_screen.dart';
import 'ui/sfx.dart';
import 'ui/voice.dart';
import 'ui/theme.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final prefs = await SharedPreferences.getInstance();
  final courses = await loadCourses(rootBundle);
  await sfx.init();
  final saved = LocalProgressRepository(prefs).load();
  sfx.enabled = saved.sound;
  await voice.init();
  voice.enabled = saved.voice;
  runApp(ProviderScope(
    overrides: [
      prefsProvider.overrideWithValue(prefs),
      coursesProvider.overrideWithValue(courses),
    ],
    child: const ChispaApp(),
  ));
}

// Para capturas y pruebas: --dart-define=START=/lesson/algos/binary abre directo ahí.
const _start = String.fromEnvironment('START', defaultValue: '/');

final _router = GoRouter(
  initialLocation: _start,
  routes: [
    // Rutas hermanas (no anidadas): al volver de una lección, el camino se arma de nuevo y Salsa puede saltar.
    GoRoute(path: '/', pageBuilder: (context, state) => const NoTransitionPage(child: HomeScreen())),
    GoRoute(
      path: '/course/:course',
      pageBuilder: (context, state) => NoTransitionPage(key: state.pageKey, child: CourseScreen(courseId: state.pathParameters['course']!)),
    ),
    GoRoute(
      path: '/practice/:course/:lesson',
      pageBuilder: (context, state) => CupertinoLikePage(
        key: ValueKey(state.uri.toString()),
        child: LessonScreen(courseId: state.pathParameters['course']!, lessonId: state.pathParameters['lesson']!, mode: PlayMode.practice),
      ),
    ),
    GoRoute(path: '/interview', pageBuilder: (context, state) => CupertinoLikePage(key: state.pageKey, child: const InterviewScreen())),
    GoRoute(path: '/closet', pageBuilder: (context, state) => CupertinoLikePage(key: state.pageKey, child: const ClosetScreen())),
    GoRoute(
      path: '/mission',
      pageBuilder: (context, state) => CupertinoLikePage(key: state.pageKey, child: const LessonScreen(mode: PlayMode.mission)),
    ),
    GoRoute(
      path: '/lesson/:course/:lesson',
      pageBuilder: (context, state) => CupertinoLikePage(
        key: ValueKey(state.uri.toString()),
        child: LessonScreen(courseId: state.pathParameters['course']!, lessonId: state.pathParameters['lesson']!),
      ),
    ),
  ],
);

/// Las lecciones entran desde abajo, como una hoja.
class CupertinoLikePage extends CustomTransitionPage<void> {
  CupertinoLikePage({required super.child, super.key})
      : super(
          transitionDuration: const Duration(milliseconds: 280),
          transitionsBuilder: (context, animation, secondary, child) => SlideTransition(
            position: Tween(begin: const Offset(0, 1), end: Offset.zero).animate(CurvedAnimation(parent: animation, curve: Curves.easeOutCubic)),
            child: child,
          ),
        );
}

class ChispaApp extends ConsumerWidget {
  const ChispaApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = ref.watch(progressProvider.select((p) => p.theme));
    final mode = switch (theme) {
      'light' => ThemeMode.light,
      'dark' => ThemeMode.dark,
      _ => ThemeMode.system,
    };
    return MaterialApp.router(
      title: 'SauceCode',
      debugShowCheckedModeBanner: false,
      theme: buildTheme(Palette.light, Brightness.light),
      darkTheme: buildTheme(Palette.dark, Brightness.dark),
      themeMode: mode,
      routerConfig: _router,
    );
  }
}
