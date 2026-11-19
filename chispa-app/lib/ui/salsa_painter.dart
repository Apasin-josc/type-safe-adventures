import 'dart:math' as math;
import 'dart:ui' as ui;

import 'package:flutter/material.dart';

/// Pose de Salsa en un instante. Todos los valores cambian suave con el tiempo (ver salsa.dart).
class SalsaPose {
  const SalsaPose({
    this.breath = 0,
    this.blink = 1,
    this.tail = 0,
    this.ear = 0,
    this.tuck = 0,
    this.headTilt = 0,
    this.mouthOpen = 0,
  });

  final double breath; // -1..1, el pecho sube y baja
  final double blink; // 1 abiertos, 0 cerrados
  final double tail; // -1..1, meneo de la cola
  final double ear; // 0 doblada (rosa), 1 parada de emoción
  final double tuck; // 0 parada, 1 patas recogidas (en el aire)
  final double headTilt; // radianes
  final double mouthOpen; // 0..1, boca abierta con la lengua de fuera
}

/// Salsa, la galga: atigrada, de pecho hondo y cintura metida, patas larguísimas, orejas de rosa
/// y hocico largo. Se dibuja de lado, mirando a la derecha, en una caja de 126 × 108.
///
/// El cuerpo (cuello, pecho, patas y cola) se pinta en una sola capa y el atigrado se pinta encima
/// con el mismo patrón para todo: así no hay costuras y las rayas siguen el mismo pelaje.
/// [sweater] le pone su suéter gris de cuello de tortuga (para el invierno).
class SalsaPainter extends CustomPainter {
  SalsaPainter({this.pose = const SalsaPose(), this.flip = false, this.shadow = true, this.sweater = false, this.ball = false});

  final SalsaPose pose;
  final bool flip;
  final bool shadow;
  final bool sweater;
  final bool ball; // su pelotita de tenis junto a las patas

  static const vw = 126.0, vh = 108.0;
  static const ground = 101.0; // donde pisan las patas

  static const fawn = Color(0xFFC58A4F);
  static const fawnLight = Color(0xFFDDAA72);
  static const fawnDark = Color(0xFF94612F);
  static const brindle = Color(0xFF4A2C14);
  static const cream = Color(0xFFF1DCC0);
  static const skin = Color(0xFFD9A99A); // la piel rosadita del pecho
  static const sweaterC = Color(0xFF6B6B75);
  static const sweaterDark = Color(0xFF4A4A54);
  static const sweaterLight = Color(0xFFD6D6DC);
  static const ink = Color(0xFF231A1A);
  static const pink = Color(0xFFEAA3A2);
  static const blush = Color(0x5CFF7F8A);

  static const _bounds = Rect.fromLTWH(-10, -10, vw + 20, vh + 20);

  Paint _fill(Color c) => Paint()
    ..color = c
    ..isAntiAlias = true;
  Paint _stroke(Color c, double w) => Paint()
    ..color = c
    ..style = PaintingStyle.stroke
    ..strokeWidth = w
    ..strokeCap = StrokeCap.round
    ..strokeJoin = StrokeJoin.round
    ..isAntiAlias = true;

  // ── Silueta: tronco y cuello son UNA sola forma (sin escalón entre cuello y pecho) ──
  static final Path _trunk = Path()
    ..moveTo(26, 49) // grupa
    ..cubicTo(32, 45, 40, 43, 48, 44) // lomo
    ..cubicTo(58, 45, 68, 44, 76, 41) // cruz
    ..cubicTo(80, 34, 85, 25, 90, 18) // nuca: el cuello sube derechito
    ..lineTo(99, 23) // debajo de la quijada
    ..cubicTo(94, 31, 91, 39, 90, 47) // garganta
    ..cubicTo(89, 55, 89, 63, 85, 68) // pecho
    ..cubicTo(81, 72, 72, 72, 66, 68) // pecho hondo
    ..cubicTo(61, 64, 56, 59, 51, 59) // cintura bien metida (es galga)
    ..cubicTo(46, 59, 43, 63, 40, 67) // atrás del muslo
    ..cubicTo(35, 71, 27, 70, 23, 63) // anca
    ..cubicTo(21, 58, 22, 52, 26, 49)
    ..close();

