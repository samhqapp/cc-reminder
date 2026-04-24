import { StyleSheet, Text } from "react-native";

import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { shadow, thickness } from "@/constants/Tokens";
import { PressableScale } from "@/components/ui/PressableScale";

type Props = {
	onPress: () => void;
};

export function FloatingAddButton({ onPress }: Props) {
	const colorScheme = useColorScheme() ?? "light";
	const palette = Colors[colorScheme];

	return (
		<PressableScale
			onPress={onPress}
			contentStyle={[
				styles.button,
				{
					backgroundColor: palette.primary,
					borderColor: palette.primaryBorder,
					shadowColor: palette.primaryBorder,
				},
				shadow.medium,
			]}
		>
			<Text style={[styles.label, { color: palette.onPrimary }]}>+</Text>
		</PressableScale>
	);
}

const styles = StyleSheet.create({
	button: {
		width: 72,
		height: 72,
		borderRadius: 36,
		borderWidth: thickness.border,
		borderBottomWidth: thickness.border3D,
		alignItems: "center",
		justifyContent: "center",
	},
	label: {
		fontSize: 40,
		lineHeight: 44,
		fontWeight: "900",
		marginTop: -2,
	},
});
