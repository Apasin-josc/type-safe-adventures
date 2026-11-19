import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../ui/i18n.dart';
import '../ui/rich.dart';
import '../ui/sfx.dart';
import '../ui/theme.dart';

class CheckResult {
  const CheckResult(this.ok, [this.msg]);
  final bool ok;
  final String? msg; // HTML corto que explica el error
}

/// El puente entre una pantalla interactiva y el reproductor de la lección.
/// La pantalla avisa cuándo está lista (setReady) y registra cómo calificarse.
class StepController extends ChangeNotifier {
  StepController({required this.step, required this.lang});

  final Map<String, dynamic> step;
  final String lang;
  late final Tr t = translator(lang);
  String tx(Object? v) => i18nTx(v, lang);

  bool ready = false;
  bool retryable = false; // código: reintentos sin límite
  bool interview = false; // modo entrevista: sin pistas
  Future<CheckResult> Function()? onCheck; // null = pantalla de explorar
  void Function(bool ok)? onFeedback;
  VoidCallback? onReveal;
  /// Pista de Salsa (solo retos de código): si se puede pedir una ahorita, y cómo pedirla.
  bool Function()? canHint;
  VoidCallback? onHint;
  VoidCallback? onSubmit; // lo pone el reproductor: "Enter" en un campo de texto

  void setReady(bool v) {
    if (ready == v) return;
    ready = v;
    notifyListeners();
  }
}

String i18nTx(Object? v, String lang) => tx(v, lang);

/// Cómo se ve un valor en JavaScript (JSON.stringify).
String show(Object? v) => jsonEncode(v);

String fmtNum(num n) {
  final s = n.toInt().toString();
  final b = StringBuffer();
  for (var i = 0; i < s.length; i++) {
    if (i > 0 && (s.length - i) % 3 == 0) b.write(',');
    b.write(s[i]);
  }
  return b.toString();
}

List<T> seededShuffle<T>(List<T> list, int seed) {
  final a = List<T>.of(list);
  var s = seed % 2147483647;
  if (s == 0) s = 1;
  for (var i = a.length - 1; i > 0; i--) {
    s = (s * 16807) % 2147483647;
    final j = s % (i + 1);
    final tmp = a[i];
    a[i] = a[j];
    a[j] = tmp;
  }
  return a;
}

/// Estado visual de un casillero.
class CellLook {
  const CellLook({this.state, this.dim = false, this.dashed = false, this.ptr});
  final String? state; // 'sel' | 'good' | 'bad' | 'ptr'
  final bool dim;
  final bool dashed;
  final String? ptr; // 'L', 'R' o 'L R'
}

/// Una fila de casilleros con su índice abajo. Si no caben, se acomodan en renglones parejos.
class ArrayView extends StatelessWidget {
  const ArrayView({super.key, required this.values, this.indices = true, this.onTap, this.look});
  final List<dynamic> values;
  final bool indices;
  final void Function(int i)? onTap;
  final CellLook Function(int i)? look;

  @override
  Widget build(BuildContext context) {
    final p = context.pal;
    final hasPtr = look != null && List.generate(values.length, (i) => look!(i).ptr).any((e) => e != null);
    return LayoutBuilder(builder: (context, c) {
      const gap = 6.0;
      final n = values.length;
      final perRow = ((c.maxWidth + gap) / (46 + gap)).floor().clamp(1, n);
      final w = ((c.maxWidth - gap * (perRow - 1)) / perRow).clamp(0.0, 66.0);
      return Padding(
        padding: EdgeInsets.only(top: hasPtr ? 22 : 4, bottom: 14),
        child: Wrap(
          spacing: gap,
          runSpacing: hasPtr ? 28 : gap,
          children: [
            for (var i = 0; i < n; i++) _cell(context, p, i, w),
          ],
        ),
      );
    });
  }

  Widget _cell(BuildContext context, Palette p, int i, double w) {
    final l = look?.call(i) ?? const CellLook();
    final (border, fill) = switch (l.state) {
      'sel' => (p.sel, p.selSoft),
      'good' => (p.good, p.goodSoft),
      'bad' => (p.bad, p.badSoft),
      'ptr' => (p.accent, p.surface),
      _ => (p.line, p.surface),
    };
    final cell = AnimatedOpacity(
      duration: const Duration(milliseconds: 200),
      opacity: l.dim ? 0.3 : 1,
      child: Stack(
        clipBehavior: Clip.none,
        alignment: Alignment.topCenter,
        children: [
          AnimatedContainer(
            duration: const Duration(milliseconds: 150),
            width: w,
            height: 60,
            decoration: BoxDecoration(
              color: fill,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: border, width: l.dashed ? 1.5 : 2),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                FittedBox(child: Text('${values[i]}', style: monoStyle(size: 18, color: p.ink, weight: FontWeight.w700).copyWith(height: 1.1))),
                if (indices) Text('$i', style: monoStyle(size: 11, color: p.faint, weight: FontWeight.w700).copyWith(height: 1.3)),
              ],
            ),
          ),
          if (l.ptr != null)
            Positioned(
              top: -20,
              child: Text(l.ptr!, style: TextStyle(color: p.accent, fontWeight: FontWeight.w900, fontSize: 13)),
            ),
        ],
      ),
    );
    if (onTap == null) return cell;
    return GestureDetector(
      onTap: () {
        HapticFeedback.selectionClick();
        sfx.play(Sfx.tap);
        onTap!(i);
      },
      child: cell,
    );
  }
}

/// Una línea de estado que cambia según lo que haces (con un poco de HTML).
class StatusLine extends StatelessWidget {
  const StatusLine(this.html, {super.key});
  final String html;
  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 10),
        child: html.isEmpty
            ? const SizedBox(height: 22)
            : Rich(html, style: const TextStyle(fontSize: 16, height: 1.4, fontWeight: FontWeight.w600)),
      );
}

/// Etiqueta chiquita en mayúsculas ("TU CÓDIGO", "PRUEBAS").
class SmallLabel extends StatelessWidget {
  const SmallLabel(this.text, {super.key});
  final String text;
  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.only(top: 16, bottom: 6),
        child: Text(text.toUpperCase(), style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, letterSpacing: 0.8, color: context.pal.faint)),
      );
}
