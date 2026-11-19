import 'dart:async';
import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../data/progress.dart';
import 'i18n.dart';
import 'theme.dart';

/// El festejo cuando tu racha sube: la flama crece con rebote, el número sube y salen chispitas.
class StreakBurst extends StatefulWidget {
  const StreakBurst({super.key, required this.streak, required this.lang});
  final int streak;
  final String lang;
  @override
  State<StreakBurst> createState() => _StreakBurstState();
}

class _StreakBurstState extends State<StreakBurst> with SingleTickerProviderStateMixin {
  // Empieza después de la fanfarria de "lección completada".
  late final AnimationController a = AnimationController(vsync: this, duration: const Duration(milliseconds: 1400));
  Timer? _start;

  @override
  void initState() {
    super.initState();
    _start = Timer(const Duration(milliseconds: 1450), () {
      if (mounted) a.forward();
    });
  }

  @override
  void dispose() {
    _start?.cancel();
    a.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final p = context.pal;
    final t = translator(widget.lang);
    return AnimatedBuilder(
      animation: a,
      builder: (context, _) {
        final k = a.value;
        final pop = Curves.elasticOut.transform(math.min(1, k * 1.4));
        final shown = k < 0.45 ? math.max(0, widget.streak - 1) : widget.streak;
        return Opacity(
          opacity: math.min(1, k * 4),
          child: Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 18, horizontal: 16),
            decoration: BoxDecoration(
              gradient: LinearGradient(colors: [const Color(0xFFFFB648), p.accent], begin: Alignment.topLeft, end: Alignment.bottomRight),
              borderRadius: BorderRadius.circular(20),
              boxShadow: [BoxShadow(color: p.accentDeep, offset: const Offset(0, 5))],
            ),
            child: Stack(clipBehavior: Clip.none, alignment: Alignment.center, children: [
              // chispitas que salen volando
              for (var i = 0; i < 10; i++)
                Transform.translate(
                  offset: Offset.fromDirection(i / 10 * 2 * math.pi - math.pi / 2, 30 + 70 * Curves.easeOut.transform(k)),
                  child: Opacity(
                    opacity: (1 - k).clamp(0, 1),
                    child: Text(i.isEven ? '✦' : '•', style: TextStyle(color: Colors.white.withValues(alpha: 0.9), fontSize: i.isEven ? 16 : 12)),
                  ),
                ),
              Row(mainAxisSize: MainAxisSize.min, children: [
                Transform.scale(scale: 0.4 + 0.6 * pop, child: const Text('🔥', style: TextStyle(fontSize: 52))),
                const SizedBox(width: 12),
                Flexible(
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisSize: MainAxisSize.min, children: [
                    AnimatedSwitcher(
                      duration: const Duration(milliseconds: 250),
                      transitionBuilder: (c, anim) => ScaleTransition(scale: anim, child: c),
                      child: Text(t('streak_up', [shown == 0 ? 1 : shown]),
                          key: ValueKey(shown), style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w900)),
                    ),
                    Text(t('streak_up_sub'), style: TextStyle(color: Colors.white.withValues(alpha: 0.9), fontSize: 14, fontWeight: FontWeight.w600)),
                  ]),
                ),
              ]),
            ]),
          ),
        );
      },
    );
  }
}

/// La tira de los últimos 7 días, con flamita en los que estudiaste.
class WeekStrip extends StatelessWidget {
  const WeekStrip({super.key, required this.prog, required this.lang});
  final Progress prog;
  final String lang;

  @override
  Widget build(BuildContext context) {
    final p = context.pal;
    final letters = translator(lang)('week');
    final days = prog.lastWeek();
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        for (final (d, studied) in days)
          Column(children: [
            Text(letters[d.weekday - 1], style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: p.faint)),
            const SizedBox(height: 4),
            AnimatedContainer(
              duration: const Duration(milliseconds: 250),
              width: 34,
              height: 34,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: studied ? p.accentSoft : p.code,
                shape: BoxShape.circle,
                border: Border.all(
                  color: dayKey(d) == dayKey(DateTime.now()) ? p.accent : Colors.transparent,
                  width: 2,
                ),
              ),
              child: Text(studied ? '🔥' : '', style: const TextStyle(fontSize: 16)),
            ),
          ]),
      ],
    );
  }
}
