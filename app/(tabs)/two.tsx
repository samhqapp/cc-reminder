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
import Colors, { type AppPalette } from "@/constants/Colors";
import { hairline, radius, spacing, type as typeTokens } from "@/constants/Tokens";
import { mapCardToDraft, useCards } from "@/hooks/useCards";
import type { Card, DerivedReminder, SubscriptionIntent } from "@/types/domain";
import { formatFullDate } from "@/utils/date";
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

	const hPad = spacing.lg;
	const twoColumn = width >= 420;
	const tileWidth = twoColumn
		? (width - hPad * 2 - spacing.sm) / 2
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
				<Text style={[styles.pageTitle, { color: palette.text }]}>
					Reminders
				</Text>

				{reminders.length === 0 ? (
					<View
						style={[
							styles.emptyCard,
							{ backgroundColor: palette.surface, borderColor: palette.border },
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
						return (
							<ReminderTile
								key={reminder.id}
								reminder={reminder}
								card={card ?? null}
								width={tileWidth}
								palette={palette}
								onOpenNote={() => setSelectedCard(card ?? null)}
								onAcknowledge={() =>
									void acknowledgeReminder(reminder.cardId, reminder.id)
								}
								onSnooze={() =>
									void snoozeReminder(reminder.cardId, reminder.id, 12)
								}
								onSettle={() =>
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

function toneColor(tone: string, palette: AppPalette): string {
	if (tone === "danger") return palette.danger;
	if (tone === "warning") return palette.warning;
	if (tone === "success") return palette.success;
	return palette.muted;
}

function toneSurface(tone: string, palette: AppPalette): string {
	if (tone === "danger") return palette.dangerSoft;
	if (tone === "warning") return palette.warningSoft;
	if (tone === "success") return palette.successSoft;
	return palette.surface;
}

function needsSettlement(stage: string) {
	return stage === "overdue" || stage === "extended" || stage === "due-today";
}

function ReminderTile({
	reminder,
	card,
	width,
	onOpenNote,
	onAcknowledge,
	onSnooze,
	onSettle,
	onFlipIntent,
	palette,
}: {
	reminder: DerivedReminder;
	card: Card | null;
	width: number;
	onOpenNote: () => void;
	onAcknowledge: () => void;
	onSnooze: () => void;
	onSettle: () => void;
	onFlipIntent: (intent: SubscriptionIntent) => void;
	palette: AppPalette;
}) {
	const tc = toneColor(reminder.tone, palette);
	const ts = toneSurface(reminder.tone, palette);
	const currentIntent = card?.intent ?? reminder.intent;

	return (
		<View
			style={[
				styles.tile,
				{
					width,
					backgroundColor: palette.card,
					borderColor: palette.border,
				},
			]}
		>
			{/* Tone indicator stripe */}
			<View style={[styles.toneStripe, { backgroundColor: tc }]} />

			{/* Header: stage badge + date */}
			<View style={styles.tileHeader}>
				<View style={[styles.stageBadge, { backgroundColor: ts }]}>
					<Text style={[styles.stageLabel, { color: tc }]}>
						{reminder.stage === "overdue"
							? "Overdue"
							: reminder.stage === "due-today"
								? "Due today"
								: reminder.stage === "billing"
									? "Billing"
									: reminder.stage === "extended"
										? "Extended"
										: "Due soon"}
					</Text>
				</View>
				<Text style={[styles.tileDate, { color: palette.muted }]}>
					{formatFullDate(reminder.dueDate)}
				</Text>
			</View>

			{/* Title + subtitle */}
			<Text style={[styles.tileTitle, { color: palette.text }]} numberOfLines={1}>
				{reminder.title}
			</Text>
			<Text style={[styles.tileBody, { color: palette.muted }]} numberOfLines={2}>
				{reminder.subtitle}
			</Text>

			{/* Intent toggle */}
			<View style={styles.intentRow}>
				{(["cancel", "continue"] as const).map((intent) => {
					const active = currentIntent === intent;
					return (
						<PressableScale
							key={intent}
							onPress={() => onFlipIntent(intent)}
							contentStyle={[
								styles.intentBtn,
								{
									backgroundColor: active
										? intent === "cancel"
											? palette.danger
											: palette.success
										: "transparent",
									borderColor: active
										? "transparent"
										: palette.border,
								},
							]}
						>
							<Text
								style={[
									styles.intentLabel,
									{
										color: active
											? "#ffffff"
											: palette.muted,
									},
								]}
							>
								{intent === "cancel" ? "Cancel" : "Keep"}
							</Text>
						</PressableScale>
					);
				})}
			</View>

			{/* Action buttons: separate Acknowledge and Settle */}
			<View style={styles.tileActions}>
				{!reminder.isAcknowledged ? (
					<Button
						title="Seen"
						variant="secondary"
						compact
						style={styles.actionBtn}
						onPress={onAcknowledge}
					/>
				) : null}
				{needsSettlement(reminder.stage) ? (
					<Button
						title="Settled"
						variant={reminder.tone === "danger" ? "danger" : "success"}
						compact
						style={styles.actionBtn}
						onPress={onSettle}
					/>
				) : null}
				<Button
					title="Snooze"
					variant="secondary"
					compact
					style={styles.actionBtn}
					onPress={onSnooze}
				/>
			</View>

			{/* Note link */}
			{card?.note ? (
				<PressableScale onPress={onOpenNote} contentStyle={styles.noteLink}>
					<Text style={[styles.noteLinkText, { color: palette.link }]}>
						View note
					</Text>
				</PressableScale>
			) : null}
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
		gap: spacing.md,
	},
	pageTitle: {
		...typeTokens.displayLg,
		marginBottom: spacing.xs,
	},
	emptyCard: {
		borderWidth: hairline,
		borderRadius: radius.lg,
		padding: spacing.lg,
		gap: spacing.xs,
	},
	emptyTitle: {
		...typeTokens.titleMd,
	},
	emptyBody: {
		...typeTokens.body,
	},
	grid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: spacing.sm,
	},
	tile: {
		borderWidth: hairline,
		borderRadius: radius.lg,
		padding: spacing.md,
		paddingTop: spacing.sm,
		gap: spacing.xs,
		overflow: "hidden",
	},
	toneStripe: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		height: 3,
		borderTopLeftRadius: radius.lg,
		borderTopRightRadius: radius.lg,
	},
	tileHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginTop: 2,
	},
	stageBadge: {
		borderRadius: radius.xs,
		paddingHorizontal: 8,
		paddingVertical: 3,
	},
	stageLabel: {
		...typeTokens.legal,
		fontWeight: "500",
	},
	tileDate: {
		...typeTokens.legal,
	},
	tileTitle: {
		...typeTokens.titleSm,
	},
	tileBody: {
		...typeTokens.legal,
	},
	intentRow: {
		flexDirection: "row",
		gap: 6,
		marginTop: 2,
	},
	intentBtn: {
		flex: 1,
		borderWidth: hairline,
		borderRadius: radius.sm,
		paddingVertical: 7,
		alignItems: "center",
	},
	intentLabel: {
		...typeTokens.legal,
		fontWeight: "500",
	},
	tileActions: {
		flexDirection: "row",
		gap: 6,
		marginTop: 2,
	},
	actionBtn: {
		flex: 1,
	},
	noteLink: {
		alignItems: "center",
		paddingVertical: 2,
	},
	noteLinkText: {
		...typeTokens.legal,
	},
});
