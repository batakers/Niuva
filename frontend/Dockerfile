FROM node:20-alpine AS build

WORKDIR /app
ARG REACT_APP_PUBLIC_SITE_URL
ARG REACT_APP_BACKEND_URL
ARG GENERATE_SOURCEMAP=false
ENV REACT_APP_PUBLIC_SITE_URL=$REACT_APP_PUBLIC_SITE_URL
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL
ENV GENERATE_SOURCEMAP=$GENERATE_SOURCEMAP
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
