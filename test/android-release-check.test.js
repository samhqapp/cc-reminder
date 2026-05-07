const path = require("path");

const {
	loadReleaseState,
	validateReleaseState,
} = require("../scripts/android-release-check.cjs");

describe("Android release readiness", () => {
	it("keeps the Play internal testing configuration aligned", () => {
		const repoRoot = path.join(__dirname, "..");
		const state = loadReleaseState(repoRoot);

		expect(validateReleaseState(state)).toEqual([]);
	});
});
