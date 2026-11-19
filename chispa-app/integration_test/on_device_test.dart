// Corre en un iPhone (o simulador) de verdad:  flutter test integration_test -d <id>
// Comprueba el motor de JavaScript del teléfono y el recorrido de la lección 1.
import 'package:integration_test/integration_test.dart';

import '../test/app_test.dart' as app;
import '../test/runner_test.dart' as runner;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  runner.main();
  app.main();
}
