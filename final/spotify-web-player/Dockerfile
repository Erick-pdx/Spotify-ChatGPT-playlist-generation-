#Use Node.js as the base image
FROM node:18

LABEL maintainer="francoer@pdx.edu"

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the React app
RUN npm run build

# Expose the port (Cloud Run uses the PORT environment variable)
ENV PORT=8080
EXPOSE 8080

# Copy the entrypoint script into the container
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Set the entrypoint so our runtime config is injected before starting the server
ENTRYPOINT ["/app/entrypoint.sh"]

# Start the Express server
CMD ["node", "server/index.js"]

