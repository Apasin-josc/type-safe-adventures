import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../ui/chunky.dart';
import '../ui/rich.dart';
import '../ui/sfx.dart';
import '../ui/theme.dart';
import 'common.dart';

// ─────────────── Cartas boca abajo (búsqueda lineal) ───────────────
class SearchStep extends StatefulWidget {
  const SearchStep(this.c, {super.key});
  final StepController c;
  @override
  State<SearchStep> createState() => _SearchStepState();
}

class _SearchStepState extends State<SearchStep> {
  late final List values = seededShuffle(widget.c.step['values'] as List, DateTime.now().millisecondsSinceEpoch);
  final Set<int> open = {};
  bool found = false;

  @override
  Widget build(BuildContext context) {
    final p = context.pal;
    final c = widget.c;
    final target = c.step['target'];
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      GridView.count(
        crossAxisCount: 4,
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        mainAxisSpacing: 10,
        crossAxisSpacing: 10,
        childAspectRatio: 0.78,
        children: [
          for (var i = 0; i < values.length; i++)
            GestureDetector(
              onTap: found || open.contains(i)
                  ? null
                  : () => setState(() {
                        open.add(i);
                        if (values[i] == target) {
                          found = true;
                          HapticFeedback.mediumImpact();
                          sfx.correct(3);
                          c.setReady(true);
                        } else {
                          HapticFeedback.selectionClick();
                          sfx.play(Sfx.tap);
                        }
                      }),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                decoration: BoxDecoration(
                  color: open.contains(i) ? (values[i] == target ? p.goodSoft : p.surface) : p.accentSoft,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: open.contains(i) ? (values[i] == target ? p.good : p.line) : p.accent, width: 2),
                ),
                alignment: Alignment.center,
                child: Text(
                  open.contains(i) ? '${values[i]}' : '?',
                  style: monoStyle(size: 22, color: open.contains(i) ? p.ink : p.accent, weight: FontWeight.w800),
                ),
              ),
            ),
        ],
      ),
      StatusLine(found ? c.t('search_found', [open.length, values.length]) : c.t('search_flips', [open.length])),
    ]);
  }
}

// ─────────────── Cómo crecen log n, n y n² ───────────────
class GrowthStep extends StatefulWidget {
  const GrowthStep(this.c, {super.key});
  final StepController c;
  @override
  State<GrowthStep> createState() => _GrowthStepState();
}

class _GrowthStepState extends State<GrowthStep> {
  static const max = 100;
  late int n = (widget.c.step['start'] as num?)?.toInt() ?? 10;
  String note = '';

  int _log(int x) => math.max(1, (math.log(x) / math.ln2).ceil());

  @override
  void initState() {
    super.initState();
    widget.c.setReady(true);
  }

  @override
  Widget build(BuildContext context) {
    final p = context.pal;
    final c = widget.c;
    final rows = [('log₂ n', _log(n), p.good), ('n', n, p.sel), ('n²', n * n, p.accent)];
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text('n = $n', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
      Slider(
        value: n.toDouble(),
        min: 1,
        max: max.toDouble(),
        divisions: max - 1,
        onChanged: (v) => setState(() {
          n = v.round();
          note = '';
        }),
      ),
      for (final (label, value, color) in rows)
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 7),
          child: Row(children: [
            SizedBox(width: 58, child: Text(label, style: monoStyle(size: 15, color: p.ink, weight: FontWeight.w700))),
            Expanded(
              child: Container(
                height: 22,
                decoration: BoxDecoration(color: p.code, borderRadius: BorderRadius.circular(6)),
                alignment: Alignment.centerLeft,
                child: FractionallySizedBox(
                  widthFactor: math.max(0.015, value / (max * max)),
                  child: AnimatedContainer(duration: const Duration(milliseconds: 150), decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(6))),
                ),
              ),
            ),
            SizedBox(width: 74, child: Text(fmtNum(value), textAlign: TextAlign.right, style: monoStyle(size: 15, color: p.ink, weight: FontWeight.w700))),
          ]),
        ),
      const SizedBox(height: 10),
      ChunkyButton(
        label: c.t('double_n'),
        kind: ChunkyKind.ghost,
        expand: false,
        onPressed: n * 2 > max
            ? null
            : () => setState(() {
                  final prev = n;
                  n *= 2;
                  note = c.t('double_note', [prev, n, _log(n) - _log(prev), 4]);
                }),
      ),
      if (note.isNotEmpty) Padding(padding: const EdgeInsets.only(top: 10), child: Rich(note, style: TextStyle(fontSize: 16, color: p.muted))),
    ]);
  }
}

// ─────────────── Partir a la mitad ───────────────
class HalvingStep extends StatefulWidget {
  const HalvingStep(this.c, {super.key});
  final StepController c;
  @override
  State<HalvingStep> createState() => _HalvingStepState();
}

class _HalvingStepState extends State<HalvingStep> {
  late int k = (widget.c.step['start'] as num?)?.toInt() ?? 5;

  @override
  void initState() {
    super.initState();
    widget.c.setReady(true);
  }

