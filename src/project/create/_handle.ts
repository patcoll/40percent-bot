import { ProjectRequestType } from '@prisma/client';
import { ChatInputCommandInteraction, Client } from 'discord.js';
import slugify from 'slugify';
import createProjectInDB from './db/createProject';
import setProjectReviewEmbedInDB from './db/setProjectReviewEmbed';
import initProjectReview from './review/initReview';
import showDescriptionInputModal from './descriptionModal/showDescriptionModal';

function formatProjectSlug(projectName: string): string {
  return slugify(projectName, {
    lower: true,
    strict: true,
    locale: 'en',
  });
}

async function handleRequestProject(
  client: Client,
  interaction: ChatInputCommandInteraction
): Promise<void> {
  // Validate the image attachment
  const attachment = interaction.options.getAttachment('attachment', true);
  const contentType = attachment.contentType ?? 'null';
  if (
    !contentType.startsWith('image/') ||
    attachment.height === null ||
    attachment.width === null
  ) {
    await interaction.reply({
      content: `Attachment must be an image. Yours was a(n) ${contentType}.`,
      ephemeral: true,
    });
    throw Error(`Project didn't have a valid attachment.`);
  }

  // Save the project in the DB
  const projectName = interaction.options.getString('name', true).trim();
  const interactionRequestType = interaction.options.getString('type', true);
  const requestType =
    interactionRequestType === 'IC'
      ? ProjectRequestType.IC
      : ProjectRequestType.GB;
  const slug = formatProjectSlug(projectName);
  await createProjectInDB({
    creatorSnowflake: interaction.user.id,
    projectName,
    projectSlug: slug,
    projectRequestType: requestType,
    imageUrl: attachment.url,
    imageProxyURL: attachment.proxyURL,
    imageHeight: attachment.height,
    imageWidth: attachment.width,
  });

  // Send and remember the review message
  const reviewMessage = await initProjectReview(client, slug);
  await setProjectReviewEmbedInDB(slug, reviewMessage.id);

  // Prompt a modal to enter the project description, which we will handle
  // in a separate interaction
  await showDescriptionInputModal(interaction, reviewMessage.id);
}

export default handleRequestProject;
