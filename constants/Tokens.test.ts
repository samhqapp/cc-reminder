import { type as typeTokens } from "./Tokens";

describe("type tokens", () => {
	it("reserves descender space for display and title text", () => {
		const clippedTokens = [
			typeTokens.displayLg,
			typeTokens.displayMd,
			typeTokens.titleLg,
			typeTokens.titleMd,
			typeTokens.titleSm,
		].filter((token) => token.lineHeight < token.fontSize + 4);

		expect(clippedTokens).toEqual([]);
	});
});
