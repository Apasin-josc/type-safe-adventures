import 'dart:math' as math;

import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/foundation.dart';

/// Los sonidos de la app (assets/sfx, hechos con tool/make_sfx.js).
/// Respetan el interruptor de silencio del iPhone y no cortan tu música.
enum Sfx { tap, wrong, hop, land, complete, streak, unlock }

class SoundBoard {
  SoundBoard._();
  static final instance = SoundBoard._();

  final Map<String, AudioPool> _pools = {};
  bool enabled = true;
  bool _ready = false;

  /// Se llama una vez en main(). En pruebas no se llama, y entonces todo es silencio.
  Future<void> init() async {
    try {
      await AudioPlayer.global.setAudioContext(
        AudioContextConfig(respectSilence: true, focus: AudioContextConfigFocus.mixWithOthers).build(),
      );
      final names = [for (final s in Sfx.values) s.name, for (var i = 1; i <= 6; i++) 'correct_$i'];
      for (final n in names) {
        _pools[n] = await AudioPool.createFromAsset(
          path: 'sfx/$n.wav',
          maxPlayers: n == 'tap' ? 4 : 2,
          playerMode: PlayerMode.lowLatency,
        );
      }
      _ready = true;
    } catch (e) {
      debugPrint('Sin sonidos: $e');
    }
  }

  void _play(String name, {double volume = 1}) {
    if (!enabled || !_ready) return;
    _pools[name]?.start(volume: volume).catchError((Object e) {
      debugPrint('sonido $name: $e');
      return () async {};
    });
  }

  void play(Sfx s, {double volume = 1}) => _play(s.name, volume: volume);

  /// Acierto: cada acierto seguido suena un tono más arriba (hasta 6).
  void correct(int combo) => _play('correct_${math.max(1, math.min(6, combo))}');
}

final sfx = SoundBoard.instance;
