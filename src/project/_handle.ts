import { ChatInputCommandInteraction, Client } from 'discord.js';
import handleCreate from './create/_handle';

async function handleProjectCommand(
  client: Client,
  interaction: ChatInputCommandInteraction
): Promise<void> {
  const subCommand = interaction.options.getSubcommand();
  if (subCommand === 'create') {
    await handleCreate(client, interaction);
  }
}

export default handleProjectCommand;
