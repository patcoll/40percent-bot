import { PrismaClient, Project } from '@prisma/client';
import { Snowflake } from 'discord.js';

type AnnouncedProject = Project & {
  roleSnowflakeId: string;
};

async function getAnnouncedProject(
  announcementMessageId: Snowflake
): Promise<AnnouncedProject> {
  const prisma = new PrismaClient();
  const project = await prisma.project.findUnique({
    where: {
      announcementEmbedSnowflakeId: announcementMessageId,
    },
  });
  if (project === null) {
    throw Error(`No announced project ${announcementMessageId} found in DB.`);
  }
  return project as AnnouncedProject;
}

export default getAnnouncedProject;

export type { AnnouncedProject };
