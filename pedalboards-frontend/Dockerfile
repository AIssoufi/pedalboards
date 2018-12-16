# Stage 1 - the build process
FROM node:11.0.0 as build-deps
WORKDIR /usr/src/app
COPY package.json ./
RUN npm install
COPY . ./
RUN npm run build

# Stage 2 - the production environment
FROM nginx:1.15.2-alpine
COPY --from=build-deps /usr/src/app/build /var/www
COPY --from=build-deps /usr/src/app/nginx.conf /etc/nginx/nginx.conf
CMD ["nginx","-g","daemon off;"]