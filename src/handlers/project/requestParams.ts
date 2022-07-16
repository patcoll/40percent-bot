import { Snowflake, Message, ChatInputCommandInteraction } from 'discord.js';

type ProjectRequestParams = {
  type: string;
  name: string;
  ownerId: Snowflake;
  description: string;
  imageUrl: string;
};

async function parseInteraction(
  interaction: ChatInputCommandInteraction
): Promise<ProjectRequestParams> {
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

  const description = '';

  // Validate that the attachment is an image
  const attachment = interaction.options.getAttachment('attachment', true);
  const contentType = attachment.contentType ?? 'null';
  if (!contentType.startsWith('image/')) {
    errors.push(`Attachment must be an image. Yours was a(n) ${contentType}.`);
  }

  if (errors.length === 0) {
    return {
      type,
      name,
      ownerId: interaction.user.id,
      description,
      imageUrl: attachment.url,
    };
  } else {
    const errorMsg = ['Your request had the following issues:', ...errors].join(
      '\n   - '
    );
    await interaction.reply(errorMsg);
    throw Error('FormatError');
  }
}

async function parse(msg: Message): Promise<ProjectRequestParams> {
  const lines = msg.content.split('\n');

  if (lines.length >= 3) {
    const errors = [];
    const type = lines[0].trim();
    const name = lines[1].trim();
    const description = lines.slice(2).join('\n').trim();
    const descriptionLineCount = lines.slice(2).length;
    const typeValid = ['IC', 'GB'].includes(type);
    const nameValid = name.length > 0 && name.length < 32;
    const descriptionValid =
      description.length > 0 &&
      description.length <= 1000 &&
      lines.length <= 15;
    const attachmentUrls = msg.attachments.map((attachment) => attachment.url);

    if (!typeValid)
      errors.push(
        `Type (line one) must be either "IC" or "GB". You entered "${type}".`
      );
    if (!nameValid)
      errors.push(
        `Project name (line two) must be fewer than 32 characters. Your's was ${name.length} characters.`
      );
    if (!descriptionValid)
      errors.push(
        `Project description (line three+) must be fewer than 1000 characters and/or fewer than 15 lines.
       Your description was ${description.length} characters and ${descriptionLineCount} lines.`
      );
    if (attachmentUrls.length !== 1)
      errors.push(
        `Request must have exactly one image attached (not a URL). Your request had ${attachmentUrls.length} attachments.`
      );

    if (errors.length === 0) {
      return {
        type,
        name,
        ownerId: msg.author.id,
        description,
        imageUrl: attachmentUrls[0],
      };
    } else {
      let errorMessage = `your request had the following issues:`;
      for (const error of errors) {
        errorMessage += `\n   - ${error}`;
      }
      await msg.reply(errorMessage);
      throw Error('FormatError');
    }
  }
  const requestErrorMessage = `your request was incomplete. Please ensure your request matches the following format:
    - Line one: "IC" (Interest Check) or "GB" (Group Buy)
    - Line two: Project name (less than 32 characters)
    - Line three+: Project description (up to 1000 characters and/or up to 12 lines)
    - Must include exactly one image attachment (not a URL) to be used with the announcement
  `;
  await msg.reply(requestErrorMessage);
  throw Error('FormatError');
}

export { ProjectRequestParams };

export default {
  parse,
  parseInteraction,
};
