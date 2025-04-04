import express from "express";
import { getEmbedSu } from "./src/extractors/embedsu.js";
import { getTwoEmbed } from "./src/extractors/2Embed.js";

const port = 3000;

const app = express()

app.get('/', (req, res) => {
    res.status(200).json({
        INTRO: "Welcome to the unofficial vidsrcPro provider",
        ROUTES: {
            movie: "/embedsu|2embed/:movieTMDBid",
            show: "/embedsu|2embed/:showTMDBid?s=seasonNumber&e=episodeNumber",
            all_movie: "/combined/:movieTMDBid",
            all_show: "/combined/:showTMDBid?s=seasonNumber&e=episodeNumber"
        },
        AUTHOR: "This api is developed and created by Inside4ndroid Studios"
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

app.get('/2embed/:tmdbId', async (req, res) => {
    const id = req.params.tmdbId;
    const season = req.query.s;
    const episode = req.query.e;

    try {
        if (season && episode) {
            const vidsrcresponse = await getTwoEmbed(id, season, episode);
            res.status(200).json(vidsrcresponse);
        } else {
            const vidsrcresponse = await getTwoEmbed(id, 0, 0);
            res.status(200).json(vidsrcresponse);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

app.get('/combined/:tmdbId', async (req, res) => {
    const id = req.params.tmdbId;
    const season = req.query.s;
    const episode = req.query.e;

    try {
        let embedSuResponse;
        let twoEmbedResponse;

        if (season && episode) {
            embedSuResponse = await getEmbedSu(id, season, episode);
            twoEmbedResponse = await getTwoEmbed(id, season, episode);
        } else {
            embedSuResponse = await getEmbedSu(id);
            twoEmbedResponse = await getTwoEmbed(id, 0, 0);
        }

        const combinedResponse = {
            embedsu: embedSuResponse,
            twoembed: twoEmbedResponse,
        };

        res.status(200).json(combinedResponse);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

app.listen(port, () => {
    console.log(`Api listening on port http://localhost:${port}`);
});