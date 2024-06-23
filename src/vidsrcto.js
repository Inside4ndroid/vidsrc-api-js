import { load } from "cheerio";
import { decode } from "html-entities";
import randomUserAgent from 'random-useragent';

import { vidsrcBase, vidplayBase } from "./constants.js";

export async function getVidsrctoStreams(sourcesId) {
    const sources = await getVidsrcSources(sourcesId);

    console.log(sources);

    const vidplay = sources.result.find((v) => v.title.toLowerCase() === 'f2cloud');

    if (!vidplay) {
        const data = {
            file: sources
        };
        return { data: data };
    }

    const vidplayLink = await getVidsrcSourceDetails(vidplay.id);

    const key = await encodeId(vidplayLink.split('/e/')[1].split('?')[0]);
    const dataFutoken = await getFutoken(key, vidplayLink);

    const subtitles = await getSubtitles(vidplayLink);

    const response = await (await fetch(`https://vidplay.online/mediainfo/${dataFutoken}?${vidplayLink.split('?')[1]}&autostart=true`, {
        headers: {
            "Origin": generateRandomIp(),
            "Referer": vidplayLink,
            "Host": "vidplay.online",
            "User-Agent": randomUserAgent.getRandom()
        }
    })).json();

    const result = response.result;
    const source = result.sources?.[0]?.file;

    if (!source) {
        const data = {
            file: null,
            sub: subtitles
        };
        return { data: data };
    } else {
        const data = {
        file: source,
        sub: subtitles
    };
    return { data: data };
    }

    

}

export async function getVidsrcSourcesId(tmdbId, seasonNumber, episodeNumber) {
    const type = seasonNumber && episodeNumber ? "tv" : "movie";
    const url = `${vidsrcBase}/embed/${type}/${tmdbId}${type === "tv" ? `/${seasonNumber}/${episodeNumber}` : ''}`
    try {
        const data = await (await fetch(url)).text();

        const doc = load(data);
        const sourcesCode = doc('a[data-id]').attr('data-id');

        return sourcesCode;
    } catch (err) {
        return;
    }
}

async function getVidsrcSources(sourceId) {
    const data = await (await fetch(`${vidsrcBase}/ajax/embed/episode/${sourceId}/sources`)).json();

    return data;
}

async function getVidsrcSourceDetails(sourceId) {
    const data = await (await fetch(`${vidsrcBase}/ajax/embed/source/${sourceId}`)).json();

    const encryptedUrl = data.result.url;
    const decryptedUrl = decryptSourceUrl(encryptedUrl);
    return decodeURIComponent(decryptedUrl);
}

async function getSubtitles(vidplayLink) {
    if (vidplayLink.includes('sub.info=')) {
        const subtitleLink = vidplayLink.split('?sub.info=')[1].split('&')[0];
        const subtitlesFetch = await (await fetch(decodeURIComponent(subtitleLink))).json();

        const subtitles = subtitlesFetch.map(subtitle => ({
            file: subtitle.file,
            lang: subtitle.label
        }));

        return subtitles;
    }
}

function adecode(str) {
    const keyBytes = Buffer.from('WXrUARXb1aDLaZjI', 'utf-8');
    let j = 0;
    const s = Buffer.from(Array(256).fill().map((_, i) => i));

    for (let i = 0; i < 256; i++) {
        j = (j + s[i] + keyBytes[i % keyBytes.length]) & 0xff;
        [s[i], s[j]] = [s[j], s[i]];
    }

    const decoded = Buffer.alloc(str.length);
    let i = 0;
    let k = 0;

    for (let index = 0; index < str.length; index++) {
        i = (i + 1) & 0xff;
        k = (k + s[i]) & 0xff;
        [s[i], s[k]] = [s[k], s[i]];
        const t = (s[i] + s[k]) & 0xff;
        decoded[index] = str[index] ^ s[t];
    }

    return decoded;
}

function decodeBase64UrlSafe(s) {
    const standardizedInput = s.replace('_', '/').replace('-', '+');
    const binaryData = Buffer.from(standardizedInput, 'base64');

    return Buffer.from(binaryData);
}

function decryptSourceUrl(sourceUrl) {
    const encoded = decodeBase64UrlSafe(sourceUrl);
    const decoded = adecode(encoded);

    const decodedText = decoded.toString('utf-8');
    return decode(decodedText);
}

async function encodeId(v_id) {
    const resp = await (await fetch('https://raw.githubusercontent.com/Inside4ndroid/vidkey-js/main/keys.json')).json();
    const [key1, key2] = resp;
    const decoded_id = keyPermutation(key1, v_id).toString('latin1');
    const encoded_result = keyPermutation(key2, decoded_id).toString('latin1');
    const encoded_base64 = btoa(encoded_result);
    return encoded_base64.replace('/', '_');
}

async function getFutoken(key, url) {
    const response = await (await fetch(`${vidplayBase}/futoken`, { headers: { "Referer": `${url}/` } })).text();
    const fuKey = response.match(/var\s+k\s*=\s*'([^']+)'/)[1];
    const fuToken = `${fuKey},${Array.from({ length: key.length }, (_, i) => (fuKey.charCodeAt(i % fuKey.length) + key.charCodeAt(i)).toString()).join(',')}`;
    return fuToken;
}

const generateRandomIp = () => {
    return (Math.floor(Math.random() * 255) + 1) + "." + (Math.floor(Math.random() * 255)) + "." + (Math.floor(Math.random() * 255)) + "." + (Math.floor(Math.random() * 255));
}

function keyPermutation(key, data) {
    var state = Array.from(Array(256).keys());
    var index_1 = 0;
    for (var i = 0; i < 256; i++) {
        index_1 = ((index_1 + state[i]) + key.charCodeAt(i % key.length)) % 256;
        var temp = state[i];
        state[i] = state[index_1];
        state[index_1] = temp;
    }
    var index_1 = 0;
    var index_2 = 0;
    var final_key = '';
    for (var char = 0; char < data.length; char++) {
        index_1 = (index_1 + 1) % 256;
        index_2 = (index_2 + state[index_1]) % 256;
        var temp = state[index_1];
        state[index_1] = state[index_2];
        state[index_2] = temp;
        if (typeof data[char] === 'string') {
            final_key += String.fromCharCode(data[char].charCodeAt(0) ^ state[(state[index_1] + state[index_2]) % 256]);
        } else if (typeof data[char] === 'number') {
            final_key += String.fromCharCode(data[char] ^ state[(state[index_1] + state[index_2]) % 256]);
        }
    }
    return final_key;
}
