import 'dart:async';
import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../ui/chunky.dart';
import '../ui/code.dart';
import '../ui/i18n.dart';
import '../ui/rich.dart';
import '../ui/theme.dart';
import 'common.dart';

// ─────────────── Visualizador: ver una estructura cambiar paso a paso ───────────────
//
// Como "trace" (código con la línea que corre + variables + nota), pero cada cuadro además
// dibuja la estructura. Un cuadro puede traer cualquiera de estos paneles:
//   array     {values, hl, ptrs}                casilleros
//   bars      {values, hl, ptrs}                barras (para ordenar)
//   list      {values, links, hl, ptrs}         lista ligada; links [[de, a]], a = -1 es null
//   stack     {items, hl}                       pila (el tope arriba)
//   queue     {items, hl}                       cola (frente a la izquierda)
//   intervals {items, hl, merged}               intervalos sobre una recta (step.axis = [min, max])
//   graph     {hl, ehl, labels, show, edges}    grafo o árbol (step.graph = {nodes, edges, directed, names, h})
//   grid      {cells, hl, colors, rows, cols}   cuadrícula 2D; hl con llaves "fila,col"; colors {valor: estado}
// hl: {índice o nodo: 'cur' | 'cmp' | 'good' | 'bad' | 'pivot' | 'dim'}.

typedef _Look = ({Color fill, Color edge, Color ink, bool dim});

_Look _look(Palette p, Object? state) => switch (state) {
      'cur' => (fill: p.selSoft, edge: p.sel, ink: p.ink, dim: false),
      'cmp' => (fill: p.accentSoft, edge: p.accent, ink: p.ink, dim: false),
      'good' => (fill: p.goodSoft, edge: p.good, ink: p.ink, dim: false),
      'bad' => (fill: p.badSoft, edge: p.bad, ink: p.ink, dim: false),
      'pivot' => (fill: p.accent, edge: p.accent, ink: p.accentInk, dim: false),
      'dim' => (fill: p.surface, edge: p.line, ink: p.faint, dim: true),
      _ => (fill: p.surface, edge: p.line, ink: p.ink, dim: false),
    };

Object? _hl(Map? m, Object key) => m?['$key'];

/// {etiqueta: índice} → {índice: 'a, b'}
Map<int, String> _ptrs(Map? m) {
  final out = <int, String>{};
  m?.forEach((label, i) {
    if (i is num && i >= 0) out[i.toInt()] = out[i.toInt()] == null ? '$label' : '${out[i.toInt()]}, $label';
  });
  return out;
}

class VizStep extends StatefulWidget {
  const VizStep(this.c, {super.key});
  final StepController c;
  @override
  State<VizStep> createState() => _VizStepState();
}

class _VizStepState extends State<VizStep> {
  int k = 0;
  Timer? timer;
  late final List frames = widget.c.step['frames'] as List;
  late final int stackMax = _maxLen('stack');

  int _maxLen(String panel) => frames.fold(0, (m, f) => math.max(m, ((f as Map)[panel]?['items'] as List?)?.length ?? 0));

  @override
  void initState() {
    super.initState();
    if (frames.length == 1) widget.c.setReady(true);
  }

  @override
  void dispose() {
    timer?.cancel();
    super.dispose();
  }

  void _go(int d, {bool stop = true}) {
    if (stop) _stop();
    setState(() {
      k = (k + d).clamp(0, frames.length - 1);
      if (k == frames.length - 1) {
        widget.c.setReady(true);
        _stop();
      }
    });
    HapticFeedback.selectionClick();
  }

  void _stop() {
    timer?.cancel();
    timer = null;
  }

