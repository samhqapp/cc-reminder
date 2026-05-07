.PHONY: help dev ios android web test typecheck ci clean deps

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

# ─── UTILITIES ────────────────────────────────────────────────────────────────

deps: ## Install dependencies
	npm install

clean: ## Clear caches and build artifacts
	rm -rf node_modules/.cache .expo dist
	npx expo start --clear --non-interactive &>/dev/null & sleep 2 && kill $$! 2>/dev/null || true
