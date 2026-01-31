import { useParams } from "@/core/routes/hooks";
import type { UserInfo } from "@/core/types/entity";
import { Card, CardContent } from "@/core/ui/card";

// TODO: fix
// const USERS: UserInfo[] = USER_LIST as UserInfo[];
const USERS: UserInfo[] = [];

export default function UserDetail() {
	const { id } = useParams();
	const user = USERS.find((user) => user.id === id);
	return (
		<Card>
			<CardContent>
				<p>This is the detail page of {user?.username}</p>
			</CardContent>
		</Card>
	);
}
