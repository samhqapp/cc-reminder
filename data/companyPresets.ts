export type CompanyPreset = {
	key: string;
	name: string;
	accent: string;
	surface: string;
};

export const companyPresets: CompanyPreset[] = [
	{ key: "netflix", name: "Netflix", accent: "#aa2d00", surface: "#fff0eb" },
	{ key: "spotify", name: "Spotify", accent: "#0a2e0e", surface: "#eef8ee" },
	{ key: "youtube", name: "YouTube", accent: "#aa2d00", surface: "#fff0eb" },
	{ key: "prime-video", name: "Prime Video", accent: "#181d26", surface: "#f8fafc" },
	{ key: "disney-plus", name: "Disney+", accent: "#254fad", surface: "#eef2ff" },
	{ key: "notion", name: "Notion", accent: "#181d26", surface: "#f8fafc" },
	{ key: "figma", name: "Figma", accent: "#0a2e0e", surface: "#eef8ee" },
	{ key: "adobe", name: "Adobe", accent: "#aa2d00", surface: "#fff0eb" },
	{ key: "apple", name: "Apple", accent: "#41454d", surface: "#f8fafc" },
	{ key: "openai", name: "OpenAI", accent: "#181d26", surface: "#f8fafc" },
	{ key: "slack", name: "Slack", accent: "#0a2e0e", surface: "#eef8ee" },
	{ key: "canva", name: "Canva", accent: "#254fad", surface: "#eef2ff" },
];

function normalize(value: string) {
	return value.trim().toLowerCase();
}

export function findCompanyPreset(company?: string, companyKey?: string) {
	if (companyKey) {
		const byKey = companyPresets.find((item) => item.key === companyKey);
		if (byKey) {
			return byKey;
		}
	}

	if (!company) {
		return undefined;
	}

	const normalized = normalize(company);
	return companyPresets.find(
		(item) => normalize(item.name) === normalized || item.key === normalized,
	);
}

export function searchCompanyPresets(query: string) {
	const normalized = normalize(query);
	if (!normalized) {
		return companyPresets.slice(0, 6);
	}

	return companyPresets.filter((item) =>
		normalize(item.name).includes(normalized),
	).slice(0, 6);
}
