import { router } from "expo-router";
import { useState } from "react";
import {
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useColorScheme } from "@/components/useColorScheme";
import { PressableScale } from "@/components/ui/PressableScale";
import Colors from "@/constants/Colors";
import { radius, spacing, thickness } from "@/constants/Tokens";
import { useOnboarding } from "@/hooks/useOnboarding";
import { requestNotificationPermission } from "@/utils/notifications";


// ─── Mock UI helpers ──────────────────────────────────────────────────────────

function MockCard({
	name,
	provider,
	last4,
	dueLabel,
	accent,
	palette,
}: {
	name: string;
	provider: string;
	last4: string;
	dueLabel: string;
	accent: string;
	palette: (typeof Colors)["light"];
}) {
	return (
		<View
			style={[
				mockStyles.card,
				{ backgroundColor: palette.card, borderColor: palette.border, borderBottomColor: palette.border3D },
			]}
		>
			<View style={mockStyles.cardHeader}>
				<View style={[mockStyles.logoBadge, { backgroundColor: accent }]}>
					<Text style={[mockStyles.logoLabel, { color: "#fff" }]}>
						{provider.slice(0, 2).toUpperCase()}
					</Text>
				</View>
				<View style={{ flex: 1 }}>
					<Text style={[mockStyles.cardName, { color: palette.text }]}>{name}</Text>
					<Text style={[mockStyles.cardMeta, { color: palette.muted }]}>
						{provider} · •••• {last4}
					</Text>
				</View>
				<View style={[mockStyles.dueBadge, { backgroundColor: palette.primarySoft }]}>
					<Text style={[mockStyles.dueLabel, { color: palette.primary }]}>{dueLabel}</Text>
				</View>
			</View>
		</View>
	);
}

function MockReminderTile({
	name,
	label,
	tone,
	palette,
}: {
	name: string;
	label: string;
	tone: "danger" | "warning" | "success";
	palette: (typeof Colors)["light"];
}) {
	const toneColor =
		tone === "danger" ? palette.danger : tone === "warning" ? palette.warning : palette.success;
	return (
		<View
			style={[
				mockStyles.reminder,
				{ backgroundColor: palette.card, borderColor: palette.border, borderBottomColor: palette.border3D },
			]}
		>
			<View style={mockStyles.reminderHeader}>
				<Text style={[mockStyles.reminderBadge, { color: toneColor }]}>
					{tone === "danger" ? "Overdue" : tone === "warning" ? "Due in 3 days" : "Upcoming"}
				</Text>
			</View>
			<Text style={[mockStyles.reminderName, { color: palette.text }]}>{name}</Text>
			<Text style={[mockStyles.reminderSub, { color: palette.muted }]}>{label}</Text>
			<View style={mockStyles.intentRow}>
				<View
					style={[mockStyles.intentChip, { backgroundColor: palette.danger + "22", borderColor: palette.danger + "44" }]}
				>
					<Text style={[mockStyles.intentLabel, { color: palette.danger }]}>Cancel</Text>
				</View>
				<View
					style={[mockStyles.intentChip, { backgroundColor: palette.success + "22", borderColor: palette.success + "44" }]}
				>
					<Text style={[mockStyles.intentLabel, { color: palette.success }]}>Keep</Text>
				</View>
			</View>
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
	palette: (typeof Colors)["light"];
}) {
	return (
		<View
			style={[
				mockStyles.note,
				{ backgroundColor: palette.card, borderColor: palette.borderSoft, borderBottomColor: palette.border3D },
			]}
		>
			{from ? (
				<Text style={[mockStyles.noteFrom, { color: palette.primary }]}>{from}</Text>
			) : null}
			<Text style={[mockStyles.noteText, { color: palette.text }]} numberOfLines={3}>
				{text}
			</Text>
		</View>
	);
}

// ─── Steps ────────────────────────────────────────────────────────────────────

type Step = {
	kicker: string;
	title: string;
	body: string;
	mockUI: (palette: (typeof Colors)["light"]) => React.ReactNode;
};

