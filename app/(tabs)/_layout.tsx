import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { hairline } from "@/constants/Tokens";

export default function TabLayout() {
	const colorScheme = useColorScheme() ?? "light";
	const palette = Colors[colorScheme];
	const insets = useSafeAreaInsets();

	const bottomPad = insets.bottom + (Platform.OS === "android" ? 8 : 0);

	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: palette.tabActive,
				tabBarInactiveTintColor: palette.tabInactive,
				tabBarStyle: {
					backgroundColor: palette.tabBar,
					borderTopColor: palette.border,
					borderTopWidth: hairline,
					paddingBottom: bottomPad,
					height: 52 + bottomPad,
				},
				tabBarItemStyle: {
					paddingTop: 6,
					paddingBottom: 4,
				},
				tabBarLabelStyle: {
					fontSize: 11,
					fontWeight: "500",
					letterSpacing: 0.2,
				},
				headerShown: false,
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Cards",
					tabBarIcon: ({ color }) => (
						<FontAwesome name="credit-card" size={17} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="two"
				options={{
					title: "Reminders",
					tabBarIcon: ({ color }) => (
						<FontAwesome name="bell" size={17} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="notes"
				options={{
					title: "Notes",
					tabBarIcon: ({ color }) => (
						<FontAwesome name="sticky-note" size={17} color={color} />
					),
				}}
			/>
		</Tabs>
	);
}