  @override
  void paint(Canvas canvas, Size size) {
    canvas.save();
    final s = math.min(size.width / vw, size.height / vh);
    canvas.translate((size.width - vw * s) / 2, size.height - vh * s);
    canvas.scale(s);
    if (flip) {
      canvas.translate(vw, 0);
      canvas.scale(-1, 1);
    }
    final p = pose;
    final t = p.tuck;

    if (shadow) {
      canvas.drawOval(Rect.fromCenter(center: const Offset(57, ground + 2.5), width: 74 - 22 * t, height: 6 - 2 * t), _fill(const Color(0x22000000)));
    }

    // Todo el cuerpo sube un poquito al respirar.
    canvas.translate(0, -p.breath * 0.6);

    // ── Capa 1: las patas del lado lejano, un tono más oscuras ──
    canvas.saveLayer(_bounds, Paint());
    _hindLeg(canvas, hip: const Offset(38, 61), color: fawnDark, width: 4.4, tuck: t, dx: 5);
    _frontLeg(canvas, shoulder: const Offset(77, 63), color: fawnDark, width: 4.2, tuck: t, dx: -5);
    _brindle(canvas, seed: 11, strength: 0.8);
    canvas.restore();

    // ── Capa 2: cola, cuerpo, patas cercanas y cabeza, y encima el atigrado parejo ──
    canvas.saveLayer(_bounds, Paint());
    canvas.save();
    canvas.translate(24.5, 52);
    canvas.rotate(0.35 * p.tail - 0.15 * t);
    canvas.drawPath(
      Path()
        ..moveTo(0, 0)
        ..cubicTo(-8, 5, -12, 16, -11, 30)
        ..cubicTo(-10.5, 34, -7.5, 35, -6.5, 32),
      _stroke(fawn, 3.2),
    );
    canvas.restore();

    canvas.drawPath(_trunk, _fill(fawn));
    canvas.save();
    canvas.clipPath(_trunk);
    // pecho rosadito, lomo un poco más oscuro, garganta clarita que se desvanece hacia el pecho
    canvas.drawOval(Rect.fromCenter(center: const Offset(74, 70), width: 34, height: 14), _fill(skin.withValues(alpha: 0.35)));
    canvas.drawOval(Rect.fromCenter(center: const Offset(54, 40), width: 64, height: 10), _fill(fawnDark.withValues(alpha: 0.3)));
    canvas.drawPath(
      Path()
        ..moveTo(97, 24)
        ..cubicTo(93, 31, 91, 40, 90.5, 52),
      Paint()
        ..style = PaintingStyle.stroke
        ..strokeWidth = 4.5
        ..strokeCap = StrokeCap.round
        ..shader = ui.Gradient.linear(const Offset(97, 24), const Offset(90, 54), [cream.withValues(alpha: 0.85), cream.withValues(alpha: 0)]),
    );
    canvas.restore();
    // muslo
    canvas.drawOval(Rect.fromCenter(center: const Offset(33, 58), width: 19, height: 18), _fill(fawnLight.withValues(alpha: 0.28)));

    _hindLeg(canvas, hip: const Offset(35, 63), color: fawn, width: 5, tuck: t);
    _frontLeg(canvas, shoulder: const Offset(82, 65), color: fawn, width: 4.8, tuck: t);

    canvas.save();
    _headTransform(canvas, p);
    _headBase(canvas);
    canvas.restore();

    _brindle(canvas, seed: 7, strength: 1);
    // En el cráneo, rayas más gruesas negras y cafés, como las de Salsa.
    canvas.save();
    _headTransform(canvas, p);
    final sk = math.Random(41);
    const skullColors = [Color(0xFF1E140C), Color(0xFF3A2210), Color(0xFF6B3F1D)];
    for (var x = -8.0; x < 9; x += 1.8 + sk.nextDouble() * 1.6) {
      final y0 = -8 + sk.nextDouble() * 3;
      final len = 4 + sk.nextDouble() * 6;
      canvas.drawLine(
        Offset(x, y0),
        Offset(x + 0.8, y0 + len),
        Paint()
          ..strokeWidth = 0.9 + sk.nextDouble() * 0.9
          ..strokeCap = StrokeCap.round
          ..color = skullColors[sk.nextInt(3)].withValues(alpha: 0.3 + sk.nextDouble() * 0.3)
          ..blendMode = BlendMode.srcATop,
      );
    }
    canvas.restore();
    canvas.restore();

    // ── Encima: los detalles de la cara y la oreja (sin rayas) ──
    canvas.save();
    _headTransform(canvas, p);
    _headDetails(canvas, p);
    canvas.restore();

    if (sweater) _sweater(canvas);

    canvas.restore();

    // La pelotita se queda en el piso (no se mueve cuando Salsa respira ni cuando salta).
    if (ball && p.tuck < 0.2) {
      canvas.save();
      final sc = math.min(size.width / vw, size.height / vh);
      canvas.translate((size.width - vw * sc) / 2, size.height - vh * sc);
      canvas.scale(sc);
      if (flip) {
        canvas.translate(vw, 0);
        canvas.scale(-1, 1);
      }
      const c = Offset(112, ground - 3.6);
      canvas.drawOval(Rect.fromCenter(center: const Offset(112, ground + 1), width: 8, height: 2), _fill(const Color(0x22000000)));
      canvas.drawCircle(c, 3.8, _fill(const Color(0xFFD7E84A)));
      canvas.drawArc(Rect.fromCircle(center: c + const Offset(-2.6, 0), radius: 3), -0.9, 1.8, false, _stroke(Colors.white.withValues(alpha: 0.9), 0.7));
      canvas.drawArc(Rect.fromCircle(center: c + const Offset(2.6, 0), radius: 3), math.pi - 0.9, 1.8, false, _stroke(Colors.white.withValues(alpha: 0.9), 0.7));
      canvas.restore();
    }
  }

