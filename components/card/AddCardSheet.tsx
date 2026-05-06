import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { useColorScheme } from "@/components/useColorScheme";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { PressableScale } from "@/components/ui/PressableScale";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import Colors from "@/constants/Colors";
import { hairline, radius, spacing, type as typeTokens } from "@/constants/Tokens";
import {
	findCompanyPreset,
	searchCompanyPresets,
} from "@/data/companyPresets";
import type { CardDraft } from "@/types/domain";

type Props = {
	visible: boolean;
	initialDraft: CardDraft;
	onClose: () => void;
	onSubmit: (draft: CardDraft) => Promise<string | null>;
};

export function AddCardSheet({
	visible,
	initialDraft,
	onClose,
	onSubmit,
}: Props) {
	const colorScheme = useColorScheme() ?? "light";
	const palette = Colors[colorScheme];
	const [draft, setDraft] = useState<CardDraft>(initialDraft);
	const [error, setError] = useState<string | null>(null);
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		if (visible) {
			setDraft(initialDraft);
			setError(null);
			setIsSaving(false);
		}
	}, [initialDraft, visible]);

	const suggestions = useMemo(
		() => searchCompanyPresets(draft.provider),
		[draft.provider],
	);

	function update(next: Partial<CardDraft>) {
		setDraft((current) => ({ ...current, ...next }));
	}

	async function handleSave() {
		setIsSaving(true);
		const nextError = await onSubmit(draft);
		setError(nextError);
		setIsSaving(false);
		if (!nextError) {
			onClose();
		}
	}

	return (
		<BottomSheet
			visible={visible}
			title="Add card"
			subtitle="Quick setup for subscription reminders."
			onClose={onClose}
			footer={
				<View style={styles.footerWrap}>
					{error ? (
						<Text style={[styles.error, { color: palette.danger }]}>
							{error}
						</Text>
					) : null}
					<Button
						title={isSaving ? "Saving..." : "Save card"}
						onPress={() => void handleSave()}
						disabled={isSaving}
					/>
				</View>
			}
		>
			<ScrollView
				style={styles.scroll}
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
			>
				<TextField
					label="Company"
					value={draft.provider}
					onChangeText={(value) =>
						update({
							provider: value,
							companyKey: findCompanyPreset(value)?.key,
						})
					}
					placeholder="Netflix"
				/>
				{draft.provider.trim().length > 0 ? (
					<View style={styles.suggestionRow}>
						{suggestions.map((item) => (
							<PressableScale
								key={item.key}
								onPress={() =>
									update({
										provider: item.name,
										companyKey: item.key,
									})
								}
								contentStyle={[
									styles.suggestionChip,
									{
										borderColor: palette.border,
									},
								]}
							>
								<Text
									style={[styles.suggestionLabel, { color: palette.text }]}
								>
									{item.name}
								</Text>
							</PressableScale>
						))}
					</View>
				) : null}
				<TextField
					label="Card name"
					value={draft.name}
					onChangeText={(value) => update({ name: value })}
					placeholder="Family plan"
				/>
				<View style={styles.row}>
					<View style={styles.field}>
						<TextField
							label="Last 4"
							value={draft.last4}
							onChangeText={(value) =>
								update({
									last4: value.replace(/[^0-9]/g, "").slice(0, 4),
								})
							}
							placeholder="4242"
							keyboardType="number-pad"
						/>
					</View>
					<View style={styles.field}>
						<TextField
							label="Renewal day"
							value={draft.dueDay}
							onChangeText={(value) =>
								update({
									dueDay: value.replace(/[^0-9]/g, "").slice(0, 2),
								})
							}
							placeholder="25"
							keyboardType="number-pad"
							hint="Monthly, 1-31"
						/>
					</View>
				</View>
				<TextField
					label="Note"
					value={draft.note}
					onChangeText={(value) => update({ note: value })}
					placeholder="Cancellation link, phone, or reminder note."
					multiline
					minHeight={72}
				/>
			</ScrollView>
		</BottomSheet>
	);
}

const styles = StyleSheet.create({
	scroll: {
		maxHeight: 480,
	},
	content: {
		gap: spacing.md,
		paddingBottom: spacing.xs,
	},
	footerWrap: {
		gap: spacing.sm,
	},
	row: {
		flexDirection: "row",
		gap: spacing.sm,
	},
	field: {
		flex: 1,
	},
	suggestionRow: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: spacing.xs,
		marginTop: -spacing.xs,
	},
	suggestionChip: {
		borderWidth: hairline,
		borderRadius: radius.pill,
		paddingHorizontal: spacing.sm,
		paddingVertical: 8,
	},
	suggestionLabel: {
		...typeTokens.caption,
	},
	error: {
		...typeTokens.body,
		textAlign: "center",
	},
});