  void _togglePlay() {
    if (timer != null) return setState(_stop);
    if (k == frames.length - 1) setState(() => k = 0);
    timer = Timer.periodic(const Duration(milliseconds: 1600), (_) {
      if (mounted) _go(1, stop: false);
    });
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final p = context.pal;
    final c = widget.c;
    final s = c.step;
    final f = frames[k] as Map;
    final vars = (f['vars'] as Map? ?? const {}).entries.toList();
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      if (s['code'] != null) ...[
        CodeBlock(s['code'] as String, size: 13, highlightLine: (f['line'] as num?)?.toInt()),
        const SizedBox(height: 12),
      ],
      // Sin crossfade: las barras y colores se animan solos, y las flechas cambian de golpe.
      Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            if (f['array'] != null) _array(f['array'] as Map),
            if (f['bars'] != null) _Bars(f['bars'] as Map),
            if (f['list'] != null) _List(f['list'] as Map),
            if (f['stack'] != null || f['queue'] != null)
              Wrap(spacing: 28, runSpacing: 12, crossAxisAlignment: WrapCrossAlignment.end, children: [
                if (f['stack'] != null) _Stack(f['stack'] as Map, max: stackMax, t: c.t),
                if (f['queue'] != null) _Queue(f['queue'] as Map, t: c.t),
              ]),
            if (f['intervals'] != null) _Intervals(f['intervals'] as Map, axis: s['axis'] as List?, t: c.t),
            if (f['graph'] != null) _Graph(spec: s['graph'] as Map, frame: f['graph'] as Map),
            if (f['grid'] != null) _Grid(f['grid'] as Map),
          ]),
      if (vars.isNotEmpty) ...[
        const SizedBox(height: 10),
        Wrap(spacing: 8, runSpacing: 8, children: [
          for (final e in vars)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
              decoration: BoxDecoration(color: p.surface, borderRadius: BorderRadius.circular(10), border: Border.all(color: p.line, width: 2)),
              child: Row(mainAxisSize: MainAxisSize.min, children: [
                Text('${e.key}', style: monoStyle(size: 14, color: p.muted)),
                const SizedBox(width: 8),
                Text(e.value is String ? e.value as String : show(e.value), style: monoStyle(size: 16, color: p.ink, weight: FontWeight.w800)),
              ]),
            ),
        ]),
      ],
      const SizedBox(height: 12),
      // La nota de Salsa de este cuadro.
      Container(
        width: double.infinity,
        constraints: const BoxConstraints(minHeight: 64),
        padding: const EdgeInsets.fromLTRB(14, 10, 14, 10),
        decoration: BoxDecoration(
          color: p.surface,
          borderRadius: BorderRadius.circular(14),
          border: Border(left: BorderSide(color: p.accent, width: 4)),
        ),
        child: Rich(f['note'] == null ? '' : c.tx(f['note']), style: TextStyle(fontSize: 15.5, height: 1.35, color: p.ink)),
      ),
      const SizedBox(height: 10),
      // Puntitos: un cuadro cada uno.
      Center(
        child: Wrap(spacing: 5, runSpacing: 5, children: [
          for (var i = 0; i < frames.length; i++)
            AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: i == k ? 18 : 7,
              height: 7,
              decoration: BoxDecoration(color: i <= k ? p.accent : p.line, borderRadius: BorderRadius.circular(9)),
            ),
        ]),
      ),
      const SizedBox(height: 10),
      Row(children: [
        Expanded(child: ChunkyButton(label: '◀', kind: ChunkyKind.ghost, onPressed: k == 0 ? null : () => _go(-1))),
        const SizedBox(width: 8),
        Expanded(child: ChunkyButton(label: timer != null ? '⏸' : '▶ ${c.t('play')}', kind: ChunkyKind.ghost, onPressed: _togglePlay)),
        const SizedBox(width: 8),
        Expanded(child: ChunkyButton(label: '${c.t('step')} ▶', kind: ChunkyKind.ghost, onPressed: k == frames.length - 1 ? null : () => _go(1))),
      ]),
    ]);
  }

  Widget _array(Map a) {
    final ptrs = _ptrs(a['ptrs'] as Map?);
    final hl = a['hl'] as Map?;
    return ArrayView(
      values: a['values'] as List,
      indices: a['indices'] != false,
      look: (i) {
        final st = _hl(hl, i);
        return CellLook(
          state: switch (st) { 'cur' => 'sel', 'good' => 'good', 'bad' => 'bad', 'cmp' || 'pivot' => 'ptr', _ => null },
          dim: st == 'dim',
          ptr: ptrs[i],
        );
      },
    );
  }
}

