import {
  Client,
  TextChannel,
  ActionRowBuilder,
  ButtonStyle,
  EmbedBuilder,
  Message,
  ButtonBuilder,
} from 'discord.js';
import config from '../config';

interface ShowcaseEmbedConfig {
  author: {
    name: string;
    icon_url: string;
  };
  description: string;
  image: {
    url: string;
    proxyURL: string;
    height: number;
    width: number;
  };
  footer: {
    text: string;
  };
}

export default async function addShowcaseEmbed(
  embedConfig: ShowcaseEmbedConfig,
  messageUrl: string,
  client: Client
): Promise<Message> {
  const showcaseChannel = (await client.channels.fetch(
    config.FORTIES_SHOWCASE
  )) as TextChannel;
  const embed = new EmbedBuilder(embedConfig);
  const msgLinkButton = new ActionRowBuilder<ButtonBuilder>().addComponents([
    new ButtonBuilder()
      .setLabel('Original Message')
      .setStyle(ButtonStyle.Link)
      .setURL(messageUrl),
  ]);

  const embedMessage = await showcaseChannel.send({
    embeds: [embed.data],
    components: [msgLinkButton],
  });

  console.log('40s channel posted showcase:', {
    author: embedConfig.author.name,
    message_url: embedMessage.url,
    image: embed.data.image,
  });

  return embedMessage;
}
