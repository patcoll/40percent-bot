import { ButtonInteraction, Guild } from 'discord.js';
import config from '../../../config';
import getAnnouncedProjectFromDB from '../db/getAnnouncedProject';

async function handleAnnouncementInteraction(
  interaction: ButtonInteraction & { guild: Guild }
): Promise<void> {
  // Only handle interactions in the IC/GB announcement channel
  if (interaction.message.channelId !== config.IC_GB_ANNOUNCE_CHANNEL) {
    return;
  }
  const project = await getAnnouncedProjectFromDB(interaction.message.id);
  const roleId = project.roleSnowflakeId;
  const member = await interaction.guild.members.fetch(interaction.user.id);
  if (interaction.customId === 'joinProjectRole') {
    await Promise.allSettled([
      member.roles.add(roleId),
      interaction.reply({
        content: `Joined role <@&${roleId}>!`,
        ephemeral: true,
      }),
    ]);
  } else if (interaction.customId === 'leaveProjectRole') {
    await member.roles.remove(roleId);
    await interaction.reply({
      content: `Left role <@&${roleId}>!`,
      ephemeral: true,
    });
  }
}

export default handleAnnouncementInteraction;
