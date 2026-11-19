// Dibuja a Salsa en varias poses para revisarla:  flutter test tool/salsa_preview_test.dart
import 'dart:io';
import 'dart:ui' as ui;

import 'package:chispa/ui/salsa_painter.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('poses', (tester) async {
    await tester.runAsync(() async {
      const poses = [
        SalsaPose(),
        SalsaPose(tail: 1, ear: 1, mouthOpen: 1, headTilt: -0.12),
        SalsaPose(tuck: 1, ear: 0.6, tail: -0.5),
        SalsaPose(blink: 0, tail: -1),
      ];
      const w = 480.0, h = 400.0;
      final rec = ui.PictureRecorder();
      final c = Canvas(rec);
      c.drawRect(const Rect.fromLTWH(0, 0, w * 2, h * 2), Paint()..color = const Color(0xFFF6F1E7));
      for (var i = 0; i < poses.length; i++) {
        c.save();
        c.translate((i % 2) * w, (i ~/ 2) * h);
        SalsaPainter(pose: poses[i]).paint(c, const Size(w, h));
        c.restore();
      }
      final img = await rec.endRecording().toImage((w * 2).round(), (h * 2).round());
      final png = await img.toByteData(format: ui.ImageByteFormat.png);
      File('tool/salsa-preview.png').writeAsBytesSync(png!.buffer.asUint8List());
    });
  });
}
