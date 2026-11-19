import 'dart:async';
import 'dart:math' as math;
import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../data/models.dart';
import '../data/progress.dart';
import '../ui/chunky.dart';
import '../ui/i18n.dart';
import '../ui/salsa.dart';
import '../ui/sfx.dart';
import '../ui/theme.dart';
import '../ui/top_bar.dart';

const _gap = 132.0; // distancia vertical entre paradas
const _top = 118.0;

/// El camino de un curso: la carretera con sus paradas y Salsa esperándote en la que te toca.
class CourseScreen extends ConsumerStatefulWidget {
  const CourseScreen({super.key, required this.courseId});
  final String courseId;
  @override
  ConsumerState<CourseScreen> createState() => _CourseScreenState();
}

class _CourseScreenState extends ConsumerState<CourseScreen> {
  final scroll = ScrollController();
  final currentKey = GlobalKey();
  bool focused = false;

  @override
  void dispose() {
    scroll.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final p = context.pal;
    final prog = ref.watch(progressProvider);
    final courses = ref.watch(coursesProvider);
    final n = courses.indexWhere((c) => c.id == widget.courseId);
    if (n == -1) return const SizedBox();
    final course = courses[n];
    final lang = prog.effectiveLang;
    final t = translator(lang);
    final st = prog.streak();

    // La primera vez, centra la pantalla en la lección que te toca.
    if (!focused) {
      focused = true;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        final ctx = currentKey.currentContext;
        if (ctx != null) Scrollable.ensureVisible(ctx, alignment: 0.45);
      });
    }

    return Scaffold(
      body: SafeArea(
        bottom: false,
        child: Column(children: [
          // Barra de arriba: fija.
          Container(
            padding: const EdgeInsets.fromLTRB(4, 6, 12, 8),
            decoration: BoxDecoration(border: Border(bottom: BorderSide(color: p.line))),
            child: Row(children: [
              IconButton(
                onPressed: () => context.go('/'),
                icon: Icon(Icons.arrow_back_ios_new_rounded, color: p.ink, size: 22),
                tooltip: lang == 'es' ? 'Cursos' : 'Courses',
              ),
              Expanded(
                child: Text(tx(course.title, lang),
                    maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900)),
              ),
              Pill(active: st > 0, child: Text('🔥 $st', style: TextStyle(fontWeight: FontWeight.w900, color: st > 0 ? p.accent : p.faint))),
            ]),
          ),
          Expanded(
            child: SingleChildScrollView(
              controller: scroll,
              padding: EdgeInsets.fromLTRB(16, 16, 16, 40 + MediaQuery.paddingOf(context).bottom),
              child: Center(
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 560),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    // Una banda y un tramo de camino por unidad; lo que viene "pronto" va al final.
                    for (var u = 0; u < course.unitCount; u++) ...[
                      if (u > 0) const SizedBox(height: 10),
                      _Banner(course: course, number: u + 1, prog: prog, lang: lang, t: t),
                      if (u == 0)
                        Padding(
                          padding: const EdgeInsets.fromLTRB(2, 16, 2, 0),
                          child: Text(tx(course.blurb, lang), style: TextStyle(color: p.muted, fontSize: 15.5, height: 1.4)),
                        ),
                      _CourseMap(course: course, unit: u, showSoon: u == course.unitCount - 1, prog: prog, lang: lang, t: t, currentKey: currentKey),
                    ],
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

class _Banner extends StatelessWidget {
  const _Banner({required this.course, required this.number, required this.prog, required this.lang, required this.t});
  final Course course;
  final int number;
  final Progress prog;
  final String lang;
  final Tr t;

  @override
  Widget build(BuildContext context) {
    final p = context.pal;
    final unitLessons = course.lessons.where((l) => l.unit == number - 1).toList();
    final done = unitLessons.where((l) => prog.isDone(course, l)).length;
    final unitName = course.unitTitle(number - 1);
    final (ca, cb, cs) = courseColors(course.colors, p);
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(18, 14, 18, 16),
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: [ca, cb], begin: Alignment.topLeft, end: Alignment.bottomRight),
        borderRadius: BorderRadius.circular(18),
        boxShadow: [BoxShadow(color: cs, offset: const Offset(0, 5))],
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text('${t('unit').toUpperCase()} $number${unitName == null ? '' : ' · ${tx(unitName, lang).toUpperCase()}'}',
            style: TextStyle(color: Colors.white.withValues(alpha: 0.85), fontSize: 12, fontWeight: FontWeight.w800, letterSpacing: 1.2)),
        const SizedBox(height: 2),
        Text(tx(course.title, lang), style: const TextStyle(color: Colors.white, fontSize: 25, fontWeight: FontWeight.w900, height: 1.15, letterSpacing: -0.3)),
        const SizedBox(height: 12),
        Row(children: [
          Expanded(
            child: ClipRRect(
              borderRadius: BorderRadius.circular(99),
              child: LinearProgressIndicator(
                value: unitLessons.isEmpty ? 0 : done / unitLessons.length,
                minHeight: 10,
                backgroundColor: Colors.white.withValues(alpha: 0.28),
                valueColor: const AlwaysStoppedAnimation(Colors.white),
              ),
            ),
          ),
          const SizedBox(width: 10),
          Text('$done/${unitLessons.length}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900)),
        ]),
      ]),
    );
  }
}

/// Una parada del camino: una lección (o una que viene pronto).
class _Stop {
  _Stop({required this.icon, required this.title, this.lesson, this.index = -1, this.state = 'soon'});
  final String icon;
  final String title;
  final Lesson? lesson;
  final int index;
  final String state; // 'done' | 'open' | 'locked' | 'soon'
}

class _CourseMap extends ConsumerStatefulWidget {
  const _CourseMap({required this.course, required this.unit, required this.showSoon, required this.prog, required this.lang, required this.t, this.currentKey});
  final Course course;
  final int unit;
  final bool showSoon;
  final Progress prog;
  final String lang;
  final Tr t;
  final GlobalKey? currentKey;
  @override
  ConsumerState<_CourseMap> createState() => _CourseMapState();
}

class _CourseMapState extends ConsumerState<_CourseMap> with SingleTickerProviderStateMixin {
  late final AnimationController hop = AnimationController(vsync: this, duration: const Duration(milliseconds: 900));
  Hop? pending;
  bool landed = true;
  Timer? _start;

  @override
  void initState() {
    super.initState();
    final h = widget.prog.hop;
    final mine = [for (var i = 0; i < widget.course.lessons.length; i++) if (widget.course.lessons[i].unit == widget.unit) i];
    if (h != null && h.course == widget.course.id && mine.contains(h.to)) {
      // Acabas de terminar una lección: Salsa salta de esa a la siguiente.
      pending = h;
      landed = false;
      WidgetsBinding.instance.addPostFrameCallback((_) => ref.read(progressProvider.notifier).clearHop());
      _start = Timer(const Duration(milliseconds: 450), () {
        if (!mounted) return;
        HapticFeedback.lightImpact();
        sfx.play(Sfx.hop);
        hop.forward().whenComplete(() {
          if (!mounted) return;
          HapticFeedback.mediumImpact();
          sfx.play(Sfx.land);
          sfx.play(Sfx.unlock, volume: 0.8);
          setState(() => landed = true);
        });
      });
    }
  }

  @override
  void dispose() {
    _start?.cancel();
    hop.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final p = context.pal;
    final c = widget.course;
    final prog = widget.prog;
    final lang = widget.lang;
    final mine = [for (var i = 0; i < c.lessons.length; i++) if (c.lessons[i].unit == widget.unit) i];
    final stops = <_Stop>[
      for (final i in mine)
        _Stop(
          icon: c.lessons[i].icon,
          title: tx(c.lessons[i].title, lang),
          lesson: c.lessons[i],
          index: i,
          state: prog.isDone(c, c.lessons[i]) ? 'done' : prog.isOpen(c, i) ? 'open' : 'locked',
        ),
      if (widget.showSoon) for (final s in c.soon) _Stop(icon: s.icon, title: tx(s.title, lang)),
    ];
    final firstOpen = c.lessons.indexWhere((l) => !prog.isDone(c, l));
    final hereGlobal = firstOpen == -1 ? c.lessons.length - 1 : firstOpen;
    // Salsa solo aparece en el tramo de la unidad donde está tu lección.
    final here = mine.indexOf(hereGlobal);
    final unitDone = mine.every((i) => prog.isDone(c, c.lessons[i]));
    final roadUpTo = here >= 0 ? here : (unitDone ? mine.length - 1 : 0);

    return LayoutBuilder(builder: (context, box) {
      final w = box.maxWidth;
      final amp = math.min(92.0, w * 0.24);
      final pos = [for (var i = 0; i < stops.length; i++) Offset(w / 2 + math.sin(i * 1.1) * amp, _top + i * _gap)];
      final h = pos.last.dy + 90;
      final reduce = MediaQuery.maybeDisableAnimationsOf(context) ?? false;

      return SizedBox(
        height: h,
        child: Stack(clipBehavior: Clip.none, children: [
          Positioned.fill(child: CustomPaint(painter: _RoadPainter(pos, roadUpTo, p))),
          for (var i = 0; i < stops.length; i++) ..._stop(context, stops[i], pos[i], w, current: stops[i].index == hereGlobal && firstOpen != -1),
          if (here >= 0)
          // Salsa
          AnimatedBuilder(
            animation: hop,
            builder: (context, _) {
              var at = pos[here];
              var mood = SalsaMood.idle;
              final hp = pending;
              final fromLocal = hp == null ? -1 : mine.indexOf(hp.from);
              if (hp != null && !landed && !reduce && fromLocal >= 0 && hp.to == hereGlobal) {
                final from = pos[fromLocal];
                final k = hop.value;
                final e = Curves.easeInOut.transform(k);
                at = Offset(from.dx + (pos[here].dx - from.dx) * e, from.dy + (pos[here].dy - from.dy) * e - math.sin(math.pi * k) * 90);
                mood = k > 0 && k < 1 ? SalsaMood.jump : SalsaMood.idle;
              }
              // Mira hacia donde va: la siguiente parada (o hacia donde salta).
              final nextX = hp != null && !landed && fromLocal >= 0 ? pos[here].dx - pos[fromLocal].dx : (here + 1 < pos.length ? pos[here + 1].dx - pos[here].dx : 0.0);
              const w = 92.0;
              return Positioned(
                left: at.dx - w / 2,
                top: at.dy - 44 - w * SalsaPainter.vh / SalsaPainter.vw + 10,
                child: IgnorePointer(child: Salsa(size: w, mood: mood, flip: nextX < -1)),
              );
            },
          ),
        ]),
      );
    });
  }

  List<Widget> _stop(BuildContext context, _Stop s, Offset at, double w, {required bool current}) {
    final p = context.pal;
    final size = current ? 88.0 : 76.0;
    final right = at.dx < w / 2 + 4; // la etiqueta va del lado con más espacio
    final room = right ? w - at.dx - 58 : at.dx - 58;
    final key = s.lesson == null ? null : widget.course.keyOf(s.lesson!);
    final sub = switch (s.state) {
      'done' => '✓ ${widget.prog.done[key]!.acc}%',
      'soon' => widget.t('soon_badge'),
      _ => current ? widget.t('start') : '',
    };
    final subColor = s.state == 'done' ? p.good : current ? p.accent : p.faint;
    final locked = s.state == 'locked' || s.state == 'soon';
    final (fill, shadow, ring) = switch (s.state) {
      'done' => (p.accent, p.accentDeep, p.accent),
      'open' => (current ? p.accent : p.surface, current ? p.accentDeep : p.line, p.accent),
      _ => (p.code, p.line, p.line),
    };
    final offset = current ? 64.0 : 52.0;
    return [
      Positioned(
        left: at.dx - size / 2,
        top: at.dy - size / 2,
        child: GestureDetector(
          key: current ? widget.currentKey : null,
          onTap: () {
            HapticFeedback.selectionClick();
            _openStop(context, s);
          },
          child: Container(
            width: size,
            height: size,
            decoration: BoxDecoration(
              color: fill,
              shape: BoxShape.circle,
              border: Border.all(color: s.state == 'open' && !current ? ring : Colors.transparent, width: 4),
              boxShadow: [
                if (current) BoxShadow(color: p.accentSoft, spreadRadius: 11),
                if (current) BoxShadow(color: p.bg, spreadRadius: 7),
                BoxShadow(color: shadow, offset: const Offset(0, 7)),
              ],
            ),
            child: Stack(clipBehavior: Clip.none, alignment: Alignment.center, children: [
              Opacity(opacity: locked ? 0.4 : 1, child: Text(s.icon, style: TextStyle(fontSize: current ? 36 : 30))),
              if (s.state != 'open')
                Positioned(
                  right: -4,
                  bottom: -4,
                  child: Container(
                    width: 26,
                    height: 26,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: s.state == 'done' ? p.good : p.surface,
                      shape: BoxShape.circle,
                      border: Border.all(color: s.state == 'done' ? p.surface : p.line, width: 2),
                    ),
                    child: Text(s.state == 'done' ? '✓' : '🔒', style: TextStyle(fontSize: s.state == 'done' ? 13 : 11, color: Colors.white, fontWeight: FontWeight.w900)),
                  ),
                ),
            ]),
          ),
        ),
      ),
      Positioned(
        top: at.dy - 32,
        height: 64,
        left: right ? at.dx + offset : null,
        right: right ? null : w - at.dx + offset,
        width: math.max(90, math.min(170, room)),
        child: IgnorePointer(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: right ? CrossAxisAlignment.start : CrossAxisAlignment.end,
            children: [
              Text(s.title,
                  textAlign: right ? TextAlign.left : TextAlign.right,
                  maxLines: 2,
                  style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15.5, height: 1.2, color: locked ? p.faint : p.ink)),
              if (sub.isNotEmpty) Text(sub, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: subColor)),
            ],
          ),
        ),
      ),
    ];
  }

  void _openStop(BuildContext context, _Stop s) {
    final p = context.pal;
    final t = widget.t;
    final lang = widget.lang;
    final c = widget.course;
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: p.surface,
      showDragHandle: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) {
        final l = s.lesson;
        final open = l != null && (s.state == 'done' || s.state == 'open');
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(22, 0, 22, 18),
            child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(children: [
                Text(s.icon, style: const TextStyle(fontSize: 40)),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    if (l != null)
                      Text('${t('lesson').toUpperCase()} ${s.index + 1}',
                          style: TextStyle(color: p.accent, fontWeight: FontWeight.w800, fontSize: 12, letterSpacing: 1)),
                    Text(s.title, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900, height: 1.2)),
                  ]),
                ),
              ]),
              const SizedBox(height: 12),
              if (l == null) Text(t('pop_soon'), style: TextStyle(color: p.muted, fontSize: 16)),
              if (l != null) ...[
                Text(tx(l.blurb, lang), style: TextStyle(color: p.muted, fontSize: 16, height: 1.4)),
                const SizedBox(height: 6),
                Text(
                  s.state == 'done' ? '${t('first_try')}: ${widget.prog.done[c.keyOf(l)]!.acc}%' : '${l.steps.length} ${t('screens')}',
                  style: TextStyle(color: p.faint, fontSize: 14, fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 18),
                if (open) ...[
                  ChunkyButton(
                    label: s.state == 'done' ? t('review') : t('start'),
                    onPressed: () {
                      Navigator.of(ctx).pop();
                      context.go('/lesson/${c.id}/${l.id}');
                    },
                  ),
                  if (s.state == 'done') ...[
                    const SizedBox(height: 10),
                    ChunkyButton(
                      label: '🔀 ${t('practice')}',
                      kind: ChunkyKind.ghost,
                      onPressed: () {
                        Navigator.of(ctx).pop();
                        context.go('/practice/${c.id}/${l.id}');
                      },
                    ),
                  ],
                ]
                else
                  Text('🔒 ${t('pop_locked', [tx(c.lessons[s.index - 1].title, lang)])}', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
              ],
            ]),
          ),
        );
      },
    );
  }
}

