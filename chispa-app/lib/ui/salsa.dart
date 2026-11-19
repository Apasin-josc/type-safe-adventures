import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';

import 'salsa_painter.dart';

export 'salsa_painter.dart' show SalsaPainter, SalsaPose;

enum SalsaMood { idle, jump, cheer }

/// Salsa, la galga, animada. Respira, parpadea y menea la cola mientras espera; recoge las patas
/// al saltar y brinca con la lengua de fuera cuando festeja. Todo se calcula con el reloj de la
/// pantalla, así que se mueve a 60 o 120 cuadros por segundo sin saltos.
class Salsa extends StatefulWidget {
  const Salsa({super.key, this.size = 90, this.mood = SalsaMood.idle, this.flip = false});

  /// Ancho en pixeles. El alto sale solo (120 × 100).
  final double size;
  final SalsaMood mood;
  final bool flip; // mirando a la izquierda

  @override
  State<Salsa> createState() => _SalsaState();
}

class _SalsaState extends State<Salsa> with SingleTickerProviderStateMixin {
  late final Ticker _ticker;
  final _time = ValueNotifier<double>(0);
  double _cheerStart = 0;
  final double _seed = math.Random().nextDouble() * 10; // cada Salsa parpadea a su ritmo

  @override
  void initState() {
    super.initState();
    _ticker = createTicker((d) => _time.value = d.inMicroseconds / 1e6)..start();
  }

  @override
  void didUpdateWidget(Salsa old) {
    super.didUpdateWidget(old);
    if (widget.mood == SalsaMood.cheer && old.mood != SalsaMood.cheer) _cheerStart = _time.value;
  }

  @override
  void dispose() {
    _ticker.dispose();
    _time.dispose();
    super.dispose();
  }

  static double _bump(double x) => x <= 0 || x >= 1 ? 0 : math.sin(math.pi * x);

  (SalsaPose, double) _pose(double t, bool reduce) {
    if (reduce) return (const SalsaPose(ear: 0.2), 0);
    final tt = t + _seed;
    final breath = math.sin(tt * 2 * math.pi / 2.6);
    // Parpadeo: cada ~4.3 s cierra y abre en 0.18 s.
    final bp = tt % 4.3;
    final blink = bp > 4.12 ? 1 - _bump((bp - 4.12) / 0.18) : 1.0;
    // La oreja se mueve sola de vez en cuando.
    final ep = tt % 6.7;
    final earTwitch = ep > 6.2 ? 0.35 * _bump((ep - 6.2) / 0.5) : 0.0;

    switch (widget.mood) {
      case SalsaMood.idle:
        return (
          SalsaPose(
            breath: breath,
            blink: blink,
            tail: 0.55 * math.sin(tt * 2 * math.pi / 1.5),
            ear: earTwitch,
            headTilt: 0.04 * math.sin(tt * 2 * math.pi / 5.2),
          ),
          0,
        );
      case SalsaMood.jump:
        return (const SalsaPose(tail: -0.6, ear: 0.7, tuck: 1, headTilt: -0.08), 0);
      case SalsaMood.cheer:
        // Tres brincos de gusto y luego se queda feliz meneando la cola rápido.
        final c = t - _cheerStart;
        final hopping = c < 2.7;
        final up = hopping ? _bump((c % 0.9) / 0.9) : 0.0;
        return (
          SalsaPose(
            breath: breath * 0.5,
            blink: blink,
            tail: math.sin(t * 2 * math.pi / 0.32),
            ear: 0.6 + 0.4 * up,
            tuck: 0.8 * up,
            headTilt: -0.12 * up,
            mouthOpen: 1,
          ),
          -18 * up,
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    final reduce = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    final w = widget.size;
    final h = w * SalsaPainter.vh / SalsaPainter.vw;
    return RepaintBoundary(
      child: SizedBox(
        width: w,
        height: h,
        child: ValueListenableBuilder<double>(
          valueListenable: _time,
          builder: (context, t, _) {
            final (pose, lift) = _pose(t, reduce);
            return Transform.translate(
              offset: Offset(0, lift * w / 120),
              child: CustomPaint(size: Size(w, h), painter: SalsaPainter(pose: pose, flip: widget.flip, shadow: lift == 0)),
            );
          },
        ),
      ),
    );
  }
}
