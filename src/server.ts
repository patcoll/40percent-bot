import config from './config.js';
import {
  Client,
  Message,
  MessageReaction,
  PartialMessageReaction,
  User,
  Interaction,
  Partials,
  IntentsBitField,
  InteractionType,
} from 'discord.js';
import handleShowcaseMessage from './handlers/showcase';
import handleSoundtestMessage from './handlers/soundtest';
import {
  handleDescriptionModalInteraction,
  handleIcGbRequestInteraction,
  handleIcGbRequestMessage,
  DEPRECATED_handleIcGbReviewInteraction,
  handleProjectAnnouncementInteraction,
  handleProjectAnnouncementReaction,
  handleIcGbReviewInteraction,
} from './handlers/project';
import fetchPartial from './utils/fetchPartial';
import callHandlers from './utils/callHandlers.js';
import { handleShowcaseCommand } from './handlers/showcaseCommand.js';

process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
});

function messageShouldBeHandled(msg: Message): boolean {
  // Ignore messages from bots
  // Ignore messages from DMs
  return !msg.author.bot && msg.guild?.id === config.FORTIES_GUILD;
}

function reactionShouldBeHandled(
  reaction: MessageReaction | PartialMessageReaction,
  user: User
) {
  // Ignore reactions from bots
  // Ignore reactions from DMs
  return !user.bot && reaction.message.guild?.id === config.FORTIES_GUILD;
}

function interactionShouldBeHandled(interaction: Interaction) {
  // Ignore reactions from bots
  // Ignore reactions from DMs
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
    await callHandlers(
      handleIcGbReviewInteraction(interaction, client),
      DEPRECATED_handleIcGbReviewInteraction(interaction, client),
      handleProjectAnnouncementInteraction(interaction)
    );
  }
  if (interaction.isChatInputCommand()) {
    await handleIcGbRequestInteraction(interaction, client);
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
    handleSoundtestMessage(msg, client),
    handleIcGbRequestMessage(msg, client)
  );
});

client.on('messageReactionAdd', async (reaction, user) => {
  await Promise.all([fetchPartial(reaction), fetchPartial(user)]);
  if (user.partial) {
    return;
  }

  if (!reactionShouldBeHandled(reaction, user)) return;

  await callHandlers(handleProjectAnnouncementReaction(reaction, user, 'add'));
});

client.on('messageReactionRemove', async (reaction, user) => {
  await Promise.all([fetchPartial(reaction), fetchPartial(user)]);
  if (user.partial) {
    return;
  }

  if (!reactionShouldBeHandled(reaction, user)) return;

  await callHandlers(
    handleProjectAnnouncementReaction(reaction, user, 'remove')
  );
});

void client.login(config.BOT_TOKEN);
