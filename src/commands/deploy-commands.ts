// import {
//   ApplicationCommandData,
//   ApplicationCommandType,
// } from 'discord.js';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import config from '../config.js';
import projectCommand from '../project/_command';

const commands = [projectCommand];

// const commands: ApplicationCommandData[] = [
//   {
//     name: 'Showcase',
//     type: ApplicationCommandType.Message,
//   },
// ];

const rest = new REST({ version: '10' }).setToken(config.BOT_TOKEN);

rest
  .put(
    Routes.applicationGuildCommands(config.BOT_CLIENT_ID, config.FORTIES_GUILD),
    { body: commands }
  )
  .then(() => console.log('Successfully registered application commands.'))
  .catch(console.error);
