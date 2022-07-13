import {
  Client,
  Message,
  MessageContextMenuCommandInteraction,
  TextChannel,
} from 'discord.js';
import config from '../config';
import addShowcaseEmbed from '../lib/addShowcaseEmbed';

async function handleShowcaseCommand(
  interaction: MessageContextMenuCommandInteraction,
  client: Client
): Promise<void> {
  const msg = interaction.targetMessage as Message;

  if (msg.channelId === config.FORTIES_SHOWCASE) {
    await interaction.reply(
      `Can't showcase a message in <#${config.FORTIES_SHOWCASE}>`
    );
    return;
  }

  if (msg.author.id !== interaction.user.id) {
    await interaction.reply('You can only showcase your own message.');
    return;
  }

  if (msg.attachments.size !== 1) {
    await interaction.reply('Must have exactly 1 attachment to showcase.');
    return;
  }

  const acceptedFileFormats = new RegExp(
    '.(jpe?g|png|gif|bmp|webp|tiff?)$',
    'i'
  );
  const image = msg.attachments.find((attachment) =>
    acceptedFileFormats.test(attachment.url)
  );
  if (!image) {
    await interaction.reply(
      'Attachment must be an image. Accepted file types are .jpg, .png, .bmp, .gif, .webp, and .tif'
    );
    return;
  }

  const trimmedDescription =
    msg.content.length > 512
      ? `${msg.content.substring(0, 512).trim()}...`
      : msg.content;

  await addShowcaseEmbed(
    {
      author: {
        name: msg.author.username,
        icon_url: msg.author.avatarURL() ?? msg.author.defaultAvatarURL,
      },
      description: trimmedDescription,
      image: {
        url: image.url,
        proxyURL: image.proxyURL,
        height: image.height ?? 0,
        width: image.width ?? 0,
      },

      footer: {
        text: `#${(interaction.channel as TextChannel).name}`,
      },
    },
    msg.url,
    client
  );

  await interaction.reply(
    `Successfully submitted to <#${config.FORTIES_SHOWCASE}>`
  );

  return;
}

export { handleShowcaseCommand };
