import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { quoteDestinationCountries } from "@/lib/quote-destination-countries";
import { useAxios } from "@/hooks/use-axios";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const countries = quoteDestinationCountries;

export function QuoteDestinationSettings() {
	const axios = useAxios();
	const queryClient = useQueryClient();
	const { toast } = useToast();
	const [country, setCountry] = useState("");
	const preferences = useQuery(["quote-preferences"], async () => {
		const response = await axios.get("/accounts/get_quote_preferences");
		return response.data.quote_preferences as {
			destination_country_code: string | null;
		};
	});
	useEffect(() => {
		if (preferences.data)
			setCountry(preferences.data.destination_country_code ?? "");
	}, [preferences.data]);
	const mutation = useMutation(
		async () => {
			const response = await axios.post("/accounts/update_quote_preferences", {
				destination_country_code: country || null,
			});
			return response.data.quote_preferences;
		},
		{
			onSuccess: (saved) => {
				queryClient.setQueryData(["quote-preferences"], saved);
				toast({ title: "Quote destination saved" });
			},
			onError: () => {
				toast({
					title: "Could not save quote destination",
					variant: "destructive",
				});
			},
		},
	);
	return (
		<div className="border rounded-lg border-gray-200 p-4 sm:p-6 space-y-3">
			<h3 className="text-sm sm:text-base font-semibold">
				PCB quote destination
			</h3>
			<p className="text-xs sm:text-sm text-gray-500">
				Choose where your boards will ship. Shipping and estimated duties and
				taxes will be shown separately from manufacturing costs. Exact delivery
				costs may also require a postal code and shipping service.
			</p>
			<label
				htmlFor="quote-destination-country"
				className="block text-sm font-medium"
			>
				Destination country
			</label>
			<select
				id="quote-destination-country"
				value={country}
				onChange={(e) => setCountry(e.target.value)}
				disabled={
					preferences.isLoading || preferences.isError || mutation.isLoading
				}
				className="border border-gray-300 rounded-md p-2 w-full sm:max-w-md text-sm"
			>
				<option value="">Not specified</option>
				{countries.map(({ code, name }) => (
					<option key={code} value={code}>
						{name}
					</option>
				))}
			</select>
			{preferences.isError && (
				<p role="alert" className="text-sm text-red-600">
					Could not load your quote destination.{" "}
					<button
						type="button"
						onClick={() => preferences.refetch()}
						className="underline"
					>
						Retry
					</button>
				</p>
			)}
			<div>
				<Button
					size="sm"
					onClick={() => mutation.mutate()}
					disabled={
						!preferences.data ||
						mutation.isLoading ||
						country === (preferences.data.destination_country_code ?? "")
					}
				>
					{mutation.isLoading ? "Saving..." : "Save destination"}
				</Button>
			</div>
		</div>
	);
}
