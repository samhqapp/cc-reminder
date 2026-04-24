import type { ReactNode } from "react";
import type { PressableProps, StyleProp, ViewStyle } from "react-native";
import { Pressable } from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from "react-native-reanimated";

type Props = Omit<PressableProps, "children" | "style"> & {
	children?: ReactNode;
	contentStyle?: StyleProp<ViewStyle>;
	haptic?: boolean;
};

const SPRING = { damping: 15, stiffness: 400, mass: 0.6 };

export function PressableScale({
	children,
	contentStyle,
	disabled,
	onPress,
	onLongPress,
	...rest
}: Props) {
	const scale = useSharedValue(1);
	const translateY = useSharedValue(0);

	const animStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }, { translateY: translateY.value }],
		opacity: disabled ? 0.5 : 1,
	}));

	function handlePressIn() {
		scale.value = withSpring(0.96, SPRING);
		translateY.value = withSpring(3, SPRING);
	}

	function handlePressOut() {
		scale.value = withSpring(1, SPRING);
		translateY.value = withSpring(0, SPRING);
	}

	return (
		<Pressable
			{...rest}
			onPress={onPress}
			onLongPress={onLongPress}
			disabled={disabled}
			onPressIn={handlePressIn}
			onPressOut={handlePressOut}
			style={{ alignSelf: "stretch" }}
		>
			<Animated.View style={[animStyle, contentStyle]}>
				{children}
			</Animated.View>
		</Pressable>
	);
}
