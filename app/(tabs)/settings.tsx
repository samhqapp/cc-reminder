import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

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
import { useOnboarding } from "@/hooks/useOnboarding";

export default function SettingsScreen() {
	const { resetOnboarding } = useOnboarding();

	async function showOnboarding() {
		await resetOnboarding();
		router.replace("/onboarding");
	}

	return (
		<ScreenScaffold
			world="settings"
			kicker="Quiet Controls"
			title="Settings"
			subtitle="Sparse local controls, including replaying onboarding anytime."
		>
			<AnimatedAppear delay={80}>
				<PaperPanel style={styles.heroPanel}>
					<Text style={styles.heroTitle}>Replay The Illustrated Flow</Text>
					<Text style={styles.heroBody}>
						The onboarding action stays close, so the crayon setup can be seen
						again while the app is being polished.
					</Text>
					<PressableScale
						accessibilityRole="button"
						onPress={() => void showOnboarding()}
						contentStyle={styles.primaryAction}
					>
						<Ionicons name="sparkles-outline" size={19} color={stylepass.cream} />
						<Text style={styles.primaryActionLabel}>Show onboarding</Text>
					</PressableScale>
				</PaperPanel>
			</AnimatedAppear>

			<View style={styles.settingsList}>
				<AnimatedAppear delay={140}>
					<SettingRow
						title="Show Onboarding"
						body="Replay the three illustrated screens."
						icon="images-outline"
						active
					/>
				</AnimatedAppear>
				<AnimatedAppear delay={185}>
					<SettingRow
						title="Local Notes"
						body="Saved on this device, separate from card numbers."
						icon="lock-closed-outline"
						active
					/>
				</AnimatedAppear>
				<AnimatedAppear delay={230}>
					<SettingRow
						title="Reminder Tone"
						body="Quiet nudges near renewal day."
						icon="notifications-outline"
					/>
				</AnimatedAppear>
			</View>
		</ScreenScaffold>
	);
}

function SettingRow({
	title,
	body,
	icon,
	active,
}: {
	title: string;
	body: string;
	icon: keyof typeof Ionicons.glyphMap;
	active?: boolean;
}) {
	return (
		<PaperPanel style={styles.settingRow}>
			<View style={styles.settingIcon}>
				<Ionicons name={icon} size={20} color={stylepass.ink} />
			</View>
			<View style={styles.settingCopy}>
				<Text style={styles.settingTitle}>{title}</Text>
				<Text style={styles.settingBody}>{body}</Text>
			</View>
			<View style={[styles.toggle, active && styles.toggleActive]}>
				<View style={[styles.toggleThumb, active && styles.toggleThumbActive]} />
			</View>
		</PaperPanel>
	);
}

const styles = StyleSheet.create({
	heroPanel: {
		padding: spacing.lg,
		gap: spacing.sm,
		marginBottom: spacing.lg,
	},
	heroTitle: {
		...typeTokens.titleLg,
		color: stylepass.ink,
		maxWidth: 260,
	},
	heroBody: {
		...typeTokens.body,
		color: "rgba(21, 24, 33, 0.64)",
	},
	primaryAction: {
		...shadow.soft,
		alignSelf: "stretch",
		minHeight: 52,
		borderRadius: radius.pill,
		backgroundColor: "rgba(21, 24, 33, 0.88)",
		borderWidth: hairline,
		borderColor: "rgba(255, 247, 233, 0.14)",
		alignItems: "center",
		justifyContent: "center",
		flexDirection: "row",
		gap: spacing.xs,
		marginTop: spacing.sm,
	},
	primaryActionLabel: {
		...typeTokens.button,
		color: stylepass.cream,
	},
	settingsList: {
		gap: spacing.sm,
	},
	settingRow: {
		minHeight: 74,
		borderRadius: radius.md,
		padding: spacing.md,
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.sm,
		backgroundColor: "rgba(255, 255, 255, 0.45)",
	},
	settingIcon: {
		width: 42,
		height: 42,
		borderRadius: 14,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: screenWorld.settings.accentSoft,
	},
	settingCopy: {
		flex: 1,
		minWidth: 0,
	},
	settingTitle: {
		...typeTokens.titleSm,
		color: stylepass.ink,
	},
	settingBody: {
		...typeTokens.legal,
		marginTop: 4,
		color: "rgba(21, 24, 33, 0.58)",
	},
	toggle: {
		width: 52,
		height: 32,
		borderRadius: radius.pill,
		padding: 4,
		backgroundColor: "rgba(21, 24, 33, 0.18)",
		borderWidth: hairline,
		borderColor: "rgba(21, 24, 33, 0.1)",
		justifyContent: "center",
	},
	toggleActive: {
		backgroundColor: "rgba(21, 24, 33, 0.8)",
	},
	toggleThumb: {
		width: 22,
		height: 22,
		borderRadius: 11,
		backgroundColor: stylepass.cream,
	},
	toggleThumbActive: {
		transform: [{ translateX: 20 }],
	},
});
