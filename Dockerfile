FROM node:20.11-alpine3.19

WORKDIR /app/frontend

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Build application
RUN npm run build

EXPOSE 5173

CMD ["npm", "run", "preview"]