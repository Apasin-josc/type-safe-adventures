import 'dart:convert';
import 'dart:ui' show PlatformDispatcher;

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'models.dart';

class LessonResult {
  const LessonResult({required this.acc, required this.at});
  final int acc; // % de aciertos al primer intento (el mejor)
  final int at; // cuándo, en ms
  Map<String, dynamic> toJson() => {'acc': acc, 'at': at};
  factory LessonResult.fromJson(Map<String, dynamic> j) => LessonResult(acc: (j['acc'] as num).toInt(), at: (j['at'] as num).toInt());
}

/// Una pregunta que fallaste, en su "caja" de repaso espaciado.
class ReviewItem {
  const ReviewItem({required this.box, required this.due});
  final int box; // 0, 1, 2… a la caja 3 se da por dominada
  final int due; // día (número de día) en que toca repasarla
  Map<String, dynamic> toJson() => {'box': box, 'due': due};
  factory ReviewItem.fromJson(Map j) => ReviewItem(box: (j['box'] as num).toInt(), due: (j['due'] as num).toInt());
}

/// Un salto pendiente de Salsa en el camino (de la lección que terminaste a la siguiente).
class Hop {
  const Hop({required this.course, required this.from, required this.to});
  final String course;
  final int from, to;
  Map<String, dynamic> toJson() => {'course': course, 'from': from, 'to': to};
  static Hop? fromJson(Object? j) =>
      j is Map ? Hop(course: j['course'] as String, from: (j['from'] as num).toInt(), to: (j['to'] as num).toInt()) : null;
}

/// Todo lo que la app recuerda de ti.
class Progress {
  const Progress({this.done = const {}, this.days = const [], this.lang, this.theme, this.hop, this.sound = true, this.missed = const {}, this.missions = const [], this.voice = true, this.interviews = const [], this.equipped = const [], this.seenUnlocks = const []});

  final Map<String, LessonResult> done;
  final List<String> days; // días que estudiaste, 'yyyy-mm-dd'
  final String? lang; // 'es' | 'en' | null (el del teléfono)
  final String? theme; // 'light' | 'dark' | null (el del teléfono)
  final Hop? hop;
  final bool sound; // sonidos prendidos
  final Map<String, ReviewItem> missed; // preguntas falladas → su caja de repaso
  final List<String> missions; // días con la misión del día cumplida
  final bool voice; // la voz de Salsa
  final List<String> interviews; // resultados del modo entrevista: 'strong' | 'hire' | 'no'
  final List<String> equipped; // lo que trae puesto Salsa (suéter, pelota, lentes)
  final List<String> seenUnlocks; // premios que ya te avisamos

  Progress copyWith({Map<String, LessonResult>? done, List<String>? days, String? lang, String? theme, Hop? hop, bool? sound, Map<String, ReviewItem>? missed, List<String>? missions, bool? voice, List<String>? interviews, List<String>? equipped, List<String>? seenUnlocks, bool clearHop = false}) =>
      Progress(
        done: done ?? this.done,
        days: days ?? this.days,
        lang: lang ?? this.lang,
        theme: theme ?? this.theme,
        hop: clearHop ? null : (hop ?? this.hop),
        sound: sound ?? this.sound,
        missed: missed ?? this.missed,
        missions: missions ?? this.missions,
        voice: voice ?? this.voice,
        interviews: interviews ?? this.interviews,
        equipped: equipped ?? this.equipped,
        seenUnlocks: seenUnlocks ?? this.seenUnlocks,
      );

  Map<String, dynamic> toJson() => {
        'version': 1,
        'done': done.map((k, v) => MapEntry(k, v.toJson())),
        'days': days,
        if (lang != null) 'lang': lang,
        if (theme != null) 'theme': theme,
        if (hop != null) 'hop': hop!.toJson(),
        'sound': sound,
        if (missed.isNotEmpty) 'missed': missed.map((k, v) => MapEntry(k, v.toJson())),
        if (missions.isNotEmpty) 'missions': missions,
        'voice': voice,
        if (interviews.isNotEmpty) 'interviews': interviews,
        if (equipped.isNotEmpty) 'equipped': equipped,
        if (seenUnlocks.isNotEmpty) 'seenUnlocks': seenUnlocks,
      };

