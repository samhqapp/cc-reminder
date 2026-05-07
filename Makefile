.PHONY: help dev ios android web test typecheck ci clean deps android-check android-aab eas-android-build play-metadata play-internal

EXTERNAL_CACHE_ROOT ?= /Volumes/External1TB/Data/Library
ANDROID_HOME ?= $(EXTERNAL_CACHE_ROOT)/Android/sdk
ANDROID_SDK_ROOT ?= $(ANDROID_HOME)
GRADLE_USER_HOME ?= $(EXTERNAL_CACHE_ROOT)/Gradle
EXPO_HOME ?= $(EXTERNAL_CACHE_ROOT)/Expo
EAS_LOCAL_BUILD_WORKINGDIR ?= $(EXTERNAL_CACHE_ROOT)/EAS/cc-reminder-local-build
NPM_CONFIG_CACHE ?= $(EXTERNAL_CACHE_ROOT)/npm-cache
BUNDLE_PATH ?= $(EXTERNAL_CACHE_ROOT)/Ruby/bundle/cc-reminder
EAS_ANDROID_AAB ?= .release/cc-reminder-android.aab
LOCAL_ANDROID_AAB ?= .release/cc-reminder-android-1.0.2-3.aab

export ANDROID_HOME
export ANDROID_SDK_ROOT
export GRADLE_USER_HOME
export EXPO_HOME
export EAS_LOCAL_BUILD_WORKINGDIR
export NPM_CONFIG_CACHE
export BUNDLE_PATH

# ─── MAIN COMMANDS ────────────────────────────────────────────────────────────

help: ## Show available commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'

dev: ## Start Expo dev server
	npx expo start

ios: ## Start on iOS simulator
	npx expo start --ios

android: ## Start on Android emulator
	npx expo start --android

web: ## Start web dev server
	npx expo start --web

# ─── QUALITY ──────────────────────────────────────────────────────────────────

test: ## Run test suite
	npx jest --runInBand

typecheck: ## TypeScript type check
	npx tsc --noEmit

ci: typecheck test ## Run full CI checks (typecheck + test)

android-check: ## Verify Android release readiness
	@mkdir -p "$(ANDROID_HOME)" "$(GRADLE_USER_HOME)" "$(EXPO_HOME)" "$(EAS_LOCAL_BUILD_WORKINGDIR)" "$(NPM_CONFIG_CACHE)"
	npm run typecheck
	npm test
	node scripts/android-release-check.cjs

android-aab: android-check ## Build AAB from generated Android project with local release signing
	@test -f android/gradlew || (echo "Generated android/ project is missing. Run npx expo prebuild --platform android first."; exit 2)
	@test -f android/key.properties || (echo "Missing ignored android/key.properties signing file."; exit 2)
	cd android && ./gradlew bundleRelease
	@mkdir -p .release
	cp android/app/build/outputs/bundle/release/app-release.aab "$(LOCAL_ANDROID_AAB)"

eas-android-build: android-check ## Build local EAS Android AAB after explicit confirmation
	@test "$$CONFIRM_EAS_BUILD" = "yes" || (echo "Set CONFIRM_EAS_BUILD=yes to create the local EAS Android build."; exit 2)
	npx eas-cli@latest build --platform android --profile play-internal --local --non-interactive --output "$(EAS_ANDROID_AAB)"

play-metadata: ## Verify Play metadata and staging folders
	node scripts/android-release-check.cjs

play-internal: android-check ## Submit latest Android build to Play internal testing after explicit confirmation
	@test "$$CONFIRM_PLAY_UPLOAD" = "yes" || (echo "Set CONFIRM_PLAY_UPLOAD=yes only after Play Console confirmation."; exit 2)
	@test -f "$(EAS_ANDROID_AAB)" || (echo "Missing $(EAS_ANDROID_AAB). Run CONFIRM_EAS_BUILD=yes make eas-android-build first."; exit 2)
	npx eas-cli@latest submit --platform android --profile play-internal --path "$(EAS_ANDROID_AAB)" --non-interactive --wait

# ─── UTILITIES ────────────────────────────────────────────────────────────────

deps: ## Install dependencies
	npm install

clean: ## Clear caches and build artifacts
	rm -rf node_modules/.cache .expo dist
	npx expo start --clear --non-interactive &>/dev/null & sleep 2 && kill $$! 2>/dev/null || true
