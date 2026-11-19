import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

import '../data/mission.dart';
import '../data/models.dart';
import '../data/progress.dart';
import '../steps/common.dart';
import '../steps/registry.dart';
import '../ui/chunky.dart';
import '../ui/dressed.dart';
import '../ui/i18n.dart';
import '../ui/rich.dart';
import '../ui/salsa.dart';
import '../ui/sfx.dart';
import '../ui/streak.dart';
import '../ui/theme.dart';
import '../ui/voice.dart';

const _graded = {'choice', 'tap', 'number', 'fill', 'order', 'code', 'classify'};

class _Sheet {
  const _Sheet(this.kind, this.title, this.body, this.actions);
  final String kind; // 'good' | 'bad' | 'reveal'
  final String title;
  final String body;
  final List<(String, VoidCallback, ChunkyKind)> actions;
}

/// lesson: la lección normal. practice: sus preguntas en otro orden. mission: la misión del día.
enum PlayMode { lesson, practice, mission }

class LessonScreen extends ConsumerStatefulWidget {
  const LessonScreen({super.key, this.courseId = '', this.lessonId = '', this.mode = PlayMode.lesson});
  final String courseId, lessonId;
  final PlayMode mode;
  @override
  ConsumerState<LessonScreen> createState() => _LessonScreenState();
}

class _LessonScreenState extends ConsumerState<LessonScreen> {
  late final List<Course> courses = ref.read(coursesProvider);
  late final PlayMode mode = widget.mode;
  late final Course course = courses.firstWhere((c) => c.id == widget.courseId, orElse: () => courses.first);
  late final Lesson lesson = course.lessons.firstWhere((l) => l.id == widget.lessonId, orElse: () => course.lessons.first);
  late final String lang = ref.read(progressProvider).effectiveLang;

  /// De dónde sale cada pantalla (para el repaso espaciado) y la pantalla en sí.
  late final List<StepRef> refs = switch (mode) {
    PlayMode.lesson => [for (var i = 0; i < lesson.steps.length; i++) StepRef(course, lesson, i)],
    PlayMode.practice => [
        for (var i = 0; i < lesson.steps.length; i++)
          if (_graded.contains(lesson.steps[i]['type'])) StepRef(course, lesson, i),
      ]..shuffle(math.Random()),
    PlayMode.mission => buildMission(courses, ref.read(progressProvider)),
  };
  late final List<Map<String, dynamic>> steps = [
    for (final r in refs) mode == PlayMode.lesson ? r.step : shuffledStep(r.step, math.Random()),
  ];
  final Map<String, bool> results = {}; // misión: si cada pregunta salió al primer intento
  late final Tr t = translator(lang);
  final scroll = ScrollController();

  // Para capturas: --dart-define=STEP=4 abre la lección en esa pantalla.
  int idx = const int.fromEnvironment('STEP');
  int graded = 0;
  int firstTry = 0;
  int attempts = 0;
  bool checking = false;
  bool finished = false;
  int finalAcc = 0;
  int combo = 0; // aciertos seguidos al primer intento
  bool streakUp = false; // esta lección subió tu racha (primera del día)
  _Sheet? sheet;
  late StepController ctl = _makeController();

