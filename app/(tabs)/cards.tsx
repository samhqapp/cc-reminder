import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AddCardSheet } from "@/components/card/AddCardSheet";
import { FloatingAddButton } from "@/components/ui/FloatingAddButton";
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
	shadow,
	spacing,
	stylepass,
	type as typeTokens,
} from "@/constants/Tokens";
import { useCards } from "@/hooks/useCards";
import type { Card } from "@/types/domain";

export default function CardsManagerScreen() {
	const { cards, createCard, defaultDraft } = useCards();
	const [isAddOpen, setIsAddOpen] = useState(false);
	const [showInfoCard, setShowInfoCard] = useState(true);
	const starterDraft = useMemo(() => defaultDraft(), [defaultDraft]);
	const insets = useSafeAreaInsets();
	const fabBottom = insets.bottom + 92;

	return (
		<ScreenScaffold
			world="paper"
			kicker="Card Stack"
			title="Cards"
			subtitle="A single place to enter card labels, renewal days, notes, and tags."
			afterScroll={
				<View style={[styles.fabWrap, { bottom: fabBottom }]}>
					<FloatingAddButton onPress={() => setIsAddOpen(true)} />
				</View>
			}
		>
			{showInfoCard ? (
				<AnimatedAppear delay={80}>
					<PaperPanel style={styles.entryPanel}>
						<Pressable
							accessibilityRole="button"
							accessibilityLabel="Hide card info"
							onPress={() => setShowInfoCard(false)}
							hitSlop={10}
							style={styles.dismissButton}
						>
							<Ionicons name="close" size={17} color="rgba(21, 24, 33, 0.62)" />
						</Pressable>
						<View style={styles.entryIcon}>
							<Ionicons name="albums-outline" size={24} color={stylepass.ink} />
						</View>
						<View style={styles.entryCopy}>
							<Text style={styles.entryTitle}>Manage Renewal Cards</Text>
							<Text style={styles.entryBody}>
								Open any stacked card to edit renewal details, notes, tags, or reminders.
							</Text>
						</View>
					</PaperPanel>
				</AnimatedAppear>
			) : null}

			<View style={styles.cardStack}>
				{cards.length === 0 ? (
					<AnimatedAppear delay={140}>
						<PaperPanel style={styles.emptyPanel}>
							<Text style={styles.emptyTitle}>No cards entered</Text>
							<Text style={styles.emptyBody}>
								Start with a company or label and a renewal day.
							</Text>
						</PaperPanel>
					</AnimatedAppear>
				) : (
					cards.map((card, index) => (
						<AnimatedAppear key={card.id} delay={130 + index * 45}>
							<ManagedCard card={card} />
						</AnimatedAppear>
					))
				)}
			</View>

			<AddCardSheet
				visible={isAddOpen}
				initialDraft={starterDraft}
				onClose={() => setIsAddOpen(false)}
				onSubmit={createCard}
			/>
		</ScreenScaffold>
	);
}

function ManagedCard({ card }: { card: Card }) {
	const tags = card.tags.slice(0, 3);

	return (
		<PressableScale
			accessibilityRole="button"
			onPress={() => router.push(`/card/${card.id}` as never)}
			contentStyle={styles.managedCard}
		>
			<View style={styles.cardAccent} />
			<View style={styles.cardCopy}>
				<Text style={styles.cardName} numberOfLines={1}>
					{card.name}
				</Text>
				<Text style={styles.cardMeta} numberOfLines={1}>
					{formatCardMeta(card)}
				</Text>
				<View style={styles.detailRow}>
					<View style={styles.dateBadge}>
						<Text style={styles.dateBadgeLabel}>Renews</Text>
						<Text style={styles.dateBadgeValue}>Day {card.dueDay}</Text>
					</View>
					{tags.length > 0 ? (
						<View style={styles.tagRow}>
							{tags.map((tag) => (
								<View key={tag} style={styles.tagPill}>
									<Text style={styles.tagLabel}>{tag}</Text>
								</View>
							))}
						</View>
					) : null}
				</View>
			</View>
			<View style={styles.managePill}>
				<Text style={styles.manageLabel}>Manage</Text>
				<Ionicons name="chevron-forward" size={16} color={stylepass.cream} />
			</View>
		</PressableScale>
	);
}

