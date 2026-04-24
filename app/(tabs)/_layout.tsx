import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";

export default function TabLayout() {
	const colorScheme = useColorScheme() ?? "light";
	const palette = Colors[colorScheme];
	const insets = useSafeAreaInsets();

	// Sit 12px above the system gesture bar (pill nav on Android / home bar on iOS)
	const navBottom = Math.max(insets.bottom, 8) + 12;
	const navHeight = 64;

	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: palette.primary,
				tabBarInactiveTintColor: palette.muted,
				tabBarStyle: {
					position: "absolute",
					bottom: navBottom,
					left: 20,
					right: 20,
					backgroundColor: palette.card,
					borderColor: palette.borderSoft,
					borderWidth: 2,
					borderBottomWidth: 4,
					borderRadius: 32,
					height: navHeight,
					// Even vertical rhythm: icon + label centred together
					paddingTop: 10,
					paddingBottom: 10,
					shadowColor: palette.border3D,
					shadowOffset: { width: 0, height: 8 },
					shadowOpacity: 0.15,
					shadowRadius: 16,
					elevation: 12,
				},
				tabBarLabelStyle: {
					fontSize: 11,
					fontWeight: "800",
					marginTop: 2,
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
