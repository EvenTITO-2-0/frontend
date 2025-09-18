FROM node:18 AS build
WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install
COPY . .

# Accept VITE_ build arguments and set them as environment variables for the build
ARG VITE_USERS_URL
ARG VITE_EVENTS_URL
ENV VITE_USERS_URL=$VITE_USERS_URL
ENV VITE_EVENTS_URL=$VITE_EVENTS_URL

RUN npm run build

FROM node:18-slim
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/dist .
EXPOSE 8080
CMD ["serve", "-s", ".", "-l", "8080"]
