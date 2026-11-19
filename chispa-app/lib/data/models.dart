import 'dart:convert';

import 'package:flutter/services.dart';

/// Un curso: sus lecciones y las que vienen pronto. Los textos son { es, en } (ver ui/i18n.dart → tx).
class Course {
  Course({required this.id, required this.title, required this.blurb, required this.lessons, required this.soon, this.icon, this.colors = const [], this.unit, this.units = const []});

  final String id;
  final Object title;
  final Object blurb;
  final List<Lesson> lessons;
  final List<SoonItem> soon;
  final String? icon;
  final Object? unit; // nombre de la unidad (cursos de una sola unidad), { es, en }

  /// Nombres de las unidades, en orden. Cada lección dice en cuál va (Lesson.unit).
  final List<Object> units;

  /// Degradado propio del curso (2 colores + sombra), en hex. Vacío = los colores de la app.
  final List<int> colors;

  factory Course.fromJson(Map<String, dynamic> j) => Course(
        id: j['id'] as String,
        title: j['title'] as Object,
        blurb: j['blurb'] as Object,
        lessons: [for (final l in j['lessons'] as List) Lesson.fromJson(l as Map<String, dynamic>)],
        soon: [for (final s in (j['soon'] as List? ?? const [])) SoonItem.fromJson(s as Map<String, dynamic>)],
        icon: j['icon'] as String?,
        unit: j['unit'],
        units: [for (final u in (j['units'] as List? ?? const [])) u as Object],
        colors: [for (final c in (j['colors'] as List? ?? const [])) int.parse('FF${(c as String).substring(1)}', radix: 16)],
      );

  String keyOf(Lesson l) => '$id/${l.id}';

  int get unitCount => lessons.isEmpty ? 0 : lessons.map((l) => l.unit).reduce((a, b) => a > b ? a : b) + 1;

  Object? unitTitle(int u) => u < units.length ? units[u] : (u == 0 ? unit : null);
}

class Lesson {
  Lesson({required this.id, required this.icon, required this.title, required this.blurb, required this.steps, this.more = const [], this.unit = 0});

  final String id;
  final String icon;
  final Object title;
  final Object blurb;

  /// Cada pantalla tal cual viene del JSON. Su "type" decide qué widget la pinta (ver steps/registry.dart).
  final List<Map<String, dynamic>> steps;

  /// Para leer más: [{title: {es, en}, url}] (capítulos de javascript.info, por ejemplo).
  final List<Map<String, dynamic>> more;

  /// Índice de la unidad dentro del curso.
  final int unit;

  factory Lesson.fromJson(Map<String, dynamic> j) => Lesson(
        id: j['id'] as String,
        icon: j['icon'] as String,
        title: j['title'] as Object,
        blurb: j['blurb'] as Object,
        steps: [for (final s in j['steps'] as List) Map<String, dynamic>.from(s as Map)],
        more: [for (final m in (j['more'] as List? ?? const [])) Map<String, dynamic>.from(m as Map)],
        unit: (j['unit'] as num?)?.toInt() ?? 0,
      );
}

class SoonItem {
  SoonItem({required this.icon, required this.title});
  final String icon;
  final Object title;
  factory SoonItem.fromJson(Map<String, dynamic> j) => SoonItem(icon: j['icon'] as String, title: j['title'] as Object);
}

/// Lee assets/courses/index.json y cada curso que lista.
Future<List<Course>> loadCourses(AssetBundle bundle) async {
  final ids = (jsonDecode(await bundle.loadString('assets/courses/index.json')) as List).cast<String>();
  return [
    for (final id in ids) Course.fromJson(jsonDecode(await bundle.loadString('assets/courses/$id.json')) as Map<String, dynamic>),
  ];
}