  void _headTransform(Canvas canvas, SalsaPose p) {
    canvas.translate(86, 44);
    canvas.rotate(p.headTilt * 0.4);
    canvas.translate(-86, -44);
    canvas.translate(94, 16);
    canvas.rotate(p.headTilt);
  }

  /// El atigrado: rayitas delgadas casi verticales, todas inclinadas igual y cortadas en tramos,
  /// como el pelaje de verdad. Se pinta solo donde ya hay cuerpo (srcATop), así cruza cuello,
  /// pecho y patas sin cambiar de estilo. La semilla fija hace que no "bailen" entre cuadros.
  void _brindle(Canvas canvas, {required int seed, required double strength}) {
    final rnd = math.Random(seed);
    const slant = 0.16; // misma inclinación en todo el cuerpo
    for (var x = 8.0; x < vw + 4; x += 2.3 + rnd.nextDouble() * 1.7) {
      var y = -4.0 + rnd.nextDouble() * 6;
      while (y < vh) {
        final len = 4 + rnd.nextDouble() * 11;
        final w = 0.6 + rnd.nextDouble() * 0.9;
        // en la cara las rayas son más tenues
        final faceFade = (x > 104 && y < 26) ? 0.5 : 1.0; // el hocico más suave; el cráneo, marcado
        final a = (0.16 + rnd.nextDouble() * 0.2) * strength * faceFade;
        final x0 = x + slant * y;
        final wave = -0.8 + rnd.nextDouble() * 1.6;
        canvas.drawPath(
          Path()
            ..moveTo(x0, y)
            ..quadraticBezierTo(x0 + slant * len / 2 + wave, y + len / 2, x0 + slant * len, y + len),
          Paint()
            ..style = PaintingStyle.stroke
            ..strokeWidth = w
            ..strokeCap = StrokeCap.round
            ..color = brindle.withValues(alpha: a)
            ..blendMode = BlendMode.srcATop,
        );
        y += len + 1.5 + rnd.nextDouble() * 5;
      }
    }
  }

  /// Pata trasera: muslo, corvejón hacia atrás y pie pegadito hacia adelante.
  void _hindLeg(Canvas canvas, {required Offset hip, required Color color, required double width, required double tuck, double dx = 0}) {
    final hock = Offset.lerp(Offset(hip.dx - 8 + dx, hip.dy + 23), Offset(hip.dx - 17 + dx, hip.dy + 13), tuck)!;
    final paw = Offset.lerp(Offset(hip.dx - 2 + dx, ground - 1.4), Offset(hip.dx - 27 + dx, hip.dy + 22), tuck)!;
    canvas.drawPath(
      Path()
        ..moveTo(hip.dx + dx, hip.dy)
        ..quadraticBezierTo(hip.dx - 2 + dx, hip.dy + 12, hock.dx, hock.dy)
        ..lineTo(paw.dx, paw.dy),
      _stroke(color, width),
    );
    _foot(canvas, paw, color, width, back: tuck > 0.5);
  }

  /// Pata delantera: larga y derechita; en el aire se estira hacia adelante.
  void _frontLeg(Canvas canvas, {required Offset shoulder, required Color color, required double width, required double tuck, double dx = 0}) {
    final elbow = Offset.lerp(Offset(shoulder.dx + 1 + dx, shoulder.dy + 16), Offset(shoulder.dx + 12 + dx, shoulder.dy + 9), tuck)!;
    final paw = Offset.lerp(Offset(shoulder.dx + 2 + dx, ground - 1.4), Offset(shoulder.dx + 26 + dx, shoulder.dy + 11), tuck)!;
    canvas.drawPath(
      Path()
        ..moveTo(shoulder.dx + dx, shoulder.dy)
        ..lineTo(elbow.dx, elbow.dy)
        ..lineTo(paw.dx, paw.dy),
      _stroke(color, width),
    );
    _foot(canvas, paw, color, width, back: false);
  }

