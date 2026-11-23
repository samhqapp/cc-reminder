const appConfig = require("../app.json");

describe("Expo app config", () => {
	it("uses resize behavior when the software keyboard opens", () => {
		expect(appConfig.expo.android.softwareKeyboardLayoutMode).toBe("resize");
	});
});
