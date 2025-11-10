FROM nginx:alpine

COPY src/*.html /usr/share/nginx/html/

COPY src/assets/ /usr/share/nginx/html/assets/
COPY src/components/ /usr/share/nginx/html/components/
COPY src/js/ /usr/share/nginx/html/js/
COPY src/styles/ /usr/share/nginx/html/styles/

COPY default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]