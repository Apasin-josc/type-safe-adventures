import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../data/closet.dart';
import '../data/mission.dart';
import '../data/models.dart';
import '../data/progress.dart';
import '../ui/chunky.dart';
import '../ui/dressed.dart';
import '../ui/i18n.dart';
import '../ui/salsa.dart';
import '../ui/sfx.dart';
import '../ui/streak.dart';
import '../ui/theme.dart';
import '../ui/top_bar.dart';
import '../ui/voice.dart';

/// Un curso que todavía no existe pero ya se ve en el menú.
class _Soon {
  const _Soon(this.icon, this.title, this.blurb);
  final String icon;
  final Map<String, String> title, blurb;
}

const _soon = [
  _Soon('🟢', {'es': 'Node.js', 'en': 'Node.js'}, {'es': 'El event loop, archivos, servidores y npm.', 'en': 'The event loop, files, servers and npm.'}),
  _Soon('⚛️', {'es': 'React', 'en': 'React'}, {'es': 'Componentes, estado y hooks, pensando en árboles.', 'en': 'Components, state and hooks, thinking in trees.'}),
];

/// Inicio: Salsa te saluda, ves tu semana y escoges qué curso estudiar hoy.
class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});
  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  SalsaMood mood = SalsaMood.idle;
  Timer? _calm;

  @override
  void dispose() {
    _calm?.cancel();
    super.dispose();
  }

  bool _checkedUnlocks = false;

  /// Si desbloqueaste algo para Salsa, te lo enseña una vez.
  void _maybeShowUnlock(Progress prog, Tr t, String lang) {
    if (_checkedUnlocks) return;
    _checkedUnlocks = true;
    final fresh = newUnlocks(prog);
    if (fresh.isEmpty) return;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      final n = ref.read(progressProvider.notifier);
      n.markSeen([for (final i in fresh) i.id]);
      sfx.play(Sfx.streak);
      voice.say(SalsaLine.hire, lang);
      final item = fresh.first;
      showDialog<void>(
        context: context,
        builder: (ctx) => AlertDialog(
          backgroundColor: context.pal.surface,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(22)),
          title: Text(t('unlock_title'), textAlign: TextAlign.center, style: const TextStyle(fontWeight: FontWeight.w900)),
          content: Column(mainAxisSize: MainAxisSize.min, children: [
            Text(item.icon, style: const TextStyle(fontSize: 56)),
            const SizedBox(height: 8),
            Text(item.title[lang] ?? item.title['es']!, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900)),
            if (fresh.length > 1) Text('+${fresh.length - 1}', style: TextStyle(color: context.pal.muted)),
          ]),
          actionsAlignment: MainAxisAlignment.center,
          actions: [
            TextButton(onPressed: () => Navigator.of(ctx).pop(), child: Text(t('unlock_later'))),
            FilledButton(
              onPressed: () {
                for (final i in fresh) {
                  n.equip(i.id, true);
                }
                Navigator.of(ctx).pop();
              },
              child: Text(t('unlock_wear')),
            ),
          ],
        ),
      );
    });
  }

  void _pet() {
    HapticFeedback.mediumImpact();
    sfx.correct(6);
    voice.say(SalsaLine.hello, ref.read(progressProvider).effectiveLang);
    setState(() => mood = SalsaMood.cheer);
    _calm?.cancel();
    _calm = Timer(const Duration(milliseconds: 2800), () {
      if (mounted) setState(() => mood = SalsaMood.idle);
    });
  }

  void _settings(BuildContext context) {
    showModalBottomSheet<void>(
      context: context,
      showDragHandle: true,
      backgroundColor: context.pal.surface,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => Consumer(builder: (ctx, ref, _) {
        final prog = ref.watch(progressProvider);
        final n = ref.read(progressProvider.notifier);
        final t = translator(prog.effectiveLang);
        final dark = Theme.of(context).brightness == Brightness.dark;
        Widget row(String icon, String label, bool value, ValueChanged<bool> onChanged) => SwitchListTile.adaptive(
              value: value,
              onChanged: (v) {
                HapticFeedback.selectionClick();
                onChanged(v);
              },
              title: Text('$icon  $label', style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w700)),
            );
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(8, 0, 8, 12),
            child: Column(mainAxisSize: MainAxisSize.min, children: [
              row('🔊', t('set_sound'), prog.sound, (v) {
                sfx.enabled = v;
                n.setSound(v);
              }),
              row('🗣️', t('set_voice'), prog.voice, (v) {
                voice.enabled = v;
                n.setVoice(v);
                if (v) voice.say(SalsaLine.hello, prog.effectiveLang);
              }),
              row('🌙', t('set_dark'), dark, (v) => n.setTheme(v ? 'dark' : 'light')),
              ListTile(
                title: Text('👕  ${t('closet')}', style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w700)),
                trailing: const Icon(Icons.chevron_right_rounded),
                onTap: () {
                  Navigator.of(ctx).pop();
                  context.go('/closet');
                },
              ),
            ]),
          ),
        );
      }),
    );
  }

  @override
  Widget build(BuildContext context) {
    final p = context.pal;
    final prog = ref.watch(progressProvider);
    final courses = ref.watch(coursesProvider);
    final lang = prog.effectiveLang;
    final t = translator(lang);
    final st = prog.streak();
    final notifier = ref.read(progressProvider.notifier);
    _maybeShowUnlock(prog, t, lang);

    return Scaffold(
      body: SafeArea(
        bottom: false,
        child: Column(children: [
          Container(
            padding: const EdgeInsets.fromLTRB(18, 8, 12, 10),
            decoration: BoxDecoration(border: Border(bottom: BorderSide(color: p.line))),
            child: Row(children: [
              Expanded(
                child: Text.rich(
                  TextSpan(children: [const TextSpan(text: 'Sauce'), TextSpan(text: 'Code', style: TextStyle(color: p.accent))]),
                  style: const TextStyle(fontSize: 23, fontWeight: FontWeight.w900, letterSpacing: -0.3),
                ),
              ),
              Pill(active: st > 0, child: Text('🔥 $st', style: TextStyle(fontWeight: FontWeight.w900, color: st > 0 ? p.accent : p.faint))),
              const SizedBox(width: 6),
              Pill(label: 'ES / EN', onTap: () => notifier.setLang(lang == 'es' ? 'en' : 'es'), child: Text(lang.toUpperCase(), style: const TextStyle(fontWeight: FontWeight.w900))),
              const SizedBox(width: 6),
              Pill(label: t('settings'), onTap: () => _settings(context), child: const Text('⚙️')),
            ]),
          ),
          Expanded(
            child: SingleChildScrollView(
              padding: EdgeInsets.fromLTRB(16, 18, 16, 40 + MediaQuery.paddingOf(context).bottom),
              child: Center(
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 560),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    // Salsa y su globito
                    Row(crossAxisAlignment: CrossAxisAlignment.end, children: [
                      GestureDetector(onTap: _pet, child: DressedSalsa(size: 150, mood: mood)),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Padding(
                          padding: const EdgeInsets.only(bottom: 54),
                          child: _Bubble(
                            title: st > 0 ? t('hello_back', [st]) : t('hello'),
                            sub: t('hello_sub'),
                          ),
                        ),
                      ),
                    ]),
                    const SizedBox(height: 14),
                    Container(
                      padding: const EdgeInsets.fromLTRB(14, 12, 14, 14),
                      decoration: BoxDecoration(color: p.surface, borderRadius: BorderRadius.circular(18), border: Border.all(color: p.line, width: 2)),
                      child: WeekStrip(prog: prog, lang: lang),
                    ),
                    const SizedBox(height: 14),
                    _MissionCard(prog: prog, courses: courses, t: t),
                    const SizedBox(height: 12),
                    _InterviewCard(prog: prog, t: t),
                    const SizedBox(height: 22),
                    Text(t('courses').toUpperCase(), style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800, letterSpacing: 1, color: p.faint)),
                    const SizedBox(height: 10),
                    for (final c in courses) _CourseCard(course: c, prog: prog, lang: lang, t: t),
                    for (final s in _soon) _SoonCard(soon: s, lang: lang, t: t),
                    const SizedBox(height: 10),
                    Center(child: Text(t('saved_here'), style: TextStyle(color: p.faint, fontSize: 13))),
                  ]),
                ),
              ),
            ),
          ),
        ]),
      ),
    );
  }
}