  /// El pie sale de la pata (mismo color), con la puntita un poco más clara y un dedito marcado.
  void _foot(Canvas canvas, Offset at, Color color, double width, {required bool back}) {
    final dir = back ? -1.0 : 1.0;
    final foot = RRect.fromRectAndRadius(
      Rect.fromLTWH(back ? at.dx - 6 : at.dx - width / 2, at.dy - width / 2, width / 2 + 6, width * 0.95),
      Radius.circular(width / 2),
    );
    canvas.drawRRect(foot, _fill(color));
    canvas.drawOval(Rect.fromCenter(center: Offset(at.dx + dir * 4.2, at.dy + 0.5), width: 3.4, height: width * 0.7), _fill(Color.lerp(color, cream, 0.45)!));
    canvas.drawLine(Offset(at.dx + dir * 3.2, at.dy - 0.4), Offset(at.dx + dir * 3.4, at.dy + width * 0.4), _stroke(brindle.withValues(alpha: 0.35), 0.6));
  }

  // ── Cabeza (origen: centro del cráneo). Carita delgada y hocico largo de galga ──
  static final Rect _skull = Rect.fromCenter(center: Offset.zero, width: 17.5, height: 16);
  static final Path _snout = Path()
    ..moveTo(3, -6)
    ..cubicTo(11, -5.2, 21, -1.8, 26.5, 1.8)
    ..cubicTo(28, 3, 27.5, 5.4, 25.3, 5.9)
    ..cubicTo(18, 7.4, 9, 8.2, 1.5, 7.6)
    ..close();

  void _headBase(Canvas canvas) {
    canvas.drawPath(_snout, _fill(fawn));
    canvas.drawOval(_skull, _fill(fawn));
  }

  void _headDetails(Canvas canvas, SalsaPose p) {
    // Oreja de rosa: doblada hacia atrás; se para cuando se emociona.
    canvas.save();
    canvas.translate(-3.5, -5);
    canvas.rotate(-0.15 - 0.75 * p.ear);
    final ear = Path()
      ..moveTo(0, 0)
      ..cubicTo(-5.5, -5.5, -12, -4.6, -13, 0)
      ..cubicTo(-10, 2, -5.5, 3.6, -1, 4.5)
      ..close();
    canvas.drawPath(ear, _fill(brindle));
    canvas.drawPath(
      Path()
        ..moveTo(-2, 1)
        ..cubicTo(-5.5, -2.6, -9, -2.6, -10, 0)
        ..cubicTo(-7.5, 1.4, -4.6, 2.3, -2, 2.8)
        ..close(),
      _fill(pink.withValues(alpha: 0.4 + 0.5 * p.ear)),
    );
    canvas.restore();

    // barbilla clarita y la rayita clara del hocico
    canvas.drawPath(
      Path()
        ..moveTo(2.5, 5)
        ..cubicTo(10, 7.2, 18, 7.1, 25, 5.9)
        ..cubicTo(18, 9.2, 8.5, 9.6, 1.5, 8)
        ..close(),
      _fill(cream),
    );
    canvas.drawPath(
      Path()
        ..moveTo(8, -4.4)
        ..quadraticBezierTo(16, -2.4, 23, 1),
      _stroke(fawnLight, 1.1),
    );
    // cejita
    canvas.drawPath(
      Path()
        ..moveTo(1.2, -5)
        ..quadraticBezierTo(4, -6.4, 6.8, -4.6),
      _stroke(cream, 1.4),
    );

    // Nariz
    canvas.drawOval(Rect.fromCenter(center: const Offset(26.2, 2.7), width: 4.6, height: 3.8), _fill(ink));
    canvas.drawCircle(const Offset(25.6, 1.8), 0.7, _fill(Colors.white.withValues(alpha: 0.7)));

    // Boca: sonrisita; con la boca abierta saca la lengua, que cuelga y tiene su rayita al centro.
    final m = p.mouthOpen;
    if (m > 0.05) {
      canvas.drawPath(
        Path()
          ..moveTo(12.5, 5.9)
          ..quadraticBezierTo(18, 5.9 + 4 * m, 23.5, 6.2)
          ..close(),
        _fill(const Color(0xFF5A2328)),
      );
      final tongue = Path()
        ..moveTo(14.8, 6.6)
        ..cubicTo(14.2, 9 + 4 * m, 15.2, 11.2 + 5 * m, 17.5 + 0.4 * m, 11.4 + 5 * m)
        ..cubicTo(20, 11.2 + 5 * m, 20.8, 9 + 4 * m, 20, 6.6)
        ..close();
      canvas.drawPath(tongue, _fill(const Color(0xFFF07F8E)));
      canvas.drawPath(
        Path()
          ..moveTo(17.4, 7.4)
          ..lineTo(17.6, 8.8 + 4.2 * m),
        _stroke(const Color(0xFFC95668), 0.75),
      );
      canvas.drawOval(Rect.fromCenter(center: Offset(16.1, 8.6 + 2 * m), width: 1.2, height: 2.1), _fill(Colors.white.withValues(alpha: 0.45)));
    } else {
      canvas.drawPath(
        Path()
          ..moveTo(13, 5.9)
          ..quadraticBezierTo(17.5, 7.6, 22, 6.2),
        _stroke(ink.withValues(alpha: 0.75), 0.95),
      );
    }


    // Ojo grandote con brillito
    final eye = Rect.fromCenter(center: const Offset(4, -1.8), width: 5.2, height: 6.2 * p.blink + 0.4);
    canvas.drawOval(eye, _fill(ink));
    if (p.blink > 0.5) {
      canvas.drawCircle(const Offset(5.1, -3.1), 1.2, _fill(Colors.white));
      canvas.drawCircle(const Offset(3.2, -0.3), 0.55, _fill(Colors.white.withValues(alpha: 0.8)));
    }
  }

