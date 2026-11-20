import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../ui/chunky.dart';
import '../ui/code.dart';
import '../ui/rich.dart';
import '../ui/sfx.dart';
import '../ui/theme.dart';
import 'common.dart';

// ─────────────── Leer ───────────────
class ReadStep extends StatefulWidget {
  const ReadStep(this.c, {super.key});
  final StepController c;
  @override
  State<ReadStep> createState() => _ReadStepState();
}

class _ReadStepState extends State<ReadStep> {
  @override
  void initState() {
    super.initState();
    widget.c.setReady(true);
  }

  @override
  Widget build(BuildContext context) {
    final s = widget.c.step;
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      if (s['code'] != null) CodeBlock(s['code'] as String),
      if (s['array'] != null) ArrayView(values: s['array'] as List, indices: s['indices'] != false),
      if (s['body'] != null) Padding(padding: const EdgeInsets.only(top: 6), child: Rich(widget.c.tx(s['body']))),
    ]);
  }
}

// ─────────────── Opción múltiple ───────────────
class ChoiceStep extends StatefulWidget {
  const ChoiceStep(this.c, {super.key});
  final StepController c;
  @override
  State<ChoiceStep> createState() => _ChoiceStepState();
}

class _ChoiceStepState extends State<ChoiceStep> {
  int? sel;
  final Map<int, String> marks = {};
  final Set<int> struck = {}; // tachadas por la pista de Salsa
  bool locked = false;

  @override
  void initState() {
    super.initState();
    final c = widget.c;
    final answer = (c.step['answer'] as num).toInt();
    c.onCheck = () async => CheckResult(sel == answer, _why(sel));
    c.sniff = () {
      final n = (c.step['options'] as List).length;
      final wrong = [for (var i = 0; i < n; i++) if (i != answer && !struck.contains(i)) i];
      // Con dos opciones, tachar una sería darte la respuesta: ahí no hay pista.
      if (locked || n <= 2 || wrong.isEmpty) return null;
      final i = wrong[math.Random().nextInt(wrong.length)];
      setState(() {
        struck.add(i);
        if (sel == i) {
          sel = null;
          c.setReady(false);
        }
      });
      return c.t('hint_choice');
    };
    c.onFeedback = (ok) => setState(() {
          marks[sel!] = ok ? 'good' : 'bad';
          if (ok) locked = true;
        });
    c.onReveal = () => setState(() {
          locked = true;
          marks[answer] = 'good';
        });
  }

  String? _why(int? i) {
    final why = widget.c.step['why'];
    if (why is! Map || i == null) return null;
    final v = why['$i'];
    return v == null ? null : widget.c.tx(v);
  }

  @override
  Widget build(BuildContext context) {
    final c = widget.c;
    final opts = c.step['options'] as List;
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      if (c.step['code'] != null) CodeBlock(c.step['code'] as String),
      for (var i = 0; i < opts.length; i++)
        Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: Opacity(
            opacity: struck.contains(i) ? 0.35 : 1,
            child: Tile(
            state: marks[i] ?? (sel == i ? 'sel' : null),
            onTap: locked || struck.contains(i)
                ? null
                : () => setState(() {
                      sel = i;
                      marks.removeWhere((k, v) => v == 'bad');
                      c.setReady(true);
                    }),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 15),
            child: SizedBox(
              width: double.infinity,
              child: Rich('${struck.contains(i) ? '✗ ' : ''}${c.tx(opts[i])}', style: TextStyle(fontSize: 17, fontWeight: FontWeight.w600, decoration: struck.contains(i) ? TextDecoration.lineThrough : null)),
            ),
          ),
          ),
        ),
    ]);
  }
}

// ─────────────── Tocar un casillero ───────────────
class TapStep extends StatefulWidget {
  const TapStep(this.c, {super.key});
  final StepController c;
  @override
  State<TapStep> createState() => _TapStepState();
}

class _TapStepState extends State<TapStep> {
  int? sel;
  String? mark;
  bool locked = false;
  final Set<int> struck = {};

