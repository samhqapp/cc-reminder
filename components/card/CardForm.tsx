import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { useColorScheme } from "@/components/useColorScheme";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import Colors from "@/constants/Colors";
import { radius, spacing, thickness } from "@/constants/Tokens";
import { providerTemplates } from "@/data/providerTemplates";
import type { CardDraft } from "@/types/domain";

const EXTENDED_TRACKING_WARNING =
	"Grace periods, extension windows, minimum-payment effects, late fees, and credit-reporting outcomes depend on your specific card agreement and may change without notice. CC Reminder cannot monitor your issuer's policies.";

const EXTENDED_TRACKING_RESPONSIBILITY =
	"By enabling extended payment tracking, you acknowledge that any extended date shown here is only a memory aid. It is not a guarantee, not legal advice, not financial advice, and may still be wrong for your card. You are responsible for verifying the actual terms directly with your issuer.";

type Props = {
	title: string;
	subtitle: string;
	initialDraft: CardDraft;
	submitLabel: string;
	onSubmit: (draft: CardDraft) => Promise<string | null>;
	onDelete?: () => Promise<void>;
};

export function CardForm({
	title,
	subtitle,
	initialDraft,
	submitLabel,
	onSubmit,
	onDelete,
}: Props) {
	const colorScheme = useColorScheme() ?? "light";
	const palette = Colors[colorScheme];
	const [draft, setDraft] = useState<CardDraft>(initialDraft);
	const [error, setError] = useState<string | null>(null);
	const [isSaving, setIsSaving] = useState(false);

	const template = useMemo(
		() =>
			providerTemplates.find((item) => item.id === draft.providerTemplateId),
		[draft.providerTemplateId],
	);

	function update(next: Partial<CardDraft>) {
		setDraft((current) => ({ ...current, ...next }));
	}

	async function handleSubmit() {
		setIsSaving(true);
		const nextError = await onSubmit(draft);
		setError(nextError);
		setIsSaving(false);
	}

	return (
		<ScrollView
			style={{ backgroundColor: palette.background }}
			contentContainerStyle={styles.content}
			showsVerticalScrollIndicator={false}
		>
			<View
				style={[
					styles.section,
					{ backgroundColor: palette.card, borderColor: palette.border, borderBottomColor: palette.border3D },
				]}
			>
				<Text style={[styles.title, { color: palette.text }]}>{title}</Text>
				<Text style={[styles.helper, { color: palette.muted }]}>
					{subtitle}
				</Text>
			</View>

			<View
				style={[
					styles.section,
					{ backgroundColor: palette.card, borderColor: palette.border, borderBottomColor: palette.border3D },
				]}
			>
				<TextField
					label="Card label"
					value={draft.name}
					onChangeText={(value) => update({ name: value })}
					placeholder="Example: Everyday Gold"
				/>
				<TextField
					label="Provider"
					value={draft.provider}
					onChangeText={(value) => update({ provider: value })}
					placeholder="American Express"
				/>
				<TextField
					label="Last 4 digits"
					value={draft.last4}
					onChangeText={(value) =>
						update({ last4: value.replace(/[^0-9]/g, "").slice(0, 4) })
					}
					placeholder="0123"
					keyboardType="number-pad"
				/>
				<TextField
					label="Billing day"
					value={draft.billingDay}
					onChangeText={(value) =>
						update({ billingDay: value.replace(/[^0-9]/g, "").slice(0, 2) })
					}
					placeholder="1-31"
					hint="Optional. Supports 1-31. Short months clamp to the nearest valid date."
					keyboardType="number-pad"
				/>
				<TextField
					label="Due day"
					value={draft.dueDay}
					onChangeText={(value) =>
						update({ dueDay: value.replace(/[^0-9]/g, "").slice(0, 2) })
					}
					placeholder="1-31"
					hint="Required. Supports 1-31 with nearest-valid-date handling."
					keyboardType="number-pad"
				/>
				<TextField
					label="Tags"
					value={draft.tags}
					onChangeText={(value) => update({ tags: value })}
					placeholder="travel, backup, monthly"
					hint="Comma-separated card tags used for filtering."
				/>
			</View>

			<View
				style={[
					styles.section,
					{ backgroundColor: palette.card, borderColor: palette.border, borderBottomColor: palette.border3D },
				]}
			>
				<Text style={[styles.sectionTitle, { color: palette.text }]}>
					Preferences
				</Text>
				<Button
					title={`Notifications: ${draft.notificationsEnabled ? "on" : "off"}`}
					variant="secondary"
					onPress={() =>
						update({ notificationsEnabled: !draft.notificationsEnabled })
					}
				/>
				<Text style={[styles.helper, { color: palette.muted }]}>
					If device permission is denied, reminders still appear in-app.
				</Text>
				<Button
					title={`Extended tracking: ${draft.extendedTrackingEnabled ? "on" : "off"}`}
					variant="secondary"
					onPress={() =>
						update({ extendedTrackingEnabled: !draft.extendedTrackingEnabled })
					}
				/>
				<Text style={[styles.helper, { color: palette.muted }]}>
					Keep this off unless you want to manage a manual follow-up window
					yourself.
				</Text>
			</View>

			<View
				style={[
					styles.section,
					{ backgroundColor: palette.card, borderColor: palette.border, borderBottomColor: palette.border3D },
				]}
			>
				<Text style={[styles.sectionTitle, { color: palette.text }]}>
					Provider template
				</Text>
				<Text style={[styles.helper, { color: palette.muted }]}>
					Only Amex is included in v1. It is advisory only.
				</Text>
				{providerTemplates.map((item) => (
					<Button
						key={item.id}
						title={`${draft.providerTemplateId === item.id ? "Using" : "Use"} ${item.provider} template`}
						variant={draft.providerTemplateId === item.id ? "primary" : "secondary"}
						onPress={() =>
							update({
								provider: item.provider,
								providerTemplateId:
									draft.providerTemplateId === item.id ? undefined : item.id,
								paidAmountNote: item.hint,
							})
						}
					/>
				))}
				{template ? (
					<View
						style={[
							styles.subSection,
							{ backgroundColor: palette.cardAlt, borderColor: palette.border },
						]}
					>
						<Text style={[styles.helper, { color: palette.text }]}>
							{template.title}
						</Text>
						<Text style={[styles.helper, { color: palette.muted }]}>
							{template.hint}
						</Text>
						<Text style={[styles.warning, { color: palette.warning }]}>
							{template.disclaimer}
						</Text>
					</View>
				) : null}
			</View>

			{draft.extendedTrackingEnabled ? (
				<View
					style={[
						styles.section,
						{ backgroundColor: palette.card, borderColor: palette.border, borderBottomColor: palette.border3D },
					]}
				>
					<Text style={[styles.sectionTitle, { color: palette.text }]}>
						Extended tracking
					</Text>
					<TextField
						label="Manual extended date"
						value={draft.extendedDate}
						onChangeText={(value) => update({ extendedDate: value })}
						placeholder="2026-05-28"
						hint="Use a real calendar date in YYYY-MM-DD format. The app creates a 1-day-before reminder and an on-date reminder."
					/>
					<TextField
						label="Paid amount or support note"
						value={draft.paidAmountNote}
						onChangeText={(value) => update({ paidAmountNote: value })}
						placeholder="Manual note about minimum payment or support guidance"
						multiline
						minHeight={96}
					/>
					<Button
						title={`Extended tracking acknowledgment: ${draft.acknowledgmentAccepted ? "accepted" : "not accepted"}`}
						variant={draft.acknowledgmentAccepted ? "success" : "secondary"}
						onPress={() =>
							update({ acknowledgmentAccepted: !draft.acknowledgmentAccepted })
						}
					/>
					<Text style={[styles.warning, { color: palette.text }]}>
						{EXTENDED_TRACKING_WARNING}
					</Text>
					<Text style={[styles.helper, { color: palette.muted }]}>
						{EXTENDED_TRACKING_RESPONSIBILITY}
					</Text>
				</View>
			) : null}

			{error ? (
				<Text style={[styles.error, { color: palette.danger }]}>{error}</Text>
			) : null}

			<View style={styles.actions}>
				<Button
					title={isSaving ? "Saving..." : submitLabel}
					variant="primary"
					onPress={() => void handleSubmit()}
					disabled={isSaving}
					style={{ flex: 1 }}
				/>

				{onDelete ? (
					<Button
						title="Delete card"
						variant="danger"
						onPress={() => void onDelete()}
					/>
				) : null}
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	content: {
		padding: spacing.xl,
		gap: spacing.lg,
		paddingBottom: 120,
	},
	section: {
		borderWidth: thickness.border,
		borderBottomWidth: thickness.border3D,
		borderRadius: radius.xl,
		padding: spacing.xl,
		gap: spacing.md,
	},
	subSection: {
		borderWidth: thickness.border,
		borderBottomWidth: thickness.border3D,
		borderRadius: radius.lg,
		padding: spacing.md,
		gap: 8,
	},
	title: {
		fontFamily: "Nunito_900Black",
		fontSize: 24,
		lineHeight: 30,
	},
	sectionTitle: {
		fontFamily: "Nunito_800ExtraBold",
		fontSize: 18,
		lineHeight: 24,
	},
	helper: {
		fontFamily: "Nunito_600SemiBold",
		fontSize: 14,
		lineHeight: 22,
	},
	warning: {
		fontFamily: "Nunito_700Bold",
		fontSize: 14,
		lineHeight: 22,
	},
	actions: {
		flexDirection: "row",
		gap: spacing.sm,
		marginTop: spacing.md,
	},
	error: {
		fontFamily: "Nunito_700Bold",
		fontSize: 14,
		lineHeight: 22,
		textAlign: "center",
	},
});
