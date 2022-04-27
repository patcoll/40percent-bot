import {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  Message,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';

async function showDescriptionInputModal(
  interaction: ChatInputCommandInteraction,
  reviewEmbedMessage: Message
): Promise<void> {
  await interaction.showModal(
    new ModalBuilder()
      .setCustomId(`descriptionInput-${reviewEmbedMessage.id}`)
      .setTitle('Describe')
      .addComponents([
        new ActionRowBuilder<TextInputBuilder>().addComponents([
          new TextInputBuilder({
            style: TextInputStyle.Paragraph,
            customId: 'descriptionTextInput',
            label: 'Description',
            minLength: 10,
            maxLength: 1000,
            required: true,
            placeholder:
              'Enter a brief announcement description for your project. It must not be more than 15 lines long.',
          }),
        ]),
      ])
  );
}

export default showDescriptionInputModal;
