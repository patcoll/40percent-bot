import { SlashCommandSubcommandBuilder } from 'discord.js';

function createProject(
  subCommand: SlashCommandSubcommandBuilder
): SlashCommandSubcommandBuilder {
  return subCommand
    .setName('create')
    .setDescription('Request an IC or GB project')
    .addStringOption((option) =>
      option
        .setName('type')
        .setDescription('Interest Check or Group Buy')
        .addChoices(
          {
            name: 'Interest Check',
            value: 'IC',
          },
          {
            name: 'Group Buy',
            value: 'GB',
          }
        )
        .setRequired(true)
    )

    .addStringOption((option) =>
      option
        .setName('name')
        .setDescription('The name of your project')
        .setMinLength(1)
        .setMaxLength(32)
        .setRequired(true)
    )

    .addAttachmentOption((option) =>
      option
        .setName('attachment')
        .setDescription('You must *attach* exactly one image (not a URL)')
        .setRequired(true)
    );
}

export default createProject;
