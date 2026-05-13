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
import {
	hairline,
	radius,
	shadow,
	spacing,
	stylepass,
	type as typeTokens,
} from "@/constants/Tokens";

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
								backgroundColor: stylepass.cream,
								borderColor: palette.border,
							},
						]}
					>
						<View style={styles.header}>
							<View style={styles.grabberWrap}>
								<View
									style={[
										styles.grabber,
										{ backgroundColor: palette.border },
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
		...shadow.panel,
		borderTopLeftRadius: radius.rail,
		borderTopRightRadius: radius.rail,
		borderWidth: hairline,
		borderBottomWidth: 0,
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
		width: 40,
		height: 4,
		borderRadius: 2,
	},
	title: {
		...typeTokens.titleMd,
	},
	subtitle: {
		...typeTokens.body,
	},
	body: {
		gap: spacing.md,
	},
	footer: {
		gap: spacing.sm,
	},
});
