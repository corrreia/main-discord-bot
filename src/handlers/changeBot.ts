import Discord from "discord.js";
import * as utils from "../modules/utils";

export async function handleChangeAvatar(
	message: Discord.Message,
	client: Discord.Client
): Promise<void> {
	try {
		if (message.channel.type === "DM") {
			if (message.attachments.size > 0) {
				const attachment = message.attachments.first();

				if (attachment?.height! > 50 && attachment?.width! > 50) {
					utils.log(
						`User ${message.author.tag} changed avatar to ${attachment?.url}.`
					);
					const oldAv = client.user?.avatarURL();
					client.user!.setAvatar(attachment!.url);
					//log the changed avatar in a embed on the log channel
					const embed = new Discord.MessageEmbed()
						.setColor("#10c230")
						.setTitle("Avatar changed")
						.setDescription(
							`${message.author.username} changed the bot avatar. \n From: ${oldAv} \n To: ${attachment?.url}`
						);
					const commandLogsChannel = (await client.channels.fetch(
						log_channel as string
					)) as Discord.TextBasedChannel;
					commandLogsChannel?.send({ embeds: [embed] });
				} else {
					utils.log(
						`User ${message.author.tag} sent an invalid image.`
					);
					message.reply(
						"Invalid image. Has to be at least 50x50 pixels."
					);
				}
			}
		}
	} catch (e) {
		utils.log("Users are probabily changing the bot's avatar too fast.");
		message.reply(
			"I'm too fast to change the avatar. Please wait some hours."
		);
	}
}
export function handleChangeName(
	newGuild: Discord.Guild,
	client: Discord.Client<boolean>
) {
	utils.log(`Changed bot name to ${newGuild.name}.`);
	client.user!.setUsername(newGuild.name);
}
