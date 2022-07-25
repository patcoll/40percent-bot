import { ProjectRequestType } from '@prisma/client';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Client,
  EmbedBuilder,
  Message,
  TextChannel,
} from 'discord.js';
import config from '../../../config';
import getInProgressProject, {
  InProgressProject,
} from '../db/getInProgressProject';

enum ProjectReviewEmbedField {
  Type = 'Phase',
  CreatorName = 'Creator',
  Slug = 'Slug',
}

function getEmbedConfig(project: InProgressProject) {
  return {
    title: project.name,
    description: 'Waiting for creator to enter description...',
    image: {
      url: project.image.url,
      proxyURL: project.image.proxyURL,
      height: project.image.height,
      width: project.image.width,
    },
    fields: [
      {
        name: ProjectReviewEmbedField.Type,
        value:
          project.requestType === ProjectRequestType.IC
            ? 'Interest Check'
            : 'Group Buy',
      },
      {
        name: ProjectReviewEmbedField.CreatorName,
        value: `<@${project.owner.snowflakeId}>`,
        inline: true,
      },
      {
        name: ProjectReviewEmbedField.Slug,
        value: project.slug,
        inline: true,
      },
    ],
  };
}

async function initProjectReview(
  client: Client,
  slug: string
): Promise<Message> {
  const project = await getInProgressProject(slug);
  const embedConfig = getEmbedConfig(project);
  const embed = new EmbedBuilder(embedConfig);

  const reviewChannel = (await client.channels.fetch(
    config.IC_GB_REVIEW_CHANNEL
  )) as TextChannel;
  const pendingButton = new ActionRowBuilder<ButtonBuilder>().addComponents([
    new ButtonBuilder()
      .setCustomId('pendingButton')
      .setLabel('Creator still entering description...')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(true),
  ]);

  const embedMessage = await reviewChannel.send({
    embeds: [embed.data],
    components: [pendingButton],
  });

  return embedMessage;
}

export default initProjectReview;
