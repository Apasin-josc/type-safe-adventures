import 'package:flutter/material.dart';

import '../data/runner.dart';
import '../ui/chunky.dart';
import '../ui/code.dart';
import '../ui/rich.dart';
import '../ui/theme.dart';
import 'common.dart';

// ─────────────── Ordenar bloques de código (se califican corriendo pruebas de verdad) ───────────────
class OrderStep extends StatefulWidget {
  const OrderStep(this.c, {super.key});
  final StepController c;
  @override
  State<OrderStep> createState() => _OrderStepState();
}

class _OrderStepState extends State<OrderStep> {
  late final List<String> lines = (widget.c.step['lines'] as List).cast<String>();
  late final List<int> bank = seededShuffle(List.generate(lines.length, (i) => i), (widget.c.step['seed'] as num?)?.toInt() ?? 7);
  final List<int> built = [];
  String? mark;
  bool locked = false;

  @override
  void initState() {
    super.initState();
    final c = widget.c;
    c.onCheck = () async {
      final s = c.step;
      if (s['tests'] == null) return CheckResult([for (var i = 0; i < built.length; i++) built[i] == i].every((x) => x));
      final src = [s['pre'], ...built.map((i) => lines[i]), s['post']].whereType<String>().join('\n');
      final r = await runTests(src, s['fnName'] as String, s['tests'] as List, wrap: s['wrap'] as String?);
      if (r.error != null) return CheckResult(false, c.t('order_broken'));
      return CheckResult(r.allPass, c.t('tests_passed', [r.passed, r.results.length]));
    };
    c.onFeedback = (ok) => setState(() {
          mark = ok ? 'good' : 'bad';
          if (ok) locked = true;
        });
    c.onReveal = () => setState(() {
          locked = true;
          bank.clear();
          built
            ..clear()
            ..addAll(List.generate(lines.length, (i) => i));
          mark = 'good';
        });
  }

  Widget _line(int i, {required bool inBuilt}) {
    final p = context.pal;
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Tile(
        state: inBuilt ? 'sel' : null,
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 9),
        radius: 9,
        onTap: locked
            ? null
            : () => setState(() {
                  mark = null;
                  if (inBuilt) {
                    built.remove(i);
                    bank.add(i);
                  } else {
                    bank.remove(i);
                    built.add(i);
                  }
                  widget.c.setReady(bank.isEmpty);
                }),
        child: SizedBox(
          width: double.infinity,
          child: Text.rich(TextSpan(style: monoStyle(size: 13.5, color: p.codeInk), children: highlight(lines[i], p))),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final p = context.pal;
    final s = widget.c.step;
    final fixed = monoStyle(size: 13, color: p.muted);
    final border = mark == 'good' ? p.good : mark == 'bad' ? p.bad : Colors.transparent;
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      SmallLabel(widget.c.t('your_code')),
      AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.all(6),
        decoration: BoxDecoration(borderRadius: BorderRadius.circular(12), border: Border.all(color: border, width: 2)),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          if (s['pre'] != null) Padding(padding: const EdgeInsets.all(4), child: Text(s['pre'] as String, style: fixed)),
          if (built.isEmpty)
            Padding(
              padding: const EdgeInsets.all(10),
              child: Text(widget.c.t('tap_blocks'), style: TextStyle(color: p.faint, fontSize: 15)),
            ),
          for (final i in built) _line(i, inBuilt: true),
          if (s['post'] != null) Padding(padding: const EdgeInsets.all(4), child: Text(s['post'] as String, style: fixed)),
        ]),
      ),
      if (bank.isNotEmpty) SmallLabel(widget.c.t('blocks')),
      for (final i in bank) _line(i, inBuilt: false),
    ]);
  }
}

// ─────────────── Seguir el código paso a paso ───────────────
class TraceStep extends StatefulWidget {
  const TraceStep(this.c, {super.key});
  final StepController c;
  @override
  State<TraceStep> createState() => _TraceStepState();
}

class _TraceStepState extends State<TraceStep> {
  int k = 0;
  late final List frames = widget.c.step['frames'] as List;

  void _go(int d) => setState(() {
        k = (k + d).clamp(0, frames.length - 1);
        if (k == frames.length - 1) widget.c.setReady(true);
      });

  @override
  Widget build(BuildContext context) {
    final p = context.pal;
    final c = widget.c;
    final f = frames[k] as Map;
    final vars = (f['vars'] as Map? ?? const {}).entries.toList();
    final i = (f['vars'] as Map?)?['i'];
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      CodeBlock(c.step['code'] as String, size: 13.5, highlightLine: (f['line'] as num).toInt()),
      if (c.step['array'] != null) ArrayView(values: c.step['array'] as List, look: (j) => CellLook(state: j == i ? 'sel' : null)),
      Wrap(spacing: 8, runSpacing: 8, children: [
        if (vars.isEmpty) Text(c.t('no_vars'), style: TextStyle(color: p.muted)),
        for (final e in vars)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(color: p.surface, borderRadius: BorderRadius.circular(10), border: Border.all(color: p.line, width: 2)),
            child: Row(mainAxisSize: MainAxisSize.min, children: [
              Text('${e.key}', style: monoStyle(size: 15, color: p.muted)),
              const SizedBox(width: 10),
              Text(show(e.value), style: monoStyle(size: 17, color: p.ink, weight: FontWeight.w800)),
            ]),
          ),
      ]),
      SizedBox(
        height: 52,
        child: Align(
          alignment: Alignment.centerLeft,
          child: f['note'] == null ? null : Rich(c.tx(f['note']), style: TextStyle(fontSize: 16, color: p.muted)),
        ),
      ),
      Row(children: [
        Expanded(child: ChunkyButton(label: '◀ ${c.t('prev')}', kind: ChunkyKind.ghost, onPressed: k == 0 ? null : () => _go(-1))),
        SizedBox(width: 70, child: Text('${k + 1} / ${frames.length}', textAlign: TextAlign.center, style: monoStyle(size: 13, color: p.faint))),
        Expanded(child: ChunkyButton(label: '${c.t('step')} ▶', kind: ChunkyKind.ghost, onPressed: k == frames.length - 1 ? null : () => _go(1))),
      ]),
    ]);
  }
}
