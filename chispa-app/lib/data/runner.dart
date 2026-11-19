import 'dart:convert';
import 'dart:isolate';

import 'package:flutter_js/flutter_js.dart';

/// Resultado de correr tu código contra las pruebas.
class RunResult {
  RunResult({this.results = const [], this.logs = const [], this.error, this.detail});
  final List<TestResult> results;
  final List<String> logs;
  final String? error; // 'syntax' | 'nofn' | 'timeout'
  final String? detail;

  int get passed => results.where((r) => r.ok).length;
  bool get allPass => error == null && results.isNotEmpty && passed == results.length;

  factory RunResult.fromJson(Map<String, dynamic> j) => RunResult(
        results: [for (final r in (j['results'] as List? ?? const [])) TestResult(r['ok'] == true, r['got'].toString())],
        logs: [for (final l in (j['logs'] as List? ?? const [])) l.toString()],
        error: j['error'] as String?,
        detail: j['detail']?.toString(),
      );
}

class TestResult {
  TestResult(this.ok, this.got);
  final bool ok;
  final String got;
}

/// Mete un contador al inicio de cada loop con llaves: si da más de 5 millones de vueltas,
/// lanza un error en vez de colgarse. (El motor de JavaScript del iPhone no se puede interrumpir.)
String guardLoops(String code) {
  const guard = 'if(++__chispaSteps>5e6)throw new Error("__TIMEOUT__");';
  final out = StringBuffer();
  var i = 0;
  final loop = RegExp(r'\b(for|while)\s*\(|\bdo\s*\{');
  while (true) {
    final m = loop.firstMatch(code.substring(i));
    if (m == null) break;
    final start = i + m.start;
    final tokenEnd = i + m.end;
    if (m.group(0)!.startsWith('do')) {
      out.write(code.substring(i, tokenEnd));
      out.write(guard);
      i = tokenEnd;
      continue;
    }
    // Busca el ")" que cierra la condición del loop.
    var depth = 1;
    var j = tokenEnd;
    while (j < code.length && depth > 0) {
      final ch = code[j];
      if (ch == '(') depth++;
      if (ch == ')') depth--;
      j++;
    }
    var k = j;
    while (k < code.length && (code[k] == ' ' || code[k] == '\n' || code[k] == '\t' || code[k] == '\r')) {
      k++;
    }
    if (k < code.length && code[k] == '{') {
      out.write(code.substring(i, k + 1));
      out.write(guard);
      i = k + 1;
    } else {
      out.write(code.substring(i, j));
      i = j;
    }
    if (start < 0) break;
  }
  out.write(code.substring(i));
  return out.toString();
}

const _harness = r'''
(function () {
  var logs = [];
  var fmt = function (v) {
    if (v === undefined) return 'undefined';
    try { return JSON.stringify(v); } catch (e) { return String(v); }
  };
  globalThis.console = { log: function () {
    var a = Array.prototype.slice.call(arguments);
    logs.push(a.map(function (x) { return typeof x === 'string' ? x : fmt(x); }).join(' '));
  } };
  var fn;
  try {
    fn = new Function(__CODE__ + '\n;return typeof ' + __NAME__ + ' === "function" ? ' + __NAME__ + ' : undefined;')();
  } catch (err) {
    return JSON.stringify({ error: 'syntax', detail: String((err && err.message) || err), logs: logs });
  }
  if (typeof fn !== 'function') return JSON.stringify({ error: 'nofn', logs: logs });
  if (__WRAP__) {
    try {
      fn = new Function(__CODE__ + '\n;return (' + __WRAP__ + ');')();
    } catch (err) {
      return JSON.stringify({ error: 'syntax', detail: String((err && err.message) || err), logs: logs });
    }
  }
  var tests = __TESTS__;
  var timedOut = false;
  var results = tests.map(function (t) {
    globalThis.__chispaSteps = 0;
    try {
      var got = fn.apply(null, JSON.parse(JSON.stringify(t.args)));
      return { ok: fmt(got) === fmt(t.expect), got: fmt(got) };
    } catch (err) {
      if (err && err.message === '__TIMEOUT__') timedOut = true;
      return { ok: false, got: 'Error: ' + ((err && err.message) || err) };
    }
  });
  if (timedOut) return JSON.stringify({ error: 'timeout', logs: logs });
  return JSON.stringify({ results: results, logs: logs.slice(0, 50) });
})()
''';

String _runSync(String source) {
  final rt = getJavascriptRuntime(xhr: false);
  try {
    final r = rt.evaluate(source);
    if (r.isError) return jsonEncode({'error': 'syntax', 'detail': r.stringResult});
    return r.stringResult;
  } finally {
    rt.dispose();
  }
}

/// Corre [code], busca la función [fnName] y la prueba con cada {args, expect} de [tests].
/// [wrap] (opcional): una expresión de JavaScript que regresa la función a probar, usando lo que
/// definiste. Sirve para closures y clases, p. ej. `(n) => { const c = makeCounter(); ... }`.
Future<RunResult> runTests(String code, String fnName, List<dynamic> tests, {String? wrap}) async {
  final source = _harness
      .replaceAll('__CODE__', jsonEncode(guardLoops(code)))
      .replaceAll('__WRAP__', jsonEncode(wrap ?? ''))
      .replaceAll('__NAME__', jsonEncode(fnName))
      .replaceFirst('__TESTS__', jsonEncode(tests));
  try {
    final raw = await Isolate.run(() => _runSync(source)).timeout(const Duration(seconds: 4));
    return RunResult.fromJson(jsonDecode(raw) as Map<String, dynamic>);
  } on Exception catch (e) {
    final s = e.toString();
    return RunResult(error: s.contains('Timeout') ? 'timeout' : 'syntax', detail: s);
  }
}
