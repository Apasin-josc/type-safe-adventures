import 'package:flutter/material.dart';

import 'theme.dart';

/// Pinta el poquito de HTML que usan las lecciones: <p>, <b>/<strong>, <code>, <br> y entidades.
class Rich extends StatelessWidget {
  const Rich(this.html, {super.key, this.style, this.textAlign});
  final String html;
  final TextStyle? style;
  final TextAlign? textAlign;

  @override
  Widget build(BuildContext context) {
    final p = context.pal;
    final base = (style ?? const TextStyle(fontSize: 17, height: 1.45)).copyWith(color: style?.color ?? p.ink);
    return Text.rich(TextSpan(style: base, children: htmlSpans(html, base, p)), textAlign: textAlign);
  }
}

final _tag = RegExp(r'<(/?)(\w+)[^>]*>|([^<]+)');

String decodeEntities(String s) => s
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&amp;', '&');

List<InlineSpan> htmlSpans(String html, TextStyle base, Palette p) {
  final out = <InlineSpan>[];
  var bold = 0;
  var code = 0;
  var paragraphs = 0;
  void gap() {
    // Separación entre párrafos: un salto normal y otro chiquito.
    out.add(const TextSpan(text: '\n'));
    out.add(const TextSpan(text: '\n', style: TextStyle(fontSize: 7, height: 1)));
  }

  for (final m in _tag.allMatches(html)) {
    final text = m.group(3);
    if (text != null) {
      final t = decodeEntities(text);
      if (t.isEmpty) continue;
      TextStyle st = const TextStyle();
      if (bold > 0) st = st.copyWith(fontWeight: FontWeight.w800);
      if (code > 0) {
        st = st.merge(monoStyle(size: (base.fontSize ?? 17) * 0.88, color: p.codeInk)).copyWith(backgroundColor: p.code, height: base.height);
      }
      out.add(TextSpan(text: code > 0 ? ' $t ' : t, style: st));
      continue;
    }
    final closing = m.group(1) == '/';
    final name = m.group(2)!.toLowerCase();
    switch (name) {
      case 'b':
      case 'strong':
        bold += closing ? -1 : 1;
      case 'code':
        code += closing ? -1 : 1;
      case 'br':
        out.add(const TextSpan(text: '\n'));
      case 'p':
        if (!closing) {
          if (paragraphs > 0) gap();
          paragraphs++;
        }
    }
  }
  return out;
}
