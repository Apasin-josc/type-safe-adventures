import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';

import 'salsa_painter.dart';
import 'sfx.dart';

/// Cómo consigue Salsa la pista.
enum FetchKind {
  dig, // escarba un hoyo y saca un hueso
  ball, // se va corriendo y regresa con la pelotita
}

/// Salsa va por tu pista: corre, escarba (o se va por la pelota) y regresa con ella en el hocico.
/// Al terminar llama a [onDone], y ahí aparece la burbuja con la pista.
class SalsaFetch extends StatefulWidget {
  const SalsaFetch({super.key, required this.onDone, this.kind, this.sweater = false});
  final VoidCallback onDone;
  final FetchKind? kind;
  final bool sweater;

  /// Para pruebas y capturas: siempre la misma variante.
  static FetchKind? forceKind;

  /// Para revisar la animación cuadro por cuadro (tool/fetch_preview_test.dart).
  static CustomPainter painterAt(double t, FetchKind kind) {
    final r = math.Random(3);
    final dirt = [for (var i = 0; i < 26; i++) (0.8 + r.nextDouble() * 1.05, 40 + r.nextDouble() * 90, 90 + r.nextDouble() * 90, 2 + r.nextDouble() * 2.6)];
    return _FetchPainter(t: t, kind: kind, dirt: dirt, sweater: false);
  }

  @override
  State<SalsaFetch> createState() => _SalsaFetchState();
}

class _SalsaFetchState extends State<SalsaFetch> with SingleTickerProviderStateMixin {
  late final FetchKind kind = widget.kind ?? SalsaFetch.forceKind ?? (math.Random().nextBool() ? FetchKind.dig : FetchKind.ball);
  late final double total = kind == FetchKind.dig ? 3.1 : 2.6;
  late final Ticker _ticker;
  final _t = ValueNotifier<double>(0);
  bool _done = false;
  final _played = <String>{};

  // La tierra que sale volando mientras escarba: cada terrón con su hora, rapidez y tamaño.
  late final List<(double, double, double, double)> dirt = () {
    final r = math.Random();
    return [for (var i = 0; i < 26; i++) (0.8 + r.nextDouble() * 1.05, 40 + r.nextDouble() * 90, 90 + r.nextDouble() * 90, 2 + r.nextDouble() * 2.6)];
  }();

  @override
  void initState() {
    super.initState();
    _ticker = createTicker((d) {
      final t = d.inMicroseconds / 1e6;
      _t.value = t;
      _sounds(t);
      if (t >= total && !_done) {
        _done = true;
        _ticker.stop();
        widget.onDone();
      }
    });
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      // Con "reducir movimiento" no hay carrera: la pista llega de una vez.
      if (MediaQuery.maybeDisableAnimationsOf(context) ?? false) {
        _done = true;
        widget.onDone();
      } else {
        _ticker.start();
      }
    });
  }

  void _once(String key, Sfx s) {
    if (_played.add(key)) sfx.play(s);
  }

  void _sounds(double t) {
    _once('go', Sfx.hop);
    if (kind == FetchKind.dig) {
      for (var k = 0; k < 4; k++) {
        if (t > 0.85 + k * 0.28) _once('dig$k', Sfx.tap);
      }
      if (t > 1.95) _once('pop', Sfx.land);
    } else if (t > 1.25) {
      _once('back', Sfx.hop);
    }
  }

  @override
  void dispose() {
    _ticker.dispose();
    _t.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(builder: (context, box) {
      return SizedBox(
        height: 104,
        width: box.maxWidth,
        child: ValueListenableBuilder<double>(
          valueListenable: _t,
          builder: (context, t, _) => CustomPaint(
            size: Size(box.maxWidth, 104),
            painter: _FetchPainter(t: t, kind: kind, dirt: dirt, sweater: widget.sweater),
          ),
        ),
      );
    });
  }
}

