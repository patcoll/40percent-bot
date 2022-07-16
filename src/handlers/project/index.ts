import config from '../../config';
import {
  Message,
  Client,
  TextChannel,
  Guild,
  ButtonInteraction,
  MessageReaction,
  User,
  PartialMessageReaction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  ModalSubmitInteraction,
  AttachmentBuilder,
} from 'discord.js';
import { ProjectAnnouncementParams } from './announcementParams';
import { ProjectReviewParams } from './reviewParams';
import ReviewParams from './reviewParams';
import RequestParams from './requestParams';
import CreateProject from './create';

import axios from 'axios';
import {
  activateProjectReviewEmbed,
  CompletedProjectReviewEmbed,
  extractReviewParamsFromEmbed,
  getEmbedConfig,
  initProjectReviewEmbed,
} from '../../lib/projectReviewEmbed';
import showDescriptionInputModal from '../../lib/showDescriptionInputModal';

function formatIcGbReviewMessage({
  name,
  type,
  description,
  slug,
  ownerId,
}: ProjectReviewParams): string {
  return `Creator - <@${ownerId}>
${type} - ${name} - #${slug}
${description}`;
}

async function handleIcGbRequestMessage(
  msg: Message,
  client: Client
): Promise<void> {
  if (msg.channel.id == config.IC_GB_REQUEST_CHANNEL) {
    try {
      const requestParams = await RequestParams.parse(msg);
      const reviewParams = ReviewParams.fromRequestParams(requestParams);
      const reviewMessage = formatIcGbReviewMessage(reviewParams);
      const serializedParams = ReviewParams.serialize(reviewParams);
      const reviewChannel = (await client.channels.fetch(
        config.IC_GB_REVIEW_CHANNEL
      )) as TextChannel;
      const approveRejectRow =
        new ActionRowBuilder<ButtonBuilder>().addComponents([
          new ButtonBuilder()
            .setCustomId('approveProjectReview')
            .setLabel('Approve')
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId('rejectProjectReview')
            .setLabel('Reject')
            .setStyle(ButtonStyle.Danger),
        ]);
      await reviewChannel.send({
        content: reviewMessage,
        files: [
          new AttachmentBuilder(requestParams.imageUrl),
          serializedParams,
        ],
        components: [approveRejectRow],
      });
      await msg.reply('your request was successfully submitted for review.');
    } catch (error) {
      console.log(error);
      return;
    }
  }
}

async function handleIcGbRequestInteraction(
  interaction: ChatInputCommandInteraction,
  client: Client
): Promise<void> {
  try {
    const embedInitialConfig = await getEmbedConfig(interaction);
    const reviewEmbed = await initProjectReviewEmbed(
      embedInitialConfig,
      client
    );
    await showDescriptionInputModal(interaction, reviewEmbed);
  } catch (error) {
    console.log(error);
    return;
  }
}

async function handleDescriptionModalInteraction(
  interaction: ModalSubmitInteraction,
  client: Client
): Promise<void> {
  if (!interaction.customId.startsWith('proj-')) {
    return;
  }
  try {
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
  } catch (error) {
    console.log(error);
    return;
  }
}

