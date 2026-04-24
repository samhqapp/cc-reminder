export type CompanyPreset = {
	key: string;
	name: string;
	accent: string;
	surface: string;
};

export const companyPresets: CompanyPreset[] = [
	{ key: "netflix", name: "Netflix", accent: "#4C8DFF", surface: "#EAF2FF" },
	{ key: "spotify", name: "Spotify", accent: "#5F92FF", surface: "#ECF4FF" },
	{ key: "youtube", name: "YouTube", accent: "#3C78F2", surface: "#E8F1FF" },
	{ key: "prime-video", name: "Prime Video", accent: "#6A97FF", surface: "#EDF3FF" },
	{ key: "disney-plus", name: "Disney+", accent: "#5B7FEA", surface: "#E8EEFF" },
	{ key: "notion", name: "Notion", accent: "#6F86B8", surface: "#EEF2F8" },
	{ key: "figma", name: "Figma", accent: "#7AA0FF", surface: "#EEF4FF" },
	{ key: "adobe", name: "Adobe", accent: "#5A88E8", surface: "#EAF1FF" },
	{ key: "apple", name: "Apple", accent: "#7F97C8", surface: "#F1F5FB" },
	{ key: "openai", name: "OpenAI", accent: "#4E82E6", surface: "#E8F0FF" },
	{ key: "slack", name: "Slack", accent: "#6D8AD3", surface: "#EEF3FF" },
	{ key: "canva", name: "Canva", accent: "#5A8FFF", surface: "#EBF3FF" },
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
