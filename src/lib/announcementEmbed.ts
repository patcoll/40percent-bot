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
import config from '../config';
import { CompletedProjectReviewEmbed } from './projectReviewEmbed';

interface AnnouncementEmbed {
  title: string;
  description: string;
  image: {
    url: string;
    proxyURL: string;
    height: number;
    width: number;
  };
  fields: [
    {
      name: 'type';
      value: 'IC' | 'GB';
    },
    {
      name: 'project-name';
      value: string;
      inline: true;
    },
    {
      name: 'creator-name';
      value: string;
      inline: true;
    },
    {
      name: 'channel';
      value: string;
      inline: true;
    },
    {
      name: 'role';
      value: string;
      inline: true;
    },
    {
      name: 'channel-id';
      value: string;
      inline: true;
    },
    {
      name: 'creator-id';
      value: string;
      inline: true;
    },
    {
      name: 'role-id';
      value: string;
      inline: true;
    }
  ];
}

function getEmbedField(
  embed: CompletedProjectReviewEmbed,
  fieldName: string
): string {
  const field = embed.fields.find((field) => field.name === fieldName);
  if (field === undefined) {
    throw TypeError(
      `${fieldName} is not a field in the embed ${JSON.stringify(
        embed.toJSON()
      )}`
    );
  }
  return field.value;
}

function getAnnouncementEmbedFromReviewEmbed(
  reviewEmbed: CompletedProjectReviewEmbed,
  roleId: Snowflake,
  channelId: Snowflake
): AnnouncementEmbed {
  const projectType = getEmbedField(reviewEmbed, 'type') as 'IC' | 'GB';
  return {
    title: `${projectType} - ${reviewEmbed.title}`,
    description: getEmbedField(reviewEmbed, 'description'),
    image: reviewEmbed.image,
    fields: [
      {
        name: 'type',
        value: projectType,
      },
      {
        name: 'project-name',
        value: getEmbedField(reviewEmbed, 'name'),
        inline: true,
      },
      {
        name: 'creator-name',
        value: `<@${getEmbedField(reviewEmbed, 'creator')}>`,
        inline: true,
      },
      {
        name: 'channel',
        value: `<#${channelId}>`,
        inline: true,
      },
      {
        name: 'role',
        value: `<@${roleId}>`,
        inline: true,
      },
      {
        name: 'channel-id',
        value: channelId,
        inline: true,
      },
      {
        name: 'creator-id',
        value: getEmbedField(reviewEmbed, 'creator'),
        inline: true,
      },
      {
        name: 'role-id',
        value: roleId,
        inline: true,
      },
    ],
  };
}

async function createAnnouncement(
  embedConfig: AnnouncementEmbed,
  client: Client
): Promise<Message> {
  const announceChannel = (await client.channels.fetch(
    config.IC_GB_ANNOUNCE_CHANNEL
  )) as TextChannel;
  const embed = new EmbedBuilder(embedConfig);
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

export type { AnnouncementEmbed };

export { getAnnouncementEmbedFromReviewEmbed, createAnnouncement };
