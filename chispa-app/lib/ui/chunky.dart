import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'sfx.dart';
import 'theme.dart';

enum ChunkyKind { primary, ghost }

/// Botón con relieve: se "hunde" al tocarlo y vibra un poquito.
class ChunkyButton extends StatefulWidget {
  const ChunkyButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.kind = ChunkyKind.primary,
    this.expand = true,
    this.color,
    this.textColor,
    this.shadowColor,
  });

  final String label;
  final VoidCallback? onPressed;
  final ChunkyKind kind;
  final bool expand;
  final Color? color, textColor, shadowColor;

  @override
  State<ChunkyButton> createState() => _ChunkyButtonState();
}

class _ChunkyButtonState extends State<ChunkyButton> {
  bool _down = false;

  @override
  Widget build(BuildContext context) {
    final p = context.pal;
    final enabled = widget.onPressed != null;
    final primary = widget.kind == ChunkyKind.primary;
    final bg = !enabled ? p.line : widget.color ?? (primary ? p.accent : p.surface);
    final fg = !enabled ? p.faint : widget.textColor ?? (primary ? p.accentInk : p.ink);
    final shadow = !enabled ? p.line : widget.shadowColor ?? (primary ? p.accentDeep : p.line);
    const depth = 4.0;
    return Semantics(
      button: true,
      enabled: enabled,
      label: widget.label,
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTapDown: enabled ? (_) => setState(() => _down = true) : null,
        onTapCancel: () => setState(() => _down = false),
        onTapUp: enabled
            ? (_) {
                setState(() => _down = false);
                HapticFeedback.lightImpact();
                sfx.play(Sfx.tap, volume: 0.45);
                widget.onPressed!();
              }
            : null,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 70),
          width: widget.expand ? double.infinity : null,
          margin: EdgeInsets.only(top: _down ? depth : 0, bottom: _down ? 0 : depth),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          decoration: BoxDecoration(
            color: bg,
            borderRadius: BorderRadius.circular(14),
            border: primary ? null : Border.all(color: p.line, width: 2),
            boxShadow: [if (!_down) BoxShadow(color: shadow, offset: const Offset(0, depth))],
          ),
          child: Text(
            widget.label,
            textAlign: TextAlign.center,
            style: TextStyle(color: fg, fontWeight: FontWeight.w800, fontSize: 17),
          ),
        ),
      ),
    );
  }
}

/// Un recuadro tocable con borde, para opciones y fichas. [state]: null | 'sel' | 'good' | 'bad'.
class Tile extends StatelessWidget {
  const Tile({super.key, required this.child, this.onTap, this.state, this.padding = const EdgeInsets.all(14), this.radius = 12});
  final Widget child;
  final VoidCallback? onTap;
  final String? state;
  final EdgeInsets padding;
  final double radius;

  @override
  Widget build(BuildContext context) {
    final p = context.pal;
    final (border, fill) = switch (state) {
      'sel' => (p.sel, p.selSoft),
      'good' => (p.good, p.goodSoft),
      'bad' => (p.bad, p.badSoft),
      _ => (p.line, p.surface),
    };
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: onTap == null
          ? null
          : () {
              HapticFeedback.selectionClick();
              sfx.play(Sfx.tap);
              onTap!();
            },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 120),
        padding: padding,
        decoration: BoxDecoration(
          color: fill,
          borderRadius: BorderRadius.circular(radius),
          border: Border.all(color: border, width: 2),
          boxShadow: [BoxShadow(color: border, offset: const Offset(0, 3))],
        ),
        child: child,
      ),
    );
  }
}
