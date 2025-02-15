import express from "express";
import { getEmbedSu } from "./src/embedsu.js";

const port = 3000;

const app = express()

app.get('/', (req, res) => {
    res.status(200).json({
        intro: "Welcome to the unofficial vidsrcPro provider",
        routes: {
            movie: "/embedsu/:movieTMDBid",
            show: "/embedsu/:showTMDBid?s=seasonNumber&e=episodeNumber"
        },
        author: "This api is developed and created by Inside4ndroid Studios"
    });
});

app.get('/embedsu/:tmdbId', async (req, res) => {
    const id = req.params.tmdbId;
    const season = req.query.s;
    const episode = req.query.e;

    try {
        if (season && episode) {
            const vidsrcresponse = await getEmbedSu(id, season, episode);
            res.status(200).json(vidsrcresponse);
        } else {
            const vidsrcresponse = await getEmbedSu(id);
            res.status(200).json(vidsrcresponse);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port http://localhost:${port}`);
});