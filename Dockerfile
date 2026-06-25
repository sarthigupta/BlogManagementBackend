FROM node:22-alpine AS base

WORKDIR /app

FROM base AS deps

COPY package*.json ./
RUN npm ci

FROM base AS build

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/src/index.js"]