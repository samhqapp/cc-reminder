import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useColorScheme } from "@/components/useColorScheme";
import { PressableScale } from "@/components/ui/PressableScale";
import Colors, { type AppPalette } from "@/constants/Colors";
import { hairline, radius, spacing, type as typeTokens } from "@/constants/Tokens";
import { useOnboarding } from "@/hooks/useOnboarding";
import { requestNotificationPermission } from "@/utils/notifications";

type Step = {
	kicker: string;
	title: string;
	body: string;
	surface: (palette: AppPalette) => string;
	mockUI: (palette: AppPalette) => React.ReactNode;
};

function MockCard({
	name,
	provider,
	last4,
	dueLabel,
	palette,
}: {
	name: string;
	provider: string;
	last4: string;
	dueLabel: string;
	palette: AppPalette;
}) {
	return (
		<View
			style={[
				mockStyles.card,
				{ backgroundColor: palette.card, borderColor: palette.border },
			]}
		>
			<View style={mockStyles.cardRow}>
				<View style={{ flex: 1 }}>
					<Text style={[mockStyles.cardName, { color: palette.text }]}>
						{name}
					</Text>
					<Text style={[mockStyles.cardMeta, { color: palette.muted }]}>
						{provider} · •••• {last4}
					</Text>
				</View>
				<Text style={[mockStyles.dueBadge, { color: palette.body }]}>
					{dueLabel}
				</Text>
			</View>
		</View>
	);
}

function MockReminder({
	name,
	label,
	tone,
	palette,
}: {
	name: string;
	label: string;
	tone: "danger" | "warning" | "success";
	palette: AppPalette;
}) {
	const tc =
		tone === "danger"
			? palette.danger
			: tone === "warning"
				? palette.warning
				: palette.success;
	return (
		<View
			style={[
				mockStyles.reminder,
				{ backgroundColor: palette.card, borderColor: palette.border },
			]}
		>
			<Text style={[mockStyles.reminderBadge, { color: tc }]}>
				{tone === "danger"
					? "OVERDUE"
					: tone === "warning"
						? "DUE SOON"
						: "UPCOMING"}
			</Text>
			<Text style={[mockStyles.reminderName, { color: palette.text }]}>
				{name}
			</Text>
			<Text style={[mockStyles.reminderSub, { color: palette.muted }]}>
				{label}
			</Text>
		</View>
	);
}

function MockNote({
	text,
	from,
	palette,
}: {
	text: string;
	from?: string;
	palette: AppPalette;
}) {
	return (
		<View
			style={[
				mockStyles.note,
				{ backgroundColor: palette.card, borderColor: palette.border },
			]}
		>
			{from ? (
				<Text style={[mockStyles.noteFrom, { color: palette.link }]}>
					{from}
				</Text>
			) : null}
			<Text
				style={[mockStyles.noteText, { color: palette.body }]}
				numberOfLines={3}
			>
				{text}
			</Text>
		</View>
	);
}

const STEPS: Step[] = [
	{
		kicker: "Your cards",
		title: "Track every\nrenewal date",
		body: "Add a card once. The app calculates the next billing date automatically and reminds you before it hits.",
		surface: (p) => p.cream,
		mockUI: (palette) => (
			<View style={{ gap: 8 }}>
				<MockCard
					name="Family plan"
					provider="Netflix"
					last4="4242"
					dueLabel="3 days"
					palette={palette}
				/>
				<MockCard
					name="Premium"
					provider="Spotify"
					last4="1337"
					dueLabel="12 days"
					palette={palette}
				/>
				<MockCard
					name="iCloud 200GB"
					provider="Apple"
					last4="8888"
					dueLabel="Tomorrow"
					palette={palette}
				/>
			</View>
		),
	},
	{
		kicker: "Reminders",
		title: "Decide before\nyou're charged",
		body: "See what's due, flip a card to Cancel or Keep, and mark it as handled. Snooze if you need more time.",
		surface: (p) => p.dangerSoft,
		mockUI: (palette) => (
			<View style={{ gap: 8 }}>
				<MockReminder
					name="Netflix, Family plan"
					label="May 1 · •••• 4242"
					tone="danger"
					palette={palette}
				/>
				<MockReminder
					name="Spotify, Premium"
					label="May 10 · •••• 1337"
					tone="warning"
					palette={palette}
				/>
			</View>
		),
	},
	{
		kicker: "Notes",
		title: "Capture the\ndetails that matter",
		body: "Add quick notes or link them to a card: cancellation links, phone numbers, anything you'd need in the moment.",
		surface: (p) => p.successSoft,
		mockUI: (palette) => (
			<View style={{ gap: 8 }}>
				<MockNote
					from="Netflix"
					text="Cancel via netflix.com/cancel. Do NOT call support, takes 30 min."
					palette={palette}
				/>
				<MockNote
					text="Cancel Gym before 25th. They charge full month even mid-cycle."
					palette={palette}
				/>
			</View>
		),
	},
];

