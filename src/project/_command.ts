import {
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';
import createProject from './create/_subcommand';

function projectCommand(): SlashCommandSubcommandsOnlyBuilder {
  return new SlashCommandBuilder()
    .setName('project')
    .setDescription('Manage IC and GB projects')
    .addSubcommand(createProject);
}

export default projectCommand;
