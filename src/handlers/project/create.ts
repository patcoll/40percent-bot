import config from '../../config';
import {
  Client,
  TextChannel,
  Guild,
  Role,
  OverwriteResolvable,
  Snowflake,
  PermissionFlagsBits,
  ChannelType,
  NonThreadGuildBasedChannel,
} from 'discord.js';
import {
  createAnnouncement,
  getAnnouncementEmbedFromReviewEmbed,
} from '../../lib/announcementEmbed';
import {
  CompletedProjectReviewEmbed,
  getEmbedField,
} from '../../lib/projectReviewEmbed';

async function generateProjectBoilerplate(
  reviewEmbed: CompletedProjectReviewEmbed,
  guild: Guild,
  reviewerId: Snowflake,
  client: Client
): Promise<void> {
  const roleName = getEmbedField(reviewEmbed, 'name');
  const role = await createProjectRole(roleName, guild, reviewerId, client);
  const ownerId = getEmbedField(reviewEmbed, 'creator');
  const channel = await createProjectChannel(
    getEmbedField(reviewEmbed, 'type') as 'IC' | 'GB',
    ownerId,
    getEmbedField(reviewEmbed, 'slug'),
    guild,
    role
  );
  await announceProject(reviewEmbed, role.id, channel, client);
}

async function createProjectRole(
  roleName: string,
  guild: Guild,
  reviewerId: string,
  client: Client
): Promise<Role> {
  // First create the role
  const role = await guild.roles.create({
    name: roleName,
    mentionable: true,
  });
  // Then create the rank for manual add/removal
  const botCommandsChannel = (await client.channels.fetch(
    config.BOT_COMMANDS_CHANNEL
  )) as TextChannel;
  await botCommandsChannel.send(
    `<@${reviewerId}> please enter \`?addrank ${roleName}\` to create the project rank.`
  );
  return role;
}

async function sortCategoryChannels(
  guild: Guild,
  categoryId: Snowflake
): Promise<void> {
  const parent = await guild.channels.fetch(categoryId);
  if (parent?.type !== ChannelType.GuildCategory) {
    return;
  }
  const channelsInCategory = [...parent.children.valueOf().values()];
  const nonThreadChannels = channelsInCategory.filter(
    (channel) => !channel.isThread()
  ) as NonThreadGuildBasedChannel[];
  nonThreadChannels.sort((a, b) => (a.name < b.name ? -1 : 1));
  const channelPositions = nonThreadChannels.map((channel, position) => ({
    channel: channel.id,
    position,
  }));

  await guild.channels.setPositions(channelPositions);
}

async function createProjectChannel(
  type: 'IC' | 'GB',
  ownerId: Snowflake,
  slug: string,
  guild: Guild,
  role: Role
): Promise<TextChannel> {
  const categoryId = type === 'IC' ? config.IC_CATEGORY : config.GB_CATEGORY;

  const permissions = getProjectChannelPermissions(
    guild,
    role.id,
    ownerId,
    type
  );

  const newChannel = await guild.channels.create({
    name: slug,
    type: ChannelType.GuildText,
    parent: categoryId,
    permissionOverwrites: permissions,
  });

  await sortCategoryChannels(guild, categoryId);

  return newChannel;
}

function getProjectChannelPermissions(
  guild: Guild,
  roleId: Snowflake,
  ownerId: Snowflake,
  projectType: string
): OverwriteResolvable[] {
  if (projectType === 'IC') {
    return [
      // disallow everyone from seeing the channel by default
      {
        id: guild.roles.everyone.id,
        deny: [PermissionFlagsBits.ViewChannel],
      },
      // allow role members to read and send messages
      {
        id: roleId,
        allow: [PermissionFlagsBits.ViewChannel],
      },
      // allow wallet destroyer members to read and send messages
      {
        id: config.WALLET_DESTROYER_ROLE,
        allow: [PermissionFlagsBits.ViewChannel],
      },
      // make the owner a project-channel level mod
      {
        id: ownerId,
        allow: [
          PermissionFlagsBits.ManageChannels,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.ManageMessages,
        ],
      },
    ];
  } else {
    //if (projectType === 'GB')
    return [
      // make the owner a project-channel level mod
      {
        id: ownerId,
        allow: [
          PermissionFlagsBits.ManageChannels,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.ManageMessages,
        ],
      },
    ];
  }
}

async function announceProject(
  reviewEmbed: CompletedProjectReviewEmbed,
  roleId: string,
  channel: TextChannel,
  client: Client
): Promise<void> {
  const announcementEmbed = getAnnouncementEmbedFromReviewEmbed(
    reviewEmbed,
    roleId,
    channel.id
  );
  await createAnnouncement(announcementEmbed, client);
}

export default {
  boilerplate: generateProjectBoilerplate,
};
