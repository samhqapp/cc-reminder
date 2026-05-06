import { StatusBar } from "expo-status-bar";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { hairline, radius, spacing, type as typeTokens } from "@/constants/Tokens";

const sections = [
	{
		title: "Trust boundary",
		body: "CC Reminder is local-first. It stores card labels, last 4 digits, tags, dates, reminder state, notes, and optional extended tracking data on-device only.",
	},
	{
		title: "What it never stores",
		body: "No full card number, CVV, expiry date, payment credential, or bank connection lives in this app.",
	},
	{
		title: "Provider templates",
		body: "Issuer templates are memory aids only. They are not legal advice, not official verification, and not a guarantee that a late payment will be treated a certain way.",
	},
	{
		title: "Reminder model",
		body: "Billing, due soon, due today, overdue, and extended-window reminders are stage-derived. The product avoids arbitrary custom reminder builders.",
	},
];

export default function ModalScreen() {
	const colorScheme = useColorScheme() ?? "light";
	const palette = Colors[colorScheme];

	return (
		<>
			<ScrollView
				style={{ backgroundColor: palette.background }}
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
			>
				<View
					style={[
						styles.hero,
						{ backgroundColor: palette.surface, borderColor: palette.border },
					]}
				>
					<Text style={[styles.kicker, { color: palette.link }]}>
						About CC Reminder
					</Text>
					<Text style={[styles.title, { color: palette.text }]}>
						Open source trust, local-first data, and stage-based reminders.
					</Text>
					<Text style={[styles.subtitle, { color: palette.body }]}>
						This app is designed to remember payment timelines without pretending
						to be a bank integration or financial authority.
					</Text>
				</View>

				{sections.map((section) => (
					<View
						key={section.title}
						style={[
							styles.section,
							{ borderColor: palette.border },
						]}
					>
						<Text style={[styles.sectionTitle, { color: palette.text }]}>
							{section.title}
						</Text>
						<Text style={[styles.sectionBody, { color: palette.muted }]}>
							{section.body}
						</Text>
					</View>
				))}
			</ScrollView>
			<StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
		</>
	);
}

const styles = StyleSheet.create({
	content: {
		padding: spacing.lg,
		gap: spacing.md,
	},
	hero: {
		borderWidth: hairline,
		borderRadius: radius.lg,
		padding: spacing.lg,
		gap: spacing.sm,
	},
	kicker: {
		...typeTokens.caption,
		textTransform: "uppercase",
		letterSpacing: 1,
	},
	title: {
		...typeTokens.titleLg,
	},
	subtitle: {
		...typeTokens.body,
	},
	section: {
		borderBottomWidth: hairline,
		paddingVertical: spacing.md,
		gap: spacing.xxs,
	},
	sectionTitle: {
		...typeTokens.titleSm,
	},
	sectionBody: {
		...typeTokens.body,
	},
});
