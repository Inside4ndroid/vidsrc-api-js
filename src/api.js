import { getTwoEmbed } from "./workers/sites/2Embed.js";
import { getAutoembed } from "./workers/sites/AutoEmbed.js";
import { getEmbedSu } from "./workers/sites/Embedsu.js";
import { getVidSrcSu } from "./workers/sites/VidsrcSU.js";

export async function getMovie(media, provider = null) {
    const combinedResponse = [];
    const tmdb_id = media.tmdbId;

    if (provider) {
        try {
            let result;
            switch (provider) {
                case '2embed':
                    result = await getTwoEmbed(tmdb_id);
                    break;
                case 'embedsu':
                    result = await getEmbedSu(tmdb_id);
                    break;
                case 'autoembed':
                    result = await getAutoembed(tmdb_id);
                    break;
                case 'vidsrcsu':
                    result = await getVidSrcSu(tmdb_id);
                    break;
                default:
                    throw new Error(`Unknown provider: ${provider}`);
            }
            if (result) combinedResponse.push(result);
        } catch (e) {
            console.error(`Error fetching from ${provider}:`, e);
        }
        return combinedResponse;
    }

    const providers = [
        { name: '2embed', func: getTwoEmbed },
        { name: 'embedsu', func: getEmbedSu },
        { name: 'autoembed', func: getAutoembed },
        { name: 'vidsrcsu', func: getVidSrcSu }
    ];

    for (const { name, func } of providers) {
        try {
            const result = await func(tmdb_id);
            if (result) combinedResponse.push(result);
        } catch (e) {
            console.error(`Error fetching from ${name}:`, e);
        }
    }

    return combinedResponse;
}

export async function getTv(media, season, episode, provider = null) {
    const combinedResponse = [];
    const tmdb_id = media.tmdbId;

    if (provider) {
        try {
            let result;
            switch (provider) {
                case '2embed':
                    result = await getTwoEmbed(tmdb_id, season, episode);
                    break;
                case 'embedsu':
                    result = await getEmbedSu(tmdb_id, season, episode);
                    break;
                case 'autoembed':
                    result = await getAutoembed(tmdb_id, season, episode);
                    break;
                case 'vidsrcsu':
                    result = await getVidSrcSu(tmdb_id, season, episode);
                    break;
                default:
                    throw new Error(`Unknown provider: ${provider}`);
            }
            if (result) combinedResponse.push(result);
        } catch (e) {
            console.error(`Error fetching from ${provider}:`, e);
        }
        return combinedResponse;
    }

    const providers = [
        { name: '2embed', func: getTwoEmbed },
        { name: 'embedsu', func: getEmbedSu },
        { name: 'autoembed', func: getAutoembed },
        { name: 'vidsrcsu', func: getVidSrcSu }
    ];

    for (const { name, func } of providers) {
        try {
            const result = await func(tmdb_id, season, episode);
            if (result) combinedResponse.push(result);
        } catch (e) {
            console.error(`Error fetching from ${name}:`, e);
        }
    }

    return combinedResponse;
}