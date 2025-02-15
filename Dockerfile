FROM node:20.11-alpine3.19

WORKDIR /app/frontend

# Copy package files
COPY package*.json ./

COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Copy application files
COPY . .

EXPOSE 5174

ENTRYPOINT ["docker-entrypoint.sh"]