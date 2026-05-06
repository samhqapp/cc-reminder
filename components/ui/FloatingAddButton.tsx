import { StyleSheet, Text } from "react-native";

import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { hairline } from "@/constants/Tokens";
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
					borderColor: palette.primary,
				},
			]}
		>
			<Text style={[styles.label, { color: palette.onPrimary }]}>+</Text>
		</PressableScale>
	);
}

const styles = StyleSheet.create({
	button: {
		width: 56,
		height: 56,
		borderRadius: 28,
		borderWidth: hairline,
		alignItems: "center",
		justifyContent: "center",
	},
	label: {
		fontSize: 28,
		lineHeight: 30,
		fontWeight: "400",
	},
});
