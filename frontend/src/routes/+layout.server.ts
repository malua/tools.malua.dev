import type { LayoutServerLoad } from './$types';
import type { EnvUser } from '@backend/lib/types/app';

export const load: LayoutServerLoad = async ({ cookies }) => {
	const userCookie = cookies.get('user-data');
	const user = userCookie ? (JSON.parse(decodeURI(userCookie)) as EnvUser) : null;

	return { user };
};
