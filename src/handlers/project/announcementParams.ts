import { Snowflake, AttachmentBuilder } from 'discord.js';

type ProjectAnnouncementParams = {
  version: string;
  ownerId: Snowflake;
  roleId: Snowflake;
};

function generate(
  ownerId: Snowflake,
  roleId: Snowflake
): ProjectAnnouncementParams {
  return {
    version: '1.0.0', // Use semantic versioning to figure out if we need to keep old parsers around
    ownerId,
    roleId,
  };
}

function serialize(
  announcementParams: ProjectAnnouncementParams
): AttachmentBuilder {
  return new AttachmentBuilder(
    Buffer.from(JSON.stringify(announcementParams))
  ).setName('metadata.json');
}

export { ProjectAnnouncementParams };

export default {
  generate,
  serialize,
};
