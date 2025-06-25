export interface DomainOrigin {
	name: string;
	type: string;
	forward_available: boolean;
	forward_max_seconds: number;
}

export interface DomainList {
	domains: DomainOrigin[];
}

export interface DomainInfo {
	domain: string;
	type: string;
	forward_available: boolean;
	forward_max_seconds: number;
}

export interface EmailCreateInfo {
	email: string;
	token: string;
}

interface Attachment {
	id: string;
	has_preview: boolean;
	name: string;
	size: number;
}

export interface EmailInfo {
	id: string;
	from: string;
	to: string;
	cc: string | null;
	subject: string;
	body_text: string;
	body_html: string;
	created_at: string;
	attachments: Attachment[];
}

export interface EmailResponse {
	count: number;
	first_id: string;
	last_id: string;
	mail_list: EmailInfo[];
}
