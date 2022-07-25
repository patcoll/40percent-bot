import {
  PrismaClient,
  ProjectRequestType,
  ProjectStatus,
} from '@prisma/client';
import { Snowflake } from 'discord.js';

const prisma = new PrismaClient();

interface CreateProjectParams {
  creatorSnowflake: Snowflake;
  projectName: string;
  projectSlug: string;
  projectRequestType: ProjectRequestType;
  imageUrl: string;
  imageProxyURL: string;
  imageHeight: number;
  imageWidth: number;
}

async function createProject({
  creatorSnowflake,
  projectName,
  projectSlug,
  projectRequestType,
  imageUrl,
  imageProxyURL,
  imageHeight,
  imageWidth,
}: CreateProjectParams): Promise<void> {
  await prisma.user.upsert({
    where: {
      snowflakeId: creatorSnowflake,
    },
    update: {
      ownedProjects: {
        create: {
          name: projectName,
          slug: projectSlug,
          status: ProjectStatus.PendingDescription,
          requestType: projectRequestType,
          image: {
            create: {
              url: imageUrl,
              proxyURL: imageProxyURL,
              height: imageHeight,
              width: imageWidth,
            },
          },
        },
      },
    },
    create: {
      snowflakeId: creatorSnowflake,
      ownedProjects: {
        create: {
          name: projectName,
          slug: projectSlug,
          status: ProjectStatus.PendingDescription,
          requestType: projectRequestType,
          image: {
            create: {
              url: imageUrl,
              proxyURL: imageProxyURL,
              height: imageHeight,
              width: imageWidth,
            },
          },
        },
      },
    },
  });
}

export default createProject;
