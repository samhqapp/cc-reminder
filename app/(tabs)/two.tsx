import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { NoteSheet } from "@/components/card/NoteSheet";
import { useColorScheme } from "@/components/useColorScheme";
import { PressableScale } from "@/components/ui/PressableScale";
import Colors from "@/constants/Colors";
import { radius, shadow, spacing, thickness } from "@/constants/Tokens";
import { findCompanyPreset } from "@/data/companyPresets";
import { useCards } from "@/hooks/useCards";
import type { Card, DerivedReminder } from "@/types/domain";
import { formatFullDate, relativeDayLabel } from "@/utils/date";
import { deriveReminders, getReminderMetrics } from "@/utils/reminders";

export default function RemindersScreen() {
	const colorScheme = useColorScheme() ?? "light";
	const palette = Colors[colorScheme];
	const { width } = useWindowDimensions();
	const {
		cards,
		acknowledgeReminder,
		settleCycle,
		snoozeReminder,
	} = useCards();
	const [selectedCard, setSelectedCard] = useState<Card | null>(null);

	const reminders = useMemo(() => deriveReminders(cards), [cards]);
	const metrics = useMemo(
		() => getReminderMetrics(cards, reminders),
		[cards, reminders],
	);
	const twoColumn = width >= 390;
	const tileWidth = twoColumn
		? (width - spacing.lg * 2 - spacing.sm) / 2
		: width - spacing.lg * 2;

	return (
		<SafeAreaView
			edges={["top"]}
			style={[styles.safeArea, { backgroundColor: palette.background }]}
		>
			<ScrollView
				style={{ backgroundColor: palette.background }}
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
			>
				<View
					style={[
						styles.hero,
						{
							backgroundColor: palette.card,
							borderColor: palette.borderSoft,
							shadowColor: palette.primary,
						},
						shadow.soft,
					]}
				>
					<Text style={[styles.eyebrow, { color: palette.primary }]}>
						Reminders
					</Text>
					<Text style={[styles.title, { color: palette.text }]}>
						Decision board
					</Text>
					<Text style={[styles.subtitle, { color: palette.muted }]}>
						{metrics.activeCount} active · {metrics.cardCount} cards ·{" "}
						{metrics.overdueCount} overdue
					</Text>
				</View>

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
							Your reminder bento grid will fill up as renewal dates get closer.
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
								width={tileWidth}
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
								companySurface={companyTheme?.surface ?? palette.card}
								palette={palette}
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
	width,
	onOpenNote,
	onAcknowledge,
	onSnooze,
	onHandle,
	companySurface,
	palette,
}: {
	reminder: DerivedReminder;
	width: number;
	onOpenNote: () => void;
	onAcknowledge: () => void;
	onSnooze: () => void;
	onHandle: () => void;
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

	return (
		<PressableScale
			onLongPress={onOpenNote}
			contentStyle={[
				styles.tile,
				{
					width,
					backgroundColor: companySurface,
					borderColor: palette.borderSoft,
					shadowColor: toneColor,
				},
				shadow.soft,
			]}
		>
			<View style={styles.tileHeader}>
				<Text style={[styles.badge, { color: toneColor }]}>
					{reminder.intent === "cancel" ? "Cancel" : "Continue"}
				</Text>
				<Text style={[styles.badgeMuted, { color: palette.muted }]}>
					{relativeDayLabel(reminder.dueDate)}
				</Text>
			</View>
			<Text style={[styles.tileTitle, { color: palette.text }]}>
				{reminder.title}
			</Text>
			<Text style={[styles.tileMeta, { color: palette.muted }]}>
				{formatFullDate(reminder.dueDate)}
			</Text>
			<Text style={[styles.tileBody, { color: palette.muted }]}>
				{reminder.subtitle}
			</Text>
			<View style={styles.tileActions}>
				<PressableScale
					onPress={onAcknowledge}
					contentStyle={[
						styles.smallButton,
						{ backgroundColor: palette.card, borderColor: palette.borderSoft },
					]}
				>
					<Text style={[styles.smallLabel, { color: palette.text }]}>Seen</Text>
				</PressableScale>
				<PressableScale
					onPress={onSnooze}
					contentStyle={[
						styles.smallButton,
						{ backgroundColor: palette.card, borderColor: palette.borderSoft },
					]}
				>
					<Text style={[styles.smallLabel, { color: palette.text }]}>Snooze</Text>
				</PressableScale>
				<PressableScale
					onPress={onHandle}
					contentStyle={[
						styles.smallButton,
						{ backgroundColor: palette.primary, borderColor: palette.primary },
					]}
				>
					<Text style={[styles.smallLabel, { color: palette.onPrimary }]}>
						Handled
					</Text>
				</PressableScale>
			</View>
		</PressableScale>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
	},
	content: {
		padding: spacing.lg,
		gap: spacing.lg,
	},
	hero: {
		borderWidth: thickness.border,
		borderBottomWidth: thickness.border3D,
		borderRadius: radius.xl,
		padding: spacing.xl,
		gap: spacing.xs,
	},
	eyebrow: {
		fontSize: 13,
		lineHeight: 18,
		fontWeight: "800",
		textTransform: "uppercase",
	},
	title: {
		fontSize: 30,
		lineHeight: 36,
		fontWeight: "900",
	},
	subtitle: {
		fontSize: 15,
		lineHeight: 22,
	},
	emptyCard: {
		borderWidth: thickness.border,
		borderBottomWidth: thickness.border3D,
		borderRadius: radius.lg,
		padding: spacing.lg,
		gap: spacing.xs,
	},
	emptyTitle: {
		fontSize: 20,
		lineHeight: 26,
		fontWeight: "800",
	},
	emptyBody: {
		fontSize: 14,
		lineHeight: 20,
	},
	grid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: spacing.sm,
	},
	tile: {
		borderWidth: thickness.border,
		borderBottomWidth: thickness.border3D,
		borderRadius: radius.lg,
		padding: spacing.md,
		gap: spacing.sm,
	},
	tileHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	badge: {
		fontSize: 12,
		lineHeight: 16,
		fontWeight: "800",
		textTransform: "uppercase",
	},
	badgeMuted: {
		fontSize: 12,
		lineHeight: 16,
		fontWeight: "700",
	},
	tileTitle: {
		fontSize: 18,
		lineHeight: 22,
		fontWeight: "800",
	},
	tileMeta: {
		fontSize: 12,
		lineHeight: 16,
		fontWeight: "700",
	},
	tileBody: {
		fontSize: 13,
		lineHeight: 18,
	},
	tileActions: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: spacing.xs,
	},
	smallButton: {
		borderWidth: thickness.border,
		borderBottomWidth: thickness.border3DSmall,
		borderRadius: 999,
		paddingHorizontal: 12,
		paddingVertical: 10,
	},
	smallLabel: {
		fontSize: 12,
		lineHeight: 16,
		fontWeight: "800",
		textTransform: "uppercase",
	},
});