  factory Progress.fromJson(Map<String, dynamic> j) => Progress(
        done: {
          for (final e in (j['done'] as Map? ?? const {}).entries)
            e.key as String: LessonResult.fromJson(Map<String, dynamic>.from(e.value as Map)),
        },
        days: [for (final d in (j['days'] as List? ?? const [])) d as String],
        lang: j['lang'] as String?,
        theme: j['theme'] as String?,
        hop: Hop.fromJson(j['hop']),
        sound: j['sound'] != false,
        missed: {
          for (final e in (j['missed'] as Map? ?? const {}).entries) e.key as String: ReviewItem.fromJson(e.value as Map),
        },
        missions: [for (final d in (j['missions'] as List? ?? const [])) d as String],
        voice: j['voice'] != false,
        interviews: [for (final d in (j['interviews'] as List? ?? const [])) d as String],
        equipped: [for (final d in (j['equipped'] as List? ?? const [])) d as String],
        seenUnlocks: [for (final d in (j['seenUnlocks'] as List? ?? const [])) d as String],
      );

  String get effectiveLang => lang ?? (PlatformDispatcher.instance.locale.languageCode == 'es' ? 'es' : 'en');

  bool isDone(Course c, Lesson l) => done.containsKey(c.keyOf(l));

  bool get missionDoneToday => missions.contains(dayKey(DateTime.now()));

  bool isOpen(Course c, int i) => i == 0 || isDone(c, c.lessons[i - 1]);

  /// Los últimos 7 días (de hace 6 días a hoy): si estudiaste cada uno.
  List<(DateTime, bool)> lastWeek([DateTime? now]) {
    final today = now ?? DateTime.now();
    final set = days.toSet();
    return [
      for (var i = 6; i >= 0; i--)
        () {
          final d = DateTime(today.year, today.month, today.day).subtract(Duration(days: i));
          return (d, set.contains(dayKey(d)));
        }(),
    ];
  }

  /// La racha más larga que has tenido.
  int get bestStreak {
    final sorted = days.map(DateTime.parse).toList()..sort();
    var best = 0, run = 0;
    DateTime? prev;
    for (final d in sorted) {
      run = (prev != null && d.difference(prev).inDays == 1) ? run + 1 : 1;
      if (prev == null || d != prev) best = run > best ? run : best;
      prev = d;
    }
    return best;
  }

  int streak([DateTime? now]) {
    final set = days.toSet();
    var d = now ?? DateTime.now();
    if (!set.contains(dayKey(d))) d = d.subtract(const Duration(days: 1));
    var n = 0;
    while (set.contains(dayKey(d))) {
      n++;
      d = d.subtract(const Duration(days: 1));
    }
    return n;
  }
}

String dayKey(DateTime d) => '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';

/// Dónde vive el progreso. Hoy: en el teléfono. Mañana, con login, otra implementación que
/// sincronice con un servidor; el resto de la app no se entera del cambio.
abstract class ProgressRepository {
  Progress load();
  Future<void> save(Progress p);
}

class LocalProgressRepository implements ProgressRepository {
  LocalProgressRepository(this.prefs);
  final SharedPreferences prefs;
  static const _key = 'chispa-progress';

  @override
  Progress load() {
    final raw = prefs.getString(_key);
    if (raw == null) return const Progress();
    try {
      return Progress.fromJson(jsonDecode(raw) as Map<String, dynamic>);
    } catch (_) {
      return const Progress();
    }
  }

  @override
  Future<void> save(Progress p) => prefs.setString(_key, jsonEncode(p.toJson()));
}

// ───────────── Providers ─────────────
final prefsProvider = Provider<SharedPreferences>((ref) => throw UnimplementedError('se inyecta en main()'));
final coursesProvider = Provider<List<Course>>((ref) => throw UnimplementedError('se inyecta en main()'));
final progressRepoProvider = Provider<ProgressRepository>((ref) => LocalProgressRepository(ref.watch(prefsProvider)));