const STEPS: Step[] = [
	{
		kicker: "Your cards",
		title: "Track every\nrenewal date",
		body: "Add a card once. The app calculates the next billing date automatically and reminds you before it hits.",
		mockUI: (palette) => (
			<View style={{ gap: 10 }}>
				<MockCard
					name="Family plan"
					provider="Netflix"
					last4="4242"
					dueLabel="3 days"
					accent="#E50914"
					palette={palette}
				/>
				<MockCard
					name="Premium"
					provider="Spotify"
					last4="1337"
					dueLabel="12 days"
					accent="#1DB954"
					palette={palette}
				/>
				<MockCard
					name="iCloud 200GB"
					provider="Apple"
					last4="8888"
					dueLabel="Tomorrow"
					accent="#555"
					palette={palette}
				/>
			</View>
		),
	},
	{
		kicker: "Reminders",
		title: "Decide before\nyou're charged",
		body: "See what's due, flip a card to Cancel or Keep, and mark it as Handled. Snooze if you need more time.",
		mockUI: (palette) => (
			<View style={{ gap: 10 }}>
				<MockReminderTile
					name="Netflix · Family plan"
					label="May 1 · ••••4242"
					tone="danger"
					palette={palette}
				/>
				<MockReminderTile
					name="Spotify · Premium"
					label="May 10 · ••••1337"
					tone="warning"
					palette={palette}
				/>
			</View>
		),
	},
	{
		kicker: "Notes",
		title: "Capture the\ndetails that matter",
		body: "Add quick notes or link them directly to a card — cancellation links, phone numbers, anything you'd need in the moment.",
		mockUI: (palette) => (
			<View style={{ gap: 10 }}>
				<MockNote
					from="Netflix"
					text="Cancel via netflix.com/cancel — do NOT call support, takes 30 min"
					palette={palette}
				/>
				<MockNote
					text="Remember to cancel Gym before 25th — they charge full month even mid-cycle"
					palette={palette}
				/>
				<MockNote
					from="Spotify"
					text="Family plan — need to stay subscribed until June for concert tickets"
					palette={palette}
				/>
			</View>
		),
	},
];

// ─── Screen ───────────────────────────────────────────────────────────────────

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
		<SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]}>
			{/* Progress dots */}
			<View style={styles.dotsRow}>
				{STEPS.map((_, i) => (
					<View
						key={i}
						style={[
							styles.dot,
							{
								backgroundColor:
									i === step ? palette.primary : palette.borderSoft,
								width: i === step ? 24 : 8,
							},
						]}
					/>
				))}
			</View>

			<ScrollView
				contentContainerStyle={styles.scroll}
				showsVerticalScrollIndicator={false}
			>
				{/* Header */}
				<View style={styles.header}>
					<Text style={[styles.kicker, { color: palette.primary }]}>
						{current.kicker}
					</Text>
					<Text style={[styles.title, { color: palette.text }]}>
						{current.title}
					</Text>
					<Text style={[styles.body, { color: palette.muted }]}>
						{current.body}
					</Text>
				</View>

				{/* Mock UI preview */}
				<View
					style={[
						styles.preview,
						{ backgroundColor: palette.cardAlt, borderColor: palette.borderSoft },
					]}
				>
					{current.mockUI(palette)}
				</View>

				{/* Privacy note on last step */}
				{isLast ? (
					<Text style={[styles.privacyNote, { color: palette.muted }]}>
						📱 Everything stays on your device. No account required.
					</Text>
				) : null}
			</ScrollView>

			{/* Navigation */}
			<View style={[styles.nav, { borderTopColor: palette.borderSoft }]}>
				{step > 0 ? (
					<PressableScale
						onPress={goPrev}
						contentStyle={[styles.backBtn, { borderColor: palette.borderSoft }]}
					>
						<Text style={[styles.backLabel, { color: palette.muted }]}>Back</Text>
					</PressableScale>
				) : (
					<View style={styles.backPlaceholder} />
				)}

				<PressableScale
					onPress={goNext}
					disabled={isContinuing}
					contentStyle={[
						styles.nextBtn,
						{ backgroundColor: palette.primary, borderColor: palette.primaryBorder },
					]}
				>
					<Text style={[styles.nextLabel, { color: palette.onPrimary }]}>
						{isLast
							? isContinuing
								? "Starting…"
								: "Get Started"
							: "Next →"}
					</Text>
				</PressableScale>
			</View>
		</SafeAreaView>
	);
}

