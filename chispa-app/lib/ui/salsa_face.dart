import 'dart:math' as math;
import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';

import 'salsa_painter.dart';
import 'sfx.dart';

/// Salsa vista de frente: cara larga y angosta de galga, orejas de rosa hacia los lados,
/// atigrada, con la raya clara del hocico. Caja de 100 × 112.
class SalsaFacePainter extends CustomPainter {
  SalsaFacePainter({
    this.glasses = 0,
    this.glint = -1,
    this.ear = 0,
    this.blink = 1,
    this.tilt = 0,
    this.tongue = 0,
    this.lens = const [Color(0xFF2B2E45), Color(0xFF0E0F18)],
  });

  final double glasses; // 0 = arriba, fuera de la cara; 1 = puestos en los ojos
  final double glint; // -1 sin brillo; 0..1 el brillo cruzando los lentes
  final double ear; // 0 dobladas, 1 levantadas de emoción
  final double blink; // 1 abiertos, 0 cerrados
  final double tilt; // radianes, ladea la cabeza
  final double tongue; // 0..1 la lengüita de fuera
  final List<Color> lens; // color de los lentes (arriba → abajo)

  static const vw = 100.0, vh = 112.0;
  static const _bounds = Rect.fromLTWH(-20, -30, vw + 40, vh + 40);

  static final Path _head = Path()
    ..moveTo(50, 14)
    ..cubicTo(62, 14, 72, 20, 73, 32)
    ..cubicTo(74, 42, 70, 52, 64, 62)
    ..cubicTo(60, 70, 58, 80, 57.5, 86)
    ..cubicTo(56, 93, 44, 93, 42.5, 86)
    ..cubicTo(42, 80, 40, 70, 36, 62)
    ..cubicTo(30, 52, 26, 42, 27, 32)
    ..cubicTo(28, 20, 38, 14, 50, 14)
    ..close();

  static final Path _neck = Path()
    ..moveTo(41, 58)
    ..lineTo(59, 58)
    ..cubicTo(62, 80, 65, 98, 70, 112)
    ..lineTo(30, 112)
    ..cubicTo(35, 98, 38, 80, 41, 58)
    ..close();

  Paint _fill(Color c) => Paint()
    ..color = c
    ..isAntiAlias = true;
  Paint _stroke(Color c, double w) => Paint()
    ..color = c
    ..style = PaintingStyle.stroke
    ..strokeWidth = w
    ..strokeCap = StrokeCap.round
    ..isAntiAlias = true;

