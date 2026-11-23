# Android Play Release Prep

This repo uses the Expo managed release path for Android. The generated `android/` directory is ignored and must not be treated as the tracked source of release configuration. The release source of truth is `app.json`, `eas.json`, the ignored local credential files, and the Play metadata in `fastlane/metadata/android/en-US`.

## Release Identity

| Field | Value |
|---|---|
| App title | CC Reminder |
| Expo owner | `surajmanalcell` |
| Android package | `com.surajmandal.ccreminder` |
| App version | `1.0.4` |
| Android versionCode | `5` |
| Play track | Internal testing and Closed testing - Alpha |
| Release status | Preparing superseding test release |
| Latest Play release target | `1.0.4`, Android versionCode `5`, to supersede Internal testing `1.0.3` / `4` and Closed testing - Alpha `1.0.1` / `2` |
| Pricing | Paid. Base price set from USD 5.00; United States row shows USD 4.99 after Play tier rounding. |
| Category | Finance |
| Ads | No |
| Target audience | Adults and general audience. Not directed at children. |
| Branded app icon | Updated in `assets/images/icon.png`, `assets/images/adaptive-icon.png`, `assets/images/splash-icon.png`, and `assets/images/favicon.png` |
| Play listing icon | Added in `store-assets/android/en-US/icon.png` and `fastlane/metadata/android/en-US/images/icon.png` |
| Play feature graphic | Replaced with generated artwork in `store-assets/android/en-US/feature-graphic/cc-reminder-feature-graphic.png` and `fastlane/metadata/android/en-US/images/featureGraphic.png` |

## External Cache Paths

Use these paths to keep Android, Gradle, Expo, EAS, npm, and Ruby dependency caches off the internal drive where possible.

| Tool | Path |
|---|---|
| Android SDK | `/Volumes/External1TB/Data/Library/Android/sdk` |
| Gradle | `/Volumes/External1TB/Data/Library/Gradle` |
| Expo | `/Volumes/External1TB/Data/Library/Expo` |
| EAS local build | `/Volumes/External1TB/Data/Library/EAS/cc-reminder-local-build` |
| npm | `/Volumes/External1TB/Data/Library/npm-cache` |
| Ruby bundle | `/Volumes/External1TB/Data/Library/Ruby/bundle/cc-reminder` |

The Makefile exports these paths automatically.

## Commands

| Command | Purpose |
|---|---|
| `npm install` | Install dependencies. The Makefile uses `NPM_CONFIG_CACHE` for the external npm cache. |
| `make android-check` | Run typecheck, tests, and release configuration validation. |
| `make play-metadata` | Validate Play metadata and staging folders. |
| `make android-aab` | Fallback only: build a signed AAB from the generated ignored Android project and copy it to `.release/cc-reminder-android-1.0.4-5.aab`. |
| `CONFIRM_EAS_BUILD=yes make eas-android-build` | Create a local EAS Android App Bundle at `.release/cc-reminder-android.aab`. |
| `CONFIRM_PLAY_UPLOAD=yes make play-internal` | Submit `.release/cc-reminder-android.aab` to Play internal testing. Do not run until the Play Console and service account steps are confirmed. |

## Local Signing

The release build profile uses EAS local Android credentials. The real files are ignored by git.

| File | Purpose | Git status |
|---|---|---|
| `.release/cc-reminder-upload.jks` | Android upload keystore | Ignored |
| `credentials.json` | EAS local credential pointer and passwords | Ignored |
| `.release/google-play-service-account.json` | Play Console service account key | Ignored |
| `docs/release/eas-credentials.example.json` | Placeholder EAS credential example | Tracked |
| `docs/release/android-key.properties.example` | Placeholder Gradle signing example | Tracked |

Do not grant API permissions, download a service account JSON key, upload a build, or save a package key in Play Console without explicit confirmation.

## Play Console Manual Gates

