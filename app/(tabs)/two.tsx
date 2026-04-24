import { useMemo, useState } from "react";
import {
	ScrollView,
	StyleSheet,
	Text,
	useWindowDimensions,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { NoteSheet } from "@/components/card/NoteSheet";
import { useColorScheme } from "@/components/useColorScheme";
import { PressableScale } from "@/components/ui/PressableScale";
import { Button } from "@/components/ui/Button";
import Colors from "@/constants/Colors";
import { radius, shadow, spacing, thickness } from "@/constants/Tokens";
import { findCompanyPreset } from "@/data/companyPresets";
import { mapCardToDraft, useCards } from "@/hooks/useCards";
import type { Card, DerivedReminder, SubscriptionIntent } from "@/types/domain";
import { formatFullDate, relativeDayLabel } from "@/utils/date";
import { deriveReminders } from "@/utils/reminders";

export default function RemindersScreen() {
	const colorScheme = useColorScheme() ?? "light";
	const palette = Colors[colorScheme];
	const { width } = useWindowDimensions();
	const {
		cards,
		updateCard,
		acknowledgeReminder,
		settleCycle,
		snoozeReminder,
	} = useCards();
	const [selectedCard, setSelectedCard] = useState<Card | null>(null);

	const reminders = useMemo(() => deriveReminders(cards), [cards]);

	// Single-column on narrow screens, two-column on wider
	const hPad = spacing.lg;
	const twoColumn = width >= 420;
	const tileWidth = twoColumn
		? (width - hPad * 2 - spacing.md) / 2
		: width - hPad * 2;

	async function handleFlipIntent(card: Card, intent: SubscriptionIntent) {
		const draft = mapCardToDraft(card);
		await updateCard(card.id, { ...draft, intent });
	}

	return (
		<SafeAreaView
			edges={["top"]}
			style={[styles.safeArea, { backgroundColor: palette.background }]}
		>
			<ScrollView
				style={{ backgroundColor: palette.background }}
				contentContainerStyle={[styles.content, { paddingHorizontal: hPad }]}
				showsVerticalScrollIndicator={false}
			>
				<Text style={[styles.pageTitle, { color: palette.text }]}>Reminders</Text>

				{reminders.length === 0 ? (
					<View
						style={[
							styles.emptyCard,
							{ backgroundColor: palette.card, borderColor: palette.borderSoft },
						]}
					>
						<Text style={[styles.emptyTitle, { color: palette.text }]}>
							Nothing due
						</Text>
						<Text style={[styles.emptyBody, { color: palette.muted }]}>
							Reminders appear here as renewal dates approach.
						</Text>
					</View>
				) : null}

				<View style={styles.grid}>
					{reminders.map((reminder) => {
						const card = cards.find((item) => item.id === reminder.cardId);
						const companyTheme = findCompanyPreset(
							reminder.provider,
							reminder.companyKey,
						);

						return (
							<ReminderTile
								key={reminder.id}
								reminder={reminder}
								card={card ?? null}
								width={tileWidth}
								palette={palette}
								companySurface={companyTheme?.surface ?? palette.card}
								onOpenNote={() => setSelectedCard(card ?? null)}
								onAcknowledge={() =>
									void acknowledgeReminder(reminder.cardId, reminder.id)
								}
								onSnooze={() =>
									void snoozeReminder(reminder.cardId, reminder.id, 12)
								}
								onHandle={() =>
									void settleCycle(reminder.cardId, reminder.cycleId)
								}
								onFlipIntent={(intent) =>
									card ? void handleFlipIntent(card, intent) : undefined
								}
							/>
						);
					})}
				</View>
			</ScrollView>

			<NoteSheet
				visible={Boolean(selectedCard)}
				title={selectedCard?.name ?? "Card note"}
				subtitle={selectedCard?.provider}
				note={selectedCard?.note}
				onClose={() => setSelectedCard(null)}
			/>
		</SafeAreaView>
	);
}

function ReminderTile({
	reminder,
	card,
	width,
	onOpenNote,
	onAcknowledge,
	onSnooze,
	onHandle,
	onFlipIntent,
	companySurface,
	palette,
}: {
	reminder: DerivedReminder;
	card: Card | null;
	width: number;
	onOpenNote: () => void;
	onAcknowledge: () => void;
	onSnooze: () => void;
	onHandle: () => void;
	onFlipIntent: (intent: SubscriptionIntent) => void;
	companySurface: string;
	palette: (typeof Colors)["light"] | (typeof Colors)["dark"];
}) {
	const toneColor =
		reminder.tone === "danger"
			? palette.danger
			: reminder.tone === "warning"
				? palette.warning
				: reminder.tone === "success"
					? palette.success
					: palette.primary;

	const currentIntent = card?.intent ?? reminder.intent;

	return (
		<View
			style={[
				styles.tile,
				{
					width,
					backgroundColor: companySurface,
					borderColor: palette.border,
					borderBottomColor: palette.border3D,
				},
				shadow.soft,
			]}
		>
			{/* Header row: tone badge + relative date */}
			<View style={styles.tileHeader}>
				<Text style={[styles.badge, { color: toneColor }]}>
					{reminder.stage === "overdue" ? "Overdue" : relativeDayLabel(reminder.dueDate)}
				</Text>
				<Text style={[styles.badgeMuted, { color: palette.muted }]}>
					{formatFullDate(reminder.dueDate)}
				</Text>
			</View>

			{/* Title */}
			<Text style={[styles.tileTitle, { color: palette.text }]} numberOfLines={1}>
				{reminder.title}
			</Text>
			<Text style={[styles.tileBody, { color: palette.muted }]} numberOfLines={2}>
				{reminder.subtitle}
			</Text>

			{/* Intent toggle */}
			<View style={[styles.intentRow, { backgroundColor: palette.cardAlt }]}>
				{(["cancel", "continue"] as const).map((intent) => {
					const active = currentIntent === intent;
					return (
						<PressableScale
							key={intent}
							onPress={() => onFlipIntent(intent)}
							contentStyle={[
								styles.intentBtn,
								active
									? {
											backgroundColor:
												intent === "cancel" ? palette.danger : palette.success,
											borderBottomWidth: thickness.border3DSmall,
											borderBottomColor:
												intent === "cancel"
													? palette.dangerBorder
													: palette.successBorder,
										}
									: null,
							]}
						>
							<Text
								style={[
									styles.intentLabel,
									{ color: active ? palette.onPrimary : palette.muted },
								]}
							>
								{intent === "cancel" ? "Cancel" : "Keep"}
							</Text>
						</PressableScale>
					);
				})}
			</View>

			{/* Action buttons */}
			<View style={styles.tileActions}>
				<Button
					title="Handled"
					variant={reminder.tone === "danger" ? "danger" : "success"}
					style={styles.actionBtn}
					onPress={onHandle}
				/>
				<Button
					title="Snooze"
					variant="secondary"
					style={styles.actionBtn}
					onPress={onSnooze}
				/>
			</View>

			{/* Long-press hint */}
			<PressableScale onPress={onOpenNote} contentStyle={styles.noteHint}>
				<Text style={[styles.noteHintText, { color: palette.muted }]}>
					📝 View note
				</Text>
			</PressableScale>
		</View>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
	},
	content: {
		paddingTop: spacing.lg,
		paddingBottom: 120,
		gap: spacing.lg,
	},
	pageTitle: {
		fontFamily: "Nunito_900Black",
		fontSize: 28,
		marginBottom: 4,
	},
	emptyCard: {
		borderWidth: thickness.border,
		borderBottomWidth: thickness.border3D,
		borderRadius: radius.xl,
		padding: spacing.lg,
		gap: spacing.xs,
	},
	emptyTitle: {
		fontFamily: "Nunito_800ExtraBold",
		fontSize: 18,
	},
	emptyBody: {
		fontFamily: "Nunito_700Bold",
		fontSize: 14,
		lineHeight: 20,
	},
	grid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: spacing.md,
	},
	tile: {
		borderWidth: thickness.border,
		borderBottomWidth: thickness.border3D,
		borderRadius: radius.xl,
		padding: spacing.md,
		gap: spacing.sm,
	},
	tileHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	badge: {
		fontFamily: "Nunito_900Black",
		fontSize: 13,
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},
	badgeMuted: {
		fontFamily: "Nunito_700Bold",
		fontSize: 12,
	},
	tileTitle: {
		fontFamily: "Nunito_800ExtraBold",
		fontSize: 18,
		lineHeight: 22,
	},
	tileBody: {
		fontFamily: "Nunito_600SemiBold",
		fontSize: 13,
		lineHeight: 18,
	},
	intentRow: {
		flexDirection: "row",
		borderRadius: radius.md,
		padding: 3,
		gap: 3,
	},
	intentBtn: {
		flex: 1,
		borderRadius: radius.sm,
		paddingVertical: 8,
		alignItems: "center",
		borderWidth: 0,
	},
	intentLabel: {
		fontFamily: "Nunito_900Black",
		fontSize: 12,
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},
	tileActions: {
		flexDirection: "row",
		gap: spacing.xs,
	},
	actionBtn: {
		flex: 1,
		paddingVertical: 10,
		paddingHorizontal: 4,
	},
	noteHint: {
		alignItems: "center",
		paddingVertical: 2,
	},
	noteHintText: {
		fontFamily: "Nunito_600SemiBold",
		fontSize: 12,
	},
});