  @override
  void initState() {
    super.initState();
    final c = widget.c;
    final answer = (c.step['answer'] as num).toInt();
    c.sniff = () {
      final n = (c.step['values'] as List).length;
      final wrong = [for (var i = 0; i < n; i++) if (i != answer && !struck.contains(i)) i]..shuffle();
      if (locked || wrong.isEmpty) return null;
      setState(() {
        struck.addAll(wrong.take((wrong.length / 2).ceil()));
        if (sel != null && struck.contains(sel)) {
          sel = null;
          mark = null;
          c.setReady(false);
        }
      });
      return c.t('hint_tap');
    };
    c.onCheck = () async {
      final why = c.step['why'];
      final msg = (why is Map && why['$sel'] != null) ? c.tx(why['$sel']) : null;
      return CheckResult(sel == answer, msg);
    };
    c.onFeedback = (ok) => setState(() {
          mark = ok ? 'good' : 'bad';
          if (ok) locked = true;
        });
    c.onReveal = () => setState(() {
          locked = true;
          sel = answer;
          mark = 'good';
        });
  }

  @override
  Widget build(BuildContext context) {
    final c = widget.c;
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      if (c.step['code'] != null) CodeBlock(c.step['code'] as String),
      ArrayView(
        values: c.step['values'] as List,
        indices: c.step['indices'] != false,
        look: (i) => CellLook(state: i == sel ? (mark ?? 'sel') : null, dim: struck.contains(i)),
        onTap: locked
            ? null
            : (i) => struck.contains(i) ? null : setState(() {
                  sel = i;
                  mark = null;
                  c.setReady(true);
                }),
      ),
    ]);
  }
}

// ─────────────── Escribir un número ───────────────
class NumberStep extends StatefulWidget {
  const NumberStep(this.c, {super.key});
  final StepController c;
  @override
  State<NumberStep> createState() => _NumberStepState();
}

class _NumberStepState extends State<NumberStep> {
  final ctl = TextEditingController();
  String? mark;

  @override
  void initState() {
    super.initState();
    final c = widget.c;
    final answer = (c.step['answer'] as num).toInt();
    ctl.addListener(() {
      c.setReady(ctl.text.trim().isNotEmpty);
      if (mark == 'bad') setState(() => mark = null);
    });
    c.onCheck = () async {
      final n = int.tryParse(ctl.text.replaceAll(RegExp(r'[,\s]'), ''));
      return CheckResult(n == answer, c.step['hint'] == null ? null : c.tx(c.step['hint']));
    };
    c.sniff = () {
      if (mark == 'good') return null;
      if (c.step['hint'] != null) return c.tx(c.step['hint']);
      final a = answer.abs();
      if (answer < 0) return c.t('hint_neg');
      if (a < 10) return c.t(a.isEven ? 'hint_num_even' : 'hint_num_odd');
      return c.t('hint_num', ['$a'.length, '$a'[0]]);
    };
    c.onFeedback = (ok) => setState(() => mark = ok ? 'good' : 'bad');
    c.onReveal = () => setState(() {
          ctl.text = fmtNum(answer);
          mark = 'good';
        });
  }

  @override
  void dispose() {
    ctl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final p = context.pal;
    final c = widget.c;
    final color = mark == 'good' ? p.good : mark == 'bad' ? p.bad : p.line;
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      if (c.step['code'] != null) CodeBlock(c.step['code'] as String),
      SizedBox(
        width: 220,
        child: TextField(
          controller: ctl,
          readOnly: mark == 'good',
          keyboardType: TextInputType.number,
          textInputAction: TextInputAction.done,
          onSubmitted: (_) => c.onSubmit?.call(),
          style: monoStyle(size: 22, color: p.ink, weight: FontWeight.w700),
          decoration: InputDecoration(
            hintText: c.t('answer'),
            hintStyle: TextStyle(color: p.faint, fontSize: 18),
            filled: true,
            fillColor: mark == 'good' ? p.goodSoft : mark == 'bad' ? p.badSoft : p.surface,
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: color, width: 2)),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: mark == null ? p.sel : color, width: 2)),
          ),
        ),
      ),
    ]);
  }
}

