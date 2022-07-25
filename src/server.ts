import config from './config.js';
import {
  Client,
  Message,
  Interaction,
  Partials,
  IntentsBitField,
  InteractionType,
  Guild,
  ButtonInteraction,
} from 'discord.js';
import handleShowcaseMessage from './handlers/showcase';
import handleSoundtestMessage from './handlers/soundtest';
import fetchPartial from './utils/fetchPartial';
import callHandlers from './utils/callHandlers.js';
import { handleShowcaseCommand } from './handlers/showcaseCommand.js';

import handleProjectCommand from './project/_handle';
import handleDescriptionModalInteraction from './project/create/descriptionModal/_handle.js';
import handleProjectReviewInteraction from './project/create/review/_handle.js';
import handleAnnouncementInteraction from './project/create/announcement/_handle.js';

process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
});

function messageShouldBeHandled(msg: Message): boolean {
  // Ignore messages from bots
  // Ignore messages from DMs
  return !msg.author.bot && msg.guild?.id === config.FORTIES_GUILD;
}

function interactionShouldBeHandled(interaction: Interaction) {
  // Ignore interactions from bots
  // Ignore interactions from DMs
  return !interaction.user.bot && interaction.guildId === config.FORTIES_GUILD;
}

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildMessageReactions,
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.Reaction,
    Partials.User,
    Partials.GuildMember,
  ],
});

client.once('ready', () => {
  console.log('==== READY ====');
});

client.on('error', (err) => {
  console.log('Uncaught error:', err);
});

client.on('interactionCreate', async (interaction) => {
  if (!interactionShouldBeHandled(interaction)) return;
  if (interaction.isButton()) {
    await handleProjectReviewInteraction(interaction, client);
    if (interaction.guild !== null) {
      await handleAnnouncementInteraction(
        interaction as ButtonInteraction & { guild: Guild }
      );
    }
  }
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === 'project') {
      await handleProjectCommand(client, interaction);
    }
  }
  if (interaction.isMessageContextMenuCommand()) {
    await handleShowcaseCommand(interaction, client);
  }
  if (interaction.type === InteractionType.ModalSubmit) {
    await handleDescriptionModalInteraction(interaction, client);
  }
});

client.on('messageCreate', async (msg) => {
  await fetchPartial(msg);

  if (!messageShouldBeHandled(msg)) return;

  await callHandlers(
    handleShowcaseMessage(msg, client),
    handleSoundtestMessage(msg, client)
  );
});

void client.login(config.BOT_TOKEN);
