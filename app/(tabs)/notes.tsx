import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useColorScheme } from "@/components/useColorScheme";
import { PressableScale } from "@/components/ui/PressableScale";
import { TextField } from "@/components/ui/TextField";
import Colors from "@/constants/Colors";
import { radius, shadow, spacing, thickness } from "@/constants/Tokens";
import { useCards } from "@/hooks/useCards";
import { useQuickNotes } from "@/hooks/useQuickNotes";

export default function NotesScreen() {
	const colorScheme = useColorScheme() ?? "light";
	const palette = Colors[colorScheme];
	const { width } = useWindowDimensions();
	const { cards } = useCards();
	const { notes, isReady, addNote, deleteNote } = useQuickNotes();
	const [draft, setDraft] = useState("");
	const [isSaving, setIsSaving] = useState(false);

	const noteCards = useMemo(
		() => [
			...cards
				.filter((card) => card.note?.trim())
				.map((card) => ({
					id: `card:${card.id}`,
					title: card.name,
					body: card.note ?? "",
					meta: `${card.provider} · ${card.intent === "cancel" ? "Cancel" : "Continue"}`,
					deletable: false,
				})),
			...notes.map((note) => ({
				id: note.id,
				title: "Quick note",
				body: note.body,
				meta: new Intl.DateTimeFormat(undefined, {
					month: "short",
					day: "numeric",
				}).format(new Date(note.createdAt)),
				deletable: true,
			})),
		],
		[cards, notes],
	);

	const twoColumn = width >= 390;
	const tileWidth = twoColumn
		? (width - spacing.lg * 2 - spacing.sm) / 2
		: width - spacing.lg * 2;

	async function handleSave() {
		setIsSaving(true);
		const saved = await addNote(draft);
		if (saved) {
			setDraft("");
		}
		setIsSaving(false);
	}

	return (
		<SafeAreaView
			edges={["top"]}
			style={[styles.safeArea, { backgroundColor: palette.background }]}
		>
			<ScrollView
				style={{ backgroundColor: palette.background }}
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
			>
				<View
					style={[
						styles.hero,
						{
							backgroundColor: palette.card,
							borderColor: palette.borderSoft,
							shadowColor: palette.primary,
						},
						shadow.soft,
					]}
				>
					<Text style={[styles.eyebrow, { color: palette.primary }]}>Notes</Text>
					<Text style={[styles.title, { color: palette.text }]}>Memory stack</Text>
					<Text style={[styles.subtitle, { color: palette.muted }]}>
						Saved notes from cards and freeform notes share the same pattern.
					</Text>
				</View>

				<View
					style={[
						styles.composer,
						{ backgroundColor: palette.card, borderColor: palette.borderSoft },
					]}
				>
					<TextField
						label="New note"
						value={draft}
						onChangeText={setDraft}
						placeholder="Add a general note you want to remember later."
						multiline
						minHeight={104}
					/>
					<PressableScale
						onPress={() => void handleSave()}
						disabled={isSaving}
						contentStyle={[
							styles.primaryButton,
							{ backgroundColor: palette.primary, borderColor: palette.primary },
						]}
					>
						<Text style={[styles.primaryLabel, { color: palette.onPrimary }]}>
							{isSaving ? "Saving..." : "Save note"}
						</Text>
					</PressableScale>
				</View>

				{!isReady ? (
					<Text style={[styles.loading, { color: palette.muted }]}>Loading…</Text>
				) : null}

				{isReady && noteCards.length === 0 ? (
					<View
						style={[
							styles.emptyCard,
							{ backgroundColor: palette.card, borderColor: palette.borderSoft },
						]}
					>
						<Text style={[styles.emptyTitle, { color: palette.text }]}>
							No notes yet
						</Text>
						<Text style={[styles.emptyBody, { color: palette.muted }]}>
							Add a quick note or save one inside a card.
						</Text>
					</View>
				) : null}

				<View style={styles.grid}>
					{noteCards.map((item) => (
						<View
							key={item.id}
							style={[
								styles.tile,
								{
									width: tileWidth,
									backgroundColor: palette.card,
									borderColor: palette.borderSoft,
									shadowColor: palette.primary,
								},
								shadow.soft,
							]}
						>
							<Text style={[styles.tileTitle, { color: palette.text }]}>
								{item.title}
							</Text>
							<Text style={[styles.emptyTitle, { color: palette.text }]}>
								No notes saved
							</Text>
							<Text style={[styles.emptyBody, { color: palette.muted }]}>
								Add notes to your cards to keep track of cancellation links, phone numbers, and support context.
							</Text>
						</View>
					) : null}

					<View style={styles.list}>
						{activeCards.map((card) => {
							const companyTheme = findCompanyPreset(
								card.provider,
								card.companyKey,
							);
							const editingThis = isEditing && activeCardId === card.id;

							return (
								<View
									key={card.id}
									style={[
										styles.card,
										{
											backgroundColor: palette.card,
											borderColor: palette.border,
											borderBottomColor: palette.border3D,
										},
									]}
								>
									<View style={styles.cardHeader}>
										<View
											style={[
												styles.logoBadge,
												{ backgroundColor: companyTheme?.accent ?? palette.primary },
											]}
										>
											<Text style={[styles.logoLabel, { color: palette.onPrimary }]}>
												{card.provider.slice(0, 2).toUpperCase()}
											</Text>
										</View>
										<View style={styles.cardTextGroup}>
											<Text style={[styles.cardTitle, { color: palette.text }]}>
												{card.name}
											</Text>
											<Text style={[styles.cardMeta, { color: palette.muted }]}>
												{card.provider}
											</Text>
										</View>
									</View>

									{editingThis ? (
										<View style={styles.editorWrap}>
											<TextField
												label="Edit Note"
												value={draftNote}
												onChangeText={setDraftNote}
												multiline
												minHeight={120}
												autoFocus
											/>
											<View style={styles.editorActions}>
												<Button 
													title="Cancel" 
													variant="secondary"
													style={{ flex: 1 }}
													onPress={handleCancel} 
												/>
												<Button 
													title="Save Note" 
													variant="success"
													style={{ flex: 1 }}
													onPress={() => void handleSave()} 
												/>
											</View>
										</View>
									) : (
										<>
											<Text style={[styles.noteContent, { color: palette.text }]}>
												{card.note}
											</Text>
											<View style={styles.actions}>
												<Button 
													title="Edit Note" 
													variant="secondary"
													style={{ flex: 1 }}
													onPress={() => handleStartEdit(card)} 
												/>
											</View>
										</>
									)}
								</View>
							);
						})}
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
	},
	keyboardView: {
		flex: 1,
	},
	content: {
		padding: spacing.xl,
		paddingBottom: 128,
		gap: spacing.xl,
	},
	pageTitle: {
		fontFamily: "Nunito_900Black",
		fontSize: 32,
		marginBottom: 8,
	},
	emptyCard: {
		borderWidth: thickness.border,
		borderBottomWidth: thickness.border3D,
		borderRadius: radius.xl,
		padding: spacing.xl,
		gap: spacing.sm,
	},
	emptyTitle: {
		fontFamily: "Nunito_800ExtraBold",
		fontSize: 20,
	},
	emptyBody: {
		fontSize: 14,
		lineHeight: 20,
	},
	grid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: spacing.sm,
	},
	tile: {
		borderWidth: thickness.border,
		borderBottomWidth: thickness.border3D,
		borderRadius: radius.lg,
		padding: spacing.md,
		gap: spacing.xs,
	},
	tileTitle: {
		fontSize: 18,
		lineHeight: 22,
		fontWeight: "800",
	},
	tileMeta: {
		fontSize: 12,
		lineHeight: 16,
		fontWeight: "700",
	},
	tileBody: {
		fontSize: 14,
		lineHeight: 20,
	},
	secondaryButton: {
		borderWidth: thickness.border,
		borderBottomWidth: thickness.border3DSmall,
		borderRadius: 999,
		paddingHorizontal: 12,
		paddingVertical: 10,
		alignSelf: "flex-start",
		marginTop: spacing.xs,
	},
	secondaryLabel: {
		fontSize: 12,
		lineHeight: 16,
		fontWeight: "800",
		textTransform: "uppercase",
	},
});
