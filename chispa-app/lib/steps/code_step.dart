import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../data/runner.dart';
import '../ui/chunky.dart';
import '../ui/code.dart';
import '../ui/theme.dart';
import 'common.dart';

/// Controlador que pinta el código con colores mientras escribes.
class HighlightController extends TextEditingController {
  HighlightController({super.text, required this.palette});
  Palette palette;

  @override
  TextSpan buildTextSpan({required BuildContext context, TextStyle? style, required bool withComposing}) =>
      TextSpan(style: style, children: highlight(text, palette));
}

/// Al dar Enter, repite la sangría de la línea anterior (y agrega un nivel después de "{").
class AutoIndent extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(TextEditingValue old, TextEditingValue now) {
    final added = now.text.length - old.text.length;
    if (added != 1 || !now.selection.isCollapsed) return now;
    final pos = now.selection.baseOffset;
    if (pos < 1 || now.text[pos - 1] != '\n') return now;
    final before = now.text.substring(0, pos - 1);
    final lineStart = before.lastIndexOf('\n') + 1;
    final line = before.substring(lineStart);
    var indent = RegExp(r'^[ \t]*').firstMatch(line)!.group(0)!;
    if (line.trimRight().endsWith('{') || line.trimRight().endsWith('(') || line.trimRight().endsWith('[')) indent += '  ';
    if (indent.isEmpty) return now;
    final text = now.text.replaceRange(pos, pos, indent);
    return TextEditingValue(text: text, selection: TextSelection.collapsed(offset: pos + indent.length));
  }
}

class CodeStep extends StatefulWidget {
  const CodeStep(this.c, {super.key});
  final StepController c;
  @override
  State<CodeStep> createState() => _CodeStepState();
}

class _CodeStepState extends State<CodeStep> {
  late final HighlightController ctl = HighlightController(text: widget.c.step['starter'] as String? ?? '', palette: Palette.light);
  final focus = FocusNode();
  RunResult? result;
  bool running = false;
  String status = '';
  bool showSolution = false;

  List get tests => widget.c.step['tests'] as List;
  String get fnName => widget.c.step['fnName'] as String;

  @override
  void initState() {
    super.initState();
    final c = widget.c;
    c.retryable = true;
    c.onCheck = _run;
    c.onReveal = () => setState(() => showSolution = true);
    c.setReady(true);
    focus.addListener(() => setState(() {}));
  }

  @override
  void dispose() {
    ctl.dispose();
    focus.dispose();
    super.dispose();
  }

  String _call(List args, [Object? label]) => label != null ? widget.c.tx(label) : '$fnName(${args.map(show).join(', ')})';

  Future<CheckResult> _run() async {
    final c = widget.c;
    setState(() {
      running = true;
      status = c.t('running');
    });
    final r = await runTests(ctl.text, fnName, tests, wrap: widget.c.step['wrap'] as String?);
    if (!mounted) return const CheckResult(false);
    setState(() {
      running = false;
      result = r;
      status = switch (r.error) {
        'timeout' => c.t('err_timeout'),
        'nofn' => c.t('err_nofn', [fnName]),
        'syntax' => c.t('err_syntax', [r.detail ?? '']),
        _ => c.t('tests_passed', [r.passed, r.results.length]),
      };
    });
    if (r.error != null) return CheckResult(false, _esc(status));
    if (r.allPass) return const CheckResult(true);
    final bad = r.results.indexWhere((x) => !x.ok);
    final tc = tests[bad] as Map;
    final hint = c.step['hint'] == null ? '' : '<br>${c.tx(c.step['hint'])}';
    return CheckResult(
      false,
      '${c.t('tests_passed', [r.passed, r.results.length])}<br><code>${_esc(_call(tc['args'] as List))}</code> ${c.t('should_be')} '
      '<code>${_esc(show(tc['expect']))}</code>, ${c.t('got')} <code>${_esc(r.results[bad].got)}</code>.$hint',
    );
  }

  String _esc(String s) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

