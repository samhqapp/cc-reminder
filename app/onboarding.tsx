import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useColorScheme } from "@/components/useColorScheme";
import { Button } from "@/components/ui/Button";
import Colors from "@/constants/Colors";
import { radius, spacing, thickness } from "@/constants/Tokens";
import { useOnboarding } from "@/hooks/useOnboarding";
import { requestNotificationPermission } from "@/utils/notifications";

export default function OnboardingScreen() {
	const colorScheme = useColorScheme() ?? "light";
	const palette = Colors[colorScheme];
	const { completeOnboarding } = useOnboarding();
	const [isContinuing, setIsContinuing] = useState(false);

	async function handleContinue() {
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
			<ScrollView
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				<View style={styles.header}>
					<Text style={[styles.kicker, { color: palette.primary }]}>
						CC Reminder
					</Text>
					<Text style={[styles.title, { color: palette.text }]}>
						TRACK DUE DATES
					</Text>
					<Text style={[styles.body, { color: palette.muted }]}>
						Local-first reminder flow for billing checkpoints and manual follow-up windows. Just hard edges and clear timing.
					</Text>
				</View>

				<View style={styles.grid}>
					<View style={[styles.tile, { backgroundColor: palette.card, borderColor: palette.border, borderBottomColor: palette.border3D }]}>
						<Text style={[styles.tileIndex, { color: palette.primary }]}>01</Text>
						<Text style={[styles.tileBody, { color: palette.text }]}>Data stays on-device.</Text>
					</View>
					<View style={[styles.tile, { backgroundColor: palette.card, borderColor: palette.border, borderBottomColor: palette.border3D }]}>
						<Text style={[styles.tileIndex, { color: palette.primary }]}>02</Text>
						<Text style={[styles.tileBody, { color: palette.text }]}>Only last 4 digits stored.</Text>
					</View>
					<View style={[styles.tile, { backgroundColor: palette.card, borderColor: palette.border, borderBottomColor: palette.border3D }]}>
						<Text style={[styles.tileIndex, { color: palette.primary }]}>03</Text>
						<Text style={[styles.tileBody, { color: palette.text }]}>Clear, visible logic.</Text>
					</View>
				</View>

				<View style={styles.footer}>
					<Text style={[styles.note, { color: palette.muted }]}>
						If notification permission is denied, in-app reminders still work.
					</Text>
					<Button
						title={isContinuing ? "Starting..." : "Get Started"}
						onPress={() => void handleContinue()}
						disabled={isContinuing}
					/>
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
		padding: spacing.xl,
		gap: spacing.xl,
		justifyContent: "center",
	},
	header: {
		gap: spacing.sm,
		alignItems: "center",
		textAlign: "center",
		marginTop: spacing.xl,
	},
	kicker: {
		fontFamily: "Nunito_800ExtraBold",
		fontSize: 14,
		textTransform: "uppercase",
		letterSpacing: 1,
	},
	title: {
		fontFamily: "Nunito_900Black",
		fontSize: 36,
		lineHeight: 42,
		textAlign: "center",
	},
	body: {
		fontFamily: "Nunito_700Bold",
		fontSize: 16,
		lineHeight: 24,
		textAlign: "center",
		maxWidth: 320,
	},
	grid: {
		gap: spacing.md,
	},
	tile: {
		borderWidth: thickness.border,
		borderBottomWidth: thickness.border3D,
		borderRadius: radius.xl,
		padding: spacing.lg,
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.md,
	},
	tileIndex: {
		fontFamily: "Nunito_900Black",
		fontSize: 24,
	},
	tileBody: {
		fontFamily: "Nunito_700Bold",
		fontSize: 16,
		flex: 1,
	},
	footer: {
		marginTop: spacing.xl,
		gap: spacing.lg,
	},
	note: {
		fontFamily: "Nunito_600SemiBold",
		fontSize: 14,
		textAlign: "center",
	},
});
