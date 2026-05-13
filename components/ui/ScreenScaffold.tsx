import type { PropsWithChildren, ReactNode } from "react";
import { useEffect, useRef } from "react";
import {
	AccessibilityInfo,
	Animated,
	Easing,
	Platform,
	ScrollView,
	StyleSheet,
	Text,
	View,
	type StyleProp,
	type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
	motion,
	radius,
	screenWorld,
	type ScreenWorldName,
	shadow,
	spacing,
	stylepass,
	type as typeTokens,
} from "@/constants/Tokens";

type ScreenScaffoldProps = PropsWithChildren<{
	world: ScreenWorldName;
	kicker: string;
	title: string;
	subtitle: string;
	contentStyle?: StyleProp<ViewStyle>;
	afterScroll?: ReactNode;
}>;

export function ScreenScaffold({
	world,
	kicker,
	title,
	subtitle,
	children,
	contentStyle,
	afterScroll,
}: ScreenScaffoldProps) {
	const worldTokens = screenWorld[world];
	const opacity = useRef(new Animated.Value(0)).current;
	const drift = useRef(new Animated.Value(18)).current;

	useEffect(() => {
		let isMounted = true;

		AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
			if (!isMounted) return;

			if (reduceMotion) {
				opacity.setValue(1);
				drift.setValue(0);
				return;
			}

			Animated.parallel([
				Animated.timing(opacity, {
					toValue: 1,
					duration: motion.screen,
					easing: Easing.out(Easing.cubic),
					useNativeDriver: true,
				}),
				Animated.timing(drift, {
					toValue: 0,
					duration: motion.screen,
					easing: Easing.out(Easing.cubic),
					useNativeDriver: true,
				}),
			]).start();
		});

		return () => {
			isMounted = false;
		};
	}, [drift, opacity]);

	return (
		<SafeAreaView
			edges={["top"]}
			style={[styles.safeArea, { backgroundColor: worldTokens.background }]}
		>
			<View
				pointerEvents="none"
				style={[
					styles.texture,
					{ backgroundColor: worldTokens.background },
				]}
			>
				<View style={[styles.glow, { backgroundColor: stylepass.cream }]} />
				<View
					style={[
						styles.inkSmudge,
						{ backgroundColor: worldTokens.accentSoft },
					]}
				/>
			</View>
			<ScrollView
				style={styles.scroll}
				contentContainerStyle={[styles.content, contentStyle]}
				contentInsetAdjustmentBehavior="automatic"
				automaticallyAdjustKeyboardInsets
				keyboardShouldPersistTaps="handled"
				keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
				showsVerticalScrollIndicator={false}
			>
				<Animated.View
					style={{
						opacity,
						transform: [{ translateY: drift }],
					}}
				>
					<View style={styles.header}>
						<Text style={styles.kicker}>{kicker}</Text>
						<Text style={styles.title}>{title}</Text>
						<Text style={styles.subtitle}>{subtitle}</Text>
					</View>
					{children}
				</Animated.View>
			</ScrollView>
			{afterScroll}
		</SafeAreaView>
	);
}

type AnimatedAppearProps = PropsWithChildren<{
	delay?: number;
	style?: StyleProp<ViewStyle>;
}>;

export function AnimatedAppear({
	children,
	delay = 0,
	style,
}: AnimatedAppearProps) {
	const opacity = useRef(new Animated.Value(0)).current;
	const drift = useRef(new Animated.Value(14)).current;

	useEffect(() => {
		let isMounted = true;

		AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
			if (!isMounted) return;

			if (reduceMotion) {
				opacity.setValue(1);
				drift.setValue(0);
				return;
			}

			Animated.parallel([
				Animated.timing(opacity, {
					toValue: 1,
					duration: motion.card,
					delay,
					easing: Easing.out(Easing.cubic),
					useNativeDriver: true,
				}),
				Animated.timing(drift, {
					toValue: 0,
					duration: motion.card,
					delay,
					easing: Easing.out(Easing.cubic),
					useNativeDriver: true,
				}),
			]).start();
		});

		return () => {
			isMounted = false;
		};
	}, [delay, drift, opacity]);

	return (
		<Animated.View
			style={[
				style,
				{
					opacity,
					transform: [{ translateY: drift }],
				},
			]}
		>
			{children}
		</Animated.View>
	);
}

export function PaperPanel({
	children,
	style,
}: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
	return <View style={[styles.paperPanel, style]}>{children}</View>;
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
	},
	texture: {
		...StyleSheet.absoluteFillObject,
		overflow: "hidden",
	},
	glow: {
		position: "absolute",
		top: -90,
		right: -72,
		width: 220,
		height: 220,
		borderRadius: 110,
		opacity: 0.24,
	},
	inkSmudge: {
		position: "absolute",
		bottom: 70,
		left: -74,
		width: 180,
		height: 140,
		borderRadius: 70,
		opacity: 0.6,
		transform: [{ rotate: "-13deg" }],
	},
	scroll: {
		flex: 1,
	},
	content: {
		paddingHorizontal: spacing.lg,
		paddingTop: spacing.lg,
		paddingBottom: 136,
	},
	header: {
		gap: spacing.xs,
		marginBottom: spacing.lg,
	},
	kicker: {
		...typeTokens.legal,
		color: stylepass.muted,
		textTransform: "uppercase",
		letterSpacing: 1.4,
	},
	title: {
		...typeTokens.displayLg,
		color: stylepass.ink,
	},
	subtitle: {
		...typeTokens.body,
		color: "rgba(21, 24, 33, 0.67)",
		maxWidth: 340,
	},
	paperPanel: {
		...shadow.panel,
		backgroundColor: stylepass.panel,
		borderColor: stylepass.line,
		borderWidth: 1,
		borderRadius: radius.xxl,
	},
});
