# Use the official Node.js 18 image as the base
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and yarn.lock files first (to leverage Docker caching)
COPY package.json ./

# Install dependencies using Yarn
RUN yarn install

# Copy the rest of the application files to the container
COPY . .

# Ensure uploads directory exists with proper permissions
RUN mkdir -p uploads && chmod 755 uploads

# Expose the application port (default Express.js port)
EXPOSE 5000

# Start the application
CMD ["sh", "-c", "node createUser.js && yarn run start"]
