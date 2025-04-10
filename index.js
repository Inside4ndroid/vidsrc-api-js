import express from "express";
import { getMovie, getTv } from './src/api.js';
import { getMovieFromTmdb, getTvFromTmdb } from './src/workers/tmdb.js';
import cors from "cors";

const PORT = process.env.PORT;
const app = express();

app.use(cors());

app.get('/', (req, res) => {
    res.status(200).json({
        INTRO: "Welcome to the TMDB Embed API",
        PROVIDERS: "2embed | embedsu | autoembed | vidsrcsu",
        ROUTES: {
            movie: "/movie/{PROVIDER}/{TMDBID}",
            show: "/tv/{PROVIDER}/{TMDBID}?s={SEASON}&e={EPISODE}",
            all_movie_providers: "/movie/{TMDBID}",
            all_show_providers: "/tv/{TMDBID}?s={SEASON}&e={EPISODE}"
        },
        INFORMATION: "This project is for educational purposes only. We do not host any kind of content. We provide only the links to already available content on the internet. We do not host, upload any videos, films or media files. We are not responsible for the accuracy, compliance, copyright, legality, decency, or any other aspect of the content of other linked sites. If you have any legal issues please contact the appropriate media file owners or host sites.",
        SOURCE: "https://github.com/Inside4ndroid/TMDB-Embed-API"
    });
});

app.get('/movie/:tmdbId', async (req, res) => {
    if (isNaN(parseInt(req.params.tmdbId))) {
        res.status(405).json({
            error: "Invalid movie id",
            hint: "Check the documentation again to see how to use this endpoint"
        });
        return;
    }

    const media = await getMovieFromTmdb(req.params.tmdbId);

    if (media instanceof Error) {
        res.status(405).json({ error: media.message });
        return;
    }

    let output = await getMovie(media);

    if (output === null || output instanceof Error) {
        res.status(404).json({
            error: "No sources fond for this movie.",
            hint: "If you know where to find this movie and know programming feel free to join us on GitHub: https://github.com/Inside4ndroid/TMDB-Embed-API to add it."
        });
    } else {
        res.status(200).json(output);
    }
});

app.get('/movie/:provider/:tmdbId', async (req, res) => {
    const allowedProviders = ['2embed', 'autoembed', 'embedsu', 'vidsrcsu'];
    if (!allowedProviders.includes(req.params.provider)) {
        res.status(400).json({
            error: "Invalid provider",
            hint: `Provider must be one of: ${allowedProviders.join(', ')}`
        });
        return;
    }

    if (isNaN(parseInt(req.params.tmdbId))) {
        res.status(400).json({
            error: "Invalid movie id",
            hint: "Check the documentation again to see how to use this endpoint"
        });
        return;
    }

    const media = await getMovieFromTmdb(req.params.tmdbId);

    if (media instanceof Error) {
        res.status(405).json({ error: media.message });
        return;
    }

    let output = await getMovie(media, req.params.provider);

    if (output === null || output instanceof Error) {
        res.status(404).json({
            error: "No sources fond for this movie.",
            hint: "If you know where to find this movie and know programming feel free to join us on GitHub: https://github.com/Inside4ndroid/TMDB-Embed-API to add it."
        });
    } else {
        res.status(200).json(output);
    }
});

app.get('/tv/:tmdbId', async (req, res) => {
    if (!req.params.tmdbId || isNaN(parseInt(req.params.tmdbId)) || !req.query.s || isNaN(parseInt(req.query.s)) || !req.query.e || isNaN(parseInt(req.query.e))) {
        res.status(405).json({
            error: "Invalid show id, season, or episode number",
            hint: "Check the documentation again to see how to use this endpoint"
        });
        return;
    }

    const media = await getTvFromTmdb(req.params.tmdbId, req.query.s, req.query.e);

    if (media instanceof Error) {
        res.status(405).json({ error: media.message });
        return;
    }

    let output = await getTv(media, req.query.s, req.query.e);

    if (output === null || output instanceof Error) {
        res.status(404).json({
            error: "No sources found for this show.",
            hint: "If you know where to find this show and know programming feel free to join us on GitHub: https://github.com/Inside4ndroid/TMDB-Embed-API to add it."
        });
    } else {
        res.status(200).json(output);
    }
});

app.get('/tv/:provider?/:tmdbId', async (req, res) => {
    const allowedProviders = ['2embed', 'autoembed', 'embedsu', 'vidsrcsu'];
    if (!allowedProviders.includes(req.params.provider)) {
        res.status(400).json({
            error: "Invalid provider",
            hint: `Provider must be one of: ${allowedProviders.join(', ')}`
        });
        return;
    }

    if (isNaN(parseInt(req.params.tmdbId))) {
        res.status(400).json({
            error: "Invalid show id",
            hint: "Check the documentation again to see how to use this endpoint",
        });
        return;
    }

    if (!req.query.s || isNaN(parseInt(req.query.s)) || !req.query.e || isNaN(parseInt(req.query.e))) {
        return res.status(400).json({
            error: "Invalid season, or episode number",
            hint: "Check the documentation again to see how to use this endpoint"
        });
    }

    const media = await getTvFromTmdb(req.params.tmdbId, req.query.s, req.query.e);

    if (media instanceof Error) {
        return res.status(405).json({ error: media.message });
    }

    let output = await getTv(media, req.query.s, req.query.e, req.params.provider);

    if (output === null || output instanceof Error) {
        return res.status(404).json({
            error: "No sources found for this show.",
            hint: "If you know where to find this show and know programming feel free to join us on GitHub: https://github.com/Inside4ndroid/TMDB-Embed-API to add it."
        });
    }

    return res.status(200).json(output);
});

app.get('/movie/', (req, res) => {
    res.status(405).json({
        error: "Invalid movie id",
        hint: "Check the documentation again to see how to use this endpoint"
    });
});

app.get('/tv/', (req, res) => {
    res.status(405).json({
        error: "Invalid show id",
        hint: "Check the documentation again to see how to use this endpoint"
    });
});

app.get('*', (req, res) => {
    res.status(404).json({ error: 'Not found', hint: 'Go to /' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});