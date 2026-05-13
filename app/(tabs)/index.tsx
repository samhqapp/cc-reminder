import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
	Image,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
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
import { getNextOccurrence, relativeDayLabel } from "@/utils/date";

const trackerArt = require("../../assets/images/onboarding/track-renewals.png");

type RenewalItem = {
	card: Card;
	nextRenewal: Date;
	dayLabel: string;
};

export default function CardsScreen() {
	const insets = useSafeAreaInsets();
	const { cards, createCard, defaultDraft, tagPool } = useCards();
	const [isAddOpen, setIsAddOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [activeTag, setActiveTag] = useState<string | null>(null);

	const starterDraft = useMemo(() => defaultDraft(), [defaultDraft]);

	const renewalItems = useMemo(
		() =>
			cards
				.map((card) => {
					const nextRenewal = getNextOccurrence(card.dueDay);
					return {
						card,
						nextRenewal,
						dayLabel: relativeDayLabel(nextRenewal),
					};
				})
				.sort(
					(left, right) =>
						left.nextRenewal.getTime() - right.nextRenewal.getTime(),
				),
		[cards],
	);

	const filteredItems = useMemo(() => {
		let result = renewalItems;
		if (activeTag) {
			result = result.filter(({ card }) => card.tags.includes(activeTag));
		}

		const q = searchQuery.trim().toLowerCase();
		if (q) {
			result = result.filter(({ card }) => {
				return (
					card.name.toLowerCase().includes(q) ||
					card.last4.includes(q) ||
					card.provider.toLowerCase().includes(q) ||
					card.tags.some((tag) => tag.toLowerCase().includes(q))
				);
			});
		}

		return result;
	}, [activeTag, renewalItems, searchQuery]);

	const nextUp = filteredItems[0] ?? renewalItems[0] ?? null;
	const fabBottom = insets.bottom + 92;

	return (
		<ScreenScaffold
			world="billing"
			kicker={monthKicker()}
			title="Billing Dates"
			subtitle="A larger, glanceable view of what renews next. Renewal dates only, no spending feed."
			afterScroll={
				cards.length > 0 ? (
					<View style={[styles.fabWrap, { bottom: fabBottom }]}>
						<FloatingAddButton onPress={() => setIsAddOpen(true)} />
					</View>
				) : null
			}
		>
			<MonthRibbon items={renewalItems} />

			<View style={styles.searchStack}>
				<View style={styles.searchBar}>
					<Ionicons
						name="search-outline"
						size={19}
						color="rgba(21, 24, 33, 0.5)"
					/>
					<TextInput
						style={styles.searchInput}
						placeholder="Search provider, ending, tag..."
						placeholderTextColor="rgba(21, 24, 33, 0.48)"
						value={searchQuery}
						onChangeText={setSearchQuery}
						returnKeyType="search"
					/>
					{searchQuery ? (
						<PressableScale
							onPress={() => setSearchQuery("")}
							contentStyle={styles.clearBtn}
						>
							<Text style={styles.clearLabel}>Clear</Text>
						</PressableScale>
					) : null}
				</View>

				{tagPool.length > 0 ? (
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						contentContainerStyle={styles.tagRow}
					>
						{activeTag ? (
							<TagChip label="All" active={false} onPress={() => setActiveTag(null)} />
						) : null}
						{tagPool.map((tag) => (
							<TagChip
								key={tag}
								label={tag}
								active={activeTag === tag}
								onPress={() => setActiveTag(activeTag === tag ? null : tag)}
							/>
						))}
					</ScrollView>
				) : null}
			</View>

			<AnimatedAppear delay={80}>
				<NextUpPanel item={nextUp} onAdd={() => setIsAddOpen(true)} />
			</AnimatedAppear>

			{filteredItems.length === 0 ? (
				<AnimatedAppear delay={140}>
					<PaperPanel style={styles.emptyPanel}>
						<Text style={styles.emptyTitle}>
							{cards.length === 0 ? "No cards yet" : "No matches"}
						</Text>
						<Text style={styles.emptyBody}>
							{cards.length === 0
								? "Add a card label and renewal day to start the ledger."
								: "Try another search or clear the selected tag."}
						</Text>
					</PaperPanel>
				</AnimatedAppear>
			) : null}

			<View style={styles.renewalStack}>
				{filteredItems.map((item, index) => (
					<AnimatedAppear key={item.card.id} delay={150 + index * 45}>
						<RenewalRow item={item} />
					</AnimatedAppear>
				))}
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

function MonthRibbon({ items }: { items: RenewalItem[] }) {
	const ribbonItems = items.slice(0, 5);
	const fallback = createFallbackDays(5 - ribbonItems.length);

	return (
		<View style={styles.monthRibbon}>
			{ribbonItems.map((item, index) => (
				<View
					key={item.card.id}
					style={[styles.monthDay, index === 0 && styles.monthDayActive]}
				>
					<Text
						style={[
							styles.monthDayNumber,
							index === 0 && styles.monthDayNumberActive,
						]}
					>
						{dayNumber(item.nextRenewal)}
					</Text>
					<Text
						style={[
							styles.monthDayLabel,
							index === 0 && styles.monthDayLabelActive,
						]}
					>
						{weekday(item.nextRenewal)}
					</Text>
				</View>
			))}
			{fallback.map((date) => (
				<View key={date.toISOString()} style={styles.monthDayGhost}>
					<Text style={styles.monthDayNumber}>{dayNumber(date)}</Text>
					<Text style={styles.monthDayLabel}>{weekday(date)}</Text>
				</View>
			))}
		</View>
	);
}

function NextUpPanel({
	item,
	onAdd,
}: {
	item: RenewalItem | null;
	onAdd: () => void;
}) {
	const card = item?.card;

	return (
		<PaperPanel style={styles.nextPanel}>
			<View style={styles.nextCopy}>
				<View style={styles.nextLabel}>
					<View style={styles.nextLabelDot} />
					<Text style={styles.nextLabelText}>Next Up</Text>
				</View>
				<Text style={styles.nextTitle}>
					{card ? card.name : "Start Your Renewal Ledger"}
				</Text>
				<Text style={styles.nextBody}>
					{card
						? `${formatCardMeta(card)}. Renewal date saved, no spending data needed.`
						: "Save the card label, last four digits, and the day you want to remember."}
				</Text>
				{!card ? (
					<PressableScale onPress={onAdd} contentStyle={styles.inlineAdd}>
						<Text style={styles.inlineAddLabel}>Add First Date</Text>
					</PressableScale>
				) : null}
			</View>
			<View style={styles.dateStamp}>
				<Text style={styles.dateStampDay}>
					{item ? dayNumber(item.nextRenewal) : "--"}
				</Text>
				<Text style={styles.dateStampMonth}>
					{item ? monthShort(item.nextRenewal) : "Date"}
				</Text>
			</View>
			<Image source={trackerArt} style={styles.trackerArt} resizeMode="contain" />
		</PaperPanel>
	);
}

function RenewalRow({ item }: { item: RenewalItem }) {
	const { card, nextRenewal, dayLabel } = item;
	const intentLabel = card.intent === "cancel" ? "Cancel" : "Keep";

	return (
		<PressableScale
			accessibilityRole="button"
			onPress={() => router.push(`/card/${card.id}` as never)}
			contentStyle={styles.renewalRow}
		>
			<View style={styles.renewalDate}>
				<Text style={styles.renewalDateDay}>{dayNumber(nextRenewal)}</Text>
				<Text style={styles.renewalDateMonth}>{monthShort(nextRenewal)}</Text>
			</View>
			<View style={styles.renewalCopy}>
				<Text style={styles.renewalName} numberOfLines={1}>
					{card.name}
				</Text>
				<Text style={styles.renewalMeta} numberOfLines={1}>
					{formatCardMeta(card)} - {dayLabel}
				</Text>
			</View>
			<View
				style={[
					styles.intentPill,
					card.intent === "cancel" && styles.intentPillWarn,
				]}
			>
				<Text style={styles.intentLabel}>{intentLabel}</Text>
			</View>
		</PressableScale>
	);
}

function TagChip({
	label,
	active,
	onPress,
}: {
	label: string;
	active: boolean;
	onPress: () => void;
}) {
	return (
		<PressableScale
			onPress={onPress}
			contentStyle={[styles.tagChip, active && styles.tagChipActive]}
		>
			<Text style={[styles.tagLabel, active && styles.tagLabelActive]}>
				{label}
			</Text>
		</PressableScale>
	);
}

function monthKicker() {
	return new Intl.DateTimeFormat(undefined, {
		month: "long",
	}).format(new Date()) + " Ledger";
}

function dayNumber(date: Date) {
	return new Intl.DateTimeFormat(undefined, { day: "2-digit" }).format(date);
}

function monthShort(date: Date) {
	return new Intl.DateTimeFormat(undefined, { month: "short" }).format(date);
}

function weekday(date: Date) {
	return new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(date);
}

function formatCardMeta(card: Card) {
	return card.last4 ? `${card.provider} ending ${card.last4}` : card.provider;
}

function createFallbackDays(count: number) {
	const today = new Date();
	return Array.from({ length: Math.max(0, count) }, (_, index) => {
		const date = new Date(today);
		date.setDate(today.getDate() + index * 4);
		return date;
	});
}

const styles = StyleSheet.create({
	monthRibbon: {
		flexDirection: "row",
		gap: 7,
		marginBottom: spacing.md,
	},
	monthDay: {
		...shadow.soft,
		flex: 1,
		minHeight: 58,
		borderRadius: 14,
		paddingVertical: 9,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "rgba(255, 255, 255, 0.36)",
		borderWidth: hairline,
		borderColor: "rgba(21, 24, 33, 0.1)",
	},
	monthDayGhost: {
		flex: 1,
		minHeight: 58,
		borderRadius: 14,
		paddingVertical: 9,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "rgba(255, 255, 255, 0.2)",
		borderWidth: hairline,
		borderColor: "rgba(21, 24, 33, 0.08)",
		opacity: 0.68,
	},
	monthDayActive: {
		backgroundColor: "rgba(21, 24, 33, 0.88)",
		transform: [{ translateY: -3 }],
	},
	monthDayNumber: {
		...typeTokens.titleSm,
		color: "rgba(21, 24, 33, 0.58)",
	},
	monthDayNumberActive: {
		color: stylepass.cream,
	},
	monthDayLabel: {
		...typeTokens.legal,
		marginTop: 4,
		color: "rgba(21, 24, 33, 0.58)",
		textTransform: "uppercase",
		letterSpacing: 0.8,
	},
	monthDayLabelActive: {
		color: "rgba(255, 247, 233, 0.76)",
	},
	nextPanel: {
		minHeight: 214,
		padding: 17,
		overflow: "hidden",
		marginBottom: spacing.md,
	},
	nextCopy: {
		maxWidth: 190,
		zIndex: 2,
	},
	nextLabel: {
		alignSelf: "flex-start",
		minHeight: 28,
		borderRadius: radius.lg,
		paddingHorizontal: 12,
		flexDirection: "row",
		alignItems: "center",
		gap: 7,
		backgroundColor: screenWorld.billing.accentSoft,
	},
	nextLabelDot: {
		width: 7,
		height: 7,
		borderRadius: 4,
		backgroundColor: screenWorld.billing.accent,
	},
	nextLabelText: {
		...typeTokens.legal,
		color: "rgba(21, 24, 33, 0.68)",
		textTransform: "uppercase",
		letterSpacing: 0.7,
	},
	nextTitle: {
		...typeTokens.displayMd,
		marginTop: spacing.md,
		color: stylepass.ink,
	},
	nextBody: {
		...typeTokens.legal,
		marginTop: spacing.xs,
		color: "rgba(21, 24, 33, 0.63)",
	},
	dateStamp: {
		position: "absolute",
		zIndex: 3,
		right: 16,
		top: 28,
		width: 74,
		height: 76,
		borderRadius: radius.lg,
		alignItems: "center",
		justifyContent: "center",
		paddingTop: 2,
		backgroundColor: "rgba(21, 24, 33, 0.9)",
		...shadow.soft,
	},
	dateStampDay: {
		fontFamily: typeTokens.displayMd.fontFamily,
		fontSize: 34,
		lineHeight: 40,
		color: stylepass.cream,
	},
	dateStampMonth: {
		...typeTokens.legal,
		marginTop: 4,
		color: "rgba(255, 247, 233, 0.74)",
		textTransform: "uppercase",
		letterSpacing: 1,
	},
	trackerArt: {
		position: "absolute",
		right: -116,
		bottom: -318,
		width: 250,
		height: 410,
		opacity: 0.9,
	},
	inlineAdd: {
		alignSelf: "flex-start",
		marginTop: spacing.md,
		minHeight: 38,
		paddingHorizontal: spacing.md,
		borderRadius: radius.lg,
		justifyContent: "center",
		backgroundColor: "rgba(92, 76, 115, 0.9)",
	},
	inlineAddLabel: {
		...typeTokens.caption,
		color: stylepass.cream,
	},
	searchStack: {
		gap: spacing.sm,
		marginBottom: spacing.md,
	},
	searchBar: {
		flexDirection: "row",
		alignItems: "center",
		minHeight: 48,
		borderRadius: radius.lg,
		paddingHorizontal: spacing.md,
		gap: spacing.xs,
		backgroundColor: "rgba(255, 255, 255, 0.38)",
		borderWidth: hairline,
		borderColor: "rgba(21, 24, 33, 0.1)",
	},
	searchInput: {
		flex: 1,
		...typeTokens.body,
		color: stylepass.ink,
		paddingVertical: 0,
	},
	clearBtn: {
		paddingHorizontal: 8,
		paddingVertical: 5,
	},
	clearLabel: {
		...typeTokens.legal,
		color: stylepass.plum,
	},
	tagRow: {
		gap: spacing.xs,
		paddingVertical: 2,
	},
	tagChip: {
		borderWidth: hairline,
		borderColor: "rgba(21, 24, 33, 0.12)",
		borderRadius: radius.lg,
		paddingHorizontal: 14,
		paddingVertical: 8,
		backgroundColor: "rgba(255, 255, 255, 0.32)",
	},
	tagChipActive: {
		backgroundColor: "rgba(21, 24, 33, 0.86)",
		borderColor: "rgba(21, 24, 33, 0.86)",
	},
	tagLabel: {
		...typeTokens.legal,
		color: "rgba(21, 24, 33, 0.68)",
	},
	tagLabelActive: {
		color: stylepass.cream,
	},
	emptyPanel: {
		padding: spacing.lg,
		gap: spacing.xs,
		marginBottom: spacing.md,
	},
	emptyTitle: {
		...typeTokens.titleLg,
		color: stylepass.ink,
	},
	emptyBody: {
		...typeTokens.body,
		color: stylepass.body,
	},
	renewalStack: {
		gap: 9,
	},
	renewalRow: {
		...shadow.soft,
		minHeight: 68,
		borderRadius: radius.xl,
		borderWidth: hairline,
		borderColor: "rgba(21, 24, 33, 0.1)",
		backgroundColor: "rgba(255, 255, 255, 0.42)",
		padding: 10,
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
	},
	renewalDate: {
		width: 48,
		height: 48,
		borderRadius: 13,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: screenWorld.billing.accentSoft,
	},
	renewalDateDay: {
		...typeTokens.titleSm,
		color: "rgba(21, 24, 33, 0.75)",
	},
	renewalDateMonth: {
		...typeTokens.legal,
		marginTop: 2,
		color: "rgba(21, 24, 33, 0.58)",
		textTransform: "uppercase",
		letterSpacing: 0.7,
	},
	renewalCopy: {
		flex: 1,
		minWidth: 0,
	},
	renewalName: {
		...typeTokens.titleSm,
		color: stylepass.ink,
	},
	renewalMeta: {
		...typeTokens.legal,
		marginTop: 4,
		color: "rgba(21, 24, 33, 0.56)",
	},
	intentPill: {
		minWidth: 58,
		minHeight: 28,
		borderRadius: radius.lg,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 12,
		backgroundColor: "rgba(55, 93, 72, 0.9)",
	},
	intentPillWarn: {
		backgroundColor: "rgba(140, 75, 53, 0.9)",
	},
	intentLabel: {
		...typeTokens.legal,
		color: stylepass.cream,
	},
	fabWrap: {
		position: "absolute",
		right: spacing.lg,
		zIndex: 30,
	},
});
