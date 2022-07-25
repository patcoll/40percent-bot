import { Image, PrismaClient, Project, User } from '@prisma/client';
import { Snowflake } from 'discord.js';

type CreatedProject = Project & {
  owner: User;
  image: Image;
  description: string;
  roleSnowflakeId: string;
  channelSnowflakeId: string;
};

async function getCreatedProject(
  reviewEmbedMessageId: Snowflake
): Promise<CreatedProject> {
  const prisma = new PrismaClient();
  const project = await prisma.project.findUnique({
    where: {
      reviewEmbedSnowflakeId: reviewEmbedMessageId,
    },
    include: {
      owner: true,
      image: true,
    },
  });
  if (project === null) {
    throw Error(`No announce project ${reviewEmbedMessageId} found in DB.`);
  }
  if (project.image === null) {
    throw Error(`Image not found for project ${reviewEmbedMessageId} in DB.`);
  }
  return project as CreatedProject;
}

export default getCreatedProject;

export type { CreatedProject };
