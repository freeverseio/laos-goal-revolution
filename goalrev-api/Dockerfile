FROM node:10

# Set the working directory to /app
WORKDIR /app

# Copy the current directory contents into the container at /appa
COPY . /app

RUN npm ci --only=production
# If you are building your code for production
# RUN npm ci --only=production

EXPOSE 4000

ENTRYPOINT [ "npm", "start", "--" ]