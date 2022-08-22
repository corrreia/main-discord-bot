// Main controller for the bot

import Discord from "discord.js";
import {
	RESTPostAPIApplicationCommandsJSONBody,
	Routes,
} from "discord-api-types/v9";
import { REST } from "@discordjs/rest";
import { readFileSync } from "fs";

import {
	Chore,
	CommandProvider,
	Config,
	InteractionHandlers,
	InteractionProvider,
} from "./bot.d";
import * as ping from "./handlers/commands/ping";
import * as csgoserver from "./handlers/commands/csgoserver";
import * as changeBot from "./handlers/changeBot";
import { handleNewUser } from "./handlers/newUser";

import * as utils from "./modules/utils";

const client = new Discord.Client({
	intents: [
		Discord.Intents.FLAGS.GUILDS,
		Discord.Intents.FLAGS.GUILD_MESSAGES,
		Discord.Intents.FLAGS.GUILD_VOICE_STATES,
		Discord.Intents.FLAGS.GUILD_MEMBERS, // THIS IS A PRIVILEGED INTENT! MANUAL ACTION REQUIRED TO ENABLE!
		Discord.Intents.FLAGS.DIRECT_MESSAGES,
	],
	partials: ["MESSAGE", "CHANNEL", "REACTION"],
}) as Discord.Client;

export let config: Config = JSON.parse(
	readFileSync("./configs/config.json", "utf-8")
);

const DISCORD_TOKEN = config.token as string;
global.log_channel = config.log_channel as string;
global.guild_id = config.guild_id as string;
global.new_role = config.new_role as string;
global.avaliable_roles = config.avaliable_roles as string[];

const commandHandlers: InteractionHandlers<Discord.CommandInteraction> = {};
const buttonHandlers: InteractionHandlers<Discord.ButtonInteraction> = {};
const menuHandlers: InteractionHandlers<Discord.SelectMenuInteraction> = {};

const commandProviders: CommandProvider[] = [
	ping.provideCommands,
	csgoserver.provideCommands,
];
const interactions: InteractionProvider[] = [];

client.login(DISCORD_TOKEN);

const startupChores: Chore[] = [
	{
		summary: "Started refreshing application (/) commands.", //took from https://github.com/ist-bot-team/ist-discord-bot/
		fn: async () => {
			const commands: RESTPostAPIApplicationCommandsJSONBody[] = [];
			for (const provider of commandProviders) {
				for (const descriptor of provider()) {
					const name = descriptor.builder.name;
					commands.push(descriptor.builder.toJSON());
					commandHandlers[name] = descriptor.handler;
				}
			}

			const rest = new REST({ version: "9" }).setToken(
				DISCORD_TOKEN as string
			);

			await rest.put(
				Routes.applicationGuildCommands(
					client?.user?.id as string,
					guild_id
				),
				{ body: commands }
			);
		},
		complete: "Successfully reloaded application (/) commands.",
	},
	{
		summary: "Started refreshing interactions.",
		fn: async () => {
			for (const provider of interactions) {
				const prefix = provider.prefix;
				menuHandlers[prefix] = provider.menuHandler;
				buttonHandlers[prefix] = provider.buttonHandler;
			}
		},
		complete: "Successfully reloaded interactions.",
	},
];

client.on("ready", async () => {
	utils.log(`Logged in as ${client.user!.tag}!`);

	//get invite link for the bot
	let inviteLink = await client.generateInvite({
		permissions: Discord.Permissions.FLAGS.ADMINISTRATOR,
		scopes: ["bot", "applications.commands"],
	});
	utils.log(`Invite link: ${inviteLink}`);

	//start all chores
	utils.log(`Starting chores...`);
	for (const [i, chore] of startupChores.entries()) {
		utils.log(`${i + 1}/${startupChores.length}: ${chore.summary}`);
		chore.fn();
		utils.log(`${i + 1}/${startupChores.length}: ${chore.complete}`);
	}
	utils.log(`All chores started.`);
	utils.log("Bot is ready!");
});

client.on("interactionCreate", async (interaction: Discord.Interaction) => {
	//also from ist-bot-team/ist-discord-bot
	try {
		if (interaction.isMessageComponent()) {
			const prefix = interaction.customId.split(":")[0];

			if (interaction.isButton()) {
				await buttonHandlers[prefix]?.(
					interaction as Discord.ButtonInteraction
				);
			} else if (interaction.isSelectMenu()) {
				await menuHandlers[prefix]?.(
					interaction as Discord.SelectMenuInteraction
				);
			}
		} else if (interaction.isCommand()) {
			await interaction.deferReply({ ephemeral: true });

			if (!interaction.command?.guildId) {
				// global commands
			}

			let commandLogsChannel: Discord.TextBasedChannel | undefined;

			try {
				commandLogsChannel = (await client.channels.fetch(
					log_channel as string
				)) as Discord.TextBasedChannel;

				const embed = new Discord.MessageEmbed()
					.setDescription(utils.stringifyCommand(interaction))
					.setColor("#0099ff");
				utils.log(utils.stringifyCommand(interaction));
				await commandLogsChannel?.send({ embeds: [embed] });
			} catch (e) {}

			await commandHandlers[interaction.commandName]?.(interaction);
		}
	} catch (e) {
		console.error(`Problem handling interaction: ${(e as Error).message}`);
	}
});

client.on("guildMemberAdd", async (member: Discord.GuildMember) => {
	handleNewUser(member, client);
});

//change avatar on image recived
client.on("messageCreate", async (message: Discord.Message<boolean>) => {
	if (message.author.bot) return;
	changeBot.handleChangeAvatar(message, client);
});

//on guild change name change bot name
client.on(
	"guildUpdate",
	async (oldGuild: { name: any }, newGuild: Discord.Guild) => {
		if (oldGuild.name === newGuild.name) return;
		changeBot.handleChangeName(newGuild, client);
	}
);