// ─────────────── Completar huecos con fichas ───────────────
class FillStep extends StatefulWidget {
  const FillStep(this.c, {super.key});
  final StepController c;
  @override
  State<FillStep> createState() => _FillStepState();
}

class _FillStepState extends State<FillStep> {
  late final List<String> parts = (widget.c.step['code'] as String).split(RegExp(r'\[\[\d+\]\]'));
  late final List<String> chips = (widget.c.step['chips'] as List).cast<String>();
  late final List<String> answers = (widget.c.step['answers'] as List).cast<String>();
  late final List<int?> filled = List.filled(parts.length - 1, null);
  List<String?>? marks;
  bool locked = false;

  @override
  void initState() {
    super.initState();
    final c = widget.c;
    bool right() => [for (var i = 0; i < filled.length; i++) chips[filled[i]!] == answers[i]].every((x) => x);
    c.onCheck = () async => CheckResult(right(), c.step['hint'] == null ? null : c.tx(c.step['hint']));
    c.sniff = () {
      // Pon bien el primer hueco que esté vacío o mal.
      final k = [for (var i = 0; i < filled.length; i++) i].where((i) => filled[i] == null || chips[filled[i]!] != answers[i]).firstOrNull;
      if (locked || k == null) return null;
      setState(() {
        final chip = chips.indexOf(answers[k]);
        final other = filled.indexOf(chip);
        if (other != -1) filled[other] = null; // si esa ficha estaba en otro hueco, se mueve
        filled[k] = chip;
        _changed();
      });
      return c.t('hint_fill');
    };
    c.onFeedback = (ok) => setState(() {
          marks = [for (var i = 0; i < filled.length; i++) chips[filled[i]!] == answers[i] ? 'good' : 'bad'];
          if (ok) locked = true;
        });
    c.onReveal = () => setState(() {
          locked = true;
          for (var i = 0; i < answers.length; i++) {
            filled[i] = chips.indexOf(answers[i]);
          }
          marks = List.filled(filled.length, 'good');
        });
  }

  void _changed() {
    marks = null;
    widget.c.setReady(filled.every((f) => f != null));
  }

  @override
  Widget build(BuildContext context) {
    final p = context.pal;
    final style = monoStyle(size: 15, color: p.codeInk);
    final spans = <InlineSpan>[];
    for (var i = 0; i < parts.length; i++) {
      spans.addAll(highlight(parts[i], p));
      if (i < filled.length) {
        final m = marks?[i];
        final border = m == 'good' ? p.good : m == 'bad' ? p.bad : p.sel;
        final bg = m == 'good' ? p.goodSoft : m == 'bad' ? p.badSoft : p.selSoft;
        spans.add(WidgetSpan(
          alignment: PlaceholderAlignment.middle,
          child: GestureDetector(
            onTap: locked || filled[i] == null
                ? null
                : () => setState(() {
                      filled[i] = null;
                      _changed();
                    }),
            child: Container(
              constraints: const BoxConstraints(minWidth: 40),
              margin: const EdgeInsets.symmetric(horizontal: 2),
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
              decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(6), border: Border.all(color: border, width: 2)),
              child: Text(filled[i] == null ? ' ' : chips[filled[i]!], textAlign: TextAlign.center, style: style.copyWith(fontWeight: FontWeight.w800)),
            ),
          ),
        ));
      }
    }
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Container(
        width: double.infinity,
        margin: const EdgeInsets.only(bottom: 16),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(color: p.code, borderRadius: BorderRadius.circular(12)),
        child: SingleChildScrollView(scrollDirection: Axis.horizontal, child: Text.rich(TextSpan(style: style, children: spans), softWrap: false)),
      ),
      Wrap(spacing: 10, runSpacing: 10, children: [
        for (var i = 0; i < chips.length; i++)
          Opacity(
            opacity: filled.contains(i) ? 0.3 : 1,
            child: Tile(
              onTap: locked || filled.contains(i)
                  ? null
                  : () => setState(() {
                        final empty = filled.indexOf(null);
                        if (empty == -1) return;
                        filled[empty] = i;
                        _changed();
                      }),
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
              child: Text(chips[i], style: monoStyle(size: 18, color: p.ink, weight: FontWeight.w800)),
            ),
          ),
      ]),
    ]);
  }
}

