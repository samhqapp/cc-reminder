import { router } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AddCardSheet } from "@/components/card/AddCardSheet";
import { NoteSheet } from "@/components/card/NoteSheet";
import { useColorScheme } from "@/components/useColorScheme";
import { FloatingAddButton } from "@/components/ui/FloatingAddButton";
import { Button } from "@/components/ui/Button";
import Colors from "@/constants/Colors";
import { radius, shadow, spacing, thickness } from "@/constants/Tokens";
import { findCompanyPreset } from "@/data/companyPresets";
import { useCards } from "@/hooks/useCards";
import type { Card } from "@/types/domain";
import { formatFullDate, getNextOccurrence, relativeDayLabel } from "@/utils/date";

export default function CardsScreen() {
	const colorScheme = useColorScheme() ?? "light";
	const palette = Colors[colorScheme];
	const { cards, createCard, defaultDraft } = useCards();
	const [isAddOpen, setIsAddOpen] = useState(false);
	const [selectedCard, setSelectedCard] = useState<Card | null>(null);

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
				<Text style={[styles.pageTitle, { color: palette.text }]}>Cards</Text>

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

				<View style={styles.list}>
					{cards.map((card) => {
						const companyTheme = findCompanyPreset(
							card.provider,
							card.companyKey,
						);
						const nextRenewal = getNextOccurrence(card.dueDay);

						return (
							<View
								key={card.id}
								style={[
									styles.card,
									{
										backgroundColor: palette.card,
										borderColor: palette.border,
										borderBottomColor: palette.border3D,
									},
								]}
							>
								<View style={styles.cardHeader}>
									<View
										style={[
											styles.logoBadge,
											{
												backgroundColor: companyTheme?.accent ?? palette.primary,
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
									<View style={styles.cardTextGroup}>
										<Text style={[styles.cardTitle, { color: palette.text }]}>
											{card.name}
										</Text>
										<Text style={[styles.cardMeta, { color: palette.muted }]}>
											{card.provider} · •••• {card.last4}
										</Text>
									</View>
								</View>

								<View style={styles.cardInfo}>
									<Text style={[styles.renewalLabel, { color: palette.text }]}>
										Next renewal {relativeDayLabel(nextRenewal)}
									</Text>
									<Text style={[styles.renewalMeta, { color: palette.muted }]}>
										{formatFullDate(nextRenewal)}
									</Text>
								</View>

								<View style={styles.cardActions}>
									<Button 
										title="Details" 
										variant="secondary" 
										style={{ flex: 1 }}
										onPress={() => router.push(`/card/${card.id}` as never)}
									/>
									<Button 
										title={card.intent === "cancel" ? "Cancel" : "Keep"} 
										variant={card.intent === "cancel" ? "danger" : "primary"}
										style={{ flex: 1 }}
										onPress={() => setSelectedCard(card)}
									/>
								</View>
							</View>
						);
					})}
				</View>
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
	list: {
		gap: spacing.lg,
	},
	card: {
		borderWidth: thickness.border,
		borderBottomWidth: thickness.border3D,
		borderRadius: radius.xl,
		padding: spacing.xl,
		gap: spacing.lg,
	},
	cardHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.md,
	},
	logoBadge: {
		width: 48,
		height: 48,
		borderRadius: radius.md,
		alignItems: "center",
		justifyContent: "center",
	},
	logoLabel: {
		fontFamily: "Nunito_900Black",
		fontSize: 16,
	},
	cardTextGroup: {
		flex: 1,
	},
	cardTitle: {
		fontFamily: "Nunito_800ExtraBold",
		fontSize: 20,
		marginBottom: 2,
	},
	cardMeta: {
		fontFamily: "Nunito_700Bold",
		fontSize: 14,
	},
	cardInfo: {
		gap: 2,
	},
	renewalLabel: {
		fontFamily: "Nunito_700Bold",
		fontSize: 16,
	},
	renewalMeta: {
		fontFamily: "Nunito_600SemiBold",
		fontSize: 14,
	},
	cardActions: {
		flexDirection: "row",
		gap: spacing.sm,
		marginTop: spacing.xs,
	},
	fabWrap: {
		position: "absolute",
		left: spacing.xl,
		bottom: 110,
	},
});
