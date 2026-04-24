import type { PropsWithChildren, ReactNode } from "react";
import {
	KeyboardAvoidingView,
	Modal,
	Platform,
	Pressable,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { radius, shadow, spacing } from "@/constants/Tokens";

type Props = PropsWithChildren<{
	visible: boolean;
	title: string;
	subtitle?: string;
	onClose: () => void;
	footer?: ReactNode;
}>;

export function BottomSheet({
	visible,
	title,
	subtitle,
	onClose,
	footer,
	children,
}: Props) {
	const colorScheme = useColorScheme() ?? "light";
	const palette = Colors[colorScheme];

	return (
		<Modal
			animationType="slide"
			transparent
			visible={visible}
			onRequestClose={onClose}
		>
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : undefined}
				style={styles.keyboard}
			>
				<Pressable
					style={[styles.overlay, { backgroundColor: palette.overlayStrong }]}
					onPress={onClose}
				/>
				<SafeAreaView edges={["bottom"]} style={styles.safeArea}>
					<View
						style={[
							styles.sheet,
							{
								backgroundColor: palette.card,
								borderColor: palette.border,
								shadowColor: palette.accent,
							},
							shadow.soft,
						]}
					>
						<View style={styles.header}>
							<View style={styles.grabberWrap}>
								<View
									style={[
										styles.grabber,
										{ backgroundColor: palette.borderSoft },
									]}
								/>
							</View>
							<Text style={[styles.title, { color: palette.text }]}>{title}</Text>
							{subtitle ? (
								<Text style={[styles.subtitle, { color: palette.muted }]}>
									{subtitle}
								</Text>
							) : null}
						</View>
						<View style={styles.body}>{children}</View>
						{footer ? <View style={styles.footer}>{footer}</View> : null}
					</View>
				</SafeAreaView>
			</KeyboardAvoidingView>
		</Modal>
	);
}

const styles = StyleSheet.create({
	keyboard: {
		flex: 1,
		justifyContent: "flex-end",
	},
	overlay: {
		...StyleSheet.absoluteFillObject,
	},
	safeArea: {
		justifyContent: "flex-end",
	},
	sheet: {
		borderTopLeftRadius: radius.xl,
		borderTopRightRadius: radius.xl,
		borderWidth: 1,
		paddingHorizontal: spacing.lg,
		paddingTop: spacing.sm,
		paddingBottom: spacing.lg,
		gap: spacing.md,
	},
	header: {
		gap: spacing.xs,
	},
	grabberWrap: {
		alignItems: "center",
		paddingBottom: spacing.xs,
	},
	grabber: {
		width: 56,
		height: 6,
		borderRadius: 999,
	},
	title: {
		fontSize: 22,
		lineHeight: 28,
		fontWeight: "800",
	},
	subtitle: {
		fontSize: 14,
		lineHeight: 20,
	},
	body: {
		gap: spacing.md,
	},
	footer: {
		gap: spacing.sm,
	},
});
