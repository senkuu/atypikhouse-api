FROM node:12-alpine

WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
COPY yarn.lock ./

RUN yarn install --frozen-lockfile

# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

RUN yarn run build

EXPOSE 4000
CMD [ "node", "dist/index.js" ]
