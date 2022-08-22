// Controller for channels where only images may be sent

import * as Discord from "discord.js";
import * as Builders from "@discordjs/builders";
import { CommandDescriptor } from "../command";

export function provideCommands(): CommandDescriptor[] {
	const cmd = new Builders.SlashCommandBuilder()
		.setName("ping")
		.setDescription("Envia um ping ao bot e calcula o tempo de resposta");
	//.setDefaultMemberPermissions(Discord.Permissions.FLAGS.KICK_MEMBERS);
	return [
		{
			builder: cmd,
			handler: handleCommand,
		},
	];
}

export async function handleCommand(
	interaction: Discord.CommandInteraction
): Promise<void> {
	var time = Date.now();
	await interaction.editReply("Pong! `unix:" + time + "`").then(() => {
		time = Date.now() - time;
		interaction.editReply("Pong! `" + time + "ms`");
	});
}
