// Genera el ícono de la app (retrato de Salsa con su suéter):  flutter test tool/icon_test.dart
import 'dart:io';
import 'dart:ui' as ui;

import 'package:chispa/ui/salsa_painter.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('icono', (tester) async {
    await tester.runAsync(() async {
      const s = 1024.0;
      final rec = ui.PictureRecorder();
      final canvas = Canvas(rec);
      canvas.drawRect(
        const Rect.fromLTWH(0, 0, s, s),
        Paint()
          ..shader = const RadialGradient(center: Alignment(0.2, -0.3), radius: 1.1, colors: [Color(0xFF4A5C93), Color(0xFF262C52), Color(0xFF15162A)])
              .createShader(const Rect.fromLTWH(0, 0, s, s)),
      );
      final dot = Paint()..color = const Color(0x88FFB36B);
      for (final (o, r) in const [(Offset(150, 190), 16.0), (Offset(260, 120), 9.0), (Offset(880, 860), 14.0), (Offset(120, 880), 10.0)]) {
        canvas.drawCircle(o, r, dot);
      }
      // Acercamiento a la cabeza y el cuello de tortuga.
      canvas.save();
      canvas.translate(512, 520);
      canvas.scale(7.4);
      canvas.translate(-62, -55);
      SalsaPainter(pose: const SalsaPose(mouthOpen: 1, ear: 0.4, headTilt: -0.05, tail: 0.6)).paint(canvas, const Size(126, 108));
      canvas.restore();
      final img = await rec.endRecording().toImage(1024, 1024);
      final png = await img.toByteData(format: ui.ImageByteFormat.png);
      File('tool/icon-1024.png').writeAsBytesSync(png!.buffer.asUint8List());
    });
  });
}
