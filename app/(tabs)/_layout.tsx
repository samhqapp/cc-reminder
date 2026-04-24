import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import { Platform, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";

export default function TabLayout() {
	const colorScheme = useColorScheme() ?? "light";
	const palette = Colors[colorScheme];
	const insets = useSafeAreaInsets();
	const { width } = useWindowDimensions();

	// Responsive horizontal margin: tighter on narrow screens (Pixel 3 = ~392dp)
	const hMargin = width < 400 ? 10 : 16;

	// Clear the system gesture bar with a small, consistent gap
	const gestureBarHeight = insets.bottom;
	const bottomOffset = gestureBarHeight + (Platform.OS === "android" ? 10 : 12);

	// Explicit height: icon (20) + gap (4) + label (12) + vertical padding (2*10)
	const TAB_HEIGHT = 64;

	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: palette.primary,
				tabBarInactiveTintColor: palette.muted,
				tabBarStyle: {
					position: "absolute",
					bottom: bottomOffset,
					left: hMargin,
					right: hMargin,
					backgroundColor: palette.card,
					borderColor: palette.borderSoft,
					borderWidth: 2,
					borderBottomWidth: 4,
					borderRadius: 24,
					height: TAB_HEIGHT,
					// Zero out React Navigation's default internal padding
					// so we control it entirely via tabBarItemStyle
					paddingTop: 0,
					paddingBottom: 0,
					shadowColor: palette.border3D,
					shadowOffset: { width: 0, height: 6 },
					shadowOpacity: 0.12,
					shadowRadius: 12,
					elevation: 8,
				},
				tabBarItemStyle: {
					// Even vertical padding so icon+label are truly centred
					height: TAB_HEIGHT,
					paddingTop: 10,
					paddingBottom: 10,
				},
				tabBarLabelStyle: {
					fontSize: 11,
					fontWeight: "800",
					// Reset any default margin React Navigation adds
					marginTop: 2,
					marginBottom: 0,
				},
				tabBarIconStyle: {
					marginBottom: 0,
					marginTop: 0,
				},
				headerShown: false,
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Cards",
					tabBarIcon: ({ color }) => (
						<FontAwesome name="credit-card" size={18} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="two"
				options={{
					title: "Reminders",
					tabBarIcon: ({ color }) => (
						<FontAwesome name="bell" size={18} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="notes"
				options={{
					title: "Notes",
					tabBarIcon: ({ color }) => (
						<FontAwesome name="sticky-note" size={18} color={color} />
					),
				}}
			/>
		</Tabs>
	);
}
