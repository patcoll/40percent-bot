import {
  ApplicationCommandData,
  ApplicationCommandOptionType,
  ApplicationCommandType,
} from 'discord.js';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import config from '../config.js';

const commands: ApplicationCommandData[] = [
  {
    name: 'project-create',
    description: 'Request an IC or GB project',
    options: [
      {
        name: 'type',
        type: ApplicationCommandOptionType.String,
        description: 'Valid options are IC and GB',
        choices: [
          {
            name: 'Interest Check',
            value: 'IC',
          },
          {
            name: 'Group Buy',
            value: 'GB',
          },
        ],
        required: true,
      },
      {
        name: 'name',
        type: ApplicationCommandOptionType.String,
        description:
          'A short name for your project, must be fewer than 32 characters',
        required: true,
      },
      // Can we get the description in a modal?
      // https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-response-object-modal
      // {
      //   name: 'description',
      //   type: ApplicationCommandOptionType.String,
      //   description:
      //     'A short name for your project, must be fewer than 1000 characters and/or fewer than 15 lines.',
      //   required: true,
      // },
      {
        name: 'attachment',
        type: ApplicationCommandOptionType.Attachment,
        description: 'You must *attach* exactly one image (not a URL)',
        required: true,
      },
    ],
  },
  {
    name: 'Showcase',
    type: ApplicationCommandType.Message,
  },
];

const rest = new REST({ version: '10' }).setToken(config.BOT_TOKEN);

rest
  .put(
    Routes.applicationGuildCommands(config.BOT_CLIENT_ID, config.FORTIES_GUILD),
    { body: commands }
  )
  .then(() => console.log('Successfully registered application commands.'))
  .catch(console.error);
