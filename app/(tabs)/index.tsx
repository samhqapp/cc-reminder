import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { AddCardSheet } from "@/components/card/AddCardSheet";
import { NoteSheet } from "@/components/card/NoteSheet";
import { useColorScheme } from "@/components/useColorScheme";
import { FloatingAddButton } from "@/components/ui/FloatingAddButton";
import { PressableScale } from "@/components/ui/PressableScale";
import Colors from "@/constants/Colors";
import { hairline, radius, spacing, type as typeTokens } from "@/constants/Tokens";
import { findCompanyPreset } from "@/data/companyPresets";
import { useCards } from "@/hooks/useCards";
import type { Card } from "@/types/domain";
import { formatFullDate, getNextOccurrence, relativeDayLabel } from "@/utils/date";

export default function CardsScreen() {
	const colorScheme = useColorScheme() ?? "light";
	const palette = Colors[colorScheme];
	const insets = useSafeAreaInsets();
	const { cards, createCard, defaultDraft, tagPool } = useCards();
	const [isAddOpen, setIsAddOpen] = useState(false);
	const [selectedCard, setSelectedCard] = useState<Card | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [activeTag, setActiveTag] = useState<string | null>(null);

	const starterDraft = useMemo(() => defaultDraft(), [defaultDraft]);

	const filteredCards = useMemo(() => {
		let result = cards;
		if (activeTag) {
			result = result.filter((c) => c.tags.includes(activeTag));
		}
		const q = searchQuery.trim().toLowerCase();
		if (q) {
			result = result.filter(
				(c) =>
					c.name.toLowerCase().includes(q) ||
					c.last4.includes(q) ||
					c.provider.toLowerCase().includes(q) ||
					c.tags.some((t) => t.toLowerCase().includes(q)),
			);
		}
		return result;
	}, [cards, searchQuery, activeTag]);

	const fabBottom = insets.bottom + 52 + 16;

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

				{/* Search */}
				<View
					style={[
						styles.searchBar,
						{ backgroundColor: palette.cardAlt, borderColor: palette.border },
					]}
				>
					<Text style={[styles.searchIcon, { color: palette.muted }]}>
						&#x2315;
					</Text>
					<TextInput
						style={[styles.searchInput, { color: palette.text }]}
						placeholder="Search name, last 4, provider, tag..."
						placeholderTextColor={palette.muted}
						value={searchQuery}
						onChangeText={setSearchQuery}
						returnKeyType="search"
					/>
					{searchQuery ? (
						<PressableScale
							onPress={() => setSearchQuery("")}
							contentStyle={styles.clearBtn}
						>
							<Text style={{ color: palette.muted, fontSize: 16 }}>x</Text>
						</PressableScale>
					) : null}
				</View>

				{/* Tag filter chips */}
				{tagPool.length > 0 ? (
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						contentContainerStyle={styles.tagRow}
					>
						{activeTag ? (
							<PressableScale
								onPress={() => setActiveTag(null)}
								contentStyle={[
									styles.tagChip,
									{ borderColor: palette.border },
								]}
							>
								<Text style={[styles.tagLabel, { color: palette.muted }]}>
									All
								</Text>
							</PressableScale>
						) : null}
						{tagPool.map((tag) => {
							const active = activeTag === tag;
							return (
								<PressableScale
									key={tag}
									onPress={() => setActiveTag(active ? null : tag)}
									contentStyle={[
										styles.tagChip,
										{
											backgroundColor: active ? palette.primary : "transparent",
											borderColor: active ? palette.primary : palette.border,
										},
									]}
								>
									<Text
										style={[
											styles.tagLabel,
											{ color: active ? palette.onPrimary : palette.body },
										]}
									>
										{tag}
									</Text>
								</PressableScale>
							);
						})}
					</ScrollView>
				) : null}

				{filteredCards.length === 0 ? (
					<View
						style={[
							styles.emptyCard,
							{ backgroundColor: palette.surface, borderColor: palette.border },
						]}
					>
						<Text style={[styles.emptyTitle, { color: palette.text }]}>
							{cards.length === 0 ? "No cards yet" : "No matches"}
						</Text>
						<Text style={[styles.emptyBody, { color: palette.muted }]}>
							{cards.length === 0
								? "Tap the + button to save your first subscription card."
								: "Try a different search or clear the filter."}
						</Text>
					</View>
				) : null}

				<View style={styles.list}>
					{filteredCards.map((card) => {
						const companyTheme = findCompanyPreset(
							card.provider,
							card.companyKey,
						);
						const nextRenewal = getNextOccurrence(card.dueDay);
						const dayLabel = relativeDayLabel(nextRenewal);

						return (
							<PressableScale
								key={card.id}
								onPress={() => router.push(`/card/${card.id}` as never)}
								contentStyle={[
									styles.card,
									{
										backgroundColor: palette.card,
										borderColor: palette.border,
									},
								]}
							>
								<View style={styles.cardHeader}>
									<View
										style={[
											styles.logoBadge,
											{
												backgroundColor:
													companyTheme?.accent ?? palette.primary,
											},
										]}
									>
										<Text style={styles.logoLabel}>
											{card.provider.slice(0, 2).toUpperCase()}
										</Text>
									</View>
									<View style={styles.cardTextGroup}>
										<Text
											style={[styles.cardTitle, { color: palette.text }]}
											numberOfLines={1}
										>
											{card.name}
										</Text>
										<Text style={[styles.cardMeta, { color: palette.muted }]}>
											{card.provider} · •••• {card.last4}
										</Text>
									</View>
									<View
										style={[
											styles.intentDot,
											{
												backgroundColor:
													card.intent === "cancel"
														? palette.danger
														: palette.success,
											},
										]}
									/>
								</View>

								<View style={[styles.cardFooter, { borderTopColor: palette.border }]}>
									<Text style={[styles.renewalLabel, { color: palette.body }]}>
										{dayLabel}
									</Text>
									<Text style={[styles.renewalDate, { color: palette.muted }]}>
										{formatFullDate(nextRenewal)}
									</Text>
								</View>

								{card.tags.length > 0 ? (
									<View style={styles.cardTags}>
										{card.tags.map((tag) => (
											<View
												key={tag}
												style={[styles.cardTagChip, { backgroundColor: palette.surface }]}
											>
												<Text style={[styles.cardTagLabel, { color: palette.muted }]}>
													{tag}
												</Text>
											</View>
										))}
									</View>
								) : null}
							</PressableScale>
						);
					})}
				</View>
			</ScrollView>

			<View style={[styles.fabWrap, { bottom: fabBottom }]}>
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
		paddingBottom: 120,
		gap: spacing.md,
	},
	pageTitle: {
		...typeTokens.displayLg,
		marginBottom: spacing.xs,
	},
	searchBar: {
		flexDirection: "row",
		alignItems: "center",
		borderWidth: hairline,
		borderRadius: radius.sm,
		paddingHorizontal: spacing.sm,
		height: 44,
		gap: spacing.xs,
	},
	searchIcon: {
		fontSize: 18,
	},
	searchInput: {
		flex: 1,
		...typeTokens.body,
		paddingVertical: 0,
	},
	clearBtn: {
		padding: 4,
	},
	tagRow: {
		flexDirection: "row",
		gap: spacing.xs,
		paddingVertical: 2,
	},
	tagChip: {
		borderWidth: hairline,
		borderRadius: radius.pill,
		paddingHorizontal: spacing.sm,
		paddingVertical: 6,
	},
	tagLabel: {
		...typeTokens.caption,
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
	list: {
		gap: spacing.sm,
	},
	card: {
		borderWidth: hairline,
		borderRadius: radius.lg,
		padding: spacing.md,
		gap: spacing.sm,
	},
	cardHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.sm,
	},
	logoBadge: {
		width: 40,
		height: 40,
		borderRadius: radius.md,
		alignItems: "center",
		justifyContent: "center",
	},
	logoLabel: {
		color: "#ffffff",
		fontSize: 13,
		fontWeight: "500",
		letterSpacing: 0.5,
	},
	cardTextGroup: {
		flex: 1,
	},
	cardTitle: {
		...typeTokens.titleSm,
		marginBottom: 1,
	},
	cardMeta: {
		...typeTokens.legal,
	},
	intentDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
	},
	cardFooter: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		borderTopWidth: hairline,
		paddingTop: spacing.xs,
	},
	renewalLabel: {
		...typeTokens.caption,
	},
	renewalDate: {
		...typeTokens.legal,
	},
	cardTags: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 6,
	},
	cardTagChip: {
		borderRadius: radius.xs,
		paddingHorizontal: 8,
		paddingVertical: 3,
	},
	cardTagLabel: {
		...typeTokens.legal,
	},
	fabWrap: {
		position: "absolute",
		right: spacing.lg,
	},
});
