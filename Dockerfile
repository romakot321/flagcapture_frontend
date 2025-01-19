FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install -g @angular/cli@19
RUN npm install
COPY . .
RUN ng build

# Stage 2: Запуск nginx
FROM nginx:alpine

# Меняем конфиг nginx-а на собственный
COPY nginx.conf /etc/nginx/nginx.conf

# Копируем собранное приложение из предыдущего этапа в рабочую директорию nginx
COPY --from=build /app/dist/project4/browser /usr/share/nginx/html
EXPOSE 8080

# Запускаем nginx
CMD ["nginx", "-g", "daemon off;"]