  @override
  Widget build(BuildContext context) {
    final p = context.pal;
    final n = 1 << k;
    final seq = [for (var v = n; v >= 1; v ~/= 2) fmtNum(v)];
    final shown = seq.length > 8 ? [...seq.take(4), '…', ...seq.skip(seq.length - 3)] : seq;
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text('n = ${fmtNum(n)}', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
      Slider(value: k.toDouble(), min: 3, max: 20, divisions: 17, onChanged: (v) => setState(() => k = v.round())),
      Wrap(spacing: 6, runSpacing: 8, crossAxisAlignment: WrapCrossAlignment.center, children: [
        for (var i = 0; i < shown.length; i++) ...[
          if (i > 0) Text('→', style: TextStyle(color: p.faint)),
          shown[i] == '…'
              ? Text('…', style: TextStyle(color: p.faint, fontWeight: FontWeight.w800))
              : Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(color: p.surface, borderRadius: BorderRadius.circular(8), border: Border.all(color: p.line, width: 2)),
                  child: Text(shown[i], style: monoStyle(size: 14, color: p.ink, weight: FontWeight.w700)),
                ),
        ],
      ]),
      const SizedBox(height: 16),
      Rich(widget.c.t('halvings', [k, fmtNum(n)]), style: const TextStyle(fontSize: 19)),
    ]);
  }
}

// ─────────────── Adivina el número ───────────────
class GuessStep extends StatefulWidget {
  const GuessStep(this.c, {super.key});
  final StepController c;
  @override
  State<GuessStep> createState() => _GuessStepState();
}

class _GuessStepState extends State<GuessStep> {
  late final int lo0 = (widget.c.step['min'] as num?)?.toInt() ?? 1;
  late final int hi0 = (widget.c.step['max'] as num?)?.toInt() ?? 100;
  late final int secret = lo0 + math.Random().nextInt(hi0 - lo0 + 1);
  late int lo = lo0, hi = hi0;
  final List<(int, String)> history = [];
  final ctl = TextEditingController();
  final focus = FocusNode();
  String status = '';
  bool won = false;

  @override
  void dispose() {
    ctl.dispose();
    focus.dispose();
    super.dispose();
  }

  void _submit() {
    final c = widget.c;
    final g = int.tryParse(ctl.text.trim());
    if (g == null || g < lo0 || g > hi0) {
      setState(() => status = c.t('guess_invalid', [lo0, hi0]));
      return;
    }
    ctl.clear();
    setState(() {
      if (g == secret) {
        won = true;
        lo = hi = g;
        history.add((g, 'good'));
        status = c.t('guess_won', [g, history.length]);
        HapticFeedback.mediumImpact();
        sfx.correct(4);
        c.setReady(true);
        focus.unfocus();
      } else if (g < secret) {
        lo = math.max(lo, g + 1);
        history.add((g, 'up'));
        status = c.t('guess_higher', [g]);
        HapticFeedback.selectionClick();
        sfx.play(Sfx.tap);
      } else {
        hi = math.min(hi, g - 1);
        history.add((g, 'down'));
        status = c.t('guess_lower', [g]);
        HapticFeedback.selectionClick();
        sfx.play(Sfx.tap);
      }
    });
    if (!won) focus.requestFocus();
  }

  @override
  Widget build(BuildContext context) {
    final p = context.pal;
    final c = widget.c;
    final total = (hi0 - lo0 + 1).toDouble();
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      LayoutBuilder(builder: (context, box) {
        return Container(
          height: 16,
          decoration: BoxDecoration(color: p.code, borderRadius: BorderRadius.circular(99)),
          child: Stack(children: [
            AnimatedPositioned(
              duration: const Duration(milliseconds: 250),
              left: box.maxWidth * (lo - lo0) / total,
              width: math.max(6, box.maxWidth * (hi - lo + 1) / total),
              top: 0,
              bottom: 0,
              child: Container(decoration: BoxDecoration(color: p.accent, borderRadius: BorderRadius.circular(99))),
            ),
          ]),
        );
      }),
      if (!won) Padding(padding: const EdgeInsets.only(top: 8), child: Rich(c.t('guess_range', [lo, hi]), style: TextStyle(fontSize: 16, color: p.muted))),
      const SizedBox(height: 14),
      Row(children: [
        Expanded(
          child: TextField(
            controller: ctl,
            focusNode: focus,
            enabled: !won,
            keyboardType: TextInputType.number,
            textInputAction: TextInputAction.go,
            onSubmitted: (_) => _submit(),
            style: monoStyle(size: 20, color: p.ink, weight: FontWeight.w700),
            decoration: InputDecoration(
              hintText: '$lo0–$hi0',
              filled: true,
              fillColor: p.surface,
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: p.line, width: 2)),
              disabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: p.line, width: 2)),
              focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: p.sel, width: 2)),
            ),
          ),
        ),
        const SizedBox(width: 10),
        ChunkyButton(label: c.t('guess_btn'), kind: ChunkyKind.ghost, expand: false, onPressed: won ? null : _submit),
      ]),
      StatusLine(status),
      Wrap(spacing: 6, runSpacing: 6, children: [
        for (final (g, tag) in history)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: tag == 'good' ? p.goodSoft : p.surface,
              borderRadius: BorderRadius.circular(99),
              border: Border.all(color: tag == 'good' ? p.good : p.line, width: 2),
            ),
            child: Text('$g ${tag == 'up' ? '⬆' : tag == 'down' ? '⬇' : '✓'}', style: monoStyle(size: 14, color: p.ink, weight: FontWeight.w700)),
          ),
      ]),
    ]);
  }
}

