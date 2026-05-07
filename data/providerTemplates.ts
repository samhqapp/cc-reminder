import type { ProviderTemplate } from "@/types/domain";

export const providerTemplates: ProviderTemplate[] = [
	{
		id: "amex-flex",
		provider: "American Express",
		title: "Amex reference template",
		hint: "Use this only as a memory aid after you confirm the real dates and consequences with Amex for your specific account.",
		typicalExtraDays: 7,
		disclaimer:
			"Advisory only. CC Reminder does not verify issuer policy, late fees, grace treatment, or credit reporting outcomes.",
	},
	{
		id: "chase-flex",
		provider: "Chase",
		title: "Chase reference template",
		hint: "Chase typically offers a minimum payment due date with a late fee applied after. Grace period behavior varies by card product.",
		typicalExtraDays: 5,
		disclaimer:
			"Advisory only. Actual dates, fees, and reporting depend on your specific Chase agreement.",
	},
	{
		id: "citi-flex",
		provider: "Citi",
		title: "Citi reference template",
		hint: "Citi cards generally allow a short window after the due date before reporting. Minimum payment timing varies by product.",
		typicalExtraDays: 3,
		disclaimer:
			"Advisory only. Verify with Citi directly for your card's specific terms and grace behavior.",
	},
	{
		id: "discover-flex",
		provider: "Discover",
		title: "Discover reference template",
		hint: "Discover is known for waiving the first late fee. Extended window is a general memory aid only.",
		typicalExtraDays: 5,
		disclaimer:
			"Advisory only. First-fee waiver and reporting timelines depend on account standing.",
	},
	{
		id: "capitalone-flex",
		provider: "Capital One",
		title: "Capital One reference template",
		hint: "Capital One may report late after 30 days past due. The extended window here is a rough memory aid.",
		typicalExtraDays: 7,
		disclaimer:
			"Advisory only. Reporting and fee behavior depend on your specific Capital One agreement.",
	},
	{
		id: "bofa-flex",
		provider: "Bank of America",
		title: "Bank of America reference template",
		hint: "BofA typically charges a late fee the day after the due date. Grace period and reporting vary by product.",
		typicalExtraDays: 4,
		disclaimer:
			"Advisory only. Verify all dates and fee structures directly with Bank of America.",
	},
];
