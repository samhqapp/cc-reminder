import { router } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AddCardSheet } from "@/components/card/AddCardSheet";
import { NoteSheet } from "@/components/card/NoteSheet";
import { useColorScheme } from "@/components/useColorScheme";
import { FloatingAddButton } from "@/components/ui/FloatingAddButton";
import { PressableScale } from "@/components/ui/PressableScale";
import Colors from "@/constants/Colors";
import { radius, shadow, spacing, thickness } from "@/constants/Tokens";
import { findCompanyPreset } from "@/data/companyPresets";
import { useCards } from "@/hooks/useCards";
import type { Card } from "@/types/domain";
import { formatFullDate, getNextOccurrence, relativeDayLabel } from "@/utils/date";
import { deriveReminders } from "@/utils/reminders";

export default function CardsScreen() {
	const colorScheme = useColorScheme() ?? "light";
	const palette = Colors[colorScheme];
	const { cards, createCard, defaultDraft } = useCards();
	const [isAddOpen, setIsAddOpen] = useState(false);
	const [selectedCard, setSelectedCard] = useState<Card | null>(null);

	const groupedCards = useMemo(() => {
		const bucket = new Map<string, Card[]>();

		for (const card of cards) {
			const key = card.groupName?.trim() || "Ungrouped";
			const current = bucket.get(key) ?? [];
			current.push(card);
			bucket.set(key, current);
		}

		return Array.from(bucket.entries())
			.map(([group, items]) => ({
				group,
				items: [...items].sort((left, right) => left.name.localeCompare(right.name)),
			}))
			.sort((left, right) => {
				if (left.group === "Ungrouped") return 1;
				if (right.group === "Ungrouped") return -1;
				return left.group.localeCompare(right.group);
			});
	}, [cards]);

	const starterDraft = useMemo(() => defaultDraft(), [defaultDraft]);

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
							backgroundColor: palette.hero,
							borderColor: palette.border,
							shadowColor: palette.primary,
						},
						shadow.soft,
					]}
				>
					<Text style={[styles.eyebrow, { color: palette.primary }]}>
						Home
					</Text>
					<Text style={[styles.title, { color: palette.text }]}>Cards</Text>
					<Text style={[styles.subtitle, { color: palette.muted }]}>
						Your subscriptions, grouped the way you think about them. Long press
						any card to peek at the saved note.
					</Text>
				</View>

				{cards.length === 0 ? (
					<View
						style={[
							styles.emptyCard,
							{ backgroundColor: palette.card, borderColor: palette.borderSoft },
						]}
					>
						<Text style={[styles.emptyTitle, { color: palette.text }]}>
							No cards yet
						</Text>
						<Text style={[styles.emptyBody, { color: palette.muted }]}>
							Hit the floating plus button to save your first subscription card.
						</Text>
					</View>
				) : null}

				{groupedCards.map((section) => (
					<View key={section.group} style={styles.section}>
						<Text style={[styles.sectionTitle, { color: palette.text }]}>
							{section.group}
						</Text>
						<View style={styles.list}>
							{section.items.map((card) => {
								const companyTheme = findCompanyPreset(
									card.provider,
									card.companyKey,
								);
								const nextReminder = deriveReminders([card])[0];
								const nextRenewal = getNextOccurrence(card.dueDay);

								return (
									<PressableScale
										key={card.id}
										onPress={() => router.push(`/card/${card.id}` as never)}
										onLongPress={() => setSelectedCard(card)}
										contentStyle={[
											styles.card,
											{
												backgroundColor:
													companyTheme?.surface ?? palette.card,
												borderColor: palette.borderSoft,
												shadowColor: palette.primary,
											},
											shadow.soft,
										]}
									>
										<View style={styles.cardTop}>
											<View style={styles.cardHeading}>
												<View
													style={[
														styles.logoBadge,
														{
															backgroundColor:
																companyTheme?.accent ?? palette.primary,
														},
													]}
												>
													<Text
														style={[
															styles.logoLabel,
															{ color: palette.onPrimary },
														]}
													>
														{card.provider.slice(0, 2).toUpperCase()}
													</Text>
												</View>
												<View style={styles.cardText}>
													<Text
														style={[styles.cardTitle, { color: palette.text }]}
													>
														{card.name}
													</Text>
													<Text
														style={[styles.cardMeta, { color: palette.muted }]}
													>
														{card.provider} · •••• {card.last4}
													</Text>
												</View>
											</View>
											<View
												style={[
													styles.intentPill,
													{
														backgroundColor:
															card.intent === "cancel"
																? palette.primarySoft
																: palette.cardAlt,
													},
												]}
											>
												<Text
													style={[
														styles.intentLabel,
														{
															color:
																card.intent === "cancel"
																	? palette.primary
																	: palette.success,
														},
													]}
												>
													{card.intent === "cancel" ? "Cancel" : "Continue"}
												</Text>
											</View>
										</View>
										<View style={styles.cardBottom}>
											<Text style={[styles.renewalLabel, { color: palette.text }]}>
												Next renewal {relativeDayLabel(nextRenewal)}
											</Text>
											<Text style={[styles.renewalMeta, { color: palette.muted }]}>
												{formatFullDate(nextRenewal)}
											</Text>
											<Text style={[styles.helper, { color: palette.muted }]}>
												{nextReminder
													? nextReminder.title
													: "No active reminder right now."}
											</Text>
										</View>
									</PressableScale>
								);
							})}
						</View>
					</View>
				))}
			</ScrollView>

			<View style={styles.fabWrap}>
				<FloatingAddButton onPress={() => setIsAddOpen(true)} />
			</View>

			<AddCardSheet
				visible={isAddOpen}
				initialDraft={starterDraft}
				onClose={() => setIsAddOpen(false)}
				onSubmit={createCard}
			/>
			<NoteSheet
				visible={Boolean(selectedCard)}
				title={selectedCard?.name ?? "Card note"}
				subtitle={
					selectedCard
						? `${selectedCard.provider} · ${selectedCard.intent === "cancel" ? "Cancel" : "Continue"}`
						: undefined
				}
				note={selectedCard?.note}
				onClose={() => setSelectedCard(null)}
			/>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
	},
	content: {
		padding: spacing.lg,
		paddingBottom: 128,
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
	section: {
		gap: spacing.sm,
	},
	sectionTitle: {
		fontSize: 18,
		lineHeight: 24,
		fontWeight: "800",
	},
	list: {
		gap: spacing.sm,
	},
	card: {
		borderWidth: thickness.border,
		borderBottomWidth: thickness.border3D,
		borderRadius: radius.lg,
		padding: spacing.md,
		gap: spacing.md,
	},
	cardTop: {
		flexDirection: "row",
		justifyContent: "space-between",
		gap: spacing.sm,
	},
	cardHeading: {
		flexDirection: "row",
		gap: spacing.sm,
		flex: 1,
	},
	logoBadge: {
		width: 46,
		height: 46,
		borderRadius: radius.md,
		alignItems: "center",
		justifyContent: "center",
	},
	logoLabel: {
		fontSize: 14,
		lineHeight: 18,
		fontWeight: "800",
	},
	cardText: {
		flex: 1,
		gap: 2,
	},
	cardTitle: {
		fontSize: 18,
		lineHeight: 22,
		fontWeight: "800",
	},
	cardMeta: {
		fontSize: 13,
		lineHeight: 18,
	},
	intentPill: {
		borderRadius: 999,
		paddingHorizontal: 12,
		paddingVertical: 8,
		alignSelf: "flex-start",
	},
	intentLabel: {
		fontSize: 12,
		lineHeight: 16,
		fontWeight: "800",
		textTransform: "uppercase",
	},
	cardBottom: {
		gap: 2,
	},
	renewalLabel: {
		fontSize: 14,
		lineHeight: 18,
		fontWeight: "700",
	},
	renewalMeta: {
		fontSize: 13,
		lineHeight: 18,
	},
	helper: {
		fontSize: 13,
		lineHeight: 18,
	},
	fabWrap: {
		position: "absolute",
		left: spacing.lg,
		bottom: 96,
	},
});
