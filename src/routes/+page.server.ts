import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, fetch }) => {
	const loadDomains = async () => {
		const res = await fetch('/api/domains');
		if (res.status !== 200) {
			return [];
		}
		return res.json();
	};

	return {
		domains: loadDomains(),
		localEmail: cookies.get('email')
	};
};
