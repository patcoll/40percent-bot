import { PrismaClient, ProjectStatus } from '@prisma/client';
import { Snowflake } from 'discord.js';

async function setProjectDescription(
  reviewMessageId: Snowflake,
  description: string
): Promise<void> {
  const dbClient = new PrismaClient();
  await dbClient.project.update({
    where: { reviewEmbedSnowflakeId: reviewMessageId },
    data: { description, status: ProjectStatus.Requested },
  });
}

export default setProjectDescription;
