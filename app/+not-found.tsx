import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
	radius,
	shadow,
	spacing,
	stylepass,
	type as typeTokens,
} from "@/constants/Tokens";

export default function NotFoundScreen() {
	return (
		<>
			<Stack.Screen options={{ title: "Missing" }} />
			<SafeAreaView style={styles.safeArea}>
				<View style={styles.panel}>
					<Text style={styles.kicker}>Missing Date</Text>
					<Text style={styles.title}>This screen doesn't exist.</Text>

					<Link href="/" style={styles.link}>
						<Text style={styles.linkText}>Go to home screen!</Text>
					</Link>
				</View>
			</SafeAreaView>
		</>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		padding: spacing.lg,
		backgroundColor: stylepass.paper,
	},
	panel: {
		...shadow.panel,
		width: "100%",
		maxWidth: 360,
		borderRadius: radius.xl,
		backgroundColor: stylepass.panel,
		padding: spacing.xl,
		gap: spacing.sm,
	},
	kicker: {
		...typeTokens.legal,
		color: stylepass.muted,
		textTransform: "uppercase",
		letterSpacing: 1.2,
	},
	title: {
		...typeTokens.titleLg,
		color: stylepass.ink,
	},
	link: {
		marginTop: spacing.sm,
		paddingVertical: spacing.sm,
	},
	linkText: {
		...typeTokens.button,
		color: stylepass.forest,
	},
});