// ─────────────── Barras ───────────────
class _Bars extends StatelessWidget {
  const _Bars(this.b);
  final Map b;

  @override
  Widget build(BuildContext context) {
    final p = context.pal;
    final v = [for (final x in b['values'] as List) (x as num).toDouble()];
    final top = v.fold<double>(1, math.max);
    final ptrs = _ptrs(b['ptrs'] as Map?);
    final hl = b['hl'] as Map?;
    // Huecos entre grupos (merge sort): índices después de los que va un espacio.
    final gaps = {for (final g in (b['gaps'] as List? ?? const [])) (g as num).toInt()};
    return Padding(
      padding: const EdgeInsets.only(top: 4, bottom: 6),
      child: SizedBox(
        height: 170,
        child: Row(crossAxisAlignment: CrossAxisAlignment.end, children: [
          for (var i = 0; i < v.length; i++) ...[
            Expanded(
              child: Builder(builder: (context) {
                final l = _look(p, _hl(hl, i));
                return AnimatedOpacity(
                  duration: const Duration(milliseconds: 250),
                  opacity: l.dim ? 0.3 : 1,
                  child: Column(mainAxisAlignment: MainAxisAlignment.end, children: [
                    SizedBox(
                      height: 18,
                      child: ptrs[i] == null
                          ? null
                          : FittedBox(child: Text(ptrs[i]!, style: TextStyle(color: p.accent, fontWeight: FontWeight.w900, fontSize: 13))),
                    ),
                    AnimatedContainer(
                      duration: const Duration(milliseconds: 350),
                      curve: Curves.easeOutCubic,
                      margin: const EdgeInsets.symmetric(horizontal: 3),
                      height: 14 + 106 * v[i] / top,
                      decoration: BoxDecoration(
                        color: l.fill == p.surface ? p.code : l.fill,
                        borderRadius: const BorderRadius.vertical(top: Radius.circular(8), bottom: Radius.circular(3)),
                        border: Border.all(color: l.edge == p.line ? p.faint.withValues(alpha: 0.5) : l.edge, width: 2),
                      ),
                    ),
                    const SizedBox(height: 4),
                    FittedBox(child: Text(_num(v[i]), style: monoStyle(size: 15, color: p.ink, weight: FontWeight.w800))),
                  ]),
                );
              }),
            ),
            if (gaps.contains(i) && i < v.length - 1) const SizedBox(width: 14),
          ],
        ]),
      ),
    );
  }
}

String _num(num v) => v == v.roundToDouble() ? v.toInt().toString() : v.toString();

// ─────────────── Pila y cola ───────────────
class _Stack extends StatelessWidget {
  const _Stack(this.s, {required this.max, required this.t});
  final Map s;
  final int max;
  final Tr t;