// ─────────────── Búsqueda binaria a mano ───────────────
class BsearchStep extends StatefulWidget {
  const BsearchStep(this.c, {super.key});
  final StepController c;
  @override
  State<BsearchStep> createState() => _BsearchStepState();
}

class _BsearchStepState extends State<BsearchStep> {
  late final List v = widget.c.step['values'] as List;
  late final int target = (widget.c.step['target'] as num).toInt();
  late int lo = 0, hi = v.length - 1;
  int looks = 0;
  bool done = false;
  final Set<int> seen = {};
  late String status = widget.c.t('bs_start', [target]);

  void _tap(int i) {
    final c = widget.c;
    if (done || i < lo || i > hi) return;
    final mid = (lo + hi) ~/ 2;
    setState(() {
      if (i != mid) {
        status = c.t('bs_not_mid', [lo, hi, mid]);
        return;
      }
      looks++;
      seen.add(i);
      final x = (v[i] as num).toInt();
      if (x == target) {
        done = true;
        status = c.t('bs_found', [target, looks, v.length]);
        HapticFeedback.mediumImpact();
        sfx.correct(4);
        c.setReady(true);
      } else if (x < target) {
        status = c.t('bs_go_right', [x, target]);
        lo = mid + 1;
      } else {
        status = c.t('bs_go_left', [x, target]);
        hi = mid - 1;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final p = context.pal;
    final c = widget.c;
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      if (!done)
        Padding(
          padding: const EdgeInsets.only(bottom: 4),
          child: Rich('<code>lo = $lo</code> · <code>hi = $hi</code> · ${c.t('bs_looks', [looks])}', style: TextStyle(fontSize: 15, color: p.muted)),
        ),
      ArrayView(
        values: v,
        onTap: _tap,
        look: (i) => CellLook(
          state: done && (v[i] as num).toInt() == target ? 'good' : null,
          dim: i < lo || i > hi,
          dashed: seen.contains(i),
        ),
      ),
      StatusLine(status),
    ]);
  }
}

// ─────────────── Dos punteros ───────────────
class PointersStep extends StatefulWidget {
  const PointersStep(this.c, {super.key});
  final StepController c;
  @override
  State<PointersStep> createState() => _PointersStepState();
}

class _PointersStepState extends State<PointersStep> {
  late final List v = widget.c.step['values'] as List;
  late final int target = (widget.c.step['target'] as num).toInt();
  late int L = 0, R = v.length - 1;
  int moves = 0;
  bool done = false;

  int at(int i) => (v[i] as num).toInt();

  void _after() {
    if (L < R && at(L) + at(R) == target) {
      done = true;
      HapticFeedback.mediumImpact();
      sfx.correct(4);
      widget.c.setReady(true);
    }
  }

  @override
  Widget build(BuildContext context) {
    final p = context.pal;
    final c = widget.c;
    final s = L < R ? at(L) + at(R) : 0;
    final cmp = s == target ? '=' : s < target ? '<' : '>';
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      ArrayView(
        values: v,
        look: (i) => CellLook(
          state: done && (i == L || i == R) ? 'good' : (i == L || i == R) ? 'ptr' : null,
          dim: i < L || i > R,
          ptr: i == L && i == R ? 'L R' : i == L ? 'L' : i == R ? 'R' : null,
        ),
      ),
      if (L < R)
        Rich('<code>${at(L)} + ${at(R)} = <b>$s</b></code>  $cmp $target', style: monoStyle(size: 18, color: p.ink).copyWith(fontWeight: FontWeight.w600)),
      const SizedBox(height: 14),
      Wrap(spacing: 8, runSpacing: 8, children: [
        ChunkyButton(
          label: 'L →',
          kind: ChunkyKind.ghost,
          expand: false,
          onPressed: done || L >= R
              ? null
              : () => setState(() {
                    moves++;
                    L++;
                    _after();
                  }),
        ),
        ChunkyButton(
          label: '← R',
          kind: ChunkyKind.ghost,
          expand: false,
          onPressed: done || L >= R
              ? null
              : () => setState(() {
                    moves++;
                    R--;
                    _after();
                  }),
        ),
        ChunkyButton(
          label: '↺ ${c.t('reset')}',
          kind: ChunkyKind.ghost,
          expand: false,
          onPressed: () => setState(() {
            L = 0;
            R = v.length - 1;
            moves = 0;
            done = false;
          }),
        ),
      ]),
      StatusLine(done ? c.t('ptr_found', [moves]) : L >= R ? c.t('ptr_crossed') : ''),
    ]);
  }
}
