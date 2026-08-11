export const colors = {
  primary: '#004ac6',
  primaryContainer: '#2563eb',
  onPrimary: '#ffffff',
  onPrimaryContainer: '#eeefff',
  primaryFixed: '#dbe1ff',
  primaryFixedDim: '#b4c5ff',
  secondary: '#0058be',
  secondaryContainer: '#2170e4',
  onSecondary: '#ffffff',
  onSecondaryContainer: '#fefcff',
  tertiary: '#006229',
  tertiaryContainer: '#007e37',
  onTertiary: '#ffffff',
  onTertiaryContainer: '#c1ffc5',
  tertiaryFixed: '#6bff8f',
  tertiaryFixedDim: '#4ae176',
  background: '#f8f9ff',
  onBackground: '#0b1c30',
  surface: '#f8f9ff',
  onSurface: '#0b1c30',
  surfaceBright: '#f8f9ff',
  surfaceDim: '#cbdbf5',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#eff4ff',
  surfaceContainer: '#e5eeff',
  surfaceContainerHigh: '#dce9ff',
  surfaceContainerHighest: '#d3e4fe',
  surfaceVariant: '#d3e4fe',
  onSurfaceVariant: '#434655',
  outline: '#737686',
  outlineVariant: '#c3c6d7',
  error: '#ba1a1a',
  onError: '#ffffff',
  errorContainer: '#ffdad6',
  onErrorContainer: '#93000a',
  inverseSurface: '#213145',
  inverseOnSurface: '#eaf1ff',
  inversePrimary: '#b4c5ff',
  surfaceTint: '#0053db',
  white: '#ffffff',
  black: '#0b1c30',
  overlay: 'rgba(15, 23, 42, 0.42)',
  star: '#F59E0B',
};

export const shadow = {
  level1: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  level2: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  level3: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 32,
    elevation: 6,
  },
  primary: {
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 3,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
};

export const radius = {
  sm: 8, // rounded-lg (8px)
  md: 12, // rounded-xl (12px)
  lg: 16, // rounded-2xl / button chính (16px)
  xl: 20, // card chính (20px)
  '2xl': 24, // modal (24px)
  '3xl': 28, // modal lớn (28px)
  full: 9999,
};

export const typography = {
  displayLg: {
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.64,
    fontWeight: '600',
  },
  displayLgMobile: {
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: -0.28,
    fontWeight: '600',
  },
  headlineMd: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600',
  },
  headlineMdMobile: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600',
  },
  headlineSm: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
  },
  headlineSmMobile: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
  },
  bodyLg: {
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '400',
  },
  bodyMd: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  bodySm: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  labelMd: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  button: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
  },
} as const;
