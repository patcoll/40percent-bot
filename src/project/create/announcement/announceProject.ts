import { ProjectRequestType } from '@prisma/client';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Client,
  EmbedBuilder,
  Message,
  Snowflake,
  TextChannel,
} from 'discord.js';
import config from '../../../config';
import getCreatedProject, { CreatedProject } from '../db/getCreatedProject';
import setProjectAnnouncementInDB from '../db/setProjectAnnouncement';

enum ProjectAnnouncementEmbedField {
  Type = 'Phase',
  CreatorName = 'Creator',
  Channel = 'Channel',
  Role = 'Role',
}

function getEmbedConfig(project: CreatedProject) {
  return {
    title: project.name,
    description: project.description,
    image: {
      url: project.image.url,
      proxyURL: project.image.proxyURL,
      height: project.image.height,
      width: project.image.width,
    },
    fields: [
      {
        name: ProjectAnnouncementEmbedField.Type,
        value:
          project.requestType === ProjectRequestType.IC
            ? 'Interest Check'
            : 'Group Buy',
      },
      {
        name: ProjectAnnouncementEmbedField.CreatorName,
        value: `<@${project.owner.snowflakeId}>`,
        inline: true,
      },
      {
        name: ProjectAnnouncementEmbedField.Channel,
        value: `<#${project.channelSnowflakeId}>`,
        inline: true,
      },
      {
        name: ProjectAnnouncementEmbedField.Role,
        value: `<@&${project.roleSnowflakeId}>`,
        inline: true,
      },
    ],
  };
}

async function createAnnouncement(
  embed: EmbedBuilder,
  client: Client
): Promise<Message> {
  const announceChannel = (await client.channels.fetch(
    config.IC_GB_ANNOUNCE_CHANNEL
  )) as TextChannel;
  const joinLeaveButtonRow =
    new ActionRowBuilder<ButtonBuilder>().addComponents([
      new ButtonBuilder()
        .setCustomId('joinProjectRole')
        .setLabel('Join')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('leaveProjectRole')
        .setLabel('Leave')
        .setStyle(ButtonStyle.Danger),
    ]);

  const embedMessage = await announceChannel.send({
    embeds: [embed.data],
    components: [joinLeaveButtonRow],
  });

  return embedMessage;
}

async function announceProject(
  reviewEmbedMessageId: Snowflake,
  client: Client
): Promise<void> {
  const project = await getCreatedProject(reviewEmbedMessageId);
  const embedConfig = getEmbedConfig(project);
  const embed = new EmbedBuilder(embedConfig);
  const announcementMessage = await createAnnouncement(embed, client);
  await setProjectAnnouncementInDB(
    reviewEmbedMessageId,
    announcementMessage.id
  );
}

export default announceProject;