  @override
  Widget build(BuildContext context) {
    final p = context.pal;
    final items = s['items'] as List;
    final hl = s['hl'] as Map?;
    return Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisSize: MainAxisSize.min, children: [
      Text(s['label'] as String? ?? t('viz_stack'), style: TextStyle(color: p.faint, fontSize: 12, fontWeight: FontWeight.w800, letterSpacing: 0.6)),
      const SizedBox(height: 6),
      Container(
        width: 96,
        constraints: BoxConstraints(minHeight: math.max(1, max) * 38.0 + 10),
        padding: const EdgeInsets.fromLTRB(6, 6, 6, 6),
        decoration: BoxDecoration(
          border: Border(left: BorderSide(color: p.faint, width: 2.5), right: BorderSide(color: p.faint, width: 2.5), bottom: BorderSide(color: p.faint, width: 2.5)),
          borderRadius: const BorderRadius.vertical(bottom: Radius.circular(10)),
        ),
        child: Column(mainAxisAlignment: MainAxisAlignment.end, mainAxisSize: MainAxisSize.min, children: [
          for (var i = items.length - 1; i >= 0; i--) _box(p, items[i], _look(p, _hl(hl, i) ?? (i == items.length - 1 ? 'cur' : null)), top: i == items.length - 1),
        ]),
      ),
      if (items.isEmpty) Padding(padding: const EdgeInsets.only(top: 4), child: Text(t('viz_empty'), style: TextStyle(color: p.faint, fontSize: 12))),
    ]);
  }

  Widget _box(Palette p, Object? v, _Look l, {required bool top}) => Container(
        height: 32,
        margin: const EdgeInsets.only(top: 4),
        alignment: Alignment.center,
        decoration: BoxDecoration(color: l.fill, borderRadius: BorderRadius.circular(8), border: Border.all(color: l.edge, width: 2)),
        child: FittedBox(child: Text('$v', style: monoStyle(size: 15, color: l.ink, weight: FontWeight.w800))),
      );
}

class _Queue extends StatelessWidget {
  const _Queue(this.q, {required this.t});
  final Map q;
  final Tr t;

  @override
  Widget build(BuildContext context) {
    final p = context.pal;
    final items = q['items'] as List;
    final hl = q['hl'] as Map?;
    return Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisSize: MainAxisSize.min, children: [
      Text(q['label'] as String? ?? t('viz_queue'), style: TextStyle(color: p.faint, fontSize: 12, fontWeight: FontWeight.w800, letterSpacing: 0.6)),
      const SizedBox(height: 6),
      Container(
        constraints: const BoxConstraints(minWidth: 120, minHeight: 50),
        padding: const EdgeInsets.all(6),
        decoration: BoxDecoration(
          border: Border.symmetric(horizontal: BorderSide(color: p.faint, width: 2.5)),
        ),
        child: Wrap(spacing: 6, runSpacing: 6, children: [
          for (var i = 0; i < items.length; i++)
            Builder(builder: (context) {
              final l = _look(p, _hl(hl, i) ?? (i == 0 ? 'cur' : null));
              return Container(
                constraints: const BoxConstraints(minWidth: 38),
                height: 36,
                padding: const EdgeInsets.symmetric(horizontal: 8),
                alignment: Alignment.center,
                decoration: BoxDecoration(color: l.fill, borderRadius: BorderRadius.circular(8), border: Border.all(color: l.edge, width: 2)),
                child: Text('${items[i]}', style: monoStyle(size: 15, color: l.ink, weight: FontWeight.w800)),
              );
            }),
        ]),
      ),
      const SizedBox(height: 4),
      Text(items.isEmpty ? t('viz_empty') : '↑ ${t('viz_front')}', style: TextStyle(color: p.faint, fontSize: 12, fontWeight: FontWeight.w700)),
    ]);
  }
}

// ─────────────── Intervalos sobre una recta ───────────────
class _Intervals extends StatelessWidget {
  const _Intervals(this.m, {required this.axis, required this.t});
  final Map m;
  final List? axis;
  final Tr t;

