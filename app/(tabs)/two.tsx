import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { NoteSheet } from "@/components/card/NoteSheet";
import { useColorScheme } from "@/components/useColorScheme";
import { PressableScale } from "@/components/ui/PressableScale";
import { Button } from "@/components/ui/Button";
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
	
	// Max width constraint applied in root layout is 480, so tile calculations 
	// should be based on actual container width, but we can assume max 480.
	const containerWidth = Math.min(width, 480);
	const twoColumn = containerWidth >= 390;
	const tileWidth = twoColumn
		? (containerWidth - spacing.xl * 2 - spacing.md) / 2
		: containerWidth - spacing.xl * 2;

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
				<Text style={[styles.pageTitle, { color: palette.text }]}>Decision board</Text>

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
					borderColor: palette.border,
					borderBottomColor: palette.border3D,
				},
			]}
		>
			<View style={styles.tileHeader}>
				<Text style={[styles.badge, { color: toneColor }]}>
					{reminder.intent === "cancel" ? "Cancel" : "Keep"}
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
			<Text style={[styles.tileBody, { color: palette.text }]}>
				{reminder.subtitle}
			</Text>
			<View style={styles.tileActions}>
				<Button 
					title="Handled" 
					variant={reminder.tone === "danger" ? "danger" : "success"}
					style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 8 }}
					onPress={onHandle} 
				/>
				<Button 
					title="Snooze" 
					variant="secondary"
					style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 8 }}
					onPress={onSnooze} 
				/>
			</View>
		</PressableScale>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
	},
	content: {
		padding: spacing.xl,
		paddingBottom: 128,
		gap: spacing.xl,
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
	grid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: spacing.md,
	},
	tile: {
		borderWidth: thickness.border,
		borderBottomWidth: thickness.border3D,
		borderRadius: radius.xl,
		padding: spacing.lg,
		gap: spacing.sm,
	},
	tileHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: spacing.xs,
	},
	badge: {
		fontFamily: "Nunito_900Black",
		fontSize: 14,
		textTransform: "uppercase",
	},
	badgeMuted: {
		fontFamily: "Nunito_700Bold",
		fontSize: 14,
	},
	tileTitle: {
		fontFamily: "Nunito_800ExtraBold",
		fontSize: 20,
		marginBottom: -2,
	},
	tileMeta: {
		fontFamily: "Nunito_700Bold",
		fontSize: 14,
	},
	tileBody: {
		fontFamily: "Nunito_600SemiBold",
		fontSize: 15,
		marginVertical: spacing.xs,
	},
	tileActions: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: spacing.sm,
		marginTop: spacing.xs,
	},
});
