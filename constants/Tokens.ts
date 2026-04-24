export const spacing = {
	xs: 8,
	sm: 12,
	md: 16,
	lg: 20,
	xl: 24,
	xxl: 32,
} as const;

export const radius = {
	sm: 18,
	md: 24,
	lg: 32,
	xl: 40,
} as const;

export const thickness = {
	border: 2,
	border3D: 6,
	border3DSmall: 4,
} as const;

export const motion = {
	fast: 140,
	normal: 220,
	slow: 320,
} as const;

export const shadow = {
	soft: {
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.1,
		shadowRadius: 10,
		elevation: 4,
	},
	medium: {
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.15,
		shadowRadius: 16,
		elevation: 8,
	},
} as const;
