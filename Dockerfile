FROM node:16-alpine

# Create app directory
WORKDIR /usr/src/app

# Install PM2
RUN npm install pm2 -g

# CMD ["pm2-dev", "server.js"]