function formatCardMeta(card: Card) {
	return card.last4 ? `${card.provider} ending ${card.last4}` : card.provider;
}

const styles = StyleSheet.create({
	entryPanel: {
		position: "relative",
		padding: spacing.md,
		gap: spacing.sm,
		marginBottom: spacing.lg,
	},
	dismissButton: {
		position: "absolute",
		top: spacing.sm,
		right: spacing.sm,
		zIndex: 2,
		width: 34,
		height: 34,
		alignItems: "center",
		justifyContent: "center",
	},
	entryIcon: {
		width: 48,
		height: 48,
		borderRadius: 16,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: screenWorld.paper.accentSoft,
	},
	entryCopy: {
		gap: spacing.xs,
	},
	entryTitle: {
		...typeTokens.titleLg,
		color: stylepass.ink,
	},
	entryBody: {
		...typeTokens.body,
		color: "rgba(21, 24, 33, 0.64)",
	},
	cardStack: {
		gap: spacing.sm,
	},
	emptyPanel: {
		padding: spacing.lg,
		gap: spacing.xs,
	},
	emptyTitle: {
		...typeTokens.titleLg,
		color: stylepass.ink,
	},
	emptyBody: {
		...typeTokens.body,
		color: stylepass.body,
	},
	managedCard: {
		...shadow.soft,
		minHeight: 118,
		borderRadius: radius.xl,
		borderWidth: hairline,
		borderColor: "rgba(21, 24, 33, 0.1)",
		backgroundColor: "rgba(255, 255, 255, 0.46)",
		padding: spacing.md,
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.sm,
	},
	cardAccent: {
		width: 6,
		alignSelf: "stretch",
		borderRadius: radius.pill,
		backgroundColor: screenWorld.paper.accent,
		opacity: 0.82,
	},
	cardCopy: {
		flex: 1,
		minWidth: 0,
		gap: spacing.xs,
	},
	cardName: {
		...typeTokens.titleMd,
		color: stylepass.ink,
	},
	cardMeta: {
		...typeTokens.body,
		color: "rgba(21, 24, 33, 0.64)",
	},
	detailRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.xs,
		flexWrap: "wrap",
	},
	dateBadge: {
		borderRadius: radius.md,
		paddingHorizontal: spacing.sm,
		paddingVertical: spacing.xs,
		backgroundColor: screenWorld.paper.accentSoft,
	},
	dateBadgeLabel: {
		...typeTokens.legal,
		color: "rgba(21, 24, 33, 0.54)",
		textTransform: "uppercase",
		letterSpacing: 0.8,
	},
	dateBadgeValue: {
		...typeTokens.caption,
		color: stylepass.ink,
	},
	tagRow: {
		flexDirection: "row",
		gap: spacing.xs,
		flexWrap: "wrap",
		flex: 1,
		minWidth: 0,
	},
	tagPill: {
		borderRadius: radius.md,
		paddingHorizontal: 12,
		paddingVertical: 6,
		backgroundColor: "rgba(255, 247, 233, 0.62)",
		borderWidth: hairline,
		borderColor: "rgba(21, 24, 33, 0.1)",
	},
	tagLabel: {
		...typeTokens.legal,
		color: "rgba(21, 24, 33, 0.64)",
	},
	managePill: {
		borderRadius: radius.lg,
		minHeight: 34,
		paddingHorizontal: 13,
		alignItems: "center",
		justifyContent: "center",
		flexDirection: "row",
		gap: 2,
		backgroundColor: "rgba(21, 24, 33, 0.88)",
	},
	manageLabel: {
		...typeTokens.legal,
		color: stylepass.cream,
	},
	fabWrap: {
		position: "absolute",
		right: spacing.lg,
		zIndex: 30,
	},
});
