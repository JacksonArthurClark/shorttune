const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const acrcloud = require('acrcloud');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

/**
 * Validate YouTube URL
 * @param {string} url - The YouTube URL to validate
 * @returns {boolean} - Returns true if the URL is valid, otherwise false
 */
const isValidYouTubeUrl = (url) => {
  const regex = /^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/;
  return regex.test(url);
};

const app = express();
const port = 3000;

const acr = new acrcloud({
  host: process.env.ACRCLOUD_HOST,
  access_key: process.env.ACRCLOUD_ACCESS_KEY,
  access_secret: process.env.ACRCLOUD_ACCESS_SECRET
});

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

const downloadAudio = (youtubeUrl) => {
  return new Promise((resolve, reject) => {
    if (!isValidYouTubeUrl(youtubeUrl)) {
      return reject('Invalid YouTube URL');
    }

    const uniqueFilename = `${uuidv4()}.mp3`;
    const output = path.resolve(__dirname, uniqueFilename);
    const command = `yt-dlp -x --audio-format mp3 -o "${output}" "${youtubeUrl}"`;
    console.log(`Executing command: ${command}`);
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        console.error(stderr);
        reject(`Error: ${error.message}`);
      } else {
        console.log(stdout);
        resolve(output);
      }
    });
  });
};

const recognizeSong = (filePath) => {
  return new Promise((resolve, reject) => {
    console.log(`Reading file: ${filePath}`);
    const buffer = fs.readFileSync(filePath);
    console.log(`File read successfully, buffer length: ${buffer.length}`);

    // Sending request to ACRCloud using the proper method
    console.log('Sending request to ACRCloud...');
    acr.identify(buffer).then(metadata => {
      console.log(`Metadata received: ${JSON.stringify(metadata, null, 2)}`);
      fs.unlink(filePath, (unlinkErr) => {
        if (unlinkErr) {
          console.error(`Error deleting file: ${unlinkErr}`);
        }
      });
      if (metadata.status.code === 1001) {
        reject('No result found');
      } else {
        resolve(metadata);
      }
    }).catch(err => {
      console.error(`Error in ACRCloud identification: ${err}`);
      reject(err);
    });
  });
};

app.post('/identify', (req, res) => {
  const youtubeUrl = req.body.url;
  if (!youtubeUrl) {
    return res.status(400).send({ error: 'No URL provided' });
  }

  downloadAudio(youtubeUrl)
    .then(filePath => recognizeSong(filePath))
    .then(result => {
      res.send({ recognitionResult: result });
    })
    .catch(error => {
      console.error('Error:', error);
      res.status(500).send({ error: error === 'No result found' ? 'Song not found' : 'An error occurred' });
    });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
