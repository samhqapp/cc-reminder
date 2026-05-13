import Ionicons from "@expo/vector-icons/Ionicons";
import { useMemo, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { NoteSheet } from "@/components/card/NoteSheet";
import { Button } from "@/components/ui/Button";
import { PressableScale } from "@/components/ui/PressableScale";
import {
	AnimatedAppear,
	PaperPanel,
	ScreenScaffold,
} from "@/components/ui/ScreenScaffold";
import {
	hairline,
	radius,
	screenWorld,
	spacing,
	stylepass,
	type as typeTokens,
} from "@/constants/Tokens";
import { mapCardToDraft, useCards } from "@/hooks/useCards";
import type { Card, DerivedReminder, SubscriptionIntent } from "@/types/domain";
import { formatFullDate, formatShortDate, relativeDayLabel } from "@/utils/date";
import { successTap, warningTap } from "@/utils/haptics";
import { deriveReminders, getReminderMetrics } from "@/utils/reminders";

const nudgeArt = require("../../assets/images/onboarding/renewal-reminders.png");

export default function RemindersScreen() {
	const {
		cards,
		updateCard,
		acknowledgeReminder,
		settleCycle,
		snoozeReminder,
	} = useCards();
	const [selectedCard, setSelectedCard] = useState<Card | null>(null);
	const [showInfoCard, setShowInfoCard] = useState(true);

	const reminders = useMemo(() => deriveReminders(cards), [cards]);
	const metrics = useMemo(
		() => getReminderMetrics(cards, reminders),
		[cards, reminders],
	);
	const featured = reminders[0] ?? null;

	async function handleFlipIntent(card: Card, intent: SubscriptionIntent) {
		const draft = mapCardToDraft(card);
		await updateCard(card.id, { ...draft, intent });
	}

	return (
		<ScreenScaffold
			world="reminders"
			kicker="Renewal Window"
			title="Reminders"
			subtitle="Soft nudges near renewal day, framed as a clear decision."
		>
			{showInfoCard ? (
				<AnimatedAppear delay={80}>
					<ReminderHero
						reminder={featured}
						metrics={metrics}
						onDismiss={() => setShowInfoCard(false)}
					/>
				</AnimatedAppear>
			) : null}

			{reminders.length === 0 ? (
				<AnimatedAppear delay={140}>
					<PaperPanel style={styles.emptyPanel}>
						<Text style={styles.emptyTitle}>Nothing due</Text>
						<Text style={styles.emptyBody}>
							Reminders appear here as renewal dates approach.
						</Text>
					</PaperPanel>
				</AnimatedAppear>
			) : null}

			<View style={styles.timeline}>
				<View style={styles.timelineLine} />
				{reminders.map((reminder, index) => {
					const card = cards.find((item) => item.id === reminder.cardId);
					return (
						<AnimatedAppear key={reminder.id} delay={160 + index * 45}>
							<ReminderTimelineItem
								reminder={reminder}
								card={card ?? null}
								onOpenNote={() => setSelectedCard(card ?? null)}
								onAcknowledge={() => {
									successTap();
									void acknowledgeReminder(reminder.cardId, reminder.id);
								}}
								onSnooze={() => {
									warningTap();
									void snoozeReminder(reminder.cardId, reminder.id, 12);
								}}
								onSettle={() => {
									successTap();
									void settleCycle(reminder.cardId, reminder.cycleId);
								}}
								onFlipIntent={(intent) =>
									card ? void handleFlipIntent(card, intent) : undefined
								}
							/>
						</AnimatedAppear>
					);
				})}
			</View>

			<NoteSheet
				visible={Boolean(selectedCard)}
				title={selectedCard?.name ?? "Card note"}
				subtitle={selectedCard?.provider}
				note={selectedCard?.note}
				onClose={() => setSelectedCard(null)}
			/>
		</ScreenScaffold>
	);
}

function ReminderHero({
	reminder,
	metrics,
	onDismiss,
}: {
	reminder: DerivedReminder | null;
	metrics: {
		cardCount: number;
		activeCount: number;
		overdueCount: number;
		extendedCount?: number;
	};
	onDismiss: () => void;
}) {
	return (
		<PaperPanel style={styles.heroPanel}>
			<Pressable
				accessibilityRole="button"
				accessibilityLabel="Hide reminder summary"
				onPress={onDismiss}
				hitSlop={10}
				style={styles.dismissButton}
			>
				<Ionicons name="close" size={17} color="rgba(21, 24, 33, 0.62)" />
			</Pressable>
			<View style={styles.heroCopy}>
				<Text style={styles.heroLabel}>Due Tonight</Text>
				<Text style={styles.heroTitle}>
					{reminder ? reminder.cardName : "No Renewal Pressure"}
				</Text>
				<Text style={styles.heroBody}>
					{reminder
						? `${reminder.provider} is inside the reminder window. Mark the cycle or change intent.`
						: "The ledger is quiet. New nudges will show up around saved renewal days."}
				</Text>
				<View style={styles.metricRow}>
					<MetricPill label="Active" value={metrics.activeCount} />
					<MetricPill label="Overdue" value={metrics.overdueCount} />
				</View>
			</View>
			<Image source={nudgeArt} style={styles.nudgeArt} resizeMode="contain" />
		</PaperPanel>
	);
}

function MetricPill({ label, value }: { label: string; value: number }) {
	return (
		<View style={styles.metricPill}>
			<Text style={styles.metricValue}>{value}</Text>
			<Text style={styles.metricLabel}>{label}</Text>
		</View>
	);
}

function ReminderTimelineItem({
	reminder,
	card,
	onOpenNote,
	onAcknowledge,
	onSnooze,
	onSettle,
	onFlipIntent,
}: {
	reminder: DerivedReminder;
	card: Card | null;
	onOpenNote: () => void;
	onAcknowledge: () => void;
	onSnooze: () => void;
	onSettle: () => void;
	onFlipIntent: (intent: SubscriptionIntent) => void;
}) {
	const currentIntent = card?.intent ?? reminder.intent;
	const tone = toneStyles(reminder.tone);

	return (
		<View style={styles.timelineItem}>
			<View style={[styles.timelineDot, tone.dot]} />
			<PaperPanel style={styles.reminderCard}>
				<View style={styles.cardHeader}>
					<View style={[styles.stageBadge, tone.badge]}>
						<Text style={[styles.stageLabel, tone.label]}>
							{stageLabel(reminder.stage)}
						</Text>
					</View>
					<Text style={styles.scheduledText}>
						{relativeDayLabel(reminder.scheduledFor)} -{" "}
						{formatShortDate(reminder.dueDate)}
					</Text>
				</View>

				<Text style={styles.reminderTitle}>{reminder.title}</Text>
				<Text style={styles.reminderBody}>{reminder.subtitle}</Text>
				<Text style={styles.reminderDate}>
					Renewal date {formatFullDate(reminder.dueDate)}
				</Text>

				<View style={styles.intentRow}>
					{(["cancel", "continue"] as const).map((intent) => {
						const active = currentIntent === intent;
						return (
							<PressableScale
								key={intent}
								onPress={() => onFlipIntent(intent)}
								contentStyle={[
									styles.intentBtn,
									active && styles.intentBtnActive,
									active && intent === "cancel" && styles.intentBtnWarn,
								]}
							>
								<Text
									style={[
										styles.intentLabel,
										active && styles.intentLabelActive,
									]}
								>
									{intent === "cancel" ? "Cancel" : "Keep"}
								</Text>
							</PressableScale>
						);
					})}
				</View>

				<View style={styles.actionRow}>
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

				{card?.note ? (
					<PressableScale onPress={onOpenNote} contentStyle={styles.noteLink}>
						<Text style={styles.noteLinkText}>View note</Text>
					</PressableScale>
				) : null}
			</PaperPanel>
		</View>
	);
}

function toneStyles(tone: string) {
	if (tone === "danger") {
		return {
			dot: styles.dotDanger,
			badge: styles.badgeDanger,
			label: styles.labelDanger,
		};
	}
	if (tone === "warning") {
		return {
			dot: styles.dotWarning,
			badge: styles.badgeWarning,
			label: styles.labelWarning,
		};
	}
	if (tone === "success") {
		return {
			dot: styles.dotSuccess,
			badge: styles.badgeSuccess,
			label: styles.labelSuccess,
		};
	}
	return {
		dot: styles.dotAccent,
		badge: styles.badgeAccent,
		label: styles.labelAccent,
	};
}

function stageLabel(stage: string) {
	if (stage === "overdue") return "Overdue";
	if (stage === "due-today") return "Due Today";
	if (stage === "billing") return "Billing";
	if (stage === "extended") return "Extended";
	return "Due Soon";
}

function needsSettlement(stage: string) {
	return stage === "overdue" || stage === "extended" || stage === "due-today";
}

const styles = StyleSheet.create({
	heroPanel: {
		position: "relative",
		minHeight: 184,
		padding: spacing.md,
		overflow: "hidden",
		marginBottom: spacing.lg,
	},
	dismissButton: {
		position: "absolute",
		top: spacing.sm,
		right: spacing.sm,
		zIndex: 4,
		width: 34,
		height: 34,
		alignItems: "center",
		justifyContent: "center",
	},
	heroCopy: {
		maxWidth: 210,
		zIndex: 2,
	},
	heroLabel: {
		...typeTokens.titleLg,
		color: stylepass.ink,
	},
	heroTitle: {
		...typeTokens.titleMd,
		marginTop: spacing.xs,
		color: stylepass.ink,
	},
	heroBody: {
		...typeTokens.legal,
		marginTop: spacing.xs,
		color: "rgba(21, 24, 33, 0.62)",
	},
	metricRow: {
		flexDirection: "row",
		gap: spacing.xs,
		marginTop: spacing.md,
	},
	metricPill: {
		minHeight: 38,
		borderRadius: radius.lg,
		paddingHorizontal: 14,
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		backgroundColor: screenWorld.reminders.accentSoft,
	},
	metricValue: {
		...typeTokens.titleSm,
		color: stylepass.forest,
	},
	metricLabel: {
		...typeTokens.legal,
		color: "rgba(21, 24, 33, 0.62)",
	},
	nudgeArt: {
		position: "absolute",
		right: -98,
		bottom: -326,
		width: 250,
		height: 430,
		opacity: 0.9,
	},
	emptyPanel: {
		padding: spacing.lg,
		gap: spacing.xs,
		marginBottom: spacing.lg,
	},
	emptyTitle: {
		...typeTokens.titleLg,
		color: stylepass.ink,
	},
	emptyBody: {
		...typeTokens.body,
		color: stylepass.body,
	},
	timeline: {
		position: "relative",
		gap: spacing.md,
		paddingLeft: 18,
	},
	timelineLine: {
		position: "absolute",
		left: 4,
		top: 7,
		bottom: 8,
		width: 2,
		borderRadius: radius.pill,
		backgroundColor: "rgba(21, 24, 33, 0.2)",
	},
	timelineItem: {
		position: "relative",
		paddingLeft: spacing.sm,
	},
	timelineDot: {
		position: "absolute",
		left: -18,
		top: 16,
		width: 10,
		height: 10,
		borderRadius: 5,
	},
	dotAccent: {
		backgroundColor: stylepass.forest,
		boxShadow: "0 0 0 5px rgba(55, 93, 72, 0.14)",
	},
	dotDanger: {
		backgroundColor: stylepass.rust,
	},
	dotWarning: {
		backgroundColor: stylepass.mustard,
	},
	dotSuccess: {
		backgroundColor: stylepass.forest,
	},
	reminderCard: {
		padding: spacing.md,
		gap: spacing.xs,
	},
	cardHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		gap: spacing.sm,
	},
	stageBadge: {
		borderRadius: radius.md,
		paddingHorizontal: 12,
		paddingVertical: 5,
	},
	badgeAccent: {
		backgroundColor: screenWorld.reminders.accentSoft,
	},
	badgeDanger: {
		backgroundColor: "rgba(140, 75, 53, 0.14)",
	},
	badgeWarning: {
		backgroundColor: "rgba(138, 119, 66, 0.14)",
	},
	badgeSuccess: {
		backgroundColor: "rgba(55, 93, 72, 0.14)",
	},
	stageLabel: {
		...typeTokens.legal,
	},
	labelAccent: {
		color: stylepass.forest,
	},
	labelDanger: {
		color: stylepass.rust,
	},
	labelWarning: {
		color: stylepass.mustard,
	},
	labelSuccess: {
		color: stylepass.forest,
	},
	scheduledText: {
		...typeTokens.legal,
		color: "rgba(21, 24, 33, 0.54)",
	},
	reminderTitle: {
		...typeTokens.titleSm,
		color: stylepass.ink,
		marginTop: spacing.xs,
	},
	reminderBody: {
		...typeTokens.body,
		color: "rgba(21, 24, 33, 0.64)",
	},
	reminderDate: {
		...typeTokens.legal,
		color: "rgba(21, 24, 33, 0.54)",
	},
	intentRow: {
		flexDirection: "row",
		gap: spacing.xs,
		marginTop: spacing.xs,
	},
	intentBtn: {
		flex: 1,
		minHeight: 38,
		borderRadius: radius.lg,
		borderWidth: hairline,
		borderColor: stylepass.line,
		backgroundColor: "rgba(255, 255, 255, 0.34)",
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: spacing.sm,
	},
	intentBtnActive: {
		backgroundColor: "rgba(55, 93, 72, 0.9)",
		borderColor: "rgba(55, 93, 72, 0.9)",
	},
	intentBtnWarn: {
		backgroundColor: "rgba(140, 75, 53, 0.9)",
		borderColor: "rgba(140, 75, 53, 0.9)",
	},
	intentLabel: {
		...typeTokens.legal,
		color: "rgba(21, 24, 33, 0.64)",
	},
	intentLabelActive: {
		color: stylepass.cream,
	},
	actionRow: {
		flexDirection: "row",
		gap: spacing.xs,
		marginTop: spacing.xs,
	},
	actionBtn: {
		flex: 1,
	},
	noteLink: {
		alignItems: "center",
		paddingVertical: spacing.xs,
	},
	noteLinkText: {
		...typeTokens.legal,
		color: stylepass.forest,
	},
});
