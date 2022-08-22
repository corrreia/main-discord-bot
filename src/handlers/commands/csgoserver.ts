// Controller for channels where only images may be sent

import * as Discord from "discord.js";
import * as Builders from "@discordjs/builders";
import { CommandDescriptor } from "../command";

export function provideCommands(): CommandDescriptor[] {
	const cmd = new Builders.SlashCommandBuilder()
		.setName("csgo")
		.setDescription("Get csgo server connect info");
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
	const embed = new Discord.MessageEmbed()
		.setDescription(
			"Connect to PRIVATE server: `connect 188.83.144.135:27015; password correia` \n" +
				"Connect to RETAKES server: `connect 188.83.144.135:27016` \n" +
				"Connect to PROPHUNT server: `connect 188.83.144.135:28003`"
		)
		.setFooter({
			text: "Copy paste the command in your console to connect",
		})
		.setColor("#10c230");
	await interaction.editReply({ embeds: [embed] });
}
