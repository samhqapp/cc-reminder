import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import { useEffect } from "react";
import {
	Platform,
	Pressable,
	StyleSheet,
	View,
} from "react-native";
import Animated, {
	interpolateColor,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
	motion,
	radius,
	shadow,
	spacing,
	stylepass,
} from "@/constants/Tokens";

type IoniconName = keyof typeof Ionicons.glyphMap;

export type TabItem = {
	name: string;
	title: string;
	outlineIcon: IoniconName;
	filledIcon: IoniconName;
};

export const TAB_ITEMS = [
	{
		name: "index",
		title: "Billing Dates",
		outlineIcon: "calendar-outline",
		filledIcon: "calendar",
	},
	{
		name: "cards",
		title: "Cards",
		outlineIcon: "albums-outline",
		filledIcon: "albums",
	},
	{
		name: "two",
		title: "Reminders",
		outlineIcon: "notifications-outline",
		filledIcon: "notifications",
	},
	{
		name: "notes",
		title: "Notes",
		outlineIcon: "document-text-outline",
		filledIcon: "document-text",
	},
	{
		name: "settings",
		title: "Settings",
		outlineIcon: "options-outline",
		filledIcon: "options",
	},
] satisfies TabItem[];

export const TAB_RAIL_LAYOUT = {
	maxWidth: 390,
	height: 66,
	paddingHorizontal: 16,
	gap: 6,
	tabPressableWidth: 50,
	tabPressableHeight: 50,
	tabButtonSize: 46,
	iconSize: 28,
	justifyContent: "space-between",
} as const;

const TAB_BY_ROUTE = TAB_ITEMS.reduce<Record<string, TabItem>>((acc, item) => {
	acc[item.name] = item;
	return acc;
}, {});

type Route = {
	key: string;
	name: string;
	params?: object;
};

type TabBarProps = {
	state: {
		index: number;
		routes: Route[];
	};
	descriptors: Record<
		string,
		{
			options: {
				tabBarAccessibilityLabel?: string;
				title?: string;
			};
		}
	>;
	navigation: {
		emit: (event: {
			type: "tabPress";
			target: string;
			canPreventDefault: true;
		}) => { defaultPrevented: boolean };
		navigate: (name: string, params?: object) => void;
	};
};

export default function TabLayout() {
	return (
		<Tabs
			tabBar={(props) => <InkRailTabBar {...props} />}
			screenOptions={{
				headerShown: false,
				tabBarShowLabel: false,
			}}
		>
			{TAB_ITEMS.map((item) => (
				<Tabs.Screen
					key={item.name}
					name={item.name}
					options={{
						title: item.title,
					}}
				/>
			))}
		</Tabs>
	);
}

export function InkRailTabBar({ state, descriptors, navigation }: TabBarProps) {
	const insets = useSafeAreaInsets();
	const bottom = insets.bottom + (Platform.OS === "android" ? 12 : 10);

	return (
		<View pointerEvents="box-none" style={[styles.wrap, { bottom }]}>
			<View style={styles.rail}>
				{state.routes.map((route, index) => {
					const item = TAB_BY_ROUTE[route.name];
					if (!item) return null;

					const isFocused = state.index === index;
					const options = descriptors[route.key]?.options ?? {};

					return (
						<Pressable
							key={route.key}
							accessibilityRole="tab"
							accessibilityState={isFocused ? { selected: true } : {}}
							accessibilityLabel={
								options.tabBarAccessibilityLabel ?? options.title ?? item.title
							}
							onPress={() => {
								const event = navigation.emit({
									type: "tabPress",
									target: route.key,
									canPreventDefault: true,
								});

								if (!isFocused && !event.defaultPrevented) {
									navigation.navigate(route.name, route.params);
								}
							}}
							style={styles.tabPressable}
						>
							<AnimatedTabIcon item={item} active={isFocused} />
						</Pressable>
					);
				})}
			</View>
		</View>
	);
}

function AnimatedTabIcon({ item, active }: { item: TabItem; active: boolean }) {
	const progress = useSharedValue(active ? 1 : 0);

	useEffect(() => {
		progress.value = withTiming(active ? 1 : 0, { duration: motion.tab });
	}, [active, progress]);

	const buttonStyle = useAnimatedStyle(() => ({
		backgroundColor: interpolateColor(
			progress.value,
			[0, 1],
			["rgba(255, 247, 233, 0)", stylepass.railSelected],
		),
		transform: [{ scale: 1 + progress.value * 0.04 }],
	}));

	const outlineStyle = useAnimatedStyle(() => ({
		opacity: 1 - progress.value,
	}));

	const filledStyle = useAnimatedStyle(() => ({
		opacity: progress.value,
	}));

	return (
		<Animated.View
			style={[styles.tabButton, buttonStyle]}
		>
			<Animated.View style={[styles.iconLayer, outlineStyle]}>
				<Ionicons
					name={item.outlineIcon}
					size={TAB_RAIL_LAYOUT.iconSize}
					color={stylepass.railIcon}
				/>
			</Animated.View>
			<Animated.View style={[styles.iconLayer, filledStyle]}>
				<Ionicons
					name={item.filledIcon}
					size={TAB_RAIL_LAYOUT.iconSize}
					color={stylepass.cream}
				/>
			</Animated.View>
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	wrap: {
		position: "absolute",
		left: spacing.lg,
		right: spacing.lg,
		zIndex: 20,
		alignItems: "center",
	},
	rail: {
		...shadow.floating,
		width: "100%",
		maxWidth: TAB_RAIL_LAYOUT.maxWidth,
		height: TAB_RAIL_LAYOUT.height,
		borderRadius: radius.rail,
		borderWidth: 1,
		borderColor: stylepass.railBorder,
		backgroundColor: stylepass.rail,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: TAB_RAIL_LAYOUT.justifyContent,
		paddingHorizontal: TAB_RAIL_LAYOUT.paddingHorizontal,
		gap: TAB_RAIL_LAYOUT.gap,
	},
	tabPressable: {
		width: TAB_RAIL_LAYOUT.tabPressableWidth,
		height: TAB_RAIL_LAYOUT.tabPressableHeight,
		alignItems: "center",
		justifyContent: "center",
	},
	tabButton: {
		width: TAB_RAIL_LAYOUT.tabButtonSize,
		height: TAB_RAIL_LAYOUT.tabButtonSize,
		borderRadius: 16,
		alignItems: "center",
		justifyContent: "center",
	},
	iconLayer: {
		position: "absolute",
		width: 32,
		height: 32,
		alignItems: "center",
		justifyContent: "center",
	},
});
