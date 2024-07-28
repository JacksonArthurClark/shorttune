# ShortTune

ShortTune is a Node.js application that extracts audio from YouTube Shorts and identifies the song using the ACRCloud API. The application includes a web frontend built with Express, allowing users to input a YouTube Short URL to identify the song.

## Features

- Extract audio from YouTube Shorts using `youtube-dl`.
- Identify songs using the ACRCloud API.
- Simple web interface for inputting YouTube Short URLs.

## Prerequisites

- Node.js
- Docker
- ACRCloud API credentials

## Setup

1. **Clone the Repository:**
   ```sh
   git clone https://github.com/your-username/shorttune.git
   cd shorttune
   ```

2. **Install Dependencies:**
   ```sh
   npm install
   ```

3. **Set Up Environment Variables:**
   - Create a `.env` file in the root of your project directory and add your ACRCloud credentials:
     ```env
     ACRCLOUD_HOST=identify-us-west-2.acrcloud.com
     ACRCLOUD_ACCESS_KEY=your_access_key
     ACRCLOUD_ACCESS_SECRET=your_access_secret
     ```

4. **Run the Application Locally:**
   ```sh
   node src/index.js
   ```
   - Open your web browser and navigate to `http://localhost:3000`.

## Docker Deployment

1. **Build the Docker Image:**
   ```sh
   docker build -t shorttune .
   ```

2. **Stop and Remove Any Existing Container:**
   ```sh
   docker stop shorttune-app
   docker rm shorttune-app
   ```

3. **Run the Docker Container:**
   ```sh
   docker run -d -p 3000:3000 --name shorttune-app shorttune
   ```

4. **Verify the Deployment:**
   - Open your web browser and navigate to `http://localhost:3000`.

## Project Structure

```
shorttune/
├── src/
│   └── index.js
├── package.json
├── package-lock.json
├── Dockerfile
├── .env
└── .dockerignore
```