  @override
  void paint(Canvas canvas, Size size) {
    final s = math.min(size.width / vw, size.height / vh);
    canvas.save();
    canvas.translate((size.width - vw * s) / 2, (size.height - vh * s) / 2);
    canvas.scale(s);
    // ladear desde el cuello
    canvas.translate(50, 100);
    canvas.rotate(tilt);
    canvas.translate(-50, -100);

    // Orejas de rosa (detrás de la cabeza)
    _ear(canvas, left: true);
    _ear(canvas, left: false);

    // Cuello y cabeza con el atigrado parejo encima
    canvas.saveLayer(_bounds, Paint());
    canvas.drawPath(_neck, _fill(SalsaPainter.fawnDark));
    canvas.drawPath(_head, _fill(SalsaPainter.fawn));
    // Atigrado: rayitas casi horizontales en tramos, que se curvan con la forma de la cara.
    final rnd = math.Random(21);
    for (var y = 12.0; y < vh; y += 2.3 + rnd.nextDouble() * 1.9) {
      var x = 18.0 + rnd.nextDouble() * 5;
      while (x < 84) {
        final len = 3.5 + rnd.nextDouble() * 8;
        final x1 = x + len;
        // las rayas bajan un poquito hacia los lados, como si rodearan la cara
        double curve(double xx) => 0.0035 * (xx - 50) * (xx - 50) * (y < 70 ? 1 : 0.4);
        final tilt = -0.6 + rnd.nextDouble() * 1.2;
        canvas.drawPath(
          Path()
            ..moveTo(x, y + curve(x))
            ..quadraticBezierTo((x + x1) / 2, y + curve((x + x1) / 2) - 0.6 + tilt, x1, y + curve(x1) + tilt),
          Paint()
            ..style = PaintingStyle.stroke
            ..strokeWidth = 0.6 + rnd.nextDouble() * 0.8
            ..strokeCap = StrokeCap.round
            ..color = SalsaPainter.brindle.withValues(alpha: 0.14 + rnd.nextDouble() * 0.2)
            ..blendMode = BlendMode.srcATop,
        );
        x = x1 + 1.5 + rnd.nextDouble() * 4;
      }
    }
    // En el cráneo el atigrado es más marcado: rayas gruesas negras y cafés, como las de Salsa.
    final skull = math.Random(33);
    const skullColors = [Color(0xFF1E140C), Color(0xFF3A2210), Color(0xFF6B3F1D)];
    for (var y = 15.0; y < 42; y += 2.6 + skull.nextDouble() * 2.2) {
      var x = 26.0 + skull.nextDouble() * 6;
      while (x < 74) {
        final len = 4 + skull.nextDouble() * 9;
        final x1 = x + len;
        double curve(double xx) => 0.006 * (xx - 50) * (xx - 50);
        final tilt = -0.8 + skull.nextDouble() * 1.6;
        // la raya clara del centro de la frente queda más limpia
        final center = (x + x1) / 2;
        final nearBlaze = (center - 50).abs() < 4 && y > 24;
        canvas.drawPath(
          Path()
            ..moveTo(x, y + curve(x))
            ..quadraticBezierTo(center, y + curve(center) - 0.8 + tilt, x1, y + curve(x1) + tilt),
          Paint()
            ..style = PaintingStyle.stroke
            ..strokeWidth = 1.2 + skull.nextDouble() * 1.3
            ..strokeCap = StrokeCap.round
            ..color = skullColors[skull.nextInt(3)].withValues(alpha: (nearBlaze ? 0.15 : 0.32) + skull.nextDouble() * 0.28)
            ..blendMode = BlendMode.srcATop,
        );
        x = x1 + 1.2 + skull.nextDouble() * 3.5;
      }
    }
    // sombritas que dan volumen a las sienes
    canvas.drawOval(Rect.fromCenter(center: const Offset(30, 40), width: 12, height: 26), Paint()..color = SalsaPainter.fawnDark.withValues(alpha: 0.35)..blendMode = BlendMode.srcATop);
    canvas.drawOval(Rect.fromCenter(center: const Offset(70, 40), width: 12, height: 26), Paint()..color = SalsaPainter.fawnDark.withValues(alpha: 0.35)..blendMode = BlendMode.srcATop);
    canvas.restore();

    // Raya clara del hocico y la trompita clara
    final blaze = Path()
      ..moveTo(50, 24)
      ..cubicTo(53, 34, 55, 52, 56, 66)
      ..cubicTo(57, 74, 57.5, 82, 56, 88)
      ..cubicTo(54, 92, 46, 92, 44, 88)
      ..cubicTo(42.5, 82, 43, 74, 44, 66)
      ..cubicTo(45, 52, 47, 34, 50, 24)
      ..close();
    canvas.drawPath(
      blaze,
      Paint()
        ..shader = ui.Gradient.linear(const Offset(50, 24), const Offset(50, 80), [SalsaPainter.cream.withValues(alpha: 0.0), SalsaPainter.cream.withValues(alpha: 0.95)]),
    );


    // Ojos (se ven si los lentes todavía no bajan)
    for (final x in const [39.0, 61.0]) {
      canvas.drawOval(Rect.fromCenter(center: Offset(x, 46), width: 8.5, height: 10 * blink + 0.6), _fill(SalsaPainter.ink));
      if (blink > 0.5) {
        canvas.drawCircle(Offset(x + 1.6, 43.5), 1.9, _fill(Colors.white));
        canvas.drawCircle(Offset(x - 1.4, 48.5), 0.9, _fill(Colors.white.withValues(alpha: 0.8)));
      }
    }

    // Nariz
    final nose = Path()
      ..moveTo(44.5, 80)
      ..cubicTo(44.5, 76.5, 55.5, 76.5, 55.5, 80)
      ..cubicTo(55.5, 84, 52.5, 86, 50, 86)
      ..cubicTo(47.5, 86, 44.5, 84, 44.5, 80)
      ..close();
    canvas.drawPath(nose, _fill(SalsaPainter.ink));
    canvas.drawOval(Rect.fromCenter(center: const Offset(48, 79), width: 3.4, height: 1.8), _fill(Colors.white.withValues(alpha: 0.55)));

    // Sonrisa de lado (cool) y la lengüita
    canvas.drawPath(
      Path()
        ..moveTo(45.5, 89.5)
        ..quadraticBezierTo(50, 92.5, 55.5, 88.6),
      _stroke(SalsaPainter.ink.withValues(alpha: 0.8), 1.2),
    );
    if (tongue > 0.02) {
      final t = tongue;
      canvas.drawPath(
        Path()
          ..moveTo(49, 90.6)
          ..cubicTo(48.4, 93 + 3 * t, 49.6, 95 + 4 * t, 51.6, 95 + 4 * t)
          ..cubicTo(53.6, 95 + 4 * t, 54.6, 93 + 3 * t, 54, 90.2)
          ..close(),
        _fill(const Color(0xFFF07F8E)),
      );
      canvas.drawLine(Offset(51.5, 91.2), Offset(51.6, 93 + 3.5 * t), _stroke(const Color(0xFFC95668), 0.6));
    }

    // Lentes oscuros: bajan desde arriba y se acomodan en los ojos
    if (glasses > 0) _glasses(canvas);

    canvas.restore();
  }

