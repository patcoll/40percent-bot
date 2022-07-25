stateless announcement channel

- state should come from DB, and include
- repopulated according to latest API on server boot

/project create

- post the announcement

more /project commands

- /project search [IC|GB|POST-GB|ARCHIVE] [search filter]
- /project join
- /project leave
- /project move [IC|GB|POST-GB|ARCHIVE] (owner/mods only)
  - reassigns channel to another category, and modifies to correct permissions
  - posts an announcement if appropriate
- /project update (owner/collaborator only)
- /project ping (owner/mods only)

add a [COLLABORATORS] parameter to /project create command

- COLLABORATORS can pin messages, and use ping, move, or update command

add a dialog that confirms the user understands the rules of submitting a project

- COLLABORATORS are not OWNERS.
- it is the OWNER's sole responsibility to post project updates according to the rules
- list the rest of the rules

automatically move project to IC or GB hell after X time with no updates

- posts an announcement if appropriate

containerize

- dev container
  - watch and automatically rebuild prisma typedefs
  - push prisma types to dev db on save
  - command to clear out all project channels and the whole db
- deployment container
- base prod container
- github action to deploy bot to prod
  - build prisma types
  - rebuild docker image
    - inject env variables here?
  - deploy image to cloud image registry
  - spin up container from image
- action to soft-push or migrate prisma types to prod db

"historical load" projects created with the old system

add documentation

- project flows

- contributing
  - developing
  - ci
