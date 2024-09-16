# Use the official Node.js 18 image as the base
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and yarn.lock files first (to leverage Docker caching)
COPY package.json yarn.lock ./

# Install dependencies using Yarn
RUN yarn install

# Copy the rest of the application files to the container
COPY . .

# Expose the application port (default Express.js port)
EXPOSE 5000

# Start the application
CMD ["yarn","run","start"]