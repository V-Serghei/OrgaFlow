FROM node:18-alpine AS builder

WORKDIR /app

COPY ./OrgaFlow.UI/orga-flow-ui/package*.json ./

RUN npm install

COPY ./OrgaFlow.UI/orga-flow-ui ./

RUN SKIP_TYPECHECK=true npm run build

FROM node:18-alpine AS runner

WORKDIR /app

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json .
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

ENV PORT=3000


CMD ["npm", "start"]