class _Bubble extends StatelessWidget {
  const _Bubble({required this.title, required this.sub});
  final String title, sub;
  @override
  Widget build(BuildContext context) {
    final p = context.pal;
    return CustomPaint(
      painter: _BubblePainter(p.surface, p.line),
      child: Padding(
        padding: const EdgeInsets.fromLTRB(14, 12, 14, 14),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(title, style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w900, height: 1.25)),
          const SizedBox(height: 4),
          Text(sub, style: TextStyle(fontSize: 14, color: p.muted, height: 1.3)),
        ]),
      ),
    );
  }
}

class _BubblePainter extends CustomPainter {
  _BubblePainter(this.fill, this.edge);
  final Color fill, edge;
  @override
  void paint(Canvas canvas, Size size) {
    final r = RRect.fromRectAndRadius(Offset.zero & size, const Radius.circular(16));
    final tail = Path()
      ..moveTo(0, size.height - 28)
      ..lineTo(-12, size.height - 10)
      ..lineTo(16, size.height - 14)
      ..close();
    final shape = Path.combine(PathOperation.union, Path()..addRRect(r), tail);
    canvas.drawPath(shape, Paint()..color = fill);
    canvas.drawPath(
      shape,
      Paint()
        ..color = edge
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2,
    );
  }

