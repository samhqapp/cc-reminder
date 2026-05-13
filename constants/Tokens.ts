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
	xxl: 20,
	rail: 24,
	pill: 9999,
} as const;

export const hairline = 1 as const;

export const motion = {
	fast: 120,
	pressOut: 220,
	tab: 220,
	normal: 260,
	card: 460,
	screen: 500,
	slow: 520,
} as const;

export const stylepass = {
	ink: "#151821",
	body: "#414052",
	muted: "rgba(21, 24, 33, 0.58)",
	line: "rgba(21, 24, 33, 0.13)",
	lineStrong: "rgba(21, 24, 33, 0.23)",
	paper: "#f8f0df",
	cream: "#fff7e9",
	lavender: "#d2bef0",
	peach: "#f3b9a7",
	sage: "#c7d8a4",
	ochre: "#d2bf78",
	mint: "#b8d8c9",
	blue: "#9dbad9",
	coral: "#e4765d",
	forest: "#375d48",
	plum: "#5c4c73",
	mustard: "#8a7742",
	rust: "#8c4b35",
	panel: "rgba(255, 247, 233, 0.68)",
	panelSoft: "rgba(255, 255, 255, 0.42)",
	panelStrong: "rgba(255, 247, 233, 0.82)",
	rail: "rgba(255, 247, 233, 0.9)",
	railBorder: "rgba(255, 255, 255, 0.7)",
	railIcon: "rgba(21, 24, 33, 0.62)",
	railSelected: "rgba(21, 24, 33, 0.84)",
	overlay: "rgba(21, 24, 33, 0.44)",
	overlayStrong: "rgba(21, 24, 33, 0.68)",
} as const;

export const screenWorld = {
	billing: {
		background: stylepass.lavender,
		accent: stylepass.plum,
		accentSoft: "rgba(92, 76, 115, 0.15)",
		shadow: "rgba(27, 24, 37, 0.14)",
	},
	reminders: {
		background: stylepass.peach,
		accent: stylepass.forest,
		accentSoft: "rgba(55, 93, 72, 0.15)",
		shadow: "rgba(78, 42, 30, 0.13)",
	},
	notes: {
		background: stylepass.ochre,
		accent: stylepass.ink,
		accentSoft: "rgba(21, 24, 33, 0.11)",
		shadow: "rgba(68, 56, 22, 0.13)",
	},
	settings: {
		background: stylepass.sage,
		accent: stylepass.ink,
		accentSoft: "rgba(21, 24, 33, 0.1)",
		shadow: "rgba(41, 49, 31, 0.13)",
	},
	paper: {
		background: stylepass.paper,
		accent: stylepass.plum,
		accentSoft: "rgba(92, 76, 115, 0.12)",
		shadow: "rgba(42, 33, 22, 0.12)",
	},
} as const;

export type ScreenWorldName = keyof typeof screenWorld;

export const shadow = {
	soft: {
		boxShadow: "0 10px 24px rgba(21, 24, 33, 0.08)",
	},
	panel: {
		boxShadow: "0 16px 34px rgba(21, 24, 33, 0.11)",
	},
	floating: {
		boxShadow: "0 16px 30px rgba(21, 24, 33, 0.18)",
	},
} as const;

export const font = {
	regular: "Jost_400Regular",
	medium: "Jost_500Medium",
	semibold: "Jost_600SemiBold",
	bold: "Jost_700Bold",
	extrabold: "Jost_800ExtraBold",
} as const;

export const type = {
	displayLg: {
		fontFamily: font.bold,
		fontSize: 42,
		lineHeight: 50,
		letterSpacing: 0,
	},
	displayMd: {
		fontFamily: font.bold,
		fontSize: 30,
		lineHeight: 38,
		letterSpacing: 0,
	},
	titleLg: {
		fontFamily: font.bold,
		fontSize: 24,
		lineHeight: 31,
		letterSpacing: 0,
	},
	titleMd: {
		fontFamily: font.bold,
		fontSize: 18,
		lineHeight: 24,
		letterSpacing: 0,
	},
	titleSm: {
		fontFamily: font.bold,
		fontSize: 16,
		lineHeight: 22,
		letterSpacing: 0,
	},
	labelMd: {
		fontFamily: font.semibold,
		fontSize: 15,
		lineHeight: 21,
		letterSpacing: 0,
	},
	button: {
		fontFamily: font.bold,
		fontSize: 15,
		lineHeight: 21,
		letterSpacing: 0,
	},
	body: {
		fontFamily: font.medium,
		fontSize: 15,
		lineHeight: 20,
		letterSpacing: 0,
	},
	caption: {
		fontFamily: font.bold,
		fontSize: 13,
		lineHeight: 18,
		letterSpacing: 0,
	},
	legal: {
		fontFamily: font.semibold,
		fontSize: 12,
		lineHeight: 16,
		letterSpacing: 0,
	},
} as const;
