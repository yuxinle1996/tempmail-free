import { error, json } from '@sveltejs/kit';
import { mailFetch } from '$lib/mailFetch.js';
import type { DomainList, EmailCreateInfo } from '$lib/types/server';

export const GET = async () => {
	error(400, '请传入邮箱地址');
};

export const DELETE = async () => {
	error(400, '请传入邮箱地址');
};

export const POST = async ({ cookies, request }) => {
	let body;
	try {
		body = await request.json();
	} catch {
		error(400, '请传入有效的JSON数据');
	}
	let domain = (body.domain || '').replace('@', '');
	let name = body.name || '';
	if (!domain || !name) {
		const domainRes: DomainList = await mailFetch('/domains', cookies).then((res) => res.json());
		if (!domainRes?.domains || domainRes?.domains?.length <= 0) {
			error(400, '可用域名不足, 无法创建邮箱');
		}
		domain = domainRes.domains[Math.floor(Math.random() * domainRes.domains.length)].name;
		name = Math.random().toString(36).substring(2, 8);
	}
	const res: EmailCreateInfo = await mailFetch('/email/new', cookies, {
		method: 'POST',
		body: JSON.stringify({
			domain,
			name
		})
	}).then((res) => res.json());
	// cookies.set('email_token', res.token, {
	// 	path: '/'
	// });
	return json({
		email: res.email,
		token: res.token
	});
};
