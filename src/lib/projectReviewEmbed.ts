import {
  Client,
  TextChannel,
  ActionRowBuilder,
  ButtonStyle,
  EmbedBuilder,
  Message,
  ButtonBuilder,
  ChatInputCommandInteraction,
} from 'discord.js';
import slugify from 'slugify';
import config from '../config';

interface ProjectReviewEmbedConfig {
  title: string;
  image: {
    url: string;
    proxyURL: string;
    height: number;
    width: number;
  };
  fields: [
    {
      name: 'type';
      value: 'IC' | 'GB';
    },
    {
      name: 'name';
      value: string;
      inline: true;
    },
    {
      name: 'slug';
      value: string;
      inline: true;
    },
    {
      name: 'description';
      value: 'Waiting for creator to enter description...';
    },
    {
      name: 'creator';
      value: string;
    }
  ];
}

function formatSlug(projectName: string): string {
  return slugify(projectName, {
    lower: true,
    strict: true,
    locale: 'en',
  });
}

async function initProjectReviewEmbed(
  embedConfig: ProjectReviewEmbedConfig,
  client: Client
): Promise<Message> {
  const reviewChannel = (await client.channels.fetch(
    config.IC_GB_REVIEW_CHANNEL
  )) as TextChannel;
  const embed = new EmbedBuilder(embedConfig);
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

async function activateProjectReviewEmbed(
  message: Message,
  description: string
): Promise<void> {
  const fetchedMessage = await message.fetch();
  console.log(fetchedMessage);
  const embed = new EmbedBuilder(fetchedMessage.embeds[0].data);
  embed.setFields([
    ...(fetchedMessage.embeds[0].data.fields ?? []).slice(0, 3),
    {
      name: 'description',
      value: description,
    },
    ...(fetchedMessage.embeds[0].data.fields ?? []).slice(4),
  ]);
  const pendingButton = new ActionRowBuilder<ButtonBuilder>().addComponents([
    new ButtonBuilder()
      .setCustomId('approveProjectReview')
      .setLabel('Approve')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId('denyProjectReview')
      .setLabel('Deny')
      .setStyle(ButtonStyle.Danger),
  ]);
  await fetchedMessage.edit({
    embeds: [embed.data],
    components: [pendingButton],
  });
}

async function getEmbedConfig(
  interaction: ChatInputCommandInteraction
): Promise<ProjectReviewEmbedConfig> {
  const errors = [];

  // No need to validate type since it's picked from a set of prescribed options
  const type = interaction.options.getString('type', true);

  // Validate that name is less than 32 characters
  const name = interaction.options.getString('name', true).trim();
  const nameValid = name.length < 32;
  if (!nameValid) {
    errors.push(
      `Project name must be fewer than 32 characters ("${name}" is ${name.length} characters.)`
    );
  }

  // Validate that the attachment is an image
  const attachment = interaction.options.getAttachment('attachment', true);
  const contentType = attachment.contentType ?? 'null';
  console.log(contentType);
  if (!contentType.startsWith('image/')) {
    errors.push(`Attachment must be an image. Yours was a(n) ${contentType}.`);
  }

  if (errors.length === 0) {
    return {
      title: `Review proposal for ${name}`,
      image: {
        url: attachment.url,
        proxyURL: attachment.proxyURL,
        height: attachment.height ?? 0,
        width: attachment.width ?? 0,
      },
      fields: [
        {
          name: 'type',
          value: type as 'IC' | 'GB',
        },
        {
          name: 'name',
          value: name,
          inline: true,
        },
        {
          name: 'slug',
          value: formatSlug(name),
          inline: true,
        },
        {
          name: 'description',
          value: 'Waiting for creator to enter description...',
        },
        {
          name: 'creator',
          value: interaction.user.tag,
        },
      ],
    };
  } else {
    const errorMsg = ['Your request had the following issues:', ...errors].join(
      '\n   - '
    );
    await interaction.reply(errorMsg);
    throw Error('FormatError');
  }
}

export { initProjectReviewEmbed, activateProjectReviewEmbed, getEmbedConfig };
