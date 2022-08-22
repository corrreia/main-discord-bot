import * as Discord from "discord.js";

//get a 24-caracter hash of a string
export function getHash(str: string): string {
	return require("crypto")
		.createHash("sha256")
		.update(str)
		.digest("hex")
		.slice(0, 24);
}

export function stringifyCommand(
	interaction: Discord.CommandInteraction<Discord.CacheType>
): string {
	return `User ${interaction.user.tag} used command \"${interaction.commandName}\" in the channel ${interaction.channel}.`;
}

export function sleep(arg0: number) {
	return new Promise((resolve) => setTimeout(resolve, arg0));
}

export function log(message: string): void {
	//get time to add to log message
	const time = new Date().toLocaleString();
	console.log(`[${time}] ${message}`);
}