/// La carretera: una curva que une las paradas, con rayitas al centro.
/// Lo recorrido (hasta la lección que te toca) va de color.
class _RoadPainter extends CustomPainter {
  _RoadPainter(this.pos, this.here, this.p);
  final List<Offset> pos;
  final int here;
  final Palette p;

  Path _through(List<Offset> pts) {
    final path = Path();
    if (pts.isEmpty) return path;
    path.moveTo(pts.first.dx, pts.first.dy);
    for (var k = 1; k < pts.length; k++) {
      final a = pts[k - 1], b = pts[k];
      path.cubicTo(a.dx, a.dy + _gap * 0.55, b.dx, b.dy - _gap * 0.55, b.dx, b.dy);
    }
    return path;
  }

  @override
  void paint(Canvas canvas, Size size) {
    final road = Paint()
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeWidth = 20;
    final all = _through(pos);
    canvas.drawPath(all, road..color = p.line);
    // Rayitas
    final lane = Paint()
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeWidth = 2.5
      ..color = p.bg;
    for (final ui.PathMetric m in all.computeMetrics()) {
      for (var d = 0.0; d < m.length; d += 14) {
        canvas.drawPath(m.extractPath(d, d + 2), lane);
      }
    }
    if (here > 0) canvas.drawPath(_through(pos.sublist(0, here + 1)), road..color = p.accent.withValues(alpha: 0.9));
  }

  @override
  bool shouldRepaint(_RoadPainter old) => old.here != here || old.pos.length != pos.length || old.p != p || old.pos.first != pos.first;
}
