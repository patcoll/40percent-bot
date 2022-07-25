import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  Client,
} from 'discord.js';
import config from '../../../config';
import announceProject from '../announcement/announceProject';
import createProjectBoilerplate from './createProjectBoilerplate';

async function handleProjectReviewInteraction(
  interaction: ButtonInteraction,
  client: Client
): Promise<void> {
  if (interaction.channelId !== config.IC_GB_REVIEW_CHANNEL) {
    return;
  }
  if (interaction.message.embeds.length === 0) {
    return;
  }
  const guild = await client.guilds.fetch(config.FORTIES_GUILD);

  if (interaction.customId === 'approveProjectReview') {
    await createProjectBoilerplate(client, guild, interaction.message.id);
    await interaction.reply({
      content: 'Project approved: generated boilerplate',
    });
    await interaction.message.edit({
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents([
          new ButtonBuilder()
            .setCustomId('approveProjectReviewConfirmation')
            .setLabel('Approved')
            .setStyle(ButtonStyle.Success)
            .setDisabled(true),
        ]),
      ],
    });
    await announceProject(interaction.message.id, client);
  }

  if (interaction.customId === 'rejectProjectReview') {
    await interaction.reply({
      content: 'Please let the user know why their project was rejected.',
    });
    await interaction.message.edit({
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents([
          new ButtonBuilder()
            .setCustomId('rejectProjectReviewConfirmation')
            .setLabel('Rejected')
            .setStyle(ButtonStyle.Danger)
            .setDisabled(true),
        ]),
      ],
    });
  }
}

export default handleProjectReviewInteraction;
