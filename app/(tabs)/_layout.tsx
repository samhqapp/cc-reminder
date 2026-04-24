import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";

import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";

export default function TabLayout() {
	const colorScheme = useColorScheme() ?? "light";
	const palette = Colors[colorScheme];

	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: palette.primary,
				tabBarInactiveTintColor: palette.muted,
				tabBarStyle: {
					position: "absolute",
					bottom: 24,
					left: 24,
					right: 24,
					backgroundColor: palette.card,
					borderColor: palette.borderSoft,
					borderWidth: 2,
					borderBottomWidth: 4,
					borderRadius: 32,
					height: 72,
					paddingTop: 12,
					paddingBottom: 12,
					shadowColor: palette.border3D,
					shadowOffset: { width: 0, height: 8 },
					shadowOpacity: 0.15,
					shadowRadius: 16,
					elevation: 8,
				},
				tabBarLabelStyle: {
					fontSize: 12,
					fontWeight: "800",
				},
				tabBarIconStyle: {
					marginBottom: 0,
				},
				headerStyle: {
					backgroundColor: palette.background,
				},
				headerShadowVisible: false,
				headerTitleStyle: {
					fontFamily: "Nunito_900Black",
					fontSize: 18,
					color: palette.text,
				},
				headerShown: false,
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Cards",
					tabBarIcon: ({ color, size }) => (
						<FontAwesome name="credit-card" size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="two"
				options={{
					title: "Reminders",
					tabBarIcon: ({ color, size }) => (
						<FontAwesome name="bell" size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="notes"
				options={{
					title: "Notes",
					tabBarIcon: ({ color, size }) => (
						<FontAwesome name="sticky-note" size={size} color={color} />
					),
				}}
			/>
		</Tabs>
	);
}
