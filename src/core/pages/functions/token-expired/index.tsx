import { useMutation } from "@tanstack/react-query";
import demoService from "@/core/api/services/demoService";
import { Button } from "@/core/ui/button";
import { Card, CardContent } from "@/core/ui/card";

export default function TokenExpired() {
	const tokenExpiredMutation = useMutation({
		mutationFn: demoService.mockTokenExpired,
	});
	const mockTokenExpired = () => {
		tokenExpiredMutation.mutate();
	};
	return (
		<Card>
			<CardContent className="grid grid-cols-1 gap-4 lg:grid-cols-2">
				<div>
					<p>Clicking a button to simulate a token expiration scenario.</p>
				</div>
				<div>
					<Button onClick={mockTokenExpired}>Simulate Token Expired</Button>
				</div>
			</CardContent>
		</Card>
	);
}
