import { PrismaClient, ProjectStatus } from '@prisma/client';
import { Snowflake } from 'discord.js';

async function setProjectReviewEmbed(
  slug: string,
  embedMessageSnowflake: Snowflake
): Promise<void> {
  const prisma = new PrismaClient();
  await prisma.project.update({
    where: {
      slug_status: {
        slug,
        status: ProjectStatus.PendingDescription,
      },
    },
    data: {
      reviewEmbedSnowflakeId: embedMessageSnowflake,
    },
  });
}

export default setProjectReviewEmbed;
