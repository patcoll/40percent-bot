import {
  Image,
  PrismaClient,
  Project,
  ProjectStatus,
  User,
} from '@prisma/client';

type InProgressProject = Project & {
  owner: User;
  image: Image;
};

async function getInProgressProject(slug: string): Promise<InProgressProject> {
  const prisma = new PrismaClient();
  const project = await prisma.project.findUnique({
    where: {
      slug_status: {
        slug,
        status: ProjectStatus.PendingDescription,
      },
    },
    include: {
      owner: true,
      image: true,
    },
  });
  if (project === null) {
    throw Error(`No in-progress project ${slug} found in DB.`);
  }
  if (project.image === null) {
    throw Error(`Image not found for project ${slug} in DB.`);
  }
  return project as InProgressProject;
}

export default getInProgressProject;

export type { InProgressProject };
