module.exports = {
  apps: [
    {
      name: 'forties-bot',
      script: './build/server.js',
      watch: true,
      ignoreWatch: ['node_modules'],
    },
  ],
};
