export interface Chore {
	summary: string;
	fn: () => Promise<void>;
	complete: string;
}

export type CommandProvider = () => CommandDescriptor[];

export interface InteractionProvider {
	prefix: string;
	menuHandler?: Discord.SelectMenuInteraction;
	buttonHandler?: Discord.ButtonHandler;
}

export type InteractionHandlers<T> = {
	[prefix: string]: InteractionHandler<T>;
};

export interface Config {
	token: string;
	log_channel: string;
	guild_id: string;
	new_role: string;
	avaliable_roles: string[];
}

declare global {
	var guild_id: string;
	var new_role: string;
	var avaliable_roles: string[];
	var log_channel: string;
	//var client: Discord.Client;
}
