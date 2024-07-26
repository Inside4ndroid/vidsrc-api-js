import { getKeys } from './getKeys.js';
import { unpack } from 'unpacker';

const keys = await getKeys();

function rc4(key, inp) {
    let e = [];
    e[4] = [];
    e[3] = 0;
    let i = 0;
    e[8] = '';
    for (i = 0; i < 256; i++) {
        e[4][i] = i;
    }
    for (i = 0; i < 256; i++) {
        e[3] = (e[3] + e[4][i] + key.charCodeAt(i % key.length)) % 256;
        e[2] = e[4][i];
        e[4][i] = e[4][e[3]];
        e[4][e[3]] = e[2];
    }
    i = 0;
    e[3] = 0;
    let j = 0;
    for (j = 0; j < inp.length; j++) {
        i = (i + 1) % 256;
        e[3] = (e[3] + e[4][i]) % 256;
        e[2] = e[4][i];
        e[4][i] = e[4][e[3]];
        e[4][e[3]] = e[2];
        e[8] += String.fromCharCode(inp.charCodeAt(j) ^ e[4][(e[4][i] + e[4][e[3]]) % 256]);
    }
    return e[8];
}

function enc(inp) {
    inp = encodeURIComponent(inp);
    const e = rc4(keys[0], inp);
    const out = btoa(e).replace(/\//g, '_').replace(/\+/g, '-');
    return out;
}

function dec(inp) {
    const i = atob(inp.replace(/_/g, '/').replace(/-/g, '+'));
    let e = rc4(keys[3], i);
    e = decodeURIComponent(e);
    return e;
}

async function episode(data_id) {
    let url = `https://vidsrc.to/ajax/embed/episode/${data_id}/sources?token=${encodeURIComponent(enc(data_id))}`;
    let resp = await fetch(url);
    resp = await resp.json();

    let filemoon_id = resp.result[1].id;
    url = `https://vidsrc.to/ajax/embed/source/${filemoon_id}?token=${encodeURIComponent(enc(filemoon_id))}`;
    resp = await fetch(url);
    resp = await resp.json();

    let filemoon_url = resp.result.url;
    let filemoon_url_dec = dec(filemoon_url);
    const parsedUrl = new URL(filemoon_url_dec);

    const SRC_URL = parsedUrl.origin + parsedUrl.pathname;
    const queryParams = parsedUrl.search.substring(1);
    const params = new URLSearchParams(queryParams);
    const subtitleLink = params.get('sub.info');

    console.log(SRC_URL);
    console.log(subtitleLink);

    const data = await fetch(SRC_URL);
    const dataText = await data.text();
    const match = /eval\(function\(p,a,c,k,e,d\).+\)\)\)/g.exec(dataText);

    if (match) {
        const packed = match[0];
        const unpacked = unpack(packed);
        const hlsMatch = /sources:\[\s*{\s*file:"([^"]*)"/g.exec(unpacked);
        const subs = await getSubtitles(subtitleLink);
        const sources = hlsMatch[1];

        if (!sources) {
            const data = {
                source: null,
                subtitles: null
            };
            return { filemoon: data };
        } else {
            const data = {
                source: sources,
                subtitles: subs
            };
            return { filemoon: data };
        }
    } else {
        console.error('Packed data not found');
    }
}

async function getSubtitles(subtitleLink) {
    if (subtitleLink) {
        const subtitlesFetch = await fetch(subtitleLink);
        const subtitles = await subtitlesFetch.json();

        return subtitles.map(subtitle => ({
            file: subtitle.file,
            lang: subtitle.label,
        }));
    } else {
        console.error('Subtitle link not found in params');
        return null;
    }
}

export async function getfmovie(id) {
    let resp = await fetch(`https://vidsrc.to/embed/movie/${id}`);
    let respText = await resp.text();
    const match = /data-id="(.*?)"/g.exec(respText);

    if (match) {
        let data_id = match[1];
        return episode(data_id);
    } else {
        console.error('Data ID not found');
    }
}

export async function getfserie(id, s, e) {
    let resp = await (await fetch(`https://vidsrc.to/embed/tv/${id}/${s}/${e}`)).text();
    let match = (/data-id="(.*?)"/g).exec(resp)[1];
    if (match) {
        let data_id = match[1];
        return episode(data_id);
    } else {
        console.error('Data ID not found');
    }
  }
