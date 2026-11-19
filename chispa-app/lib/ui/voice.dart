import 'dart:math' as math;

import 'package:flutter/foundation.dart';
import 'package:flutter_tts/flutter_tts.dart';

/// La voz de Salsa: frases cortas con la voz del iPhone, un poco más aguda para que suene a ella.
/// Respeta el interruptor de silencio y no corta tu música.
enum SalsaLine { correct, combo, wrong, lessonDone, streak, mission, hire, hello }

class SalsaVoice {
  SalsaVoice._();
  static final instance = SalsaVoice._();

  final _tts = FlutterTts();
  final _rnd = math.Random();
  bool enabled = true;
  bool _ready = false;
  String _lang = '';

  static const _lines = <String, Map<SalsaLine, List<String>>>{
    'es': {
      SalsaLine.correct: ['¡Guau, eso es!', '¡Bien hecho!', '¡Así se hace!', '¡Exacto!'],
      SalsaLine.combo: ['¡Combo! Vas que vuelas', '¡Estás en racha!', '¡Imparable!'],
      SalsaLine.wrong: ['Casi. Inténtalo otra vez', 'Uy, no exactamente', 'Tranqui, vuelve a intentar'],
      SalsaLine.lessonDone: ['¡Lección completada! Estoy orgullosa de ti', '¡Lo lograste!', '¡Una más para el camino!'],
      SalsaLine.streak: ['¡Tu racha sigue viva!', '¡Otro día más!'],
      SalsaLine.mission: ['¡Misión cumplida!', '¡Repaso del día listo!'],
      SalsaLine.hire: ['¡Te contratan! Guau', '¡Pasaste la entrevista!'],
      SalsaLine.hello: ['¡Hola! ¿Qué aprendemos hoy?', '¡Guau! Qué gusto verte'],
    },
    'en': {
      SalsaLine.correct: ['Woof, that’s it!', 'Nice one!', 'That’s how it’s done!', 'Exactly!'],
      SalsaLine.combo: ['Combo! You’re on fire', 'You’re on a roll!', 'Unstoppable!'],
      SalsaLine.wrong: ['Close. Try again', 'Oops, not quite', 'No worries, give it another go'],
      SalsaLine.lessonDone: ['Lesson complete! I’m proud of you', 'You did it!', 'One more down!'],
      SalsaLine.streak: ['Your streak is alive!', 'Another day in a row!'],
      SalsaLine.mission: ['Mission complete!', 'Daily review done!'],
      SalsaLine.hire: ['You’re hired! Woof', 'You passed the interview!'],
      SalsaLine.hello: ['Hi! What are we learning today?', 'Woof! Great to see you'],
    },
  };

  Future<void> init() async {
    try {
      await _tts.setIosAudioCategory(IosTextToSpeechAudioCategory.ambient, [IosTextToSpeechAudioCategoryOptions.mixWithOthers]);
      await _tts.setPitch(1.35);
      await _tts.setSpeechRate(0.52);
      _ready = true;
    } catch (e) {
      debugPrint('Sin voz: $e');
    }
  }

  Future<void> say(SalsaLine line, String lang) {
    final options = _lines[lang]?[line] ?? _lines['es']![line]!;
    return speak(options[_rnd.nextInt(options.length)], lang);
  }

  /// Lee cualquier texto con la voz de Salsa (por ejemplo, la pista que le dio Claude).
  Future<void> speak(String text, String lang) async {
    if (!enabled || !_ready) return;
    try {
      if (lang != _lang) {
        await _tts.setLanguage(lang == 'es' ? 'es-MX' : 'en-US');
        _lang = lang;
      }
      await _tts.stop();
      // Sin los `backticks` del código, que la voz leería en voz alta.
      await _tts.speak(text.replaceAll('`', ''));
    } catch (e) {
      debugPrint('voz: $e');
    }
  }
}

final voice = SalsaVoice.instance;