  void _ear(Canvas canvas, {required bool left}) {
    canvas.save();
    if (!left) {
      canvas.translate(100, 0);
      canvas.scale(-1, 1);
    }
    canvas.translate(31, 27);
    canvas.rotate(-0.55 * ear);
    final ear0 = Path()
      ..moveTo(1, -3)
      ..cubicTo(-6, -12, -18, -13, -25, -5)
      ..cubicTo(-21, -1, -12, 3, -1, 6)
      ..close();
    canvas.drawPath(ear0, _fill(SalsaPainter.brindle));
    canvas.drawPath(
      Path()
        ..moveTo(-1, -2)
        ..cubicTo(-7, -9, -15, -9, -20, -4.5)
        ..cubicTo(-16, -2, -9, 1, -2, 3)
        ..close(),
      _fill(SalsaPainter.pink.withValues(alpha: 0.5 + 0.4 * ear)),
    );
    canvas.restore();
  }

  void _glasses(Canvas canvas) {
    // De y = -40 (arriba, fuera) a y = 0 (puestos), con un rebotito.
    final g = glasses.clamp(0.0, 1.0);
    final dy = -48 * (1 - g);
    canvas.save();
    canvas.translate(0, dy);
    final left = RRect.fromRectAndRadius(Rect.fromCenter(center: const Offset(38.5, 46.5), width: 21, height: 13.5), const Radius.circular(5));
    final right = RRect.fromRectAndRadius(Rect.fromCenter(center: const Offset(61.5, 46.5), width: 21, height: 13.5), const Radius.circular(5));
    // patitas de los lentes hacia las orejas
    canvas.drawLine(const Offset(28.4, 43), const Offset(23, 38), _stroke(const Color(0xFF111118), 2.2));
    canvas.drawLine(const Offset(71.6, 43), const Offset(77, 38), _stroke(const Color(0xFF111118), 2.2));
    final lensPaint = Paint()
      ..shader = ui.Gradient.linear(const Offset(0, 40), const Offset(0, 54), lens);
    canvas.drawRRect(left, lensPaint);
    canvas.drawRRect(right, lensPaint);
    canvas.drawRRect(left, _stroke(const Color(0xFF07070C), 1.6));
    canvas.drawRRect(right, _stroke(const Color(0xFF07070C), 1.6));
    canvas.drawLine(const Offset(48.6, 44.5), const Offset(51.4, 44.5), _stroke(const Color(0xFF07070C), 2.4));
    // reflejito fijo arriba de cada lente
    for (final x in const [33.0, 56.0]) {
      canvas.drawLine(Offset(x, 42.5), Offset(x + 5, 42.5), _stroke(Colors.white.withValues(alpha: 0.35), 1.2));
    }
    // el brillo que cruza los lentes
    if (glint >= 0 && glint <= 1) {
      final both = Path()
        ..addRRect(left)
        ..addRRect(right);
      canvas.save();
      canvas.clipPath(both);
      final x = 22 + 60 * glint;
      canvas.drawPath(
        Path()
          ..moveTo(x, 36)
          ..lineTo(x + 6, 36)
          ..lineTo(x - 2, 58)
          ..lineTo(x - 8, 58)
          ..close(),
        _fill(Colors.white.withValues(alpha: 0.75)),
      );
      canvas.restore();
    }
    canvas.restore();
  }

  @override
  bool shouldRepaint(SalsaFacePainter old) =>
      old.glasses != glasses || old.lens != lens || old.glint != glint || old.ear != ear || old.blink != blink || old.tilt != tilt || old.tongue != tongue;
}

/// El festejo de fin de lección: Salsa de frente aparece con rebote, se pone los lentes oscuros,
/// le brillan, levanta las orejas de gusto y cae confeti. Después se queda respirando tranquila.
class SalsaCelebration extends StatefulWidget {
  const SalsaCelebration({super.key, this.size = 190, this.lens});
  final double size;
  final List<Color>? lens; // lentes de color del clóset
  @override
  State<SalsaCelebration> createState() => _SalsaCelebrationState();
}

class _SalsaCelebrationState extends State<SalsaCelebration> with SingleTickerProviderStateMixin {
  late final Ticker _ticker;
  final _t = ValueNotifier<double>(0);
  bool _clicked = false;

