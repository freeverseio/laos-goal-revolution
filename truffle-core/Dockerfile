# Base image - Use Node.js LTS version
FROM node:18

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the entire project into the working directory
COPY . .

# Expose port 8545 for Ganache
EXPOSE 8545

# Run the index.mjs file when the container starts
CMD ["node", "src/index.mjs"]