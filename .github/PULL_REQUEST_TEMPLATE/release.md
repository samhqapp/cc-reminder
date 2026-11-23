Release vX.Y.Z of CC Reminder. Branch `release/vX.Y.Z`.
Major: breaking change. Minor: features. Patch: fixes only.

## In this PR

- [ ] `app.json` `expo.version` is X.Y.Z (build X*10000 + Y*100 + Z, from `app.config.js`)
- [ ] `fastlane/metadata/android/en-US/changelogs/<build>.txt` exists (1.0.4 is `10004.txt`; the next patch is `10005.txt`)
- [ ] `CHANGELOG.md` has the `X.Y.Z - <date>` entry

## After the merge

- [ ] Tag the merge commit `vX.Y.Z` and push the tag
- [ ] `node scripts/release-check.mjs` passes
- [ ] `node scripts/android-release-check.cjs` passes
- [ ] `eas build --platform all --profile production`, then `eas submit` for iOS and Android
- [ ] App Store and Play Console builds show X.Y.Z
- [ ] `samhq_backend/releases.json`: `cc-reminder` version and build per platform (if the app has an entry)
- [ ] Download links and version on the site