  @override
  Widget build(BuildContext context) {
    final p = context.pal;
    final items = [for (final x in m['items'] as List) [for (final y in x as List) (y as num).toDouble()]];
    final merged = [for (final x in (m['merged'] as List? ?? const [])) [for (final y in x as List) (y as num).toDouble()]];
    final all = [...items, ...merged];
    final lo = axis != null ? (axis![0] as num).toDouble() : all.map((e) => e[0]).fold<double>(0, math.min);
    final hi = axis != null ? (axis![1] as num).toDouble() : all.map((e) => e[1]).fold<double>(1, math.max);
    final hl = m['hl'] as Map?;
    return LayoutBuilder(builder: (context, box) {
      final w = box.maxWidth;
      double x(double v) => (v - lo) / (hi - lo) * (w - 2) + 1;
      Widget bar(List<double> e, _Look l) => Container(
            margin: EdgeInsets.only(left: x(e[0])),
            width: math.max(26, x(e[1]) - x(e[0])),
            height: 26,
            alignment: Alignment.center,
            decoration: BoxDecoration(color: l.fill, borderRadius: BorderRadius.circular(7), border: Border.all(color: l.edge, width: 2)),
            child: FittedBox(child: Text('${_num(e[0])}–${_num(e[1])}', style: monoStyle(size: 12.5, color: l.ink, weight: FontWeight.w800))),
          );
      final step = math.max(1, ((hi - lo) / 9).ceil());
      return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        for (var i = 0; i < items.length; i++)
          Padding(
            padding: const EdgeInsets.only(bottom: 5),
            child: Opacity(opacity: _hl(hl, i) == 'dim' ? 0.3 : 1, child: bar(items[i], _look(p, _hl(hl, i)))),
          ),
        // La recta con sus números.
        SizedBox(
          height: 22,
          child: Stack(clipBehavior: Clip.none, children: [
            Positioned(left: 0, right: 0, top: 4, child: Container(height: 2, color: p.line)),
            for (var v = lo; v <= hi; v += step)
              Positioned(
                left: x(v) - 10,
                top: 7,
                child: SizedBox(width: 20, child: Text(_num(v), textAlign: TextAlign.center, style: monoStyle(size: 10.5, color: p.faint))),
              ),
          ]),
        ),
        if (merged.isNotEmpty) ...[
          const SizedBox(height: 8),
          Text(t('viz_result'), style: TextStyle(color: p.good, fontSize: 12, fontWeight: FontWeight.w900, letterSpacing: 0.6)),
          const SizedBox(height: 4),
          SizedBox(
            height: 26,
            child: Stack(children: [
              for (final e in merged) Positioned(left: 0, top: 0, child: bar(e, _look(p, 'good'))),
            ]),
          ),
        ],
      ]);
    });
  }
}

// ─────────────── Lista ligada: cajitas con flechas ───────────────
class _List extends StatelessWidget {
  const _List(this.m);
  final Map m;

  @override
  Widget build(BuildContext context) {
    final values = m['values'] as List;
    final links = m['links'] as List? ?? [for (var i = 0; i < values.length; i++) [i, i + 1 < values.length ? i + 1 : -1]];
    return LayoutBuilder(
      builder: (context, box) => CustomPaint(
        size: Size(box.maxWidth, 132),
        painter: _ListPainter(
          pal: context.pal,
          values: values,
          links: [for (final l in links) (((l as List)[0] as num).toInt(), (l[1] as num).toInt())],
          hl: m['hl'] as Map?,
          ptrs: _ptrs(m['ptrs'] as Map?),
        ),
      ),
    );
  }
}

class _ListPainter extends CustomPainter {
  _ListPainter({required this.pal, required this.values, required this.links, required this.hl, required this.ptrs});
  final Palette pal;
  final List values;
  final List<(int, int)> links;
  final Map? hl;
  final Map<int, String> ptrs;

  static const y0 = 44.0, bh = 38.0;

