import {
	fireEvent,
	render,
	screen,
} from "@testing-library/react-native";
import * as Haptics from "expo-haptics";

jest.mock("@expo/vector-icons/Ionicons", () => {
	const React = require("react");
	const { Text } = require("react-native");
	const Icon = ({ name }: { name: string }) =>
		React.createElement(Text, null, name);

	Icon.glyphMap = {
		"calendar-outline": true,
		calendar: true,
		"albums-outline": true,
		albums: true,
		"notifications-outline": true,
		notifications: true,
		"document-text-outline": true,
		"document-text": true,
		"options-outline": true,
		options: true,
	};

	return {
		__esModule: true,
		default: Icon,
	};
});

import {
	InkRailTabBar,
	TAB_ITEMS,
	TAB_RAIL_LAYOUT,
	type TabItem,
} from "@/app/(tabs)/_layout";

function createTabBarProps({
	index = 0,
}: {
	index?: number;
} = {}) {
	const routes = TAB_ITEMS.map((item) => ({
		key: `${item.name}-key`,
		name: item.name,
	}));
	const titlesByName = TAB_ITEMS.reduce<Record<string, TabItem>>((acc, item) => {
		acc[item.name] = item;
		return acc;
	}, {});
	const navigation = {
		emit: jest.fn(() => ({ defaultPrevented: false })),
		navigate: jest.fn(),
	};

	return {
		props: {
			state: {
				index,
				routes,
			},
			descriptors: Object.fromEntries(
				routes.map((route) => [
					route.key,
					{ options: { title: titlesByName[route.name].title } },
				]),
			),
			navigation,
		},
		navigation,
	};
}

describe("TabLayout style contract", () => {
	it("uses the approved icon-only Ink Rail destinations", () => {
		expect(TAB_ITEMS.map((item) => item.title)).toEqual([
			"Billing Dates",
			"Cards",
			"Reminders",
			"Notes",
			"Settings",
		]);
		expect(TAB_ITEMS.map((item) => item.outlineIcon)).toEqual([
			"calendar-outline",
			"albums-outline",
			"notifications-outline",
			"document-text-outline",
			"options-outline",
		]);
		expect(TAB_ITEMS.every((item) => item.filledIcon.endsWith("-outline"))).toBe(
			false,
		);
	});

	it("keeps five tab items spaced evenly across the rail", () => {
		expect(TAB_RAIL_LAYOUT.maxWidth).toBeGreaterThanOrEqual(390);
		expect(TAB_RAIL_LAYOUT.justifyContent).toBe("space-between");
		expect(TAB_RAIL_LAYOUT.tabPressableWidth * TAB_ITEMS.length).toBeLessThan(
			TAB_RAIL_LAYOUT.maxWidth - TAB_RAIL_LAYOUT.paddingHorizontal * 2,
		);
	});

	it("does not vibrate when pressing tab bar destinations", () => {
		const { props, navigation } = createTabBarProps();

		render(<InkRailTabBar {...props} />);
		fireEvent.press(screen.getByLabelText("Cards"));
		fireEvent.press(screen.getByLabelText("Billing Dates"));

		expect(Haptics.impactAsync).not.toHaveBeenCalled();
		expect(navigation.navigate).toHaveBeenCalledWith("cards", undefined);
		expect(navigation.navigate).toHaveBeenCalledTimes(1);
	});
});
