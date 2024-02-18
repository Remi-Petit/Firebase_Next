# Use Node.js 21.6.1 as the base image
FROM node:21.6.1

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Expose the port your Next.js app runs on (default is 3000)
EXPOSE 3000

# Command to build the Next.js app for production
RUN npm run build

# Command to start the Next.js app
CMD ["npm", "start"]