// ─────────────── Clasificar: cada valor a su caja ───────────────
class ClassifyStep extends StatefulWidget {
  const ClassifyStep(this.c, {super.key});
  final StepController c;
  @override
  State<ClassifyStep> createState() => _ClassifyStepState();
}

class _ClassifyStepState extends State<ClassifyStep> {
  late final List items = widget.c.step['items'] as List;
  late final List bins = widget.c.step['bins'] as List;
  late final List<int?> picked = List.filled(items.length, null);
  List<bool>? marks;
  bool locked = false;

  int _bin(int i) => ((items[i] as Map)['bin'] as num).toInt();

  @override
  void initState() {
    super.initState();
    final c = widget.c;
    c.onCheck = () async {
      final wrong = [for (var i = 0; i < items.length; i++) if (picked[i] != _bin(i)) i].length;
      return CheckResult(wrong == 0, c.lang == 'es' ? 'Tienes $wrong mal. Las que están en rojo van en la otra caja.' : 'You have $wrong wrong. The red ones belong in the other box.');
    };
    c.sniff = () {
      final todo = [for (var i = 0; i < items.length; i++) if (picked[i] != _bin(i)) i];
      if (locked || todo.isEmpty) return null;
      final i = todo.first;
      setState(() {
        picked[i] = _bin(i);
        marks = null;
      });
      c.setReady(picked.every((x) => x != null));
      final label = c.tx((items[i] as Map)['label']).replaceAll(RegExp(r'<[^>]+>'), '');
      return c.t('hint_classify', [label, c.tx(bins[_bin(i)])]);
    };
    c.onFeedback = (ok) => setState(() {
          marks = [for (var i = 0; i < items.length; i++) picked[i] == _bin(i)];
          if (ok) locked = true;
        });
    c.onReveal = () => setState(() {
          locked = true;
          for (var i = 0; i < items.length; i++) {
            picked[i] = _bin(i);
          }
          marks = List.filled(items.length, true);
        });
  }

  @override
  Widget build(BuildContext context) {
    final p = context.pal;
    final c = widget.c;
    return Column(children: [
      for (var i = 0; i < items.length; i++)
        Container(
          margin: const EdgeInsets.only(bottom: 8),
          padding: const EdgeInsets.fromLTRB(12, 8, 8, 8),
          decoration: BoxDecoration(
            color: marks == null ? p.surface : (marks![i] ? p.goodSoft : p.badSoft),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: marks == null ? p.line : (marks![i] ? p.good : p.bad), width: 2),
          ),
          child: Row(children: [
            Expanded(child: Rich(c.tx((items[i] as Map)['label']), style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w600))),
            for (var b = 0; b < bins.length; b++)
              Padding(
                padding: const EdgeInsets.only(left: 6),
                child: GestureDetector(
                  onTap: locked
                      ? null
                      : () {
                          HapticFeedback.selectionClick();
                          sfx.play(Sfx.tap);
                          setState(() {
                            picked[i] = b;
                            marks = null;
                          });
                          c.setReady(picked.every((x) => x != null));
                        },
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 120),
                    constraints: const BoxConstraints(minWidth: 84, minHeight: 38),
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: picked[i] == b ? p.sel : p.bg,
                      borderRadius: BorderRadius.circular(99),
                      border: Border.all(color: picked[i] == b ? p.sel : p.line, width: 1.5),
                    ),
                    child: Text(
                      c.tx(bins[b]),
                      textAlign: TextAlign.center,
                      style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: picked[i] == b ? Colors.white : p.muted),
                    ),
                  ),
                ),
              ),
          ]),
        ),
    ]);
  }
}
