FROM nginx:alpine

COPY src/pages/*.html /usr/share/nginx/html/
COPY src/js/ /usr/share/nginx/html/js/
COPY src/pages/styles/ /usr/share/nginx/html/styles/
COPY default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]