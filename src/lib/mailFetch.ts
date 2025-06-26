// lib/server/apiClient.ts
import { EMAIL_API_KEY } from '$env/static/private';
import { error, type Cookies } from '@sveltejs/kit';

/**
 * 邮箱请求
 */
export async function mailFetch(path: string, cookies: Cookies, options?: RequestInit) {
	path = path.startsWith('/') ? path : '/' + path;
	const key = cookies.get('api_key');
	const headers = {
		'content-type': 'application/json',
		'x-rapidapi-key': key || EMAIL_API_KEY,
		'x-rapidapi-host': 'tempmail-api-free.p.rapidapi.com',
		...options?.headers
	};

	const res = await fetch(`https://tempmail-api-free.p.rapidapi.com/api/v3${path}`, {
		...options,
		headers
	});
	if (![200, 201].includes(res.status)) {
		error(res.status, await res.json());
	}
	return res;
}