class _FetchPainter extends CustomPainter {
  _FetchPainter({required this.t, required this.kind, required this.dirt, required this.sweater});
  final double t;
  final FetchKind kind;
  final List<(double, double, double, double)> dirt;
  final bool sweater;

  static const sw = 84.0; // ancho de Salsa en la tira
  static double get sh => sw * SalsaPainter.vh / SalsaPainter.vw;
  static const ground = 98.0;

  static double _ease(double x) => x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x);
  static double _seg(double t, double a, double b) => ((t - a) / (b - a)).clamp(0.0, 1.0);

  /// Pose de carrera: patas que se recogen y estiran, cola atrás, orejas paradas.
  SalsaPose _run(double t, {bool carrying = false}) => SalsaPose(
        tuck: 0.5 + 0.5 * math.sin(t * math.pi * 2 * 4.5),
        tail: -0.5 + 0.2 * math.sin(t * 20),
        ear: 0.85,
        headTilt: carrying ? -0.04 : -0.08,
        blink: 1,
      );

  @override
  void paint(Canvas canvas, Size size) {
    final w = size.width;
    double x; // esquina izquierda de Salsa
    bool flip; // true = mira a la izquierda
    SalsaPose pose;
    double bob = 0;
    var carrying = false;
    double hole = 0; // tamaño del hoyo 0..1
    final digX = w * 0.55;
    final holeX = digX + sw * 0.98;

    if (kind == FetchKind.dig) {
      if (t < 0.75) {
        x = _ease(_seg(t, 0, 0.75)) * digX;
        flip = false;
        pose = _run(t);
        bob = -5 * math.sin(t * math.pi * 2 * 4.5).abs();
      } else if (t < 2.0) {
        x = digX;
        flip = false;
        final k = math.sin(t * math.pi * 2 * 7);
        pose = SalsaPose(tuck: 0.18 + 0.18 * k, headTilt: 0.9 + 0.08 * k, ear: 0.55, tail: math.sin(t * 26), blink: 1);
        bob = 1.5 * k;
        hole = _ease(_seg(t, 0.8, 1.8));
      } else if (t < 2.3) {
        x = digX;
        flip = false;
        pose = SalsaPose(ear: 1, headTilt: -0.12, tail: math.sin(t * 30), mouthOpen: 1, blink: 1);
        hole = 1;
        carrying = t > 2.2;
      } else {
        final k = _ease(_seg(t, 2.3, 3.0));
        x = digX * (1 - k);
        flip = true;
        pose = _run(t, carrying: true);
        bob = -5 * math.sin(t * math.pi * 2 * 4.5).abs();
        hole = 1 - _seg(t, 2.6, 3.1);
        carrying = true;
      }
    } else {
      if (t < 0.7) {
        x = _ease(_seg(t, 0, 0.7)) * (w + 10);
        flip = false;
        pose = _run(t);
        bob = -5 * math.sin(t * math.pi * 2 * 4.5).abs();
      } else if (t < 1.25) {
        x = w + 40; // fuera de la pantalla, buscando
        flip = false;
        pose = const SalsaPose();
      } else {
        final k = _ease(_seg(t, 1.25, 2.3));
        x = (w + 10) * (1 - k);
        flip = true;
        pose = _run(t, carrying: true);
        bob = -5 * math.sin(t * math.pi * 2 * 4.5).abs();
        carrying = true;
        if (k >= 1) {
          pose = SalsaPose(ear: 1, tail: math.sin(t * 30), blink: 1);
          bob = 0;
        }
      }
    }

    // El piso.
    canvas.drawLine(Offset(0, ground), Offset(w, ground), Paint()
      ..color = const Color(0x33A47148)
      ..strokeWidth = 2
      ..strokeCap = StrokeCap.round);

    // El hoyo, con su montoncito de tierra.
    if (hole > 0) {
      final hw = 34 * hole;
      canvas.drawOval(Rect.fromCenter(center: Offset(holeX, ground), width: hw, height: 9 * hole), Paint()..color = const Color(0xFF4A3424));
      canvas.drawOval(Rect.fromCenter(center: Offset(holeX + hw * 0.62, ground - 2), width: 16 * hole, height: 7 * hole), Paint()..color = const Color(0xFF9C6B45));
    }

    // Terrones volando para atrás (a la izquierda, entre las patas traseras).
    if (kind == FetchKind.dig) {
      for (final (born, vx, vy, r) in dirt) {
        final age = t - born;
        if (age < 0 || age > 0.75) continue;
        final px = holeX - 6 - vx * age * 1.6;
        final py = ground - 4 - vy * age + 380 * age * age;
        if (py > ground) continue;
        canvas.drawCircle(Offset(px, py), r, Paint()..color = Color.lerp(const Color(0xFF7A5232), const Color(0xFFB98A5E), r / 4.6)!.withValues(alpha: 1 - age / 0.75));
      }
    }

    // Salsa.
    canvas.save();
    canvas.translate(x, ground - sh + 3 + bob);
    SalsaPainter(pose: pose, flip: flip, shadow: bob == 0, sweater: sweater).paint(canvas, Size(sw, sh));
    canvas.restore();

    // El hueso brincando del hoyo al hocico, o lo que trae en la boca.
    final mouth = Offset(x + (flip ? sw - 117 * sw / SalsaPainter.vw : 117 * sw / SalsaPainter.vw), ground - sh + 3 + bob + 25 * sw / SalsaPainter.vw);
    if (kind == FetchKind.dig && t >= 1.95 && t < 2.2) {
      final k = _seg(t, 1.95, 2.2);
      final from = Offset(holeX, ground - 2);
      final p = Offset.lerp(from, mouth, k)! - Offset(0, 34 * math.sin(math.pi * k));
      _bone(canvas, p, k * 5);
    } else if (carrying) {
      if (kind == FetchKind.dig) {
        _bone(canvas, mouth, 0);
      } else {
        _ball(canvas, mouth);
      }
    }

    // Polvito donde se fue corriendo por la pelota.
    if (kind == FetchKind.ball && t > 0.6 && t < 1.4) {
      final k = _seg(t, 0.6, 1.4);
      for (var i = 0; i < 3; i++) {
        canvas.drawCircle(Offset(w - 14 - i * 10 - k * 12, ground - 6 - i * 4 - k * 10), 5 + k * 6, Paint()..color = const Color(0xFFB98A5E).withValues(alpha: 0.35 * (1 - k)));
      }
    }
  }

  void _bone(Canvas canvas, Offset c, double spin) {
    canvas.save();
    canvas.translate(c.dx, c.dy);
    canvas.rotate(spin);
    final paint = Paint()..color = const Color(0xFFFFF6E3);
    final edge = Paint()
      ..color = const Color(0xFFC9B48E)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.2;
    final shape = Path()
      ..addRRect(RRect.fromRectAndRadius(Rect.fromCenter(center: Offset.zero, width: 18, height: 5), const Radius.circular(2)));
    for (final dx in [-9.0, 9.0]) {
      for (final dy in [-2.6, 2.6]) {
        shape.addOval(Rect.fromCircle(center: Offset(dx, dy), radius: 3.2));
      }
    }
    canvas.drawPath(shape, paint);
    canvas.drawPath(shape, edge);
    canvas.restore();
  }

  void _ball(Canvas canvas, Offset c) {
    canvas.drawCircle(c, 6.2, Paint()..color = const Color(0xFFD7E84A));
    final seam = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.2;
    canvas.drawArc(Rect.fromCircle(center: c.translate(-4.5, 0), radius: 5), -0.9, 1.8, false, seam);
    canvas.drawArc(Rect.fromCircle(center: c.translate(4.5, 0), radius: 5), math.pi - 0.9, 1.8, false, seam);
  }

  @override
  bool shouldRepaint(_FetchPainter old) => old.t != t;
}