export default function OnboardingScreen() {
	const colorScheme = useColorScheme() ?? "light";
	const palette = Colors[colorScheme];
	const { completeOnboarding } = useOnboarding();
	const [step, setStep] = useState(0);
	const [isContinuing, setIsContinuing] = useState(false);

	const isLast = step === STEPS.length - 1;
	const current = STEPS[step];

	function goNext() {
		if (isLast) {
			void handleFinish();
		} else {
			setStep((s) => s + 1);
		}
	}

	function goPrev() {
		if (step > 0) {
			setStep((s) => s - 1);
		}
	}

	async function handleFinish() {
		if (isContinuing) return;
		setIsContinuing(true);
		await requestNotificationPermission();
		await completeOnboarding();
		router.replace("/(tabs)");
	}

	return (
		<SafeAreaView
			style={[styles.safeArea, { backgroundColor: palette.background }]}
		>
			{/* Progress dots */}
			<View style={styles.dotsRow}>
				{STEPS.map((_, i) => (
					<View
						key={i}
						style={[
							styles.dot,
							{
								backgroundColor:
									i === step ? palette.primary : palette.border,
								width: i === step ? 20 : 6,
							},
						]}
					/>
				))}
			</View>

			<ScrollView
				contentContainerStyle={styles.scroll}
				showsVerticalScrollIndicator={false}
			>
				<View style={styles.header}>
					<Text style={[styles.kicker, { color: palette.link }]}>
						{current.kicker}
					</Text>
					<Text style={[styles.title, { color: palette.text }]}>
						{current.title}
					</Text>
					<Text style={[styles.body, { color: palette.body }]}>
						{current.body}
					</Text>
				</View>

				<View
					style={[
						styles.preview,
						{
							backgroundColor: current.surface(palette),
							borderColor: palette.border,
						},
					]}
				>
					{current.mockUI(palette)}
				</View>

				{isLast ? (
					<View style={[styles.trustBand, { borderColor: palette.border }]}>
						<Text style={[styles.trustTitle, { color: palette.text }]}>
							Your data stays on your device
						</Text>
						<Text style={[styles.trustBody, { color: palette.muted }]}>
							Open source. Fully local. No account required. No logs shipped to
							any server.
						</Text>
					</View>
				) : null}
			</ScrollView>

			<View style={[styles.nav, { borderTopColor: palette.border }]}>
				{step > 0 ? (
					<PressableScale
						onPress={goPrev}
						contentStyle={[styles.backBtn, { borderColor: palette.border }]}
					>
						<Text style={[styles.backLabel, { color: palette.muted }]}>
							Back
						</Text>
					</PressableScale>
				) : (
					<View style={styles.backPlaceholder} />
				)}

				<PressableScale
					onPress={goNext}
					disabled={isContinuing}
					contentStyle={[
						styles.nextBtn,
						{ backgroundColor: palette.primary },
					]}
				>
					<Text style={[styles.nextLabel, { color: palette.onPrimary }]}>
						{isLast
							? isContinuing
								? "Starting..."
								: "Get Started"
							: "Continue"}
					</Text>
				</PressableScale>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
	},
	dotsRow: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		gap: 6,
		paddingTop: spacing.lg,
		paddingBottom: spacing.sm,
	},
	dot: {
		height: 6,
		borderRadius: 3,
	},
	scroll: {
		padding: spacing.lg,
		paddingBottom: spacing.xl,
		gap: spacing.lg,
	},
	header: {
		gap: spacing.sm,
	},
	kicker: {
		...typeTokens.caption,
		textTransform: "uppercase",
		letterSpacing: 1.2,
	},
	title: {
		...typeTokens.displayLg,
	},
	body: {
		...typeTokens.body,
		maxWidth: 340,
	},
	preview: {
		borderWidth: hairline,
		borderRadius: radius.lg,
		padding: spacing.md,
	},
	trustBand: {
		borderWidth: hairline,
		borderRadius: radius.md,
		padding: spacing.md,
		gap: spacing.xxs,
	},
	trustTitle: {
		...typeTokens.titleSm,
	},
	trustBody: {
		...typeTokens.body,
	},
	nav: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: spacing.lg,
		paddingVertical: spacing.md,
		borderTopWidth: hairline,
		gap: spacing.sm,
	},
	backPlaceholder: {
		width: 72,
	},
	backBtn: {
		borderWidth: hairline,
		borderRadius: radius.lg,
		paddingHorizontal: spacing.md,
		paddingVertical: 12,
		alignItems: "center",
		width: 72,
	},
	backLabel: {
		...typeTokens.button,
	},
	nextBtn: {
		flex: 1,
		borderRadius: radius.lg,
		paddingVertical: 14,
		alignItems: "center",
	},
	nextLabel: {
		...typeTokens.button,
	},
});

const mockStyles = StyleSheet.create({
	card: {
		borderWidth: hairline,
		borderRadius: radius.md,
		padding: spacing.sm,
	},
	cardRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.sm,
	},
	cardName: {
		...typeTokens.labelMd,
	},
	cardMeta: {
		...typeTokens.legal,
	},
	dueBadge: {
		...typeTokens.caption,
	},
	reminder: {
		borderWidth: hairline,
		borderRadius: radius.md,
		padding: spacing.sm,
		gap: 3,
	},
	reminderBadge: {
		...typeTokens.legal,
		fontWeight: "500",
		letterSpacing: 0.5,
	},
	reminderName: {
		...typeTokens.labelMd,
	},
	reminderSub: {
		...typeTokens.legal,
	},
	note: {
		borderWidth: hairline,
		borderRadius: radius.md,
		padding: spacing.sm,
		gap: 3,
	},
	noteFrom: {
		...typeTokens.legal,
		fontWeight: "500",
	},
	noteText: {
		...typeTokens.body,
	},
});
