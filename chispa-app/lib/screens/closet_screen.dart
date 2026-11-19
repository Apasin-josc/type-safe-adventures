import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../data/closet.dart';
import '../data/progress.dart';
import '../ui/dressed.dart';
import '../ui/i18n.dart';
import '../ui/salsa_face.dart';
import '../ui/sfx.dart';
import '../ui/theme.dart';

/// El clóset de Salsa: lo que has desbloqueado estudiando y lo que te falta.
class ClosetScreen extends ConsumerWidget {
  const ClosetScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final p = context.pal;
    final prog = ref.watch(progressProvider);
    final lang = prog.effectiveLang;
    final t = translator(lang);
    final n = ref.read(progressProvider.notifier);
    final worn = [for (final id in prog.equipped) if (wears(prog, id)) id];
    return Scaffold(
      body: SafeArea(
        child: Column(children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(4, 6, 16, 6),
            child: Row(children: [
              IconButton(onPressed: () => context.go('/'), icon: Icon(Icons.arrow_back_ios_new_rounded, color: p.ink, size: 22)),
              Expanded(child: Text('👕 ${t('closet')}', style: const TextStyle(fontSize: 19, fontWeight: FontWeight.w900))),
            ]),
          ),
          Expanded(
            child: ListView(padding: const EdgeInsets.fromLTRB(20, 4, 20, 30), children: [
              Row(mainAxisAlignment: MainAxisAlignment.center, crossAxisAlignment: CrossAxisAlignment.end, children: [
                const DressedSalsa(size: 170),
                SizedBox(
                  width: 120,
                  height: 134,
                  child: CustomPaint(painter: SalsaFacePainter(glasses: 1, ear: 0.4, lens: lensFor(worn) ?? const [Color(0xFF2B2E45), Color(0xFF0E0F18)])),
                ),
              ]),
              const SizedBox(height: 16),
              for (final item in closetItems) _row(context, p, item, prog, lang, t, n),
            ]),
          ),
        ]),
      ),
    );
  }

  Widget _row(BuildContext context, Palette p, ClosetItem item, Progress prog, String lang, Tr t, ProgressNotifier n) {
    final open = item.unlocked(prog);
    final on = prog.equipped.contains(item.id) && open;
    final (have, need) = item.progress(prog);
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.fromLTRB(14, 12, 10, 12),
      decoration: BoxDecoration(
        color: on ? p.goodSoft : p.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: on ? p.good : p.line, width: 2),
      ),
      child: Row(children: [
        Opacity(opacity: open ? 1 : 0.35, child: Text(item.icon, style: const TextStyle(fontSize: 30))),
        const SizedBox(width: 12),
        Expanded(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(item.title[lang] ?? item.title['es']!, style: TextStyle(fontSize: 16.5, fontWeight: FontWeight.w900, color: open ? p.ink : p.faint)),
            const SizedBox(height: 2),
            Text(open ? t('closet_unlocked') : '🔒 ${item.how[lang] ?? item.how['es']!}', style: TextStyle(fontSize: 13, color: p.muted)),
            if (!open) ...[
              const SizedBox(height: 6),
              ClipRRect(
                borderRadius: BorderRadius.circular(99),
                child: LinearProgressIndicator(
                  value: (have / need).clamp(0, 1),
                  minHeight: 6,
                  backgroundColor: p.code,
                  valueColor: AlwaysStoppedAnimation(p.accent),
                ),
              ),
              const SizedBox(height: 2),
              Text('${have.clamp(0, need)} / $need', style: TextStyle(fontSize: 12, color: p.faint, fontWeight: FontWeight.w700)),
            ],
          ]),
        ),
        if (open)
          Switch.adaptive(
            value: on,
            onChanged: (v) {
              HapticFeedback.selectionClick();
              sfx.play(v ? Sfx.unlock : Sfx.tap);
              n.equip(item.id, v);
            },
          ),
      ]),
    );
  }
}
