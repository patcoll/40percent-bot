import config from '../../config';
import { ProjectReviewParams } from './reviewParams';
import {
  Client,
  TextChannel,
  Guild,
  Role,
  OverwriteResolvable,
  Snowflake,
  User,
  ActionRowBuilder,
  ButtonStyle,
  PermissionFlagsBits,
  ButtonBuilder,
  AttachmentBuilder,
  ChannelType,
  CategoryChannelType,
  TextChannelType,
  GuildTextChannelType,
  PermissionsBitField,
  CategoryChannel,
  NonThreadGuildBasedChannel,
} from 'discord.js';
import AnnouncementParams from './announcementParams';
import { ProjectAnnouncementParams } from './announcementParams';

async function generateProjectBoilerplate(
  reviewParams: ProjectReviewParams,
  guild: Guild,
  reviewer: User,
  client: Client
): Promise<void> {
  console.log('generating project boilerplate with params:');
  console.log(reviewParams);
  const role = await createProjectRole(
    reviewParams.name,
    guild,
    reviewer.id,
    client
  );
  console.log('creating project channel');
  const channel = await createProjectChannel(reviewParams, guild, role);
  console.log('created project channel');
  // console.log(channel);
  const projectAnnouncementParams = AnnouncementParams.generate(
    reviewParams.ownerId,
    role.id
  );
  await announceProject(
    reviewParams,
    projectAnnouncementParams,
    channel,
    client
  );
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
  // TODO: Re-enable this once issue with setPositions is fixed
  // const parent = await guild.channels.fetch(categoryId);
  // if (parent?.type !== ChannelType.GuildCategory) {
  //   return;
  // }
  // // parent.children.
  // const channelsInCategory = [...parent.children.valueOf().values()];
  // const nonThreadChannels = channelsInCategory.filter(
  //   (channel) => !channel.isThread()
  // ) as NonThreadGuildBasedChannel[];
  // nonThreadChannels.sort((a, b) => (a.name < b.name ? -1 : 1));
  // console.log('about to set the positions');

  // const channelPositions = nonThreadChannels.map((channel, position) => ({
  //   channel: channel.id,
  //   position,
  //   parent: parent.id,
  // }));

  // // console.log('the positions are', channelPositions);
  // try {
  //   console.log(guild.channels);
  //   await guild.channels.setPositions(channelPositions);
  // } catch (e) {
  //   console.log(e);
  //   throw e;
  // }

  // TODO: There's something wrong with the typings in this function, fix them.
  // const category =
  await guild.channels.fetch(categoryId);
  // if (category instanceof CategoryChannel) {
  //   const categoryChannels = [...category.children.valueOf().values()];
  //   categoryChannels.sort((a, b) => (a.name < b.name ? -1 : 1));
  //   for await (const [index, channel] of categoryChannels.entries()) {
  //     await channel.setPosition(index);
  //   }
  // }
}

async function createProjectChannel(
  reviewParams: ProjectReviewParams,
  guild: Guild,
  role: Role
): Promise<TextChannel> {
  const categoryId =
    reviewParams.type === 'IC' ? config.IC_CATEGORY : config.GB_CATEGORY;
  console.log('getting the permissions');
  const permissions = getProjectChannelPermissions(
    guild,
    role.id,
    reviewParams.ownerId,
    reviewParams.type
  );
  console.log('got the permissions');
  console.log('creating channel itself');
  const newChannel = await guild.channels.create({
    name: reviewParams.slug,
    type: ChannelType.GuildText,
    parent: categoryId,
    permissionOverwrites: permissions,
  });
  console.log('created channel itself');
  console.log('sorting channels');
  await sortCategoryChannels(guild, categoryId);
  console.log('sorted channels');
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
  reviewParams: ProjectReviewParams,
  projectAnnouncementParams: ProjectAnnouncementParams,
  channel: TextChannel,
  client: Client
): Promise<void> {
  const announceChannel = (await client.channels.fetch(
    config.IC_GB_ANNOUNCE_CHANNEL
  )) as TextChannel;
  const serializedParams = AnnouncementParams.serialize(
    projectAnnouncementParams
  );
  const joinLeaveRow = new ActionRowBuilder<ButtonBuilder>().addComponents([
    new ButtonBuilder()
      .setCustomId('joinProjectRole')
      .setLabel('Join')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId('leaveProjectRole')
      .setLabel('Leave')
      .setStyle(ButtonStyle.Danger),
  ]);
  await announceChannel.send({
    content: `Announcing the ${reviewParams.type} for ${reviewParams.name} by <@${reviewParams.ownerId}>!
    ${reviewParams.description}
    To gain access to the project channel <#${channel.id}>, join the role <@&${projectAnnouncementParams.roleId}> with the button below!`,
    files: [new AttachmentBuilder(reviewParams.imageUrl), serializedParams],
    components: [joinLeaveRow],
  });
}

export default {
  boilerplate: generateProjectBoilerplate,
};
