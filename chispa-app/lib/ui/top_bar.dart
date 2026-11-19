import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'sfx.dart';
import 'theme.dart';

/// Botoncito redondo de la barra de arriba (racha, idioma, sonido, tema).
class Pill extends StatelessWidget {
  const Pill({super.key, required this.child, this.onTap, this.active = false, this.label});
  final Widget child;
  final VoidCallback? onTap;
  final bool active;
  final String? label;

  @override
  Widget build(BuildContext context) {
    final p = context.pal;
    return Semantics(
      button: onTap != null,
      label: label,
      child: GestureDetector(
        onTap: onTap == null
            ? null
            : () {
                HapticFeedback.selectionClick();
                sfx.play(Sfx.tap);
                onTap!();
              },
        child: Container(
          height: 38,
          constraints: const BoxConstraints(minWidth: 40),
          padding: const EdgeInsets.symmetric(horizontal: 11),
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: p.surface,
            borderRadius: BorderRadius.circular(99),
            border: Border.all(color: active ? p.accent : p.line, width: 1.5),
          ),
          child: DefaultTextStyle.merge(style: const TextStyle(fontSize: 15), child: child),
        ),
      ),
    );
  }
}