  @override
  void initState() {
    super.initState();
    _ticker = createTicker((d) {
      _t.value = d.inMicroseconds / 1e6;
      if (!_clicked && _t.value > 1.05) {
        _clicked = true;
        sfx.play(Sfx.land, volume: 0.8); // ¡clic! los lentes en su lugar
      }
    })
      ..start();
  }

  @override
  void dispose() {
    _ticker.dispose();
    _t.dispose();
    super.dispose();
  }

  static double _seg(double t, double a, double b) => ((t - a) / (b - a)).clamp(0.0, 1.0);

  @override
  Widget build(BuildContext context) {
    final reduce = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    final w = widget.size;
    final h = w * SalsaFacePainter.vh / SalsaFacePainter.vw;
    return RepaintBoundary(
      child: SizedBox(
        width: w * 1.5,
        height: h,
        child: ValueListenableBuilder<double>(
          valueListenable: _t,
          builder: (context, t, _) {
            if (reduce) {
              return Center(child: CustomPaint(size: Size(w, h), painter: SalsaFacePainter(glasses: 1, lens: widget.lens ?? const [Color(0xFF2B2E45), Color(0xFF0E0F18)])));
            }
            final pop = Curves.elasticOut.transform(_seg(t, 0, 0.7));
            final glasses = Curves.bounceOut.transform(_seg(t, 0.45, 1.1));
            final glint = t > 1.25 && t < 1.75 ? _seg(t, 1.25, 1.75) : -1.0;
            final earUp = t > 1.05 ? 0.6 + 0.4 * math.sin((t - 1.05) * 9) * math.exp(-(t - 1.05) * 1.6) : 0.0;
            final bob = math.sin(t * 2 * math.pi / 2.4);
            final tilt = t > 1.05 ? -0.09 * math.exp(-(t - 1.05) * 0.8) + 0.02 * bob : 0.0;
            final tongue = t > 1.9 ? Curves.easeOut.transform(_seg(t, 1.9, 2.3)) : 0.0;
            return Stack(alignment: Alignment.center, clipBehavior: Clip.none, children: [
              CustomPaint(size: Size(w * 1.5, h), painter: _ConfettiPainter(t: t - 1.05)),
              Transform.translate(
                offset: Offset(0, bob * 1.2),
                child: Transform.scale(
                  scale: 0.3 + 0.7 * pop,
                  child: CustomPaint(
                    size: Size(w, h),
                    painter: SalsaFacePainter(glasses: glasses, glint: glint, ear: earUp.clamp(0, 1), tilt: tilt, tongue: tongue, lens: widget.lens ?? const [Color(0xFF2B2E45), Color(0xFF0E0F18)]),
                  ),
                ),
              ),
            ]);
          },
        ),
      ),
    );
  }
}

/// Confeti que sale cuando los lentes se acomodan.
class _ConfettiPainter extends CustomPainter {
  _ConfettiPainter({required this.t});
  final double t; // segundos desde el "clic" de los lentes (negativo = todavía no)

  static const colors = [Color(0xFFFF8A3D), Color(0xFFF2C14E), Color(0xFF57CF95), Color(0xFF8EA2FF), Color(0xFFFF7F8A), Color(0xFFFFFFFF)];

  @override
  void paint(Canvas canvas, Size size) {
    if (t <= 0 || t > 3.2) return;
    final rnd = math.Random(5);
    final c = Offset(size.width / 2, size.height * 0.42);
    for (var i = 0; i < 26; i++) {
      final ang = -math.pi / 2 + (rnd.nextDouble() - 0.5) * math.pi * 1.5;
      final speed = 120 + rnd.nextDouble() * 160;
      final x = c.dx + math.cos(ang) * speed * t * (size.width / 300);
      final y = c.dy + math.sin(ang) * speed * t * (size.width / 300) + 140 * t * t;
      final fade = (1 - t / 3.2).clamp(0.0, 1.0);
      canvas.save();
      canvas.translate(x, y);
      canvas.rotate(t * (4 + rnd.nextDouble() * 6) * (i.isEven ? 1 : -1));
      final paint = Paint()..color = colors[i % colors.length].withValues(alpha: fade);
      if (i % 3 == 0) {
        canvas.drawCircle(Offset.zero, 3, paint);
      } else {
        canvas.drawRect(const Rect.fromLTWH(-4, -2, 8, 4), paint);
      }
      canvas.restore();
    }
  }

  @override
  bool shouldRepaint(_ConfettiPainter old) => old.t != t;
}

/// Los lentes según lo que Salsa trae puesto.
List<Color>? lensFor(List<String> equipped) {
  if (equipped.contains('glasses_gold')) return const [Color(0xFFFFE08A), Color(0xFFB8860B)];
  if (equipped.contains('glasses_pink')) return const [Color(0xFFFF9EC4), Color(0xFFC2185B)];
  return null;
}
