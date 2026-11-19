// Salsa de frente en 4 momentos del festejo:  flutter test tool/face_preview_test.dart
import 'dart:io';
import 'dart:ui' as ui;

import 'package:chispa/ui/salsa_face.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('cara', (tester) async {
    await tester.runAsync(() async {
      final frames = [
        SalsaFacePainter(),
        SalsaFacePainter(glasses: 0.55, ear: 0.3),
        SalsaFacePainter(glasses: 1, glint: 0.45, ear: 1, tilt: -0.08),
        SalsaFacePainter(glasses: 1, ear: 0.6, tongue: 1),
      ];
      const w = 400.0, h = 448.0;
      final rec = ui.PictureRecorder();
      final c = Canvas(rec);
      c.drawRect(const Rect.fromLTWH(0, 0, w * 4, h), Paint()..color = const Color(0xFFF6F1E7));
      for (var i = 0; i < frames.length; i++) {
        c.save();
        c.translate(i * w, 0);
        frames[i].paint(c, const Size(w, h));
        c.restore();
      }
      final img = await rec.endRecording().toImage((w * 4).round(), h.round());
      final png = await img.toByteData(format: ui.ImageByteFormat.png);
      File('tool/face-preview.png').writeAsBytesSync(png!.buffer.asUint8List());
    });
  });
}
