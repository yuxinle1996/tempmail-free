import { text } from '@sveltejs/kit';

export const fallback = async ({ request }) => {
	return text(`I caught your ${request.method} request!`);
};