  @override
  void paint(Canvas canvas, Size size) {
    final n = values.length;
    if (n == 0) return;
    final bw = math.min(52.0, (size.width - (n - 1) * 26) / n);
    final gap = n == 1 ? 0.0 : math.min(44.0, (size.width - n * bw) / (n - 1));
    final x0 = (size.width - (n * bw + (n - 1) * gap)) / 2;
    double left(int i) => x0 + i * (bw + gap);

    final line = Paint()
      ..color = pal.muted
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    void head(Offset tip, Offset from) {
      final d = tip - from;
      final a = math.atan2(d.dy, d.dx);
      final path = Path()
        ..moveTo(tip.dx, tip.dy)
        ..lineTo(tip.dx - 8 * math.cos(a - 0.45), tip.dy - 8 * math.sin(a - 0.45))
        ..lineTo(tip.dx - 8 * math.cos(a + 0.45), tip.dy - 8 * math.sin(a + 0.45))
        ..close();
      canvas.drawPath(path, Paint()..color = pal.muted);
    }

    void text(String s, Offset c, TextStyle st) {
      final tp = TextPainter(text: TextSpan(text: s, style: st), textDirection: TextDirection.ltr)..layout(maxWidth: 200);
      tp.paint(canvas, c - Offset(tp.width / 2, tp.height / 2));
    }

    for (final (a, b) in links) {
      if (a >= n) continue;
      if (b < 0) {
        // null: una flechita hacia abajo con "null".
        final s = Offset(left(a) + bw * 0.3, y0 + bh);
        final e = s + const Offset(0, 16);
        canvas.drawLine(s, e, line);
        head(e, s);
        text('null', e + const Offset(0, 10), monoStyle(size: 11, color: pal.faint, weight: FontWeight.w700));
      } else if (b == a + 1) {
        final s = Offset(left(a) + bw, y0 + bh / 2);
        final e = Offset(left(b) - 1, y0 + bh / 2);
        canvas.drawLine(s, e, line);
        head(e, s);
      } else if (b < a) {
        // Hacia atrás (la lista al revés, o un ciclo): curva por abajo.
        final s = Offset(left(a) + bw * 0.25, y0 + bh);
        final e = Offset(left(b) + bw * 0.75, y0 + bh + 2);
        final c = Offset((s.dx + e.dx) / 2, y0 + bh + 30 + 6.0 * (a - b));
        canvas.drawPath(Path()..moveTo(s.dx, s.dy)..quadraticBezierTo(c.dx, c.dy, e.dx, e.dy), line);
        head(e, c);
      } else if (b > a + 1) {
        // Brinca nodos: curva por arriba.
        final s = Offset(left(a) + bw * 0.75, y0);
        final e = Offset(left(b) + bw * 0.25, y0 - 2);
        final c = Offset((s.dx + e.dx) / 2, y0 - 24);
        canvas.drawPath(Path()..moveTo(s.dx, s.dy)..quadraticBezierTo(c.dx, c.dy, e.dx, e.dy), line);
        head(e, c);
      }
    }

    for (var i = 0; i < n; i++) {
      final l = _look(pal, _hl(hl, i));
      final r = RRect.fromRectAndRadius(Rect.fromLTWH(left(i), y0, bw, bh), const Radius.circular(9));
      final alpha = l.dim ? 0.3 : 1.0;
      canvas.drawRRect(r, Paint()..color = l.fill.withValues(alpha: alpha));
      canvas.drawRRect(
          r,
          Paint()
            ..color = l.edge.withValues(alpha: alpha)
            ..style = PaintingStyle.stroke
            ..strokeWidth = 2);
      text('${values[i]}', r.center, monoStyle(size: 16, color: l.ink.withValues(alpha: alpha), weight: FontWeight.w800));
      final label = ptrs[i];
      if (label != null) {
        text(label, Offset(left(i) + bw / 2, 12), TextStyle(color: pal.accent, fontWeight: FontWeight.w900, fontSize: 12.5));
        final s = Offset(left(i) + bw / 2, 22);
        final e = Offset(left(i) + bw / 2, y0 - 3);
        canvas.drawLine(s, e, Paint()..color = pal.accent..strokeWidth = 2);
        final path = Path()
          ..moveTo(e.dx, e.dy)
          ..lineTo(e.dx - 4, e.dy - 6)
          ..lineTo(e.dx + 4, e.dy - 6)
          ..close();
        canvas.drawPath(path, Paint()..color = pal.accent);
      }
    }
  }

  @override
  bool shouldRepaint(_ListPainter old) => true;
}

