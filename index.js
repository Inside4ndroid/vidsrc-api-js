import express from "express";
import { port } from "./src/constants.js";
import { getmovie, getserie } from "./src/vidsrcto.js";


const app = express()

app.get('/', (req, res) => {
    res.status(200).json({
        intro: "Welcome to the unofficial vidsrc provider: check the provider website @ https://vidsrc.to/ ",
        routes: {
            movie: "/vidsrc/:movieTMDBid",
            show: "/vidsrc/:showTMDBid?s=seasonNumber&e=episodeNumber"
        },
        author: "This api is developed and created by AijaZ"
    });
});

app.get('/vidsrc/:tmdbId', async (req, res) => {
    const id = req.params.tmdbId;
    const season = req.query.s;
    const episode = req.query.e;

    if (season && episode) {
        const response = await getserie(id, season, episode);
        if (!response) {
            res.status(404).send({
                status: 404,
                return: "Oops reached rate limit of this api"
            })
        } else {
            res.status(200).json([response]);
        }
    } else {
        const response = await getmovie(id);

        if (!response) {
            res.status(404).send({
                status: 404,
                return: "Oops reached rate limit of this api"
            })
        } else {
            res.status(200).json([response]);
        }
    }

});

app.listen(port, () => {
    console.log(`Example app listening on port http://localhost:${port}`);
});