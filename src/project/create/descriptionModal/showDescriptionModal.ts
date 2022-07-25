import {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  ModalBuilder,
  Snowflake,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';

async function showDescriptionInputModal(
  interaction: ChatInputCommandInteraction,
  reviewEmbedMessageId: Snowflake
): Promise<void> {
  await interaction.showModal(
    new ModalBuilder()
      .setCustomId(`proj-${reviewEmbedMessageId}`)
      .setTitle('Describe')
      .addComponents([
        new ActionRowBuilder<TextInputBuilder>().addComponents([
          new TextInputBuilder()
            .setStyle(TextInputStyle.Paragraph)
            .setCustomId('descriptionTextInput')
            .setLabel('Description')
            .setMinLength(10)
            .setMaxLength(1000)
            .setRequired(true)
            .setPlaceholder(
              'Enter a brief announcement description for your project. It must not be more than 15 lines long.'
            ),
        ]),
      ])
  );
}

export default showDescriptionInputModal;