// ─────────────── Cuadrícula 2D (islas, tablas de DP) ───────────────
class _Grid extends StatelessWidget {
  const _Grid(this.g);
  final Map g;

  @override
  Widget build(BuildContext context) {
    final p = context.pal;
    final cells = [for (final r in g['cells'] as List) r as List];
    final hl = g['hl'] as Map?;
    final colors = g['colors'] as Map?;
    final rows = g['rows'] as List?; // etiquetas a la izquierda
    final cols = g['cols'] as List?; // etiquetas arriba
    final nCols = cells.isEmpty ? 0 : cells.first.length;
    return LayoutBuilder(builder: (context, box) {
      const gap = 4.0;
      final labelW = rows != null ? 26.0 : 0.0;
      final size = ((box.maxWidth - labelW - gap * (nCols - 1)) / math.max(1, nCols)).clamp(18.0, 46.0);
      Widget label(Object? v) => SizedBox(
            width: size,
            height: 20,
            child: Center(child: Text('${v ?? ''}', style: monoStyle(size: 12.5, color: p.faint, weight: FontWeight.w800))),
          );
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: 6),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          if (cols != null)
            Row(children: [
              SizedBox(width: labelW),
              for (var c = 0; c < nCols; c++) ...[label(c < cols.length ? cols[c] : ''), if (c < nCols - 1) const SizedBox(width: gap)],
            ]),
          for (var r = 0; r < cells.length; r++)
            Padding(
              padding: const EdgeInsets.only(top: gap),
              child: Row(children: [
                if (rows != null)
                  SizedBox(width: labelW, child: Text('${r < rows.length ? rows[r] : ''}', style: monoStyle(size: 12.5, color: p.faint, weight: FontWeight.w800))),
                for (var c = 0; c < cells[r].length; c++) ...[
                  Builder(builder: (context) {
                    final v = cells[r][c];
                    final l = _look(p, _hl(hl, '$r,$c') ?? colors?['$v']);
                    return AnimatedContainer(
                      duration: const Duration(milliseconds: 250),
                      width: size,
                      height: size,
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        color: l.dim ? p.code : l.fill,
                        borderRadius: BorderRadius.circular(size / 5),
                        border: Border.all(color: l.dim ? p.code : l.edge, width: 2),
                      ),
                      child: v == null || v == ''
                          ? null
                          : FittedBox(child: Padding(padding: const EdgeInsets.all(2), child: Text('$v', style: monoStyle(size: 15, color: l.dim ? p.faint : l.ink, weight: FontWeight.w800)))),
                    );
                  }),
                  if (c < cells[r].length - 1) const SizedBox(width: gap),
                ],
              ]),
            ),
        ]),
      );
    });
  }
}

// ─────────────── Grafos y árboles ───────────────
class _Graph extends StatelessWidget {
  const _Graph({required this.spec, required this.frame});
  final Map spec, frame;

  @override
  Widget build(BuildContext context) {
    final h = (spec['h'] as num?)?.toDouble() ?? 60;
    return LayoutBuilder(builder: (context, box) {
      final w = box.maxWidth;
      return CustomPaint(size: Size(w, math.min(300, w * h / 100) + 20), painter: _GraphPainter(pal: context.pal, spec: spec, frame: frame, h: h));
    });
  }
}

class _GraphPainter extends CustomPainter {
  _GraphPainter({required this.pal, required this.spec, required this.frame, required this.h});
  final Palette pal;
  final Map spec, frame;
  final double h;

