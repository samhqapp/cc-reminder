import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet } from "react-native";

import { hairline, shadow, stylepass } from "@/constants/Tokens";
import { PressableScale } from "@/components/ui/PressableScale";
import { mediumTap } from "@/utils/haptics";

type Props = {
	onPress: () => void;
};

export function FloatingAddButton({ onPress }: Props) {
	return (
		<PressableScale
			accessibilityRole="button"
			accessibilityLabel="Add renewal"
			onPress={() => {
				mediumTap();
				onPress();
			}}
			contentStyle={[
				styles.button,
				{
					backgroundColor: "rgba(92, 76, 115, 0.9)",
					borderColor: "rgba(255, 247, 233, 0.18)",
				},
			]}
		>
			<Ionicons name="add" size={30} color={stylepass.cream} />
		</PressableScale>
	);
}

const styles = StyleSheet.create({
	button: {
		...shadow.floating,
		width: 58,
		height: 58,
		borderRadius: 29,
		borderWidth: hairline,
		alignItems: "center",
		justifyContent: "center",
	},
});
