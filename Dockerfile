FROM node:20-alpine AS builder

RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY prisma ./prisma/
RUN npx prisma generate

COPY src ./src/
COPY tsconfig*.json ./
COPY nest-cli.json ./

ENV NODE_OPTIONS="--max-old-space-size=1024"
RUN npm run build

FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

EXPOSE 8080

CMD ["node", "dist/src/main.js"]
