# Use a small base image
FROM node:20-alpine3.19  AS builder

# Create app directory
WORKDIR /usr/src/app

# Copy app source
COPY . .

# Custom ENV
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Install source code
RUN npm ci

# Generate Prisma client
RUN npm run prisma generate

# Build the app
RUN npm run build

# Production runner
FROM node:20-alpine3.19  AS runner

# Install necessary packages for Puppeteer in runtime image
RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      harfbuzz \
      ca-certificates \
      ttf-freefont

# Create app directory
WORKDIR /usr/src/app

ENV TZ=Asia/Phnom_Penh
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
COPY package*.json ./
COPY prisma ./prisma
COPY --from=builder /usr/src/app/dist ./dist

RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
RUN npm ci --omit=dev

# Expose the port
EXPOSE 3000

# Start the app
CMD [ "node", "./dist/src/main.js" ]
