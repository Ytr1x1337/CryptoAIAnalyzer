FROM nginx:stable-alpine

COPY . /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 5500

CMD ["nginx", "-g", "daemon off;"]