| Gate | Status |
|---|---|
| Personal developer account selected | Verified in Play Console as `surajmandalcell`, developer ID `8507532153395963467` |
| Personal Play Console developer account only | Verified. Do not use MealVue, MealLens, or `pregso` |
| Package `com.surajmandal.ccreminder` created or selected | Verified in Play Console |
| Internal testing release | Published version `1.0.3` with Android versionCode `4`; Play shows "Available to internal testers", released on May 9, 2026 at 1:01 PM, not reviewed |
| Closed testing - Alpha release | Published version `1.0.1` with Android versionCode `2`; Play shows "Available to testers on Google Play", released on May 10, 2026 at 3:22 AM |
| Superseding release plan | Publish Android versionCode `5` / version `1.0.4` to both Internal testing and Closed testing - Alpha so both tester groups see the same newest build |
| Internal tester list | `cc-reminder-internal`, 1 user |
| Tester join link | `https://play.google.com/apps/internaltest/4700998914485383299` |
| AAB uploaded | Uploaded `.release/cc-reminder-android.aab` through Play Console after EAS Submit was blocked by the missing service account JSON |
| Deobfuscation file | Not uploaded. Play showed a non-blocking warning for Android versionCode `4` |
| Paid monetization | Merchant signup completed by user. Paid pricing saved in Play Console on May 7, 2026 for 176 countries / regions. Base price was set from USD 5.00; United States row shows USD 4.99 after Play tier rounding. |
| Verified package key saved | Not required during this upload |
| Service account permissions granted | Not configured |
| Service account JSON downloaded | Not configured |
| Privacy policy | Saved with GitHub privacy-policy URL |
| App access | Saved as no restricted functionality |
| Ads | Saved as no ads |
| Target audience | Saved as 18 and over; not directed at children |
| Data safety | Saved as no data collected and no data shared |
| Government apps | Saved as not a government app |
| Financial features | Saved as no regulated financial features provided |
| Health | Saved as no health features |
| App category | Saved as Finance |
| Store listing public contact email | Blocked. Play requires a public email address before this dashboard task can complete |
| Content rating | Blocked. Play requires completing the IARC questionnaire and agreeing to IARC Terms of Service |

## Play Store Listing Assets

| Asset | Play Console status |
|---|---|
| Short description | Updated to `Private credit card due date reminders.` after Play quick checks flagged `Local-first` as a ranking-style keyword |
| App icon | Uploaded and saved |
| Feature graphic | Generated with Imagen, uploaded, and saved |
| Phone screenshots | Uploaded 3 screenshots at 1080x1920 |
| 7-inch tablet screenshots | Saved 1 screenshot at 1080x1920 |
| 10-inch tablet screenshots | Saved 1 screenshot at 1080x1920 |

## Current Play Review Blockers

| Blocker | Why it is blocked | Next action |
|---|---|---|
| Store listing contact details | Google Play requires a public support email. Entering it publishes contact information to users. | Confirm the exact public email address to use. |
| Content rating | The questionnaire requires agreeing to IARC Terms of Service. | User approval is required before Codex completes it under the developer account. |

## Source Evidence For Data Safety

| Claim | Source |
|---|---|
| Local storage uses AsyncStorage | `utils/storage.ts`, `hooks/useCards.ts`, `hooks/useQuickNotes.ts`, `hooks/useOnboarding.tsx` |
| Stored card data is last 4 only | `types/domain.ts`, `hooks/useCards.ts`, `components/card/CardForm.tsx` |
| Local notifications only | `utils/notifications.ts`, `app/_layout.tsx` |
| No account system found | No auth, login, backend, Supabase, Firebase, or account code found in app source |
| No backend sync found | No app source network client or API endpoint code found |
| Android internet permission | The generated Expo Android manifest includes internet permission, but app source does not include a network client |
| Delete local data gap | Cards and notes can be deleted individually, but a single clear-all-local-data path was not found |

The clear-all-local-data gap is a production blocker unless a settings reset action is added before public release.

## EAS Project

The app is linked to EAS project `@surajmanalcell/cc-reminder` with project ID `61fb4a83-cabe-411b-bf7b-4c600400fc80`. The local CLI was verified as `surajmanalcell <surajmandalcell@gmail.com>`. Do not switch this project to any MealVue, MealLens, or `pregso` account.
