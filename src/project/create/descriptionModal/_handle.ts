import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Client,
  EmbedBuilder,
  Message,
  ModalSubmitInteraction,
  TextChannel,
} from 'discord.js';
import config from '../../../config';
import setProjectDescriptionInDB from '../db/setProjectDescription';

async function activateProjectReviewEmbed(
  message: Message,
  description: string
): Promise<void> {
  const fetchedMessage = await message.fetch();
  const embed = new EmbedBuilder(fetchedMessage.embeds[0].data);
  embed.setDescription(description);
  const approveDenyRow = new ActionRowBuilder<ButtonBuilder>().addComponents([
    new ButtonBuilder()
      .setCustomId('approveProjectReview')
      .setLabel('Approve')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId('denyProjectReview')
      .setLabel('Deny')
      .setStyle(ButtonStyle.Danger),
  ]);
  await fetchedMessage.edit({
    embeds: [embed.data],
    components: [approveDenyRow],
  });
}

async function handleDescriptionModalInteraction(
  interaction: ModalSubmitInteraction,
  client: Client
): Promise<void> {
  if (!interaction.customId.startsWith('proj-')) {
    return;
  }
  const reviewChannel = (await client.channels.fetch(
    config.IC_GB_REVIEW_CHANNEL
  )) as TextChannel;
  const embedMessageId = interaction.customId.split('proj-')[1];
  const embedMessage = await reviewChannel.messages.fetch(embedMessageId);
  const description = interaction.fields.getTextInputValue(
    'descriptionTextInput'
  );
  await activateProjectReviewEmbed(embedMessage, description);
  await interaction.reply(
    'Your project was successfully submitted for review.'
  );
  await setProjectDescriptionInDB(embedMessage.id, description);
}

export default handleDescriptionModalInteraction;
