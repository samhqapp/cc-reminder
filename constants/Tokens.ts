export const spacing = {
	xxs: 4,
	xs: 8,
	sm: 12,
	md: 16,
	lg: 24,
	xl: 32,
	xxl: 48,
} as const;

export const radius = {
	xs: 2,
	sm: 6,
	md: 10,
	lg: 12,
	xl: 16,
	pill: 9999,
} as const;

export const hairline = 1 as const;

export const motion = {
	fast: 120,
	normal: 200,
	slow: 300,
} as const;

export const type = {
	displayLg: {
		fontSize: 32,
		lineHeight: 38,
		fontWeight: "500" as const,
		letterSpacing: 0,
	},
	displayMd: {
		fontSize: 26,
		lineHeight: 32,
		fontWeight: "400" as const,
		letterSpacing: 0,
	},
	titleLg: {
		fontSize: 22,
		lineHeight: 30,
		fontWeight: "400" as const,
		letterSpacing: 0.12,
	},
	titleMd: {
		fontSize: 18,
		lineHeight: 26,
		fontWeight: "500" as const,
		letterSpacing: 0,
	},
	titleSm: {
		fontSize: 16,
		lineHeight: 22,
		fontWeight: "500" as const,
		letterSpacing: 0,
	},
	labelMd: {
		fontSize: 15,
		lineHeight: 21,
		fontWeight: "500" as const,
		letterSpacing: 0,
	},
	button: {
		fontSize: 15,
		lineHeight: 21,
		fontWeight: "500" as const,
		letterSpacing: 0.2,
	},
	body: {
		fontSize: 14,
		lineHeight: 20,
		fontWeight: "400" as const,
		letterSpacing: 0,
	},
	caption: {
		fontSize: 13,
		lineHeight: 18,
		fontWeight: "500" as const,
		letterSpacing: 0.16,
	},
	legal: {
		fontSize: 12,
		lineHeight: 16,
		fontWeight: "400" as const,
		letterSpacing: 0,
	},
} as const;
