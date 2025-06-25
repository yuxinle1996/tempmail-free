import { json } from '@sveltejs/kit';
import { mailFetch } from '$lib/mailFetch.js';
import type { DomainList } from '$lib/types/server';

export const GET = async ({ cookies }) => {
	const res: DomainList = await mailFetch('/domains', cookies).then((res) => res.json());
	const domains = (res?.domains || []).map((item) => ({
		domain: '@' + item.name,
		type: item.type,
		forward_available: item.forward_available,
		forward_max_seconds: item.forward_max_seconds
	}));
	return json(domains);
};
