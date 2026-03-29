# Use Node 20 Alpine base image
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install all dependencies including dev (for TypeScript build)
RUN npm install

# Copy the rest of the code
COPY . .

# Build the TypeScript code
RUN npm run build

# ----- Production image -----
FROM node:20-alpine

WORKDIR /app

# Copy only production dependencies
COPY package*.json ./
RUN npm install --production

# Copy the built files from the builder stage
COPY --from=builder /app/dist ./dist

# Set environment variable and expose port
ENV PORT=3000
EXPOSE 3000

# Start the app
CMD ["node", "dist/server.js"]