  // ── El suéter (opcional) ──
  void _sweater(Canvas canvas) {
    final body = Path()
      ..moveTo(46, 45)
      ..cubicTo(56, 44, 68, 43, 78, 40)
      ..cubicTo(88, 44, 90, 58, 86, 67)
      ..cubicTo(81, 72, 72, 72, 66, 68)
      ..cubicTo(60, 63, 52, 59, 47, 60)
      ..cubicTo(44, 55, 43, 49, 46, 45)
      ..close();
    canvas.drawPath(body, _fill(sweaterC));
    canvas.save();
    canvas.clipPath(body);
    _knit(canvas, const Rect.fromLTWH(40, 38, 52, 38));
    canvas.restore();
    canvas.save();
    canvas.translate(84, 41);
    canvas.rotate(-0.45);
    final roll = RRect.fromRectAndRadius(Rect.fromCenter(center: Offset.zero, width: 22, height: 13), const Radius.circular(6.5));
    canvas.drawRRect(roll, _fill(sweaterC));
    canvas.save();
    canvas.clipRRect(roll);
    _knit(canvas, const Rect.fromLTWH(-13, -8, 26, 16), small: true);
    canvas.restore();
    canvas.restore();
  }

  void _knit(Canvas canvas, Rect r, {bool small = false}) {
    final step = small ? 2.4 : 3.2;
    final light = _stroke(sweaterLight.withValues(alpha: 0.55), small ? 0.6 : 0.75);
    final dark = _stroke(sweaterDark.withValues(alpha: 0.45), small ? 0.6 : 0.75);
    var row = 0;
    for (var y = r.top; y < r.bottom; y += step) {
      final off = (row % 2) * step / 2;
      var i = 0;
      for (var x = r.left + off; x < r.right; x += step) {
        final paint = (i * 7 + row * 3) % 5 < 2 ? light : dark;
        canvas.drawLine(Offset(x, y), Offset(x + step / 2, y + step * 0.7), paint);
        canvas.drawLine(Offset(x + step, y), Offset(x + step / 2, y + step * 0.7), paint);
        i++;
      }
      row++;
    }
  }

  @override
  bool shouldRepaint(SalsaPainter old) =>
      old.flip != flip ||
      old.sweater != sweater ||
      old.ball != ball ||
      old.shadow != shadow ||
      old.pose.breath != pose.breath ||
      old.pose.blink != pose.blink ||
      old.pose.tail != pose.tail ||
      old.pose.ear != pose.ear ||
      old.pose.tuck != pose.tuck ||
      old.pose.headTilt != pose.headTilt ||
      old.pose.mouthOpen != pose.mouthOpen;
}

/// Para el ícono y las pruebas: pinta una pose a una imagen.
Future<ui.Image> renderSalsa(double w, double h, {SalsaPose pose = const SalsaPose(), Color? bg}) async {
  final rec = ui.PictureRecorder();
  final c = Canvas(rec);
  if (bg != null) c.drawRect(Rect.fromLTWH(0, 0, w, h), Paint()..color = bg);
  SalsaPainter(pose: pose).paint(c, Size(w, h));
  return rec.endRecording().toImage(w.round(), h.round());
}
