import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { NoteSheet } from "@/components/card/NoteSheet";
import { useColorScheme } from "@/components/useColorScheme";
import { PressableScale } from "@/components/ui/PressableScale";
import { Button } from "@/components/ui/Button";
import Colors from "@/constants/Colors";
import { radius, spacing, thickness } from "@/constants/Tokens";
import { findCompanyPreset } from "@/data/companyPresets";
import { mapCardToDraft, useCards } from "@/hooks/useCards";
import type { Card, DerivedReminder } from "@/types/domain";
import { formatFullDate, relativeDayLabel } from "@/utils/date";
import { deriveReminders } from "@/utils/reminders";

export default function RemindersScreen() {
	const colorScheme = useColorScheme() ?? "light";
	const palette = Colors[colorScheme];
	const insets = useSafeAreaInsets();
	const {
		cards,
		acknowledgeReminder,
		settleCycle,
		snoozeReminder,
		updateCard,
	} = useCards();
	const [selectedCard, setSelectedCard] = useState<Card | null>(null);

	const reminders = useMemo(() => deriveReminders(cards), [cards]);

	// Extra bottom padding so content clears the floating navbar
	const listPaddingBottom = Math.max(insets.bottom, 8) + 12 + 64 + 24;

	async function handleToggleIntent(card: Card) {
		const nextIntent = card.intent === "cancel" ? "continue" : "cancel";
		// Build a full draft from the existing card and flip just the intent
		const draft = { ...mapCardToDraft(card), intent: nextIntent as "cancel" | "continue" };
		await updateCard(card.id, draft);
	}

	return (
		<SafeAreaView
			edges={["top"]}
			style={[styles.safeArea, { backgroundColor: palette.background }]}
		>
			<ScrollView
				style={{ backgroundColor: palette.background }}
				contentContainerStyle={[styles.content, { paddingBottom: listPaddingBottom }]}
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
							Nothing to act on
						</Text>
						<Text style={[styles.emptyBody, { color: palette.muted }]}>
							Your reminders will appear here as renewal dates get closer.
						</Text>
					</View>
				) : null}

				<View style={styles.list}>
					{reminders.map((reminder) => {
						const card = cards.find((item) => item.id === reminder.cardId);
						const companyTheme = findCompanyPreset(
							reminder.provider,
							reminder.companyKey,
						);

						return (
							<ReminderCard
								key={reminder.id}
								reminder={reminder}
								card={card ?? null}
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
								onToggleIntent={() =>
									card ? void handleToggleIntent(card) : undefined
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

// ─── Reminder Card ───────────────────────────────────────────────────────────

function ReminderCard({
	reminder,
	card,
	palette,
	companySurface,
	onOpenNote,
	onAcknowledge,
	onSnooze,
	onHandle,
	onToggleIntent,
}: {
	reminder: DerivedReminder;
	card: Card | null;
	palette: (typeof Colors)["light"] | (typeof Colors)["dark"];
	companySurface: string;
	onOpenNote: () => void;
	onAcknowledge: () => void;
	onSnooze: () => void;
	onHandle: () => void;
	onToggleIntent: () => void;
}) {
	const toneColor =
		reminder.tone === "danger"
			? palette.danger
			: reminder.tone === "warning"
				? palette.warning
				: reminder.tone === "success"
					? palette.success
					: palette.primary;

	const intentIsCancelable = reminder.intent === "cancel";

	return (
		<PressableScale
			onLongPress={onOpenNote}
			contentStyle={[
				styles.card,
				{
					backgroundColor: companySurface,
					borderColor: palette.border,
					borderBottomColor: palette.border3D,
				},
			]}
		>
			{/* Header row: tone badge + date */}
			<View style={styles.cardHeader}>
				<View style={[styles.toneDot, { backgroundColor: toneColor }]} />
				<Text style={[styles.toneLabel, { color: toneColor }]}>
					{reminder.stage === "overdue"
						? "Overdue"
						: reminder.stage === "due-today"
							? "Due today"
							: "Upcoming"}
				</Text>
				<Text style={[styles.dateLabel, { color: palette.muted }]}>
					{relativeDayLabel(reminder.dueDate)}
				</Text>
			</View>

			{/* Title + meta */}
			<View>
				<Text style={[styles.cardTitle, { color: palette.text }]}>
					{reminder.title}
				</Text>
				<Text style={[styles.cardMeta, { color: palette.muted }]}>
					{formatFullDate(reminder.dueDate)}
				</Text>
			</View>

			{reminder.subtitle ? (
				<Text style={[styles.cardBody, { color: palette.text }]}>
					{reminder.subtitle}
				</Text>
			) : null}

			{/* Intent toggle — subscription-style pill */}
			<View style={[styles.intentRow, { backgroundColor: palette.cardAlt }]}>
				{(["cancel", "continue"] as const).map((opt) => {
					const active = (card?.intent ?? reminder.intent) === opt;
					return (
						<PressableScale
							key={opt}
							onPress={onToggleIntent}
							contentStyle={[
								styles.intentButton,
								active
									? {
											backgroundColor:
												opt === "cancel" ? palette.danger : palette.success,
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
								{opt === "cancel" ? "Cancel" : "Keep"}
							</Text>
						</PressableScale>
					);
				})}
			</View>

			{/* Action buttons */}
			<View style={styles.actions}>
				<Button
					title="Handled"
					variant={intentIsCancelable ? "danger" : "success"}
					style={{ flex: 1 }}
					onPress={onHandle}
				/>
				<Button
					title="Snooze"
					variant="secondary"
					style={{ flex: 1 }}
					onPress={onSnooze}
				/>
			</View>
		</PressableScale>
	);
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
	},
	content: {
		padding: spacing.xl,
		gap: spacing.lg,
	},
	pageTitle: {
		fontFamily: "Nunito_900Black",
		fontSize: 32,
		marginBottom: 8,
	},
	emptyCard: {
		borderWidth: thickness.border,
		borderBottomWidth: thickness.border3D,
		borderRadius: radius.xl,
		padding: spacing.xl,
		gap: spacing.sm,
	},
	emptyTitle: {
		fontFamily: "Nunito_800ExtraBold",
		fontSize: 20,
	},
	emptyBody: {
		fontFamily: "Nunito_700Bold",
		fontSize: 16,
	},
	list: {
		gap: spacing.lg,
	},
	card: {
		borderWidth: thickness.border,
		borderBottomWidth: thickness.border3D,
		borderRadius: radius.xl,
		padding: spacing.xl,
		gap: spacing.md,
	},
	cardHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.sm,
	},
	toneDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
	},
	toneLabel: {
		fontFamily: "Nunito_900Black",
		fontSize: 13,
		textTransform: "uppercase",
		flex: 1,
	},
	dateLabel: {
		fontFamily: "Nunito_700Bold",
		fontSize: 13,
	},
	cardTitle: {
		fontFamily: "Nunito_800ExtraBold",
		fontSize: 20,
		marginBottom: 2,
	},
	cardMeta: {
		fontFamily: "Nunito_600SemiBold",
		fontSize: 14,
	},
	cardBody: {
		fontFamily: "Nunito_600SemiBold",
		fontSize: 15,
		lineHeight: 22,
	},
	intentRow: {
		flexDirection: "row",
		borderRadius: radius.lg,
		padding: 4,
		gap: 4,
	},
	intentButton: {
		flex: 1,
		borderRadius: radius.md,
		paddingVertical: 10,
		alignItems: "center",
	},
	intentLabel: {
		fontFamily: "Nunito_900Black",
		fontSize: 13,
		textTransform: "uppercase",
	},
	actions: {
		flexDirection: "row",
		gap: spacing.sm,
	},
});
