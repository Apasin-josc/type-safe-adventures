import 'package:chispa/data/runner.dart';
import 'package:flutter_test/flutter_test.dart';

const tests = [
  {'args': [[1, 3, 4, 6, 8, 11], 10], 'expect': [2, 3]},
  {'args': [[1, 2, 3], 100], 'expect': null},
];

void main() {
  test('el guardián se mete en los loops con llaves', () {
    final g = guardLoops('for (let i = 0; i < n; i++) {\n x++;\n}\nwhile (a) { b(); }\ndo { c(); } while (d);');
    expect('__chispaSteps'.allMatches(g).length, 3);
    expect(guardLoops('const a = 1;'), 'const a = 1;');
  });

  test('una solución correcta pasa todas las pruebas', () async {
    final r = await runTests('''
function pairSum(arr, target) {
  let left = 0, right = arr.length - 1;
  while (left < right) {
    const s = arr[left] + arr[right];
    if (s === target) return [left, right];
    if (s < target) left++; else right--;
  }
  return null;
}''', 'pairSum', tests);
    expect(r.error, isNull);
    expect(r.allPass, isTrue);
  });

  test('una incompleta falla y dice qué salió', () async {
    final r = await runTests('function pairSum(a, t) { console.log("hola"); }', 'pairSum', tests);
    expect(r.passed, 0);
    expect(r.results.first.got, 'undefined');
    expect(r.logs, contains('hola'));
  });

  test('errores de sintaxis, función faltante y loop infinito', () async {
    expect((await runTests('function pairSum( {', 'pairSum', tests)).error, 'syntax');
    expect((await runTests('function otra() {}', 'pairSum', tests)).error, 'nofn');
    expect((await runTests('function pairSum() { while (true) {} }', 'pairSum', tests)).error, 'timeout');
  });
}
