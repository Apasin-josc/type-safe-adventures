import 'dart:async';
import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../data/mission.dart';
import '../data/progress.dart';
import '../steps/code_step.dart';
import '../steps/common.dart';
import '../ui/chunky.dart';
import '../ui/dressed.dart';
import '../ui/i18n.dart';
import '../ui/rich.dart';
import '../ui/sfx.dart';
import '../ui/theme.dart';
import '../ui/voice.dart';

const _options = ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n²)'];
const _minutes = 15;

enum _Phase { intro, coding, complexity, result }

/// Modo entrevista: un problema con cronómetro y sin pistas. Al entregar, Salsa te pregunta la
/// complejidad en tiempo y espacio, y te da un veredicto como en una entrevista de verdad.
class InterviewScreen extends ConsumerStatefulWidget {
  const InterviewScreen({super.key});
  @override
  ConsumerState<InterviewScreen> createState() => _InterviewScreenState();
}

class _InterviewScreenState extends ConsumerState<InterviewScreen> {
  late final String lang = ref.read(progressProvider).effectiveLang;
  late final Tr t = translator(lang);
  final _rnd = math.Random();

  _Phase phase = _Phase.intro;
  late StepRef problem = _pick();
  StepController? ctl;
  Timer? timer;
  int secondsLeft = _minutes * 60;
  DateTime? startedAt;
  int usedSeconds = 0;
  bool testsOk = false;
  bool submitting = false;
  String? time, space;
  String verdict = 'no';

  /// Un reto de código que tenga su complejidad marcada, de cualquier curso.
  StepRef _pick() {
    final pool = [
      for (final c in ref.read(coursesProvider))
        for (final l in c.lessons)
          for (var i = 0; i < l.steps.length; i++)
            if (l.steps[i]['type'] == 'code' && l.steps[i]['complexity'] != null) StepRef(c, l, i),
    ];
    return pool[_rnd.nextInt(pool.length)];
  }