  @override
  bool shouldRepaint(_BubblePainter old) => old.fill != fill || old.edge != edge;
}

class _CourseCard extends StatelessWidget {
  const _CourseCard({required this.course, required this.prog, required this.lang, required this.t});
  final Course course;
  final Progress prog;
  final String lang;
  final Tr t;

  @override
  Widget build(BuildContext context) {
    final p = context.pal;
    final done = course.lessons.where((l) => prog.isDone(course, l)).length;
    final total = course.lessons.length;
    final next = course.lessons.where((l) => !prog.isDone(course, l)).firstOrNull;
    final (ca, cb, cs) = courseColors(course.colors, p);
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: GestureDetector(
        onTap: () {
          HapticFeedback.selectionClick();
          sfx.play(Sfx.tap);
          context.go('/course/${course.id}');
        },
        child: Container(
          padding: const EdgeInsets.fromLTRB(18, 16, 18, 16),
          decoration: BoxDecoration(
            gradient: LinearGradient(colors: [ca, cb], begin: Alignment.topLeft, end: Alignment.bottomRight),
            borderRadius: BorderRadius.circular(20),
            boxShadow: [BoxShadow(color: cs, offset: const Offset(0, 5))],
          ),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [
              Text(course.icon ?? course.lessons.first.icon, style: const TextStyle(fontSize: 30)),
              const SizedBox(width: 12),
              Expanded(
                child: Text(tx(course.title, lang), style: const TextStyle(color: Colors.white, fontSize: 21, fontWeight: FontWeight.w900, height: 1.15)),
              ),
            ]),
            const SizedBox(height: 8),
            Text(tx(course.blurb, lang), maxLines: 2, overflow: TextOverflow.ellipsis, style: TextStyle(color: Colors.white.withValues(alpha: 0.88), fontSize: 14, height: 1.35)),
            const SizedBox(height: 14),
            Row(children: [
              Expanded(
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(99),
                  child: LinearProgressIndicator(
                    value: done / total,
                    minHeight: 9,
                    backgroundColor: Colors.white.withValues(alpha: 0.28),
                    valueColor: const AlwaysStoppedAnimation(Colors.white),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Text(t('lessons_of', [done, total]), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 13)),
            ]),
            const SizedBox(height: 14),
            ChunkyButton(
              label: next == null ? t('review') : (done == 0 ? t('start_course') : '${t('continue')}: ${next.icon} ${tx(next.title, lang)}'),
              color: Colors.white,
              textColor: cb,
              shadowColor: cs,
              onPressed: () => context.go('/course/${course.id}'),
            ),
          ]),
        ),
      ),
    );
  }
}