// ─── Styles ───────────────────────────────────────────────────────────────────

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
		height: 8,
		borderRadius: 4,
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
		fontFamily: "Nunito_800ExtraBold",
		fontSize: 13,
		textTransform: "uppercase",
		letterSpacing: 1.2,
	},
	title: {
		fontFamily: "Nunito_900Black",
		fontSize: 34,
		lineHeight: 40,
	},
	body: {
		fontFamily: "Nunito_700Bold",
		fontSize: 15,
		lineHeight: 22,
		maxWidth: 340,
	},
	preview: {
		borderWidth: 1,
		borderRadius: radius.xl,
		padding: spacing.md,
		gap: spacing.sm,
	},
	privacyNote: {
		fontFamily: "Nunito_600SemiBold",
		fontSize: 13,
		textAlign: "center",
		lineHeight: 20,
	},
	nav: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: spacing.lg,
		paddingVertical: spacing.md,
		borderTopWidth: 1,
		gap: spacing.sm,
	},
	backPlaceholder: {
		width: 80,
	},
	backBtn: {
		borderWidth: 2,
		borderRadius: radius.pill,
		paddingHorizontal: spacing.lg,
		paddingVertical: 12,
		alignItems: "center",
		width: 80,
	},
	backLabel: {
		fontFamily: "Nunito_800ExtraBold",
		fontSize: 14,
	},
	nextBtn: {
		flex: 1,
		borderWidth: 2,
		borderBottomWidth: thickness.border3D,
		borderRadius: radius.pill,
		paddingVertical: 16,
		alignItems: "center",
	},
	nextLabel: {
		fontFamily: "Nunito_900Black",
		fontSize: 16,
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},
});

const mockStyles = StyleSheet.create({
	card: {
		borderWidth: 2,
		borderBottomWidth: 4,
		borderRadius: radius.lg,
		padding: 12,
	},
	cardHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
	},
	logoBadge: {
		width: 36,
		height: 36,
		borderRadius: 10,
		alignItems: "center",
		justifyContent: "center",
	},
	logoLabel: {
		fontFamily: "Nunito_900Black",
		fontSize: 13,
	},
	cardName: {
		fontFamily: "Nunito_800ExtraBold",
		fontSize: 15,
	},
	cardMeta: {
		fontFamily: "Nunito_600SemiBold",
		fontSize: 12,
	},
	dueBadge: {
		borderRadius: 8,
		paddingHorizontal: 8,
		paddingVertical: 4,
	},
	dueLabel: {
		fontFamily: "Nunito_800ExtraBold",
		fontSize: 12,
	},
	reminder: {
		borderWidth: 2,
		borderBottomWidth: 4,
		borderRadius: radius.lg,
		padding: 12,
		gap: 4,
	},
	reminderHeader: {
		flexDirection: "row",
	},
	reminderBadge: {
		fontFamily: "Nunito_900Black",
		fontSize: 11,
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},
	reminderName: {
		fontFamily: "Nunito_800ExtraBold",
		fontSize: 15,
	},
	reminderSub: {
		fontFamily: "Nunito_600SemiBold",
		fontSize: 12,
	},
	intentRow: {
		flexDirection: "row",
		gap: 6,
		marginTop: 4,
	},
	intentChip: {
		borderWidth: 1,
		borderRadius: 8,
		paddingHorizontal: 10,
		paddingVertical: 4,
	},
	intentLabel: {
		fontFamily: "Nunito_800ExtraBold",
		fontSize: 11,
		textTransform: "uppercase",
	},
	note: {
		borderWidth: 2,
		borderBottomWidth: 4,
		borderRadius: radius.lg,
		padding: 12,
		gap: 4,
	},
	noteFrom: {
		fontFamily: "Nunito_800ExtraBold",
		fontSize: 12,
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},
	noteText: {
		fontFamily: "Nunito_600SemiBold",
		fontSize: 13,
		lineHeight: 18,
	},
});
