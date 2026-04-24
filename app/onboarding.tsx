import { router } from "expo-router";
import { useState } from "react";
import {
	ScrollView,
	StyleSheet,
	Text,
	useWindowDimensions,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PressableScale } from "@/components/ui/PressableScale";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { radius, spacing } from "@/constants/Tokens";
import { useOnboarding } from "@/hooks/useOnboarding";
import { requestNotificationPermission } from "@/utils/notifications";

export default function OnboardingScreen() {
	const colorScheme = useColorScheme() ?? "light";
	const palette = Colors[colorScheme];
	const { completeOnboarding } = useOnboarding();
	const [isContinuing, setIsContinuing] = useState(false);
	const { width } = useWindowDimensions();
	const isCompact = width < 820;
	const heroSize = width < 420 ? 48 : width < 820 ? 68 : 96;
	const heroLineHeight = width < 420 ? 46 : width < 820 ? 64 : 88;

	async function handleContinue() {
		if (isContinuing) {
			return;
		}

		setIsContinuing(true);
		await requestNotificationPermission();
		await completeOnboarding();
		router.replace("/(tabs)");
	}

	return (
		<SafeAreaView
			style={[styles.safeArea, { backgroundColor: palette.background }]}
		>
			<ScrollView
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				<View
					style={[
						styles.frame,
						{ backgroundColor: palette.card, borderColor: palette.border },
					]}
				>
					<View
						style={[
							styles.heroRow,
							isCompact ? styles.heroRowCompact : styles.heroRowWide,
						]}
					>
						<View
							style={[
								styles.heroPanel,
								isCompact ? styles.heroPanelCompact : styles.heroPanelWide,
								{ borderColor: palette.border },
							]}
						>
							<Text style={[styles.kicker, { color: palette.text }]}>
								CC Reminder
							</Text>
							<Text
								style={[
									styles.hero,
									{
										color: palette.text,
										fontSize: heroSize,
										lineHeight: heroLineHeight,
									},
								]}
							>
								TRACK{"\n"}DUE{"\n"}DATES.
							</Text>
							<Text style={[styles.body, { color: palette.text }]}>
								Local-first reminder flow for billing checkpoints, due dates,
								and manual follow-up windows. No decorative chrome. No fuzzy
								trust story. Just hard edges and clear timing.
							</Text>
						</View>

						<View style={styles.factsColumn}>
							<View
								style={[
									styles.factCard,
									{
										backgroundColor: palette.background,
										borderColor: palette.border,
									},
								]}
							>
								<Text style={[styles.factIndex, { color: palette.text }]}>
									01
								</Text>
								<Text style={[styles.factBody, { color: palette.text }]}>
									Card data stays on-device.
								</Text>
							</View>
							<View
								style={[
									styles.factCard,
									{
										backgroundColor: palette.background,
										borderColor: palette.border,
									},
								]}
							>
								<Text style={[styles.factIndex, { color: palette.text }]}>
									02
								</Text>
								<Text style={[styles.factBody, { color: palette.text }]}>
									Open source: the logic is visible.
								</Text>
							</View>
							<View
								style={[
									styles.factCard,
									{
										backgroundColor: palette.background,
										borderColor: palette.border,
									},
								]}
							>
								<Text style={[styles.factIndex, { color: palette.text }]}>
									03
								</Text>
								<Text style={[styles.factBody, { color: palette.text }]}>
									Only last 4 digits are stored.
								</Text>
							</View>
							<View
								style={[
									styles.factCard,
									{
										backgroundColor: palette.background,
										borderColor: palette.border,
									},
								]}
							>
								<Text style={[styles.factIndex, { color: palette.text }]}>
									04
								</Text>
								<Text style={[styles.factBody, { color: palette.text }]}>
									Extended dates are memory aids, not guarantees.
								</Text>
							</View>
						</View>
					</View>

					<View
						style={[
							styles.footer,
							isCompact ? styles.footerCompact : styles.footerWide,
							{ borderColor: palette.border },
						]}
					>
						<View style={styles.footerCopy}>
							<Text style={[styles.noteLabel, { color: palette.text }]}>
								Permission note
							</Text>
							<Text style={[styles.note, { color: palette.muted }]}>
								If device notification permission is denied, in-app reminders
								still work.
							</Text>
						</View>
						<PressableScale
							onPress={() => void handleContinue()}
							disabled={isContinuing}
							contentStyle={[
								styles.button,
								{
									backgroundColor: palette.cardAlt,
									borderColor: palette.border,
								},
							]}
						>
							<Text style={[styles.buttonLabel, { color: palette.text }]}>
								{isContinuing ? "Continuing..." : "Continue"}
							</Text>
						</PressableScale>
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
	},
	scrollContent: {
		flexGrow: 1,
		padding: spacing.lg,
	},
	frame: {
		flex: 1,
		width: "100%",
		maxWidth: 1040,
		alignSelf: "center",
		borderWidth: 2,
		borderRadius: radius.sm,
		minHeight: 640,
	},
	heroRow: {
		flex: 1,
	},
	heroRowWide: {
		flexDirection: "row",
	},
	heroRowCompact: {
		flexDirection: "column",
	},
	heroPanel: {
		padding: spacing.xxl,
		gap: spacing.lg,
		justifyContent: "space-between",
	},
	heroPanelWide: {
		flex: 1.35,
		borderRightWidth: 2,
	},
	heroPanelCompact: {
		borderBottomWidth: 2,
	},
	kicker: {
		fontFamily: "SpaceMono",
		fontSize: 14,
		lineHeight: 18,
		textTransform: "uppercase",
	},
	hero: {
		fontFamily: "SpaceMono",
		letterSpacing: -2,
		textTransform: "uppercase",
	},
	body: {
		fontFamily: "SpaceMono",
		fontSize: 15,
		lineHeight: 24,
		maxWidth: 460,
	},
	factsColumn: {
		flex: 1,
		padding: spacing.lg,
		gap: spacing.md,
		justifyContent: "center",
	},
	factCard: {
		borderWidth: 2,
		padding: spacing.md,
		gap: spacing.md,
		minHeight: 116,
		justifyContent: "space-between",
	},
	factIndex: {
		fontFamily: "SpaceMono",
		fontSize: 20,
		lineHeight: 24,
		textTransform: "uppercase",
	},
	factBody: {
		fontFamily: "SpaceMono",
		fontSize: 14,
		lineHeight: 22,
		textTransform: "uppercase",
	},
	footer: {
		borderTopWidth: 2,
		padding: spacing.lg,
		gap: spacing.md,
	},
	footerWide: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	footerCompact: {
		flexDirection: "column",
	},
	footerCopy: {
		flex: 1,
		gap: 6,
	},
	noteLabel: {
		fontFamily: "SpaceMono",
		fontSize: 13,
		lineHeight: 18,
		textTransform: "uppercase",
	},
	note: {
		fontFamily: "SpaceMono",
		fontSize: 13,
		lineHeight: 20,
		maxWidth: 540,
	},
	button: {
		borderWidth: 2,
		borderRadius: radius.sm,
		paddingVertical: 18,
		paddingHorizontal: 20,
		minWidth: 220,
		alignItems: "center",
	},
	buttonLabel: {
		fontFamily: "SpaceMono",
		fontSize: 14,
		lineHeight: 20,
		textTransform: "uppercase",
	},
});