class _SoonCard extends StatelessWidget {
  const _SoonCard({required this.soon, required this.lang, required this.t});
  final _Soon soon;
  final String lang;
  final Tr t;

  @override
  Widget build(BuildContext context) {
    final p = context.pal;
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Tile(
        onTap: () => ScaffoldMessenger.of(context)
          ..hideCurrentSnackBar()
          ..showSnackBar(SnackBar(content: Text(t('soon_course')), behavior: SnackBarBehavior.floating)),
        padding: const EdgeInsets.fromLTRB(16, 14, 16, 14),
        radius: 18,
        child: Row(children: [
          Text(soon.icon, style: const TextStyle(fontSize: 28)),
          const SizedBox(width: 12),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(tx(soon.title, lang), style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w900)),
              const SizedBox(height: 2),
              Text(tx(soon.blurb, lang), style: TextStyle(fontSize: 13.5, color: p.muted, height: 1.3)),
            ]),
          ),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
            decoration: BoxDecoration(color: p.code, borderRadius: BorderRadius.circular(99)),
            child: Text(t('coming_soon'), style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.w800, color: p.faint)),
          ),
        ]),
      ),
    );
  }
}

/// La misión del día: 3 preguntas de repaso. Las que fallaste van primero.
class _MissionCard extends StatelessWidget {
  const _MissionCard({required this.prog, required this.courses, required this.t});
  final Progress prog;
  final List<Course> courses;
  final Tr t;

  @override
  Widget build(BuildContext context) {
    final p = context.pal;
    final mission = buildMission(courses, prog);
    final today = dayNumber(DateTime.now());
    final due = prog.missed.values.where((r) => r.due <= today).length;
    final won = prog.missionDoneToday;
    final locked = mission.isEmpty;
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 16),
      decoration: BoxDecoration(
        color: won ? p.goodSoft : p.surface,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: won ? p.good : p.accent, width: 2),
        boxShadow: [BoxShadow(color: won ? p.good : p.accentSoft, offset: const Offset(0, 4))],
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Text(won ? '🏆' : '🎯', style: const TextStyle(fontSize: 28)),
          const SizedBox(width: 10),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(t('mission'), style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900)),
              Text(
                won ? t('mission_won') : locked ? t('mission_locked') : (due > 0 ? t('mission_due', [due]) : t('mission_desc', [mission.length])),
                style: TextStyle(fontSize: 13.5, color: won ? p.good : p.muted, fontWeight: FontWeight.w600, height: 1.3),
              ),
            ]),
          ),
        ]),
        if (!won && !locked) ...[
          const SizedBox(height: 12),
          ChunkyButton(label: t('mission_go'), onPressed: () => context.go('/mission')),
        ],
      ]),
    );
  }
}

/// El modo entrevista: un problema con cronómetro, sin pistas, y la pregunta de complejidad.
class _InterviewCard extends StatelessWidget {
  const _InterviewCard({required this.prog, required this.t});
  final Progress prog;
  final Tr t;

  @override
  Widget build(BuildContext context) {
    final p = context.pal;
    final hires = prog.interviews.where((v) => v != 'no').length;
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 16),
      decoration: BoxDecoration(
        color: p.surface,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: p.sel, width: 2),
        boxShadow: [BoxShadow(color: p.selSoft, offset: const Offset(0, 4))],
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          const Text('🎤', style: TextStyle(fontSize: 28)),
          const SizedBox(width: 10),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(t('interview'), style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900)),
              Text(prog.interviews.isEmpty ? t('interview_desc') : t('interview_record', [hires, prog.interviews.length]),
                  style: TextStyle(fontSize: 13.5, color: p.muted, fontWeight: FontWeight.w600, height: 1.3)),
            ]),
          ),
        ]),
        const SizedBox(height: 12),
        ChunkyButton(label: t('interview_go'), color: p.sel, textColor: Colors.white, shadowColor: p.sel.withValues(alpha: 0.6), onPressed: () => context.go('/interview')),
      ]),
    );
  }
}
