import { Message } from 'discord.js';

export default async function handleMemeMessage(msg: Message): Promise<void> {
  if (
    msg.content.toLowerCase().includes('planck') &&
    !msg.content.toLowerCase().includes('™')
  ) {
    await msg.reply('Planck™');
  }
}
