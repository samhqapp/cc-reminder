# Play Store Data Safety Draft

Use this as the starting point for the Play Console Data Safety form. Verify each answer in Play Console before submission.

## App Data Behavior

| Area | Draft answer |
|---|---|
| App architecture | Local-first mobile app |
| Account system | No account required. No account system found in source. |
| Backend or cloud sync | None found in source. |
| Storage | AsyncStorage on device |
| Notifications | Local notifications only |
| Network permission | Expo generated Android includes internet permission, but no app source network client was found |
| Data sharing | No intentional sharing found |
| Data sale | No sale of user data |
| Ads | No ads |

## Data Stored On Device

| Data type | Stored | Notes |
|---|---|---|
| Card nickname | Yes | User-entered reminder label |
| Provider | Yes | User-entered or selected card provider |
| Last 4 digits | Yes | Exactly four digits only |
| Billing day | Yes | Optional reminder date input |
| Due day | Yes | Reminder date input |
| Tags | Yes | Optional local organization |
| Notes | Yes | Optional user notes |
| Reminder state | Yes | Acknowledged, snoozed, and settled state |
| Notification preference | Yes | Per-card notification setting |

## Sensitive Data Not Stored

| Data type | Draft answer |
|---|---|
| Full card number | Not collected |
| CVV | Not collected |
| Expiry date | Not collected |
| Payment credentials | Not collected |
| Bank login | Not collected |
| Bank connection | Not collected |
| Account access tokens | Not collected |

## Collection And Sharing Draft

| Play Console topic | Draft answer |
|---|---|
| Is data collected from users? | No, based on current source. Data stays on device. |
| Is data shared? | No. |
| Is data encrypted in transit? | Not applicable for app data because no backend transfer was found. |
| Can users request data deletion? | No account data exists. Local cards and notes can be deleted individually. A clear-all-local-data control is not present yet. |
| Is the app committed to Play Families policies? | Not directed at children. |

## Policy Form Notes

| Form area | Draft response |
|---|---|
| Category | Finance |
| Financial features | Utility reminders only |
| Gambling | No |
| Trading | No |
| Lending | No |
| Account access | No |
| Payments | No |
| Credit decisions | No |
| Financial advice | No |

Do not submit this form without manual review and confirmation.