  @override
  void paint(Canvas canvas, Size size) {
    final nodes = spec['nodes'] as Map;
    final names = spec['names'] as Map?;
    final directed = spec['directed'] == true;
    final edges = (frame['edges'] ?? spec['edges']) as List;
    final show = (frame['show'] as List?)?.map((e) => '$e').toSet();
    final hl = frame['hl'] as Map?;
    final ehl = frame['ehl'] as Map?;
    final labels = frame['labels'] as Map?;
    const r = 17.0;
    final sx = (size.width - 2 * r - 8) / 100, sy = (size.height - 20 - 2 * r - 4) / h;
    Offset at(String id) {
      final p = nodes[id] as List;
      return Offset(r + 4 + (p[0] as num) * sx, r + 2 + (p[1] as num) * sy);
    }

    bool visible(String id) => nodes.containsKey(id) && (show == null || show.contains(id));

    void text(String s, Offset c, TextStyle st, {Color? bg}) {
      final tp = TextPainter(text: TextSpan(text: s, style: st), textDirection: TextDirection.ltr)..layout(maxWidth: 160);
      if (bg != null) {
        final rect = RRect.fromRectAndRadius(Rect.fromCenter(center: c, width: tp.width + 10, height: tp.height + 2), const Radius.circular(8));
        canvas.drawRRect(rect, Paint()..color = bg);
      }
      tp.paint(canvas, c - Offset(tp.width / 2, tp.height / 2));
    }

    for (final e in edges) {
      final a = '${(e as List)[0]}', b = '${e[1]}';
      if (!visible(a) || !visible(b)) continue;
      final st = ehl?['$a-$b'] ?? (directed ? null : ehl?['$b-$a']);
      final color = switch (st) { 'cur' => pal.sel, 'good' => pal.good, 'cmp' => pal.accent, 'bad' => pal.bad, 'dim' => pal.line, _ => pal.faint };
      final pa = at(a), pb = at(b);
      final d = pb - pa;
      final len = d.distance;
      if (len < 1) continue;
      final u = d / len;
      final s = pa + u * r, t = pb - u * (r + (directed ? 2 : 0));
      canvas.drawLine(
          s,
          t,
          Paint()
            ..color = color
            ..strokeWidth = st == null || st == 'dim' ? 2 : 3.5
            ..strokeCap = StrokeCap.round);
      if (directed) {
        final ang = math.atan2(u.dy, u.dx);
        canvas.drawPath(
            Path()
              ..moveTo(t.dx, t.dy)
              ..lineTo(t.dx - 9 * math.cos(ang - 0.45), t.dy - 9 * math.sin(ang - 0.45))
              ..lineTo(t.dx - 9 * math.cos(ang + 0.45), t.dy - 9 * math.sin(ang + 0.45))
              ..close(),
            Paint()..color = color);
      }
      if (e.length > 2 && e[2] != null) {
        text('${e[2]}', (pa + pb) / 2, monoStyle(size: 12, color: st == null ? pal.muted : color, weight: FontWeight.w800), bg: pal.bg);
      }
    }

    for (final id in nodes.keys.map((e) => '$e')) {
      if (!visible(id)) continue;
      final l = _look(pal, _hl(hl, id));
      final c = at(id);
      final alpha = l.dim ? 0.3 : 1.0;
      canvas.drawCircle(c, r, Paint()..color = l.fill.withValues(alpha: alpha));
      canvas.drawCircle(
          c,
          r,
          Paint()
            ..color = l.edge.withValues(alpha: alpha)
            ..style = PaintingStyle.stroke
            ..strokeWidth = l.edge == pal.line ? 2 : 3);
      final name = '${names?[id] ?? id}';
      // Nombres largos ("React") con letra más chica para que quepan en el círculo.
      final fs = name.length <= 2 ? 14.0 : name.length == 3 ? 12.0 : name.length == 4 ? 10.5 : 9.0;
      text(name, c, monoStyle(size: fs, color: l.ink.withValues(alpha: alpha), weight: FontWeight.w800));
      final lab = labels?[id];
      if (lab != null) text('$lab', c + const Offset(0, r + 10), monoStyle(size: 11.5, color: pal.accentInk, weight: FontWeight.w800), bg: pal.accent);
    }
  }

  @override
  bool shouldRepaint(_GraphPainter old) => true;
}
