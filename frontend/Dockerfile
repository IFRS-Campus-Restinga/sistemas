FROM node:20-alpine

ENV NODE_ENV=development

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["sh", "-c", "npm install && npx vite --host 0.0.0.0 --port 3000"]
