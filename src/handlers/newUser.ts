import Discord from "discord.js";
import * as utils from "../modules/utils";

export async function handleNewUser(
	member: Discord.GuildMember,
	client: Discord.Client
): Promise<void> {
	utils.log("New user joined: " + member.user.tag);
	member.roles.add(new_role);

	//send a embeed to server owner
	const serverOwner = client.users.cache.get(member.guild.ownerId);

	if (serverOwner) {
		const embed = new Discord.MessageEmbed()
			.setColor("#10c230")
			.setTitle("New user joined")
			.setDescription(`${member.user.username} has joined the server.`)
			.setThumbnail(member.user.displayAvatarURL())
			.addFields(
				{ name: "ID", value: member.id, inline: true },
				{ name: "Username", value: member.user.tag, inline: true },
				{
					name: "Created at",
					value: member.user.createdAt.toLocaleString(),
					inline: true,
				}
			)
			.addFields({
				name: "\u200B",
				value: "What role to give to the new user?",
			});
		const menu = new Discord.MessageSelectMenu()
			.setCustomId("newUser")
			.setPlaceholder("Select a role");

		//cycle trogh all guild roles and add them to the menu
		avaliable_roles.forEach((role) => {
			//get role name from ID
			const roleName = member.guild.roles.cache.get(role)?.name as string;
			menu.addOptions([{ label: roleName, value: role }]);
		});
		const row = new Discord.MessageActionRow().addComponents(menu);
		serverOwner.send({ embeds: [embed], components: [row] });

		client.on(
			"interactionCreate",
			async (interaction: Discord.Interaction) => {
				//also from ist-bot-team/ist-discord-bot
				try {
					if (interaction.isMessageComponent()) {
						const prefix = interaction.customId.split(":")[0];

						if (
							interaction.isSelectMenu() &&
							prefix === "newUser"
						) {
							await handleRoleSelectionMenu(interaction, member);
						}
					}
				} catch (e) {
					console.error(
						`Problem handling interaction: ${(e as Error).message}`
					);
				}
			}
		);
	}
}

async function handleRoleSelectionMenu(
	interaction: Discord.SelectMenuInteraction,
	member: Discord.GuildMember
): Promise<void> {
	await interaction.deferReply({ ephemeral: false });
	const guild = interaction.client.guilds.cache.get(guild_id);
	const role = guild!.roles.cache.get(interaction.values[0]);

	//if user has one role from avaliable_roles, remove it and add the new one
	if (avaliable_roles.includes(role!.id) && role) {
		member.roles.remove(avaliable_roles.filter((r) => r !== role!.id));
		member.roles.add(role!.id);
	} else {
		interaction.editReply("Error updating role");
		return;
	}

	const embed = new Discord.MessageEmbed()
		.setColor(role?.color! as Discord.ColorResolvable)
		.setDescription(`${member?.user.tag} has been given the role ${role?.name}`);

	interaction.editReply({ embeds: [embed] });
}
