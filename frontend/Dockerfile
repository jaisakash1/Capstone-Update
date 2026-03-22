# Use Node.js LTS (matches vite's required engine)
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Start Vite dev server, binding to all interfaces so Docker can expose it
CMD ["npm", "run", "dev", "--", "--host"]
