import 'package:flutter/material.dart';

import 'basic.dart';
import 'code_step.dart';
import 'common.dart';
import 'explore.dart';
import 'order_trace.dart';
import 'viz.dart';

/// Escoge el widget de cada pantalla según su "type" en el JSON.
Widget buildStep(StepController c, {Key? key}) {
  return switch (c.step['type']) {
    'read' => ReadStep(c, key: key),
    'choice' => ChoiceStep(c, key: key),
    'tap' => TapStep(c, key: key),
    'number' => NumberStep(c, key: key),
    'fill' => FillStep(c, key: key),
    'order' => OrderStep(c, key: key),
    'trace' => TraceStep(c, key: key),
    'search' => SearchStep(c, key: key),
    'growth' => GrowthStep(c, key: key),
    'halving' => HalvingStep(c, key: key),
    'guess' => GuessStep(c, key: key),
    'bsearch' => BsearchStep(c, key: key),
    'pointers' => PointersStep(c, key: key),
    'code' => CodeStep(c, key: key),
    'classify' => ClassifyStep(c, key: key),
    'viz' => VizStep(c, key: key),
    final t => Text('Tipo de pantalla desconocido: $t'),
  };
}
