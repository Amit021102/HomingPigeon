# Step 1: Use an official, lightweight Node.js environment
FROM node:20-slim

# Step 2: Install toolchain dependencies required to compile better-sqlite3 from source binaries
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Step 3: Set our working directory inside the container image sandbox
WORKDIR /app

# Step 4: Copy package manifest definitions first to optimize build caching layers
COPY package*.json ./

# Step 5: Clean install production dependencies only
RUN npm ci --only=production

# Step 6: Copy the rest of your app source files (frontend and backend structures)
COPY . .

# Step 7: Expose port 3000 to match your express configurations
EXPOSE 3000

# Step 8: Define the runtime execution execution trigger command
CMD ["node", "backend/server.js"]