final progressProvider = NotifierProvider<ProgressNotifier, Progress>(ProgressNotifier.new);

class ProgressNotifier extends Notifier<Progress> {
  @override
  Progress build() => ref.watch(progressRepoProvider).load();

  void _set(Progress p) {
    state = p;
    ref.read(progressRepoProvider).save(p);
  }

  void setLang(String lang) => _set(state.copyWith(lang: lang));
  void setTheme(String theme) => _set(state.copyWith(theme: theme));
  void clearHop() => _set(state.copyWith(clearHop: true));
  void setSound(bool on) => _set(state.copyWith(sound: on));

  /// ¿Ya estudiaste hoy? (Si no, terminar una lección sube tu racha.)
  bool get studiedToday => state.days.contains(dayKey(DateTime.now()));

  int _dayNum(DateTime d) => DateTime.utc(d.year, d.month, d.day).millisecondsSinceEpoch ~/ 86400000;

  List<String> _withToday() {
    final today = dayKey(DateTime.now());
    return state.days.contains(today) ? state.days : [...state.days, today];
  }

  /// Fallaste una pregunta al primer intento: entra a la caja 0 y toca repasarla mañana.
  void noteMiss(String key) {
    final tomorrow = _dayNum(DateTime.now()) + 1;
    _set(state.copyWith(missed: {...state.missed, key: ReviewItem(box: 0, due: tomorrow)}));
  }

  /// Resultado de repasar una pregunta en la misión: acierto = sube de caja; fallo = regresa a la 0.
  void reviewResult(String key, bool ok) {
    final today = _dayNum(DateTime.now());
    final cur = state.missed[key];
    final next = Map<String, ReviewItem>.of(state.missed);
    if (!ok) {
      next[key] = ReviewItem(box: 0, due: today + 1);
    } else if (cur != null) {
      final box = cur.box + 1;
      if (box >= 3) {
        next.remove(key); // dominada
      } else {
        next[key] = ReviewItem(box: box, due: today + const [1, 2, 5][box]);
      }
    }
    _set(state.copyWith(missed: next));
  }

  /// Misión del día cumplida (y cuenta para la racha).
  void winMission() {
    final today = dayKey(DateTime.now());
    _set(state.copyWith(days: _withToday(), missions: state.missions.contains(today) ? state.missions : [...state.missions, today]));
  }

  /// Practicar también cuenta para la racha.
  void touchDay() => _set(state.copyWith(days: _withToday()));

  void setVoice(bool on) => _set(state.copyWith(voice: on));

  /// Resultado del modo entrevista ('strong' | 'hire' | 'no'). Cuenta para la racha.
  void recordInterview(String verdict) => _set(state.copyWith(interviews: [...state.interviews, verdict], days: _withToday()));

  void equip(String item, bool on) {
    final next = [...state.equipped.where((e) => e != item && !(item.startsWith('glasses') && e.startsWith('glasses'))), if (on) item];
    _set(state.copyWith(equipped: next));
  }

  void markSeen(List<String> items) => _set(state.copyWith(seenUnlocks: {...state.seenUnlocks, ...items}.toList()));

  /// Guarda una lección terminada. Si era nueva y hay otra después, deja pendiente el salto de Salsa.
  void completeLesson(Course c, Lesson l, int acc) {
    final key = c.keyOf(l);
    final prev = state.done[key];
    final i = c.lessons.indexOf(l);
    final today = dayKey(DateTime.now());
    _set(state.copyWith(
      done: {...state.done, key: LessonResult(acc: prev == null ? acc : (acc > prev.acc ? acc : prev.acc), at: DateTime.now().millisecondsSinceEpoch)},
      days: state.days.contains(today) ? state.days : [...state.days, today],
      hop: prev == null && i + 1 < c.lessons.length ? Hop(course: c.id, from: i, to: i + 1) : null,
    ));
  }
}
