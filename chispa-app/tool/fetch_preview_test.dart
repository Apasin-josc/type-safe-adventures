// Dibuja la animación de "Salsa va por la pista" en varios instantes:  flutter test tool/fetch_preview_test.dart
import 'dart:io';
import 'dart:ui' as ui;

import 'package:chispa/ui/salsa_fetch.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('cuadros', (tester) async {
    await tester.runAsync(() async {
      const frames = [
        (FetchKind.dig, 0.45), (FetchKind.dig, 1.2), (FetchKind.dig, 1.6), (FetchKind.dig, 2.08), (FetchKind.dig, 2.6),
        (FetchKind.ball, 0.45), (FetchKind.ball, 1.0), (FetchKind.ball, 1.7), (FetchKind.ball, 2.5),
      ];
      const w = 360.0, h = 104.0, s = 2.0;
      final rec = ui.PictureRecorder();
      final c = Canvas(rec);
      c.scale(s);
      c.drawRect(Rect.fromLTWH(0, 0, w, h * frames.length), Paint()..color = const Color(0xFFF6F1E7));
      for (var i = 0; i < frames.length; i++) {
        c.save();
        c.translate(0, i * h);
        c.drawLine(const Offset(0, 0), const Offset(w, 0), Paint()..color = const Color(0x22000000));
        final (kind, t) = frames[i];
        SalsaFetch.painterAt(t, kind).paint(c, const Size(w, h));
        final tp = TextPainter(text: TextSpan(text: '${kind.name} t=$t', style: const TextStyle(fontSize: 10, color: Color(0xFF8C879C))), textDirection: TextDirection.ltr)..layout();
        tp.paint(c, const Offset(4, 3));
        c.restore();
      }
      final img = await rec.endRecording().toImage((w * s).round(), (h * frames.length * s).round());
      final png = await img.toByteData(format: ui.ImageByteFormat.png);
      File('tool/fetch-preview.png').writeAsBytesSync(png!.buffer.asUint8List());
    });
  });
}