  void _start() {
    // Sin pistas ni solución: es una entrevista.
    final step = Map<String, dynamic>.from(problem.step)
      ..remove('hint')
      ..remove('solution');
    ctl?.dispose();
    ctl = StepController(step: step, lang: lang)..interview = true;
    secondsLeft = _minutes * 60;
    startedAt = DateTime.now();
    timer?.cancel();
    timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (!mounted) return;
      setState(() => secondsLeft--);
      if (secondsLeft <= 0) _submit(); // se acabó el tiempo
    });
    HapticFeedback.mediumImpact();
    setState(() => phase = _Phase.coding);
  }

  Future<void> _submit() async {
    if (submitting || phase != _Phase.coding) return;
    submitting = true;
    timer?.cancel();
    FocusScope.of(context).unfocus();
    final r = await ctl!.onCheck!();
    if (!mounted) return;
    usedSeconds = DateTime.now().difference(startedAt!).inSeconds.clamp(0, _minutes * 60);
    setState(() {
      testsOk = r.ok;
      submitting = false;
      phase = _Phase.complexity;
    });
  }

  void _grade() {
    final want = problem.step['complexity'] as Map;
    final right = (time == want['time'] ? 1 : 0) + (space == want['space'] ? 1 : 0);
    verdict = testsOk && right == 2 ? 'strong' : (testsOk && right == 1 ? 'hire' : 'no');
    ref.read(progressProvider.notifier).recordInterview(verdict);
    if (verdict == 'no') {
      sfx.play(Sfx.wrong);
      voice.say(SalsaLine.wrong, lang);
    } else {
      sfx.play(Sfx.complete);
      Future.delayed(const Duration(milliseconds: 1200), () => voice.say(SalsaLine.hire, lang));
    }
    HapticFeedback.mediumImpact();
    setState(() => phase = _Phase.result);
  }

  void _again() {
    setState(() {
      problem = _pick();
      time = space = null;
      phase = _Phase.intro;
    });
  }

  @override
  void dispose() {
    timer?.cancel();
    ctl?.dispose();
    super.dispose();
  }

  String _clock(int s) => '${(s ~/ 60).toString().padLeft(2, '0')}:${(s % 60).toString().padLeft(2, '0')}';

  @override
  Widget build(BuildContext context) {
    final p = context.pal;
    return Scaffold(
      body: SafeArea(
        child: Column(children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(6, 6, 16, 6),
            child: Row(children: [
              IconButton(onPressed: () => context.go('/'), icon: Icon(Icons.close_rounded, color: p.muted, size: 28)),
              Expanded(child: Text('🎤 ${t('interview')}', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900))),
              if (phase == _Phase.coding)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: secondsLeft < 120 ? p.badSoft : p.surface,
                    borderRadius: BorderRadius.circular(99),
                    border: Border.all(color: secondsLeft < 120 ? p.bad : p.line, width: 2),
                  ),
                  child: Text('⏱ ${_clock(secondsLeft)}',
                      style: monoStyle(size: 16, color: secondsLeft < 120 ? p.bad : p.ink, weight: FontWeight.w800)),
                ),
            ]),
          ),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
              keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
              child: Center(
                child: ConstrainedBox(constraints: const BoxConstraints(maxWidth: 640), child: _body(p)),
              ),
            ),
          ),
          if (phase == _Phase.coding)
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 12),
              child: ChunkyButton(label: submitting ? '…' : t('iv_submit'), onPressed: submitting ? null : _submit),
            ),
        ]),
      ),
    );
  }

  Widget _body(Palette p) {
    switch (phase) {
      case _Phase.intro:
        return Column(children: [
          const SizedBox(height: 12),
          const DressedSalsa(size: 170),
          const SizedBox(height: 14),
          Text(t('iv_title'), textAlign: TextAlign.center, style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w900)),
          const SizedBox(height: 12),
          for (final rule in [t('iv_rule1', [_minutes]), t('iv_rule2'), t('iv_rule3')])
            Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text('•  ', style: TextStyle(color: p.accent, fontSize: 18, fontWeight: FontWeight.w900)),
                Expanded(child: Rich(rule, style: TextStyle(fontSize: 16.5, color: p.muted))),
              ]),
            ),
          const SizedBox(height: 8),
          Text('${problem.lesson.icon}  ${tx(problem.lesson.title, lang)}',
              style: TextStyle(color: p.faint, fontWeight: FontWeight.w800)),
          const SizedBox(height: 20),
          ChunkyButton(label: t('iv_start'), onPressed: _start),
        ]);
      case _Phase.coding:
        return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Rich(tx(problem.step['prompt'], lang), style: const TextStyle(fontSize: 18, height: 1.4)),
          const SizedBox(height: 16),
          CodeStep(ctl!, key: ValueKey(problem.key)),
        ]);
      case _Phase.complexity:
        return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            const DressedSalsa(size: 90),
            const SizedBox(width: 10),
            Expanded(child: Rich(t('iv_ask'), style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, height: 1.3))),
          ]),
          const SizedBox(height: 10),
          Text(testsOk ? t('iv_tests_ok') : t('iv_tests_ko'), style: TextStyle(color: testsOk ? p.good : p.bad, fontWeight: FontWeight.w800)),
          SmallLabel(t('iv_time')),
          _choices(p, time, (v) => setState(() => time = v)),
          SmallLabel(t('iv_space')),
          _choices(p, space, (v) => setState(() => space = v)),
          const SizedBox(height: 20),
          ChunkyButton(label: t('iv_grade'), onPressed: time != null && space != null ? _grade : null),
        ]);
      case _Phase.result:
        final want = problem.step['complexity'] as Map;
        final (title, sub) = switch (verdict) {
          'strong' => (t('iv_strong'), t('iv_strong_sub')),
          'hire' => (t('iv_hire'), t('iv_hire_sub')),
          _ => (t('iv_no'), t('iv_no_sub')),
        };
        Widget fact(String label, String value, bool ok) => Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Row(children: [
                Text(ok ? '✅' : '❌', style: const TextStyle(fontSize: 16)),
                const SizedBox(width: 10),
                Expanded(child: Text(label, style: TextStyle(color: p.muted, fontSize: 15))),
                Text(value, style: monoStyle(size: 15, color: p.ink, weight: FontWeight.w800)),
              ]),
            );
        return Column(children: [
          if (verdict == 'no') const DressedSalsa(size: 150) else const DressedCelebration(size: 170),
          const SizedBox(height: 12),
          Text(title, textAlign: TextAlign.center, style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w900)),
          const SizedBox(height: 6),
          Text(sub, textAlign: TextAlign.center, style: TextStyle(color: p.muted, fontSize: 16)),
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 8),
            decoration: BoxDecoration(color: p.surface, borderRadius: BorderRadius.circular(16), border: Border.all(color: p.line, width: 2)),
            child: Column(children: [
              fact(t('iv_r_tests'), testsOk ? '✓' : '✗', testsOk),
              fact(t('iv_r_time'), '${time ?? '—'} → ${want['time']}', time == want['time']),
              fact(t('iv_r_space'), '${space ?? '—'} → ${want['space']}', space == want['space']),
              fact(t('iv_r_clock'), _clock(usedSeconds), usedSeconds < _minutes * 60),
            ]),
          ),
          const SizedBox(height: 22),
          ChunkyButton(label: t('iv_again'), onPressed: _again),
          const SizedBox(height: 10),
          ChunkyButton(label: t('back_home'), kind: ChunkyKind.ghost, onPressed: () => context.go('/')),
        ]);
    }
  }

  Widget _choices(Palette p, String? value, ValueChanged<String> onPick) => Wrap(spacing: 8, runSpacing: 8, children: [
        for (final o in _options)
          Tile(
            state: value == o ? 'sel' : null,
            onTap: () => onPick(o),
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
            child: Text(o, style: monoStyle(size: 15, color: p.ink, weight: FontWeight.w800)),
          ),
      ]);
}