  void _insert(String s) {
    final sel = ctl.selection;
    final start = sel.isValid ? sel.start : ctl.text.length;
    final end = sel.isValid ? sel.end : ctl.text.length;
    ctl.value = TextEditingValue(text: ctl.text.replaceRange(start, end, s), selection: TextSelection.collapsed(offset: start + s.length));
    HapticFeedback.selectionClick();
  }

  @override
  Widget build(BuildContext context) {
    final p = context.pal;
    final c = widget.c;
    ctl.palette = p;
    const keys = ['  ', '{', '}', '(', ')', '[', ']', ';', '=', '<', '>', '+', '-', '!', '&&', '||', '.', ',', "'"];
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Container(
        decoration: BoxDecoration(
          color: p.code,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: focus.hasFocus ? p.sel : p.line, width: 2),
        ),
        child: TextField(
          controller: ctl,
          focusNode: focus,
          maxLines: null,
          minLines: 9,
          keyboardType: TextInputType.multiline,
          autocorrect: false,
          enableSuggestions: false,
          smartDashesType: SmartDashesType.disabled,
          smartQuotesType: SmartQuotesType.disabled,
          textCapitalization: TextCapitalization.none,
          inputFormatters: [AutoIndent()],
          style: monoStyle(size: 14, color: p.codeInk),
          decoration: const InputDecoration(border: InputBorder.none, contentPadding: EdgeInsets.all(12), isCollapsed: true),
        ),
      ),
      if (focus.hasFocus)
        SizedBox(
          height: 44,
          child: ListView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.only(top: 6),
            children: [
              for (final k in keys)
                Padding(
                  padding: const EdgeInsets.only(right: 6),
                  child: GestureDetector(
                    onTap: () => _insert(k),
                    child: Container(
                      constraints: const BoxConstraints(minWidth: 38),
                      alignment: Alignment.center,
                      padding: const EdgeInsets.symmetric(horizontal: 8),
                      decoration: BoxDecoration(color: p.surface, borderRadius: BorderRadius.circular(8), border: Border.all(color: p.line, width: 1.5)),
                      child: Text(k == '  ' ? '⇥' : k, style: monoStyle(size: 16, color: p.ink, weight: FontWeight.w700)),
                    ),
                  ),
                ),
            ],
          ),
        ),
      const SizedBox(height: 12),
      Row(children: [
        ChunkyButton(label: '▶ ${c.t('run')}', kind: ChunkyKind.ghost, expand: false, onPressed: running ? null : _run),
        const SizedBox(width: 12),
        Expanded(child: Text(status, style: TextStyle(color: p.muted, fontSize: 14))),
      ]),
      SmallLabel(c.t('tests')),
      for (var i = 0; i < tests.length; i++) _testRow(p, i),
      if (result != null && result!.logs.isNotEmpty) ...[
        const SmallLabel('console.log'),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(color: p.code, borderRadius: BorderRadius.circular(10)),
          child: Text(result!.logs.join('\n'), style: monoStyle(size: 13, color: p.codeInk)),
        ),
      ],
      if (showSolution) ...[SmallLabel(c.t('solution')), CodeBlock(c.step['solution'] as String? ?? '', size: 13)],
    ]);
  }

  Widget _testRow(Palette p, int i) {
    final tc = tests[i] as Map;
    final r = result?.error == null && result != null && i < result!.results.length ? result!.results[i] : null;
    final border = r == null ? p.line : r.ok ? p.good : p.bad;
    final fill = r == null ? p.surface : r.ok ? p.goodSoft : p.badSoft;
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 6),
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(color: fill, borderRadius: BorderRadius.circular(10), border: Border.all(color: border, width: 2)),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Text.rich(TextSpan(style: monoStyle(size: 13, color: p.ink), children: [
          if (r != null) TextSpan(text: r.ok ? '✓ ' : '✗ ', style: TextStyle(color: r.ok ? p.good : p.bad, fontWeight: FontWeight.w900)),
          TextSpan(text: _call(tc['args'] as List, tc['label'])),
          TextSpan(text: '  →  ', style: TextStyle(color: p.faint)),
          TextSpan(text: show(tc['expect'])),
          if (r != null && !r.ok) TextSpan(text: '   ${widget.c.t('got')} ${r.got}', style: TextStyle(color: p.bad)),
        ])),
      ),
    );
  }
}