  StepController _makeController() {
    final c = StepController(step: steps[idx], lang: lang);
    c.addListener(() {
      // Una pantalla puede avisar que está lista mientras se dibuja (en su initState): esperamos al siguiente cuadro.
      if (SchedulerBinding.instance.schedulerPhase != SchedulerPhase.idle) {
        Future.microtask(() {
          if (mounted) setState(() {});
        });
      } else {
        setState(() {});
      }
    });
    c.onSubmit = () {
      if (c.ready && sheet == null && !checking) _onGo();
    };
    // Después del primer cuadro de la pantalla, vuelve a pintar el botón: si la pantalla se marcó
    // como lista al arrancar, aquí se enciende aunque ese aviso haya llegado a medio dibujo.
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) setState(() {});
    });
    WidgetsBinding.instance.scheduleFrame();
    return c;
  }

  bool get isGraded => _graded.contains(steps[idx]['type']);

  void _next() {
    setState(() {
      sheet = null;
      idx++;
      if (idx >= steps.length) {
        _finish();
        return;
      }
      attempts = 0;
      ctl.dispose();
      ctl = _makeController();
    });
    if (scroll.hasClients) scroll.jumpTo(0);
  }

  Future<void> _onGo() async {
    FocusScope.of(context).unfocus();
    if (!isGraded) return _next();
    final check = ctl.onCheck;
    if (check == null) return;
    setState(() => checking = true);
    final r = await check();
    if (!mounted) return;
    attempts++;
    if (attempts == 1) graded++;
    final step = steps[idx];
    final explain = tx(step['explain'], lang);
    if (attempts == 1) {
      final key = refs[idx].key;
      if (mode == PlayMode.mission) {
        results[key] = r.ok;
      } else if (!r.ok && reviewTypes.contains(step['type'])) {
        ref.read(progressProvider.notifier).noteMiss(key); // vuelve en tu misión del día
      }
    }
    setState(() {
      checking = false;
      if (r.ok) {
        if (attempts == 1) {
          firstTry++;
          combo++;
        }
        HapticFeedback.mediumImpact();
        sfx.correct(attempts == 1 ? combo : 1);
        voice.say(attempts == 1 && combo >= 3 ? SalsaLine.combo : SalsaLine.correct, lang);
        ctl.onFeedback?.call(true);
        final praise = t('praise').split('|');
        final title = attempts == 1 && combo >= 2 ? t('combo', [combo]) : praise[math.Random().nextInt(praise.length)];
        sheet = _Sheet('good', title, explain, [(t('next'), _next, ChunkyKind.primary)]);
        return;
      }
      HapticFeedback.heavyImpact();
      sfx.play(Sfx.wrong);
      if (attempts == 1) voice.say(SalsaLine.wrong, lang);
      combo = 0;
      ctl.onFeedback?.call(false);
      final msg = r.msg ?? (step['hint'] != null ? tx(step['hint'], lang) : t('wrong_generic'));
      void retry() => setState(() => sheet = null);
      if (ctl.retryable) {
        sheet = _Sheet('bad', t('wrong'), msg, [
          (t('retry'), retry, attempts >= 2 ? ChunkyKind.ghost : ChunkyKind.primary),
          // Pista de Salsa con Claude: cierra la hoja y la burbuja aparece junto a tu código.
          if (ctl.canHint?.call() == true)
            (
              t('hint_ask'),
              () {
                retry();
                ctl.onHint?.call();
              },
              ChunkyKind.ghost,
            ),
          if (attempts >= 2)
            (
              t('see_solution'),
              () => setState(() {
                    ctl.onReveal?.call();
                    sheet = _Sheet('reveal', t('reveal_title'), explain, [(t('next'), _next, ChunkyKind.primary)]);
                  }),
              ChunkyKind.primary,
            ),
        ]);
      } else if (attempts < 2) {
        sheet = _Sheet('bad', t('wrong'), msg, [(t('retry'), retry, ChunkyKind.primary)]);
      } else {
        ctl.onReveal?.call();
        sheet = _Sheet('reveal', t('reveal_title'), r.msg == null ? explain : '<p>${r.msg}</p><p>$explain</p>', [(t('next'), _next, ChunkyKind.primary)]);
      }
    });
  }

  void _finish() {
    finalAcc = graded == 0 ? 100 : (firstTry * 100 / graded).round();
    final notifier = ref.read(progressProvider.notifier);
    streakUp = !notifier.studiedToday;
    switch (mode) {
      case PlayMode.lesson:
        notifier.completeLesson(course, lesson, finalAcc);
      case PlayMode.practice:
        notifier.touchDay();
      case PlayMode.mission:
        results.forEach(notifier.reviewResult);
        notifier.winMission();
    }
    sfx.play(Sfx.complete);
    Future.delayed(const Duration(milliseconds: 1300), () {
      voice.say(mode == PlayMode.mission ? SalsaLine.mission : (streakUp ? SalsaLine.streak : SalsaLine.lessonDone), lang);
    });
    if (streakUp) Future.delayed(const Duration(milliseconds: 1500), () => sfx.play(Sfx.streak));
    finished = true;
    HapticFeedback.mediumImpact();
  }

  @override
  void dispose() {
    if (steps.isNotEmpty) ctl.dispose();
    scroll.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final p = context.pal;
    final total = steps.length;
    final exit = mode == PlayMode.mission ? '/' : '/course/${course.id}';
    if (steps.isEmpty) {
      // Misión sin preguntas todavía (no has terminado ninguna lección).
      return Scaffold(
        body: SafeArea(
          child: Center(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(mainAxisSize: MainAxisSize.min, children: [
                const DressedSalsa(size: 140),
                const SizedBox(height: 16),
                Text(t('mission_locked'), textAlign: TextAlign.center, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                const SizedBox(height: 20),
                ChunkyButton(label: t('back_home'), onPressed: () => context.go('/')),
              ]),
            ),
          ),
        ),
      );
    }
    return Scaffold(
      body: SafeArea(
        bottom: false,
        child: Column(children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(6, 6, 16, 6),
            child: Row(children: [
              IconButton(
                onPressed: () => context.go(exit),
                icon: Icon(Icons.close_rounded, color: p.muted, size: 28),
                tooltip: lang == 'es' ? 'Salir' : 'Leave',
              ),
              const SizedBox(width: 4),
              Expanded(
                child: Row(children: [
                  for (var i = 0; i < total; i++)
                    Expanded(
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 250),
                        margin: const EdgeInsets.symmetric(horizontal: 2),
                        height: 9,
                        decoration: BoxDecoration(color: finished || i <= idx ? p.accent : p.line, borderRadius: BorderRadius.circular(99)),
                      ),
                    ),
                ]),
              ),
            ]),
          ),
          Expanded(child: finished ? _finishView(p) : _stepView(p)),
          if (!finished) _bottom(p),
        ]),
      ),
    );
  }

  Widget _stepView(Palette p) {
    final step = steps[idx];
    final from = refs[idx];
    return SingleChildScrollView(
      controller: scroll,
      padding: const EdgeInsets.fromLTRB(20, 10, 20, 30),
      keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 640),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            if (mode == PlayMode.mission)
              Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: Text('${from.lesson.icon}  ${tx(from.lesson.title, lang)}',
                    style: TextStyle(color: p.faint, fontSize: 13.5, fontWeight: FontWeight.w800)),
              ),
            if (step['title'] != null)
              Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: Text(tx(step['title'], lang), style: const TextStyle(fontSize: 25, fontWeight: FontWeight.w800, height: 1.2, letterSpacing: -0.3)),
              ),
            if (step['prompt'] != null)
              Padding(padding: const EdgeInsets.only(bottom: 18), child: Rich(tx(step['prompt'], lang), style: const TextStyle(fontSize: 19, height: 1.4))),
            buildStep(ctl, key: ValueKey('${mode.name}-${from.key}-$idx')),
          ]),
        ),
      ),
    );
  }

  Widget _bottom(Palette p) {
    final bottomInset = MediaQuery.paddingOf(context).bottom;
    final s = sheet;
    final (bg, edge, titleColor) = switch (s?.kind) {
      'good' => (p.goodSoft, p.good, p.good),
      'bad' => (p.badSoft, p.bad, p.bad),
      'reveal' => (p.selSoft, p.sel, p.sel),
      _ => (p.bg, p.line, p.ink),
    };
    return AnimatedContainer(
      duration: const Duration(milliseconds: 180),
      width: double.infinity,
      decoration: BoxDecoration(color: bg, border: Border(top: BorderSide(color: edge, width: s == null ? 1 : 3))),
      padding: EdgeInsets.fromLTRB(20, 14, 20, 14 + bottomInset),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 640),
          child: s == null
              ? ChunkyButton(
                  label: checking ? '…' : (isGraded ? t('check') : t('next')),
                  onPressed: ctl.ready && !checking ? _onGo : null,
                )
              : ConstrainedBox(
                  constraints: BoxConstraints(maxHeight: MediaQuery.sizeOf(context).height * 0.55),
                  child: SingleChildScrollView(
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Row(children: [
                        if (s.kind == 'good') const Padding(padding: EdgeInsets.only(right: 10), child: DressedSalsa(size: 62, mood: SalsaMood.cheer)),
                        Expanded(child: Text(s.title, style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: titleColor))),
                      ]),
                      if (s.body.isNotEmpty) Padding(padding: const EdgeInsets.only(top: 6, bottom: 4), child: Rich(s.body, style: const TextStyle(fontSize: 16.5, height: 1.4))),
                      const SizedBox(height: 10),
                      for (final (label, fn, kind) in s.actions) Padding(padding: const EdgeInsets.only(top: 6), child: ChunkyButton(label: label, onPressed: fn, kind: kind)),
                    ]),
                  ),
                ),
        ),
      ),
    );
  }

  Widget _finishView(Palette p) {
    final i = course.lessons.indexOf(lesson);
    final next = mode == PlayMode.lesson && i + 1 < course.lessons.length ? course.lessons[i + 1] : null;
    final exit = mode == PlayMode.mission ? '/' : '/course/${course.id}';
    final title = switch (mode) {
      PlayMode.lesson => t('done_title'),
      PlayMode.practice => t('practice_done'),
      PlayMode.mission => t('mission_done'),
    };
    final subtitle = mode == PlayMode.mission ? t('mission_sub') : '${lesson.icon}  ${tx(lesson.title, lang)}';
    final st = ref.watch(progressProvider).streak();
    Widget stat(String big, String small) => Expanded(
          child: Container(
            padding: const EdgeInsets.symmetric(vertical: 16),
            decoration: BoxDecoration(color: p.surface, borderRadius: BorderRadius.circular(16), border: Border.all(color: p.line, width: 2)),
            child: Column(children: [
              Text(big, style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w900)),
              Text(small, style: TextStyle(color: p.muted, fontSize: 13)),
            ]),
          ),
        );
    return SingleChildScrollView(
      padding: EdgeInsets.fromLTRB(24, 30, 24, 24 + MediaQuery.paddingOf(context).bottom),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 420),
          child: Column(children: [
            const DressedCelebration(size: 190),
            const SizedBox(height: 20),
            Text(title, textAlign: TextAlign.center, style: const TextStyle(fontSize: 30, fontWeight: FontWeight.w900)),
            const SizedBox(height: 4),
            Text(subtitle, textAlign: TextAlign.center, style: TextStyle(color: p.muted, fontSize: 17)),
            const SizedBox(height: 24),
            Row(children: [stat('$finalAcc%', t('first_try')), const SizedBox(width: 12), stat('🔥 $st', t('streak_label'))]),
            if (streakUp) Padding(padding: const EdgeInsets.only(top: 16), child: StreakBurst(streak: st, lang: lang)),
            if (mode == PlayMode.lesson && lesson.more.isNotEmpty) Padding(padding: const EdgeInsets.only(top: 16), child: _ReadMore(lesson: lesson, lang: lang, t: t)),
            if (mode == PlayMode.lesson && next == null) Padding(padding: const EdgeInsets.only(top: 20), child: Text(t('course_done'), textAlign: TextAlign.center, style: const TextStyle(fontSize: 17))),
            const SizedBox(height: 26),
            if (next != null) ChunkyButton(label: '${t('next_lesson')} →', onPressed: () => context.go('/lesson/${course.id}/${next.id}')),
            const SizedBox(height: 10),
            ChunkyButton(label: mode == PlayMode.mission ? t('back_home') : t('back'), kind: next == null ? ChunkyKind.primary : ChunkyKind.ghost, onPressed: () => context.go(exit)),
          ]),
        ),
      ),
    );
  }
}

/// "Para leer más": los capítulos del tema (en javascript.info, por ejemplo). Se abren en Safari.
class _ReadMore extends StatelessWidget {
  const _ReadMore({required this.lesson, required this.lang, required this.t});
  final Lesson lesson;
  final String lang;
  final Tr t;

  @override
  Widget build(BuildContext context) {
    final p = context.pal;
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 8),
      decoration: BoxDecoration(color: p.surface, borderRadius: BorderRadius.circular(16), border: Border.all(color: p.line, width: 2)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text('📖 ${t('read_more')}', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900)),
        const SizedBox(height: 4),
        for (final m in lesson.more)
          InkWell(
            onTap: () => launchUrl(Uri.parse(m['url'] as String), mode: LaunchMode.externalApplication),
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: Row(children: [
                Expanded(child: Text(tx(m['title'], lang), style: TextStyle(color: p.sel, fontSize: 16, fontWeight: FontWeight.w700))),
                Text(Uri.parse(m['url'] as String).host, style: TextStyle(color: p.faint, fontSize: 12)),
                const SizedBox(width: 4),
                Icon(Icons.open_in_new_rounded, size: 16, color: p.faint),
              ]),
            ),
          ),
      ]),
    );
  }
}
