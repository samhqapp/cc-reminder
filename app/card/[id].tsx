import { router, Stack, useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { CardForm } from "@/components/card/CardForm";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { hairline, radius, spacing, type as typeTokens } from "@/constants/Tokens";
import { mapCardToDraft, useCards } from "@/hooks/useCards";
import { deriveReminders } from "@/utils/reminders";
import { blurActiveElementOnWeb } from "@/utils/web";

export default function CardDetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const colorScheme = useColorScheme() ?? "light";
	const palette = Colors[colorScheme];
	const { cards, deleteCard, updateCard } = useCards();

	const card = cards.find((item) => item.id === id);

	if (!card) {
		return (
			<ScrollView
				style={{ backgroundColor: palette.background }}
				contentContainerStyle={styles.content}
			>
				<Stack.Screen options={{ title: "Card not found" }} />
				<View
					style={[
						styles.missing,
						{ backgroundColor: palette.surface, borderColor: palette.border },
					]}
				>
					<Text style={[styles.missingTitle, { color: palette.text }]}>
						Card not found
					</Text>
					<Text style={[styles.missingBody, { color: palette.muted }]}>
						It may have been deleted in another screen state.
					</Text>
				</View>
			</ScrollView>
		);
	}

	const reminders = deriveReminders([card]);

	return (
		<>
			<Stack.Screen options={{ title: card.name }} />
			<CardForm
				key={card.id}
				title={card.name}
				subtitle={`${reminders.length} upcoming reminder${reminders.length === 1 ? "" : "s"}. Edit card details below.`}
				initialDraft={mapCardToDraft(card)}
				submitLabel="Save changes"
				onSubmit={async (draft) => {
					const error = await updateCard(card.id, draft);
					if (!error) {
						blurActiveElementOnWeb();
						router.back();
					}
					return error;
				}}
				onDelete={async () => {
					blurActiveElementOnWeb();
					await deleteCard(card.id);
					router.replace("/(tabs)");
				}}
			/>
		</>
	);
}

const styles = StyleSheet.create({
	content: {
		padding: spacing.lg,
	},
	missing: {
		borderWidth: hairline,
		borderRadius: radius.lg,
		padding: spacing.lg,
		gap: spacing.sm,
	},
	missingTitle: {
		...typeTokens.titleLg,
	},
	missingBody: {
		...typeTokens.body,
	},
});
