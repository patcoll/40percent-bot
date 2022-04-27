import { Message, Client, TextChannel } from 'discord.js';
import config from '../config';
import addShowcaseEmbed from '../lib/addShowcaseEmbed';

export default async function handleShowcaseMessage(
  msg: Message,
  client: Client
): Promise<void> {
  if (
    msg.content.includes(`<#${config.FORTIES_SHOWCASE}>`) &&
    msg.attachments.size > 0
  ) {
    const acceptedFileFormats = new RegExp(
      '.(jpe?g|png|gif|bmp|webp|tiff?)$',
      'i'
    );
    const image = msg.attachments.find((attachment) =>
      acceptedFileFormats.test(attachment.url)
    );

    if (!image) {
      await msg.reply(
        'showcase messages must contain an image. Accepted file types are .jpg, .png, .bmp, .gif, .webp, and .tif'
      );

      return;
    }

    const trimDescription = (content: string): string => {
      const trimmedContent = content
        .replace(`<#${config.FORTIES_SHOWCASE}>`, '')
        .trim();
      return trimmedContent.length > 512
        ? `${trimmedContent.substring(0, 512).trim()}...`
        : trimmedContent;
    };

    await addShowcaseEmbed(
      {
        author: {
          name: msg.author.username,
          icon_url: msg.author.avatarURL() ?? msg.author.defaultAvatarURL,
        },
        description: trimDescription(msg.content),
        image: {
          url: image.url,
          proxyURL: image.proxyURL,
          height: image.height ?? 0,
          width: image.width ?? 0,
        },
        footer: {
          text: `#${(msg.channel as TextChannel).name}`,
        },
      },
      msg.url,
      client
    );

    return;
  }
}
