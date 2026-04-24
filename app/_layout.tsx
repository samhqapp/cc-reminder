import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider,
} from "@react-navigation/native";
import {
	useFonts,
	Nunito_400Regular,
	Nunito_600SemiBold,
	Nunito_700Bold,
	Nunito_800ExtraBold,
	Nunito_900Black,
} from "@expo-google-fonts/nunito";
import * as Notifications from "expo-notifications";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { View } from "react-native";
import "react-native-reanimated";

import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { CardsProvider } from "@/hooks/useCards";
import { OnboardingProvider, useOnboarding } from "@/hooks/useOnboarding";

export {
	// Catch any errors thrown by the Layout component.
	ErrorBoundary,
} from "expo-router";

Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowBanner: true,
		shouldShowList: true,
		shouldPlaySound: false,
		shouldSetBadge: false,
	}),
});

export const unstable_settings = {
	// Route root launches through `index`, which decides onboarding vs. tabs.
	initialRouteName: "index",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const [loaded, error] = useFonts({
		Nunito_400Regular,
		Nunito_600SemiBold,
		Nunito_700Bold,
		Nunito_800ExtraBold,
		Nunito_900Black,
		SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
		...FontAwesome.font,
	});

	return (
		<OnboardingProvider>
			<CardsProvider>
				<RootLayoutContent loaded={loaded} error={error} />
			</CardsProvider>
		</OnboardingProvider>
	);
}

function RootLayoutContent({
	loaded,
	error,
}: {
	loaded: boolean;
	error: Error | null | undefined;
}) {
	const { isReady } = useOnboarding();

	// Expo Router uses Error Boundaries to catch errors in the navigation tree.
	useEffect(() => {
		if (error) throw error;
	}, [error]);

	useEffect(() => {
		if (loaded && isReady) {
			SplashScreen.hideAsync();
		}
	}, [isReady, loaded]);

	if (!loaded || !isReady) {
		return null;
	}

	return <RootLayoutNav />;
}

function RootLayoutNav() {
	const colorScheme = useColorScheme() ?? "light";
	const palette = Colors[colorScheme];
	const router = useRouter();
	const segments = useSegments();
	const { hasCompletedOnboarding, isReady } = useOnboarding();

	useEffect(() => {
		if (!isReady) {
			return;
		}

		const firstSegment = String(segments[0] ?? "");
		const atRoot = firstSegment.length === 0;
		const inOnboarding = firstSegment === "onboarding";

		if (atRoot) {
			return;
		}

		if (!hasCompletedOnboarding && !inOnboarding) {
			router.replace("/onboarding");
			return;
		}

		if (hasCompletedOnboarding && inOnboarding) {
			router.replace("/(tabs)");
			return;
		}
	}, [hasCompletedOnboarding, isReady, router, segments]);

	return (
		<ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
			<View style={{ flex: 1, backgroundColor: palette.background }}>
				<View
					style={{
						flex: 1,
						width: "100%",
						maxWidth: 480,
						alignSelf: "center",
						backgroundColor: palette.background,
					}}
				>
					<Stack
						screenOptions={{
							headerStyle: {
								backgroundColor: palette.background,
							},
							headerShadowVisible: false,
							headerTitleStyle: {
								fontFamily: "Nunito_800ExtraBold",
								fontSize: 18,
							},
							animation: "slide_from_right",
							animationDuration: 220,
						}}
					>
						<Stack.Screen name="index" options={{ headerShown: false }} />
						<Stack.Screen name="onboarding" options={{ headerShown: false }} />
						<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
						<Stack.Screen
							name="card/new"
							options={{ presentation: "modal", title: "New Card" }}
						/>
						<Stack.Screen name="card/[id]" options={{ title: "Card Details" }} />
						<Stack.Screen
							name="modal"
							options={{ presentation: "modal", title: "About CC Reminder" }}
						/>
					</Stack>
				</View>
			</View>
		</ThemeProvider>
	);
}
