import { Snowflake, Attachment } from 'discord.js';

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

function serialize(announcementParams: ProjectAnnouncementParams): Attachment {
  return new Attachment(
    Buffer.from(JSON.stringify(announcementParams)),
    'metadata.json'
  );
}

export { ProjectAnnouncementParams };

export default {
  generate,
  serialize,
};
