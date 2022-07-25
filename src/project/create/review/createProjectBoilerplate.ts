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
  PrismaClient,
  ProjectRequestType,
  ProjectStatus,
} from '@prisma/client';
import config from '../../../config';
import setProjectBoilerplate from '../db/setProjectBoilerplate';

async function createProjectBoilerplate(
  client: Client,
  guild: Guild,
  reviewEmbedMessageId: Snowflake
): Promise<void> {
  const prisma = new PrismaClient();
  const project = await prisma.project.findUnique({
    where: { reviewEmbedSnowflakeId: reviewEmbedMessageId },
    include: {
      owner: true,
      image: true,
    },
  });
  if (project === null) {
    throw Error(
      `No project associated with review message ${reviewEmbedMessageId}`
    );
  }
  const roleName = project.name;
  const role = await guild.roles.create({
    name: roleName,
    mentionable: true,
  });
  const ownerId = project.owner.snowflakeId;
  const channel = await createProjectChannel(
    project.requestType === ProjectRequestType.IC ? 'IC' : 'GB',
    ownerId,
    project.slug,
    guild,
    role
  );
  const projectStatus = ProjectRequestType.IC
    ? ProjectStatus.InterestCheck
    : ProjectStatus.GroupBuy;
  await setProjectBoilerplate(
    reviewEmbedMessageId,
    projectStatus,
    channel.id,
    role.id
  );
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
    // projectType === 'GB'
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

export default createProjectBoilerplate;
