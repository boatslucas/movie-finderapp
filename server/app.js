require('dotenv').config();


const express = require('express');
const morgan = require('morgan');
const axios = require('axios');

const app = express();

const cache = {};

console.log('Loaded API Key:', process.env.OMDB_API_KEY);

app.use(morgan('dev'));

app.get('/', async (req, res) => {
    const title = req.query.title || req.query.T || req.query.t;
    const id = req.query.i || req.query.I;
    const apiKey = process.env.OMDB_API_KEY;

    if (!title && !id) {
        return res.status(400).json({ error: 'No title or ID provided' });
    }

    const cacheKey = title ? `title:${title}` : `id:${id}`;
    if (cache[cacheKey]) {
        console.log('Cache hit:', cacheKey);
        return res.json(cache[cacheKey]);
    }

    const url = title
        ? `https://www.omdbapi.com/?apikey=${apiKey}&t=${title}`
        : `https://www.omdbapi.com/?apikey=${apiKey}&i=${id}`;

    try {
        const response = await axios.get(url);
        cache[cacheKey] = response.data; 
        res.json(response.data);
    } catch (error) {
        console.error('Axios error:', error.message);
        res.status(500).json({ error: 'Error fetching data from OMDb API' });
    }
});

module.exports = app;