async function handleIcGbReviewInteraction(
  interaction: ButtonInteraction,
  client: Client
): Promise<void> {
  // Only handle interactions in the IC/GB review channel
  if (interaction.channelId !== config.IC_GB_REVIEW_CHANNEL) {
    return;
  }
  if (interaction.message.embeds.length === 0) {
    return;
  }
  const typedMessage = interaction.message;
  const guild = await client.guilds.fetch(config.FORTIES_GUILD);
  const reviewer = interaction.user;

  if (interaction.customId === 'approveProjectReview') {
    const reviewEmbed = interaction.message
      .embeds[0] as CompletedProjectReviewEmbed;
    await CreateProject.boilerplate(reviewEmbed, guild, reviewer.id, client),
      await interaction.reply({
        content: 'Project approved: generated boilerplate',
      }),
      await typedMessage.edit({
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
  } else {
    await interaction.reply('Role or channel already exists.');
  }

  if (interaction.customId === 'rejectProjectReview') {
    await interaction.reply({
      content: 'Please let the user know why their project was rejected.',
    });
    await typedMessage.edit({
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

async function handleProjectAnnouncementInteraction(
  interaction: ButtonInteraction
): Promise<void> {
  const typedMessage = interaction.message;
  // Only handle interactions in the IC/GB announcement channel
  if (typedMessage.channelId !== config.IC_GB_ANNOUNCE_CHANNEL) {
    return;
  }
  const attachmentUrls = typedMessage.attachments.map(
    (attachment) => attachment.url
  );
  if (attachmentUrls.length > 0) {
    const embed = typedMessage.embeds[0];
    const roleField = embed.fields?.find((field) => field.name === 'role-id');
    if (roleField === undefined) {
      throw Error('Role not found in announcement embed');
    }
    const roleId = roleField.value;
    const guild = interaction.guild as Guild;
    const member = await guild.members.fetch(interaction.user.id);
    if (interaction.customId === 'joinProjectRole') {
      await Promise.allSettled([
        member.roles.add(roleId),
        interaction.reply({
          content: `Joined role <@&${roleId}>!`,
          ephemeral: true,
        }),
      ]);
    } else if (interaction.customId === 'leaveProjectRole') {
      await Promise.allSettled([
        member.roles.remove(roleId),
        interaction.reply({
          content: `Left role <@&${roleId}>!`,
          ephemeral: true,
        }),
      ]);
    }
  }
  // The old announcement system, using attachments and metadata JSON
  else {
    const response = await axios.get<ProjectAnnouncementParams>(
      attachmentUrls[1]
    );
    const projectParams = response.data;
    const guild = interaction.guild as Guild;
    const member = await guild.members.fetch(interaction.user.id);
    if (interaction.customId === 'joinProjectRole') {
      await Promise.allSettled([
        member.roles.add(projectParams.roleId),
        interaction.reply({
          content: `Joined role <@&${projectParams.roleId}>!`,
          ephemeral: true,
        }),
      ]);
    } else if (interaction.customId === 'leaveProjectRole') {
      await Promise.allSettled([
        member.roles.remove(projectParams.roleId),
        interaction.reply({
          content: `Left role <@&${projectParams.roleId}>!`,
          ephemeral: true,
        }),
      ]);
    }
  }
}

// Deprecated, should be removed after a while when there are no more active
// ICs or GBs with the checkmark emoji feature
async function handleProjectAnnouncementReaction(
  reaction: MessageReaction | PartialMessageReaction,
  user: User,
  action: 'add' | 'remove'
): Promise<void> {
  // Only handle reactions in the IC/GB review channel
  if (reaction.message.channel.id !== config.IC_GB_ANNOUNCE_CHANNEL) {
    return;
  }
  // The :white_check_mark: emoji is to subscribe
  if (reaction.emoji.name === '✅') {
    const attachmentUrls = reaction.message.attachments.map(
      (attachment) => attachment.url
    );
    const response = await axios.get<ProjectAnnouncementParams>(
      attachmentUrls[1]
    );
    const projectParams = response.data;
    const guild = reaction.message.guild as Guild;
    const member = await guild.members.fetch(user.id);

    switch (action) {
      case 'add': {
        await member.roles.add(projectParams.roleId);
        break;
      }
      case 'remove': {
        await member.roles.remove(projectParams.roleId);
        break;
      }
    }
  }
}

export {
  handleIcGbRequestMessage,
  handleIcGbRequestInteraction,
  handleProjectAnnouncementInteraction,
  handleProjectAnnouncementReaction,
  handleIcGbReviewInteraction,
  handleDescriptionModalInteraction,
};
