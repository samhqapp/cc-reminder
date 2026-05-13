import { render } from "@testing-library/react-native";
import { ScrollView, Text } from "react-native";

import { ScreenScaffold } from "./ScreenScaffold";

describe("ScreenScaffold", () => {
	it("keeps focused inputs visible when the keyboard opens", () => {
		const { UNSAFE_getByType } = render(
			<ScreenScaffold
				world="billing"
				kicker="May Ledger"
				title="Billing Dates"
				subtitle="Search should remain visible while typing."
			>
				<Text>Search body</Text>
			</ScreenScaffold>,
		);

		const scrollView = UNSAFE_getByType(ScrollView);

		expect(scrollView.props.automaticallyAdjustKeyboardInsets).toBe(true);
		expect(scrollView.props.keyboardShouldPersistTaps).toBe("handled");
	});
});
