FROM nginx:alpine

COPY demo.html /usr/share/nginx/html/demo.html
COPY startup.sh /startup.sh

RUN chmod +x /startup.sh

CMD ["/startup.sh"] 