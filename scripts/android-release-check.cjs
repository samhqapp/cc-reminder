const fs = require("fs");
const path = require("path");

const EXPECTED_VERSION = "1.0.1";
const EXPECTED_PACKAGE = "com.surajmandal.ccreminder";
const EXPECTED_VERSION_CODE = 2;

const requiredFiles = [
	"docs/android-play-release.md",
	"docs/play-store-data-safety.md",
	"docs/play-store-listing.md",
	"docs/privacy-policy.md",
	"docs/release/android-key.properties.example",
	"docs/release/eas-credentials.example.json",
	"fastlane/metadata/android/en-US/full_description.txt",
	"fastlane/metadata/android/en-US/short_description.txt",
	"fastlane/metadata/android/en-US/title.txt",
	"fastlane/metadata/android/en-US/changelogs/2.txt",
	"store-assets/android/en-US/feature-graphic/.gitkeep",
	"store-assets/android/en-US/phone-screenshots/.gitkeep",
	"store-assets/android/en-US/tablet-screenshots/.gitkeep",
];

const requiredIgnorePatterns = [
	".release/",
	"credentials.json",
	"google-service-account*.json",
	"play-service-account*.json",
	"android/key.properties",
	"android/key.properties.local",
	"*.jks",
	"*.keystore",
];

function readJson(repoRoot, relativePath) {
	const fullPath = path.join(repoRoot, relativePath);
	return JSON.parse(fs.readFileSync(fullPath, "utf8"));
}

function readText(repoRoot, relativePath) {
	const fullPath = path.join(repoRoot, relativePath);
	return fs.readFileSync(fullPath, "utf8");
}

function exists(repoRoot, relativePath) {
	return fs.existsSync(path.join(repoRoot, relativePath));
}

function loadReleaseState(repoRoot) {
	return {
		repoRoot,
		packageJson: readJson(repoRoot, "package.json"),
		appJson: readJson(repoRoot, "app.json"),
		easJson: readJson(repoRoot, "eas.json"),
		gitignore: readText(repoRoot, ".gitignore"),
		title: readText(repoRoot, "fastlane/metadata/android/en-US/title.txt").trim(),
		shortDescription: readText(
			repoRoot,
			"fastlane/metadata/android/en-US/short_description.txt",
		).trim(),
		fullDescription: readText(
			repoRoot,
			"fastlane/metadata/android/en-US/full_description.txt",
		).trim(),
		releaseNotes: readText(
			repoRoot,
			"fastlane/metadata/android/en-US/changelogs/2.txt",
		).trim(),
	};
}

function includesAll(value, snippets) {
	return snippets.every((snippet) => value.includes(snippet));
}

function validateReleaseState(state) {
	const issues = [];
	const expo = state.appJson.expo || {};
	const android = expo.android || {};
	const buildProfile = state.easJson.build?.["play-internal"] || {};
	const submitProfile = state.easJson.submit?.["play-internal"] || {};

	if (state.packageJson.version !== EXPECTED_VERSION) {
		issues.push(`package.json version must be ${EXPECTED_VERSION}.`);
	}

	if (expo.version !== EXPECTED_VERSION) {
		issues.push(`app.json Expo version must be ${EXPECTED_VERSION}.`);
	}

	if (expo.name !== "CC Reminder") {
		issues.push("Expo app name must be CC Reminder.");
	}

	if (expo.owner !== "surajmanalcell") {
		issues.push("Expo owner must be the personal account surajmanalcell.");
	}

	if (android.package !== EXPECTED_PACKAGE) {
		issues.push(`Android package must be ${EXPECTED_PACKAGE}.`);
	}

	if (android.versionCode !== EXPECTED_VERSION_CODE) {
		issues.push(`Android versionCode must be ${EXPECTED_VERSION_CODE}.`);
	}

	if (state.easJson.cli?.appVersionSource !== "local") {
		issues.push("EAS appVersionSource must stay local for tracked version review.");
	}

	if (buildProfile.android?.buildType !== "app-bundle") {
		issues.push("EAS play-internal build must produce an Android App Bundle.");
	}

	if (buildProfile.android?.credentialsSource !== "local") {
		issues.push("EAS play-internal build must use local credentials.");
	}

	if (submitProfile.android?.track !== "internal") {
		issues.push("EAS play-internal submit track must be internal.");
	}

	if (submitProfile.android?.releaseStatus !== "draft") {
		issues.push("EAS play-internal submit status must be draft.");
	}

	if (
		submitProfile.android?.serviceAccountKeyPath !==
		"./.release/google-play-service-account.json"
	) {
		issues.push("EAS service account key path must point at ignored .release storage.");
	}

	if (state.title !== "CC Reminder") {
		issues.push("Play title must be CC Reminder.");
	}

	if (
		state.shortDescription !==
		"Local-first credit card due-date reminders."
	) {
		issues.push("Play short description does not match the release copy.");
	}

	if (state.shortDescription.length > 80) {
		issues.push("Play short description must stay within 80 characters.");
	}

	if (
		!includesAll(state.fullDescription, [
			"card due dates",
			"last 4 digits only",
			"No full card numbers",
			"No account required",
			"No backend",
			"local notifications",
		])
	) {
		issues.push("Play full description is missing required privacy or feature claims.");
	}

	if (
		!includesAll(state.releaseNotes, [
			"Version 1.0.1",
			"internal testing",
			"Android App Bundle",
		])
	) {
		issues.push("Internal testing release notes are incomplete.");
	}

	for (const relativePath of requiredFiles) {
		if (!exists(state.repoRoot, relativePath)) {
			issues.push(`Missing required release file: ${relativePath}`);
		}
	}

	for (const pattern of requiredIgnorePatterns) {
		if (!state.gitignore.includes(pattern)) {
			issues.push(`.gitignore must include ${pattern}.`);
		}
	}

	return issues;
}

function printSummary(state) {
	const rows = [
		["Package", state.appJson.expo.android.package],
		["Version", state.appJson.expo.version],
		["Version code", String(state.appJson.expo.android.versionCode)],
		["EAS build profile", "play-internal"],
		["Submit track", state.easJson.submit["play-internal"].android.track],
		["Submit status", state.easJson.submit["play-internal"].android.releaseStatus],
	];

	console.log("| Check | Value |");
	console.log("|---|---|");
	for (const [check, value] of rows) {
		console.log(`| ${check} | ${value} |`);
	}
}

function main() {
	const repoRoot = path.resolve(__dirname, "..");
	const state = loadReleaseState(repoRoot);
	const issues = validateReleaseState(state);

	if (issues.length > 0) {
		console.error("Android release check failed:");
		for (const issue of issues) {
			console.error(`- ${issue}`);
		}
		process.exit(1);
	}

	printSummary(state);
}

if (require.main === module) {
	main();
}

module.exports = {
	loadReleaseState,
	validateReleaseState,
};
