import type { ReactNode } from "react";
import type { PressableProps, StyleProp, ViewStyle } from "react-native";
import { Pressable } from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";

import { motion } from "@/constants/Tokens";

type Props = Omit<PressableProps, "children" | "style"> & {
	children?: ReactNode;
	contentStyle?: StyleProp<ViewStyle>;
	haptic?: boolean;
};

export function PressableScale({
	children,
	contentStyle,
	disabled,
	onPressIn,
	onPressOut,
	...rest
}: Props) {
	const pressed = useSharedValue(0);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [
			{ scale: withTiming(pressed.value ? 0.98 : 1, { duration: motion.fast }) },
		],
		opacity: withTiming(disabled ? 0.4 : pressed.value ? 0.7 : 1, {
			duration: motion.fast,
		}),
	}));

	return (
		<Pressable
			{...rest}
			disabled={disabled}
			onPressIn={(e) => {
				pressed.value = 1;
				onPressIn?.(e);
			}}
			onPressOut={(e) => {
				pressed.value = 0;
				onPressOut?.(e);
			}}
			style={{ alignSelf: "stretch" }}
		>
			<Animated.View style={[contentStyle, animatedStyle]}>
				{children}
			</Animated.View>
		</Pressable>
	);
}
