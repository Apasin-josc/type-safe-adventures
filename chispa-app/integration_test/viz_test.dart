// Captura cada animación ("viz") de los cursos a la mitad de su recorrido, para revisarlas a ojo:
//   flutter drive -d <simulador> --driver=test_driver/integration_test.dart --target=integration_test/viz_test.dart
// Las imágenes quedan en build/screens/viz-*.png.
import 'package:chispa/data/models.dart';
import 'package:chispa/steps/common.dart';
import 'package:chispa/steps/viz.dart';
import 'package:chispa/ui/theme.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';

void main() {
  final binding = IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('todas las animaciones se dibujan', (tester) async {
    final courses = await loadCourses(rootBundle);
    for (final c in courses) {
      for (final l in c.lessons) {
        for (var i = 0; i < l.steps.length; i++) {
          final step = l.steps[i];
          if (step['type'] != 'viz') continue;
          final ctl = StepController(step: step, lang: 'es');
          await tester.pumpWidget(MaterialApp(
            debugShowCheckedModeBanner: false,
            theme: buildTheme(Palette.light, Brightness.light),
            home: Scaffold(
              body: SafeArea(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.fromLTRB(20, 10, 20, 30),
                  child: VizStep(ctl, key: ValueKey('${l.id}-$i')),
                ),
              ),
            ),
          ));
          await tester.pump(const Duration(milliseconds: 300));
          final frames = (step['frames'] as List).length;
          // Al cuadro de en medio (ahí suele estar lo interesante).
          for (var k = 0; k < frames ~/ 2; k++) {
            await tester.tap(find.text('Paso ▶'));
            await tester.pump(const Duration(milliseconds: 60));
          }
          await tester.pumpAndSettle();
          expect(tester.takeException(), isNull);
          await binding.takeScreenshot('viz-${l.id}-$i');
        }
      }
    }
  });
}
