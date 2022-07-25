import { PrismaClient } from '@prisma/client';
import { Snowflake } from 'discord.js';

async function setProjectAnnouncement(
  reviewMessageId: Snowflake,
  announcementMessageId: Snowflake
): Promise<void> {
  const dbClient = new PrismaClient();
  await dbClient.project.update({
    where: { reviewEmbedSnowflakeId: reviewMessageId },
    data: {
      announcementEmbedSnowflakeId: announcementMessageId,
    },
  });
}

export default setProjectAnnouncement;
