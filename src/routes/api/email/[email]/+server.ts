import { json } from '@sveltejs/kit';
import { mailFetch } from '$lib/mailFetch.js';
import type { EmailInfo } from '$lib/types/server';
import dayjs from 'dayjs';

export const GET = async ({ params, cookies, url }) => {
	const firstId = url.searchParams.get('first_id');
	const { email } = params;
	const res: EmailInfo[] = await mailFetch(`/email/${email}/messages`, cookies).then((res) =>
		res.json()
	);
	// 按时间倒序排序
	let emails = (res || []).sort((a, b) =>
		dayjs(b.created_at).isBefore(dayjs(a.created_at)) ? -1 : 1
	);
	// 如果有firstId参数，进行过滤, 只返回比firstId时间晚的邮件
	if (firstId) {
		const targetEmail = emails.find((email) => email.id === firstId);
		if (targetEmail) {
			const targetDate = dayjs(targetEmail.created_at);
			emails = emails.filter((email) => dayjs(email.created_at).isAfter(targetDate));
		}
	}
	// 格式化created_at
	emails = emails.map((email) => ({
		...email,
		created_at: dayjs(email.created_at).format('YYYY-MM-DD HH:mm:ss')
	}));
	return json({
		first_id: emails[0]?.id || firstId || '',
		last_id: emails[emails.length - 1]?.id || '',
		count: emails.length,
		mail_list: emails
	});
};

export const DELETE = async ({ params, cookies }) => {
	const { email } = params;
	const token = cookies.get('email_token');
	await mailFetch(`/email/${email}`, cookies, {
		method: 'DELETE',
		body: JSON.stringify({
			token: token
		})
	});
	return json({
		message: '删除成功'
	});
};
