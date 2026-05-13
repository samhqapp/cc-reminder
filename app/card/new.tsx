import { router } from "expo-router";

import { CardForm } from "@/components/card/CardForm";
import { useCards } from "@/hooks/useCards";
import { blurActiveElementOnWeb } from "@/utils/web";

export default function NewCardScreen() {
	const { createCard, defaultDraft } = useCards();

	return (
		<CardForm
			key="new-card-form"
			title="Add Billing Date"
			subtitle="Capture only the reminder data that matters: provider, last 4 digits, tags, billing day, renewal day, and notes."
			initialDraft={defaultDraft()}
			submitLabel="Save card"
			onSubmit={async (draft) => {
				const error = await createCard(draft);
				if (!error) {
					blurActiveElementOnWeb();
					router.back();
				}
				return error;
			}}
		/>
	);
}
