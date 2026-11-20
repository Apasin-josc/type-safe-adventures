import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../data/hints.dart';
import '../data/runner.dart';
import '../ui/chunky.dart';
import '../ui/code.dart';
import '../ui/dressed.dart';
import '../ui/rich.dart';
import '../ui/sfx.dart';
import '../ui/theme.dart';
import '../ui/voice.dart';
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

  // Pistas de Salsa (Claude): máximo 3 por reto, y nunca en modo entrevista.
  static const maxHints = 3;
  final List<String> hints = [];
  bool asking = false;
  String? hintError;
  final _hintKey = GlobalKey();

  List get tests => widget.c.step['tests'] as List;
  String get fnName => widget.c.step['fnName'] as String;

  @override
  void initState() {
    super.initState();
    final c = widget.c;
    c.retryable = true;
    c.onCheck = _run;
    c.onReveal = () => setState(() => showSolution = true);
    c.canHint = () => _canHint;
    c.sniff = () => c.interview || c.step['hint'] == null ? null : c.tx(c.step['hint']);
    c.onHint = _askHint;
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

  /// Lleva la pantalla hasta la burbuja de Salsa.
  void _reveal() => WidgetsBinding.instance.addPostFrameCallback((_) {
        final ctx = _hintKey.currentContext;
        if (ctx != null && ctx.mounted) Scrollable.ensureVisible(ctx, duration: const Duration(milliseconds: 300), alignment: 0.9, curve: Curves.easeOut);
      });

  bool get _canHint => !widget.c.interview && result != null && !result!.allPass && hints.length < maxHints;

  /// Manda el enunciado, tu código y qué pruebas fallaron; Salsa contesta con una pista corta.
  Future<void> _askHint() async {
    if (!_canHint || asking) return;
    final c = widget.c;
    final r = result!;
    final fails = <Map<String, String>>[
      for (var i = 0; i < r.results.length && i < tests.length; i++)
        if (!r.results[i].ok)
          {
            'call': _call((tests[i] as Map)['args'] as List, (tests[i] as Map)['label']),
            'expected': show((tests[i] as Map)['expect']),
            'got': r.results[i].got,
          },
    ];
    HapticFeedback.selectionClick();
    sfx.play(Sfx.tap);
    setState(() {
      asking = true;
      hintError = null;
    });
    _reveal();
    try {
      final h = await HintClient.ask(
        lang: c.lang,
        prompt: c.tx(c.step['prompt']),
        code: ctl.text,
        fails: fails.take(4).toList(),
        error: r.error == null ? null : status,
      );
      if (!mounted) return;
      setState(() => hints.add(h));
      _reveal();
      sfx.play(Sfx.unlock);
      voice.speak(h, c.lang);
    } on HintError catch (e) {
      if (!mounted) return;
      setState(() => hintError = c.t(switch (e.code) {
            'offline' || 'token' || 'nokey' || 'rate' => 'hint_${e.code}',
            _ => 'hint_fail',
          }));
      _reveal();
    } finally {
      if (mounted) setState(() => asking = false);
    }
  }

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
      for (final h in hints) _hintBubble(p, h),
      if (asking) _hintBubble(p, c.t('hint_thinking'), thinking: true),
      if (hintError != null && !asking)
        Padding(
          padding: const EdgeInsets.only(top: 8),
          child: Text(hintError!, style: TextStyle(color: p.bad, fontSize: 14, fontWeight: FontWeight.w700)),
        ),
      SizedBox(key: _hintKey, height: 0),
      if (_canHint && !asking) ...[
        const SizedBox(height: 10),
        ChunkyButton(
          label: hints.isEmpty ? c.t('hint_ask') : c.t('hint_more', [maxHints - hints.length]),
          kind: ChunkyKind.ghost,
          onPressed: _askHint,
        ),
      ],
      if (showSolution) ...[SmallLabel(c.t('solution')), CodeBlock(c.step['solution'] as String? ?? '', size: 13)],
    ]);
  }

  Widget _hintBubble(Palette p, String text, {bool thinking = false}) => Padding(
        padding: const EdgeInsets.only(top: 10),
        child: Row(crossAxisAlignment: CrossAxisAlignment.end, children: [
          const DressedSalsa(size: 58),
          const SizedBox(width: 8),
          Expanded(
            child: Container(
              padding: const EdgeInsets.fromLTRB(14, 10, 14, 10),
              decoration: BoxDecoration(
                color: p.surface,
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(16),
                  topRight: Radius.circular(16),
                  bottomRight: Radius.circular(16),
                  bottomLeft: Radius.circular(4),
                ),
                border: Border.all(color: p.accent, width: 2),
              ),
              child: thinking
                  ? Text(text, style: TextStyle(color: p.muted, fontStyle: FontStyle.italic, fontSize: 15))
                  : Rich(_md(text), style: TextStyle(color: p.ink, fontSize: 15.5, height: 1.35)),
            ),
          ),
        ]),
      );

  /// Los `backticks` de la pista se ven como código.
  String _md(String s) => _esc(s).replaceAllMapped(RegExp(r'`([^`]+)`'), (m) => '<code>${m[1]}</code>');

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
