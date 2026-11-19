import 'package:flutter/material.dart';

/// Los colores de Chispa: papel crema con tinta y una chispa de coral (y su versión oscura).
@immutable
class Palette extends ThemeExtension<Palette> {
  const Palette({
    required this.bg,
    required this.surface,
    required this.ink,
    required this.muted,
    required this.faint,
    required this.line,
    required this.accent,
    required this.accentInk,
    required this.accentSoft,
    required this.accentDeep,
    required this.sel,
    required this.selSoft,
    required this.good,
    required this.goodSoft,
    required this.bad,
    required this.badSoft,
    required this.code,
    required this.codeInk,
    required this.kw,
    required this.str,
    required this.num,
    required this.comment,
    required this.bannerA,
    required this.bannerB,
    required this.bannerShadow,
  });

  final Color bg, surface, ink, muted, faint, line;
  final Color accent, accentInk, accentSoft, accentDeep;
  final Color sel, selSoft, good, goodSoft, bad, badSoft;
  final Color code, codeInk, kw, str, num, comment;
  final Color bannerA, bannerB, bannerShadow;

  static const light = Palette(
    bg: Color(0xFFF6F1E7),
    surface: Color(0xFFFFFDF8),
    ink: Color(0xFF1D1B2E),
    muted: Color(0xFF5D596F),
    faint: Color(0xFF8C879C),
    line: Color(0xFFE2D9C6),
    accent: Color(0xFFC8431B),
    accentInk: Colors.white,
    accentSoft: Color(0xFFF7DFD3),
    accentDeep: Color(0xFF8A2C10),
    sel: Color(0xFF3451C7),
    selSoft: Color(0xFFE3E8FB),
    good: Color(0xFF1C7A50),
    goodSoft: Color(0xFFDEF2E6),
    bad: Color(0xFFB8322A),
    badSoft: Color(0xFFFBE4E1),
    code: Color(0xFFEFE8D8),
    codeInk: Color(0xFF2A2740),
    kw: Color(0xFFA6338A),
    str: Color(0xFF2F7A3A),
    num: Color(0xFFB34D12),
    comment: Color(0xFF8C879C),
    bannerA: Color(0xFFC8431B),
    bannerB: Color(0xFFA13A63),
    bannerShadow: Color(0xFF7E2A49),
  );

  static const dark = Palette(
    bg: Color(0xFF14131C),
    surface: Color(0xFF1D1C28),
    ink: Color(0xFFF1EEE6),
    muted: Color(0xFFABA7BA),
    faint: Color(0xFF7D7990),
    line: Color(0xFF312F40),
    accent: Color(0xFFFF8A5C),
    accentInk: Color(0xFF1F0E05),
    accentSoft: Color(0xFF3B2219),
    accentDeep: Color(0xFFB0532F),
    sel: Color(0xFF8EA2FF),
    selSoft: Color(0xFF262C4D),
    good: Color(0xFF57CF95),
    goodSoft: Color(0xFF15302A),
    bad: Color(0xFFFF8478),
    badSoft: Color(0xFF3A1D1C),
    code: Color(0xFF24232F),
    codeInk: Color(0xFFE9E6F2),
    kw: Color(0xFFE48AD0),
    str: Color(0xFF8FD18F),
    num: Color(0xFFF4A76B),
    comment: Color(0xFF7D7990),
    bannerA: Color(0xFFB8471F),
    bannerB: Color(0xFF8A3157),
    bannerShadow: Color(0xFF521A33),
  );

  @override
  Palette copyWith() => this;

  @override
  Palette lerp(ThemeExtension<Palette>? other, double t) => (other is Palette && t > 0.5) ? other : this;
}

extension PaletteX on BuildContext {
  Palette get pal => Theme.of(this).extension<Palette>()!;
}

const monoFamily = 'Menlo';
const monoFallback = ['Courier', 'monospace'];

TextStyle monoStyle({double size = 14, Color? color, FontWeight weight = FontWeight.w500}) => TextStyle(
      fontFamily: monoFamily,
      fontFamilyFallback: monoFallback,
      fontSize: size,
      color: color,
      fontWeight: weight,
      height: 1.5,
    );

ThemeData buildTheme(Palette p, Brightness b) {
  final scheme = ColorScheme.fromSeed(seedColor: p.accent, brightness: b).copyWith(
    primary: p.accent,
    onPrimary: p.accentInk,
    surface: p.surface,
    onSurface: p.ink,
  );
  return ThemeData(
    useMaterial3: true,
    brightness: b,
    colorScheme: scheme,
    scaffoldBackgroundColor: p.bg,
    extensions: [p],
    splashFactory: NoSplash.splashFactory,
    textTheme: Typography.material2021(platform: TargetPlatform.iOS).black.apply(bodyColor: p.ink, displayColor: p.ink),
    sliderTheme: SliderThemeData(activeTrackColor: p.accent, thumbColor: p.accent, inactiveTrackColor: p.line, trackHeight: 6),
    textSelectionTheme: TextSelectionThemeData(cursorColor: p.accent, selectionColor: p.sel.withValues(alpha: 0.3), selectionHandleColor: p.accent),
  );
}

/// Los colores del banner de un curso: los suyos si los trae, o los de la app.
(Color, Color, Color) courseColors(List<int> colors, Palette p) =>
    colors.length >= 3 ? (Color(colors[0]), Color(colors[1]), Color(colors[2])) : (p.bannerA, p.bannerB, p.bannerShadow);
