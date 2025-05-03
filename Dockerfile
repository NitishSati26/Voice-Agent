# Stage 1: Build the React app
FROM node:18 AS build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the source code and build it
COPY . .
RUN npm run build

# Stage 2: Serve the build using `serve`
FROM node:18

# Install the `serve` package globally
RUN npm install -g serve

WORKDIR /app

# Copy only the built app from the previous stage
COPY --from=build /app/build ./build

# Expose the port `serve` will use
EXPOSE 3000

# Command to serve the app
CMD ["serve", "-s", "build", "-l", "3000"]
