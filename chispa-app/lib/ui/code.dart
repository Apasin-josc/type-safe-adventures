import 'package:flutter/material.dart';

import 'theme.dart';

const _keywords = {
  'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'do', 'break', 'continue', 'new', 'typeof',
  'instanceof', 'of', 'in', 'true', 'false', 'null', 'undefined', 'class', 'this', 'switch', 'case', 'default', 'throw',
  'try', 'catch', 'finally', 'async', 'await',
};

final _tokens = RegExp(
  r'''(//[^\n]*)|('(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"|`(?:\\.|[^`\\])*`)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)''',
);

/// Resalta JavaScript: palabras clave, textos, números y comentarios.
List<TextSpan> highlight(String src, Palette p) {
  final out = <TextSpan>[];
  var last = 0;
  for (final m in _tokens.allMatches(src)) {
    if (m.start > last) out.add(TextSpan(text: src.substring(last, m.start)));
    final tok = m.group(0)!;
    if (m.group(1) != null) {
      out.add(TextSpan(text: tok, style: TextStyle(color: p.comment, fontStyle: FontStyle.italic)));
    } else if (m.group(2) != null) {
      out.add(TextSpan(text: tok, style: TextStyle(color: p.str)));
    } else if (m.group(3) != null) {
      out.add(TextSpan(text: tok, style: TextStyle(color: p.num)));
    } else if (_keywords.contains(tok)) {
      out.add(TextSpan(text: tok, style: TextStyle(color: p.kw, fontWeight: FontWeight.w700)));
    } else {
      out.add(TextSpan(text: tok));
    }
    last = m.end;
  }
  if (last < src.length) out.add(TextSpan(text: src.substring(last)));
  return out;
}

/// Un bloque de código con fondo, que se puede deslizar de lado si una línea es larga.
class CodeBlock extends StatelessWidget {
  const CodeBlock(this.src, {super.key, this.size = 14, this.highlightLine});
  final String src;
  final double size;
  final int? highlightLine;

  @override
  Widget build(BuildContext context) {
    final p = context.pal;
    final style = monoStyle(size: size, color: p.codeInk);
    Widget body;
    if (highlightLine == null) {
      body = Text.rich(TextSpan(style: style, children: highlight(src, p)), softWrap: false);
    } else {
      final lines = src.split('\n');
      body = Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          for (var i = 0; i < lines.length; i++)
            Container(
              decoration: BoxDecoration(
                color: i == highlightLine ? p.selSoft : null,
                border: Border(left: BorderSide(color: i == highlightLine ? p.sel : Colors.transparent, width: 3)),
              ),
              padding: const EdgeInsets.only(left: 6, right: 8),
              child: Text.rich(TextSpan(style: style, children: highlight(lines[i].isEmpty ? ' ' : lines[i], p)), softWrap: false),
            ),
        ],
      );
    }
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(color: p.code, borderRadius: BorderRadius.circular(12)),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        padding: EdgeInsets.symmetric(horizontal: highlightLine == null ? 14 : 8, vertical: 12),
        child: body,
      ),
    );
  }
}
