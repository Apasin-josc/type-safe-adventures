import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/closet.dart';
import '../data/progress.dart';
import 'salsa.dart';
import 'salsa_face.dart';

/// Salsa de lado con lo que trae puesto del clóset (suéter, pelotita).
class DressedSalsa extends ConsumerWidget {
  const DressedSalsa({super.key, this.size = 90, this.mood = SalsaMood.idle, this.flip = false});
  final double size;
  final SalsaMood mood;
  final bool flip;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final p = ref.watch(progressProvider);
    return Salsa(size: size, mood: mood, flip: flip, sweater: wears(p, 'sweater'), ball: wears(p, 'ball'));
  }
}

/// El festejo de frente con los lentes que escogió en el clóset.
class DressedCelebration extends ConsumerWidget {
  const DressedCelebration({super.key, this.size = 190});
  final double size;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final p = ref.watch(progressProvider);
    final worn = [for (final id in p.equipped) if (wears(p, id)) id];
    return SalsaCelebration(size: size, lens: lensFor(worn));
  }
}
