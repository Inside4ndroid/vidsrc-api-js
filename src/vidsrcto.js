import { getKeys } from './getKeys.js';

const keys = await getKeys();

function rc4(key, inp) {
  let e = [];
  e[4] = [];
  e[3] = 0;
  let i = 0;
  e[8] = "";
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
  const out = btoa(e).replace(/\//g, "_").replace(/\+/g, '-');
  return out;
}

function embed_enc(inp) {
  inp = encodeURIComponent(inp);
  const e = rc4(keys[1], inp);
  const out = btoa(e).replace(/\//g, "_").replace(/\+/g, '-');
  return out;
}

function h_enc(inp) {
  inp = encodeURIComponent(inp);
  const e = rc4(keys[2], inp);
  const out = btoa(e).replace(/\//g, "_").replace(/\+/g, '-');
  return out;
}

function dec(inp) {
  const i = atob((inp).replace(/_/g, "/").replace(/-/g, "+"));
  let e = rc4(keys[3], i);
  e = decodeURIComponent(e);
  return e;
}

function embed_dec(inp) {
  const i = atob((inp).replace(/_/g, "/").replace(/-/g, "+"));
  let e = rc4(keys[4], i);
  e = decodeURIComponent(e);
  return e;
}

async function episode(data_id) {
  let url = `https://vidsrc.to/ajax/embed/episode/${data_id}/sources?token=${encodeURIComponent(enc(data_id))}`;
  let resp = await (await fetch(url)).json();

  console.log(resp);

  let f2cloud_id = resp['result'][0]['id'];
  url = `https://vidsrc.to/ajax/embed/source/${f2cloud_id}?token=${encodeURIComponent(enc(f2cloud_id))}`;
  resp = await (await fetch(url)).json();

  console.log(resp);

  let f2cloud_url = resp['result']['url'];
  let f2cloud_url_dec = dec(f2cloud_url);

  console.log(f2cloud_url_dec);

  const subtitles = await getSubtitles(f2cloud_url_dec);

  url = new URL(f2cloud_url_dec);
  let embed_id = url.pathname.split("/")[2];
  let h = h_enc(embed_id);
  let mediainfo_url = `https://vid2v11.site/mediainfo/${embed_enc(embed_id)}${url.search}&ads=0&h=${encodeURIComponent(h)}`;
  resp = await (await fetch(mediainfo_url)).json();

  console.log(resp);

  let playlist = embed_dec(resp['result']);
  if (typeof playlist === 'string') {
    playlist = JSON.parse(playlist);
  }
  
  const source = playlist.sources?.[0]?.file;

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

export async function getmovie(id) {
  let resp = await (await fetch(`https://vidsrc.to/embed/movie/${id}`)).text();
  let data_id = (/data-id="(.*?)"/g).exec(resp)[1];
  return episode(data_id);
}

export async function getserie(id, s, e) {
  let resp = await (await fetch(`https://vidsrc.to/embed/tv/${id}/${s}/${e}`)).text();
  let data_id = (/data-id="(.*?)"/g).exec(resp)[1];
  return episode(data_id);
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