import { writable } from 'svelte/store';
import Cookie from 'js-cookie';

type Settings = {
	apiKey?: string;
	interval: number;
};

export const settings = writable<Settings>({
	apiKey: '',
	interval: 10000
});

// 初始化
export const initSettings = () => {
	const apiKey = Cookie.get('api_key');
	const interval = Cookie.get('interval');
	const validInterval = interval ? parseInt(interval) : 10000;
	updateSettings({
		apiKey: apiKey || '',
		interval: Math.max(validInterval, 5000)
	});
};

// 更新设置
export const updateSettings = (data: Partial<Settings>) => {
	// console.log('update-settings', data);
	Object.keys(data).forEach((key) => {
		const value = data[key as keyof Settings];
		settings.update((state) => {
			state[key as keyof Settings] = value as never;
			return state;
		});
		if (value) {
			const cookieKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
			Cookie.set(cookieKey, value.toString(), {
				path: '/',
				expires: 365
			});
		} else {
			Cookie.remove(key);
		}
	});
};

// 订阅
// export const unsubscribeSettings = settings.subscribe((data) => {
// 	const keys = Object.keys(data);
// 	keys.forEach((key) => {
// 		const value = data[key as keyof Settings];
// 		console.log('subscribe', key, value);
// 		if (value) {
// 			const cookieKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
// 			Cookie.set(cookieKey, value.toString());
// 		} else {
// 			Cookie.remove(key);
// 		}
// 	});
// });
