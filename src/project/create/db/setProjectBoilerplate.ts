import { PrismaClient, ProjectStatus } from '@prisma/client';
import { Snowflake } from 'discord.js';

async function setProjectBoilerplate(
  reviewMessageId: Snowflake,
  status: ProjectStatus,
  channelId: Snowflake,
  roleId: Snowflake
): Promise<void> {
  const dbClient = new PrismaClient();
  await dbClient.project.update({
    where: { reviewEmbedSnowflakeId: reviewMessageId },
    data: {
      status,
      channelSnowflakeId: channelId,
      roleSnowflakeId: roleId,
    },
  });
}

export default setProjectBoilerplate;
