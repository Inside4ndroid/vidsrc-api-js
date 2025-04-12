import fetch from 'node-fetch';

function createErrorObject(errorMessage) {
  return {
      provider: "EmbedSU",
      ERROR: [{
          error: `ERROR`,
          what_happened: errorMessage,
          report_issue: 'https://github.com/Inside4ndroid/TMDB-Embed-API/issues'
      }]
  };
}

export async function getEmbedSu(tmdb_id, s, e) {
  const DOMAIN = "https://embed.su";
  const headers = {
    'User-Agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    'Referer': DOMAIN,
    'Origin': DOMAIN,
  };

  try {
    const urlSearch = s && e ? `${DOMAIN}/embed/tv/${tmdb_id}/${s}/${e}` : `${DOMAIN}/embed/movie/${tmdb_id}`;
    const htmlSearch = await fetch(urlSearch, { method: 'GET', headers });

    if (!htmlSearch.ok) {
      return { sources: [createErrorObject(`Failed to fetch initial page: HTTP ${htmlSearch.status}`)] };
    }

    const textSearch = await htmlSearch.text();
    const hashEncodeMatch = textSearch.match(/JSON\.parse\(atob\(\`([^\`]+)/i);
    const hashEncode = hashEncodeMatch ? hashEncodeMatch[1] : "";

    if (!hashEncode) {
      return { sources: [createErrorObject("No encoded hash found in initial page")] };
    }

    let hashDecode;
    try {
      hashDecode = JSON.parse(await stringAtob(hashEncode));
    } catch (e) {
      return { sources: [createErrorObject(`Failed to decode initial hash: ${e.message}`)] };
    }

    const mEncrypt = hashDecode.hash;
    if (!mEncrypt) {
      return { sources: [createErrorObject("No encrypted hash found in decoded data")] };
    }

    let firstDecode;
    try {
      firstDecode = (await stringAtob(mEncrypt)).split(".").map(item => item.split("").reverse().join(""));
    } catch (e) {
      return { sources: [createErrorObject(`Failed to decode first layer: ${e.message}`)] };
    }

    let secondDecode;
    try {
      secondDecode = JSON.parse(await stringAtob(firstDecode.join("").split("").reverse().join("")));
    } catch (e) {
      return { sources: [createErrorObject(`Failed to decode second layer: ${e.message}`)] };
    }

    if (!secondDecode || secondDecode.length === 0) {
      return { sources: [createErrorObject("No valid sources found after decoding")] };
    }

    const sources = [];
    const subtitles = [];

    for (const item of secondDecode) {
      try {
        const urlDirect = `${DOMAIN}/api/e/${item.hash}`;
        const dataDirect = await requestGet(urlDirect, {
          "Referer": DOMAIN,
          "User-Agent": headers['User-Agent'],
          "Origin": DOMAIN
        });

        if (!dataDirect || !dataDirect.source) {
          console.warn(`No source found for hash ${item.hash}`);
          continue;
        }

        const tracks = (dataDirect.subtitles || []).map(sub => ({
          url: sub.file,
          lang: sub.label ? sub.label.split('-')[0].trim() : 'en'
        })).filter(track => track.url);

        const requestDirectSize = await fetch(dataDirect.source, { headers, method: "GET" });
        if (!requestDirectSize.ok) {
          console.warn(`Failed to fetch source ${dataDirect.source}: HTTP ${requestDirectSize.status}`);
          continue;
        }

        const parseRequest = await requestDirectSize.text();
        const patternSize = parseRequest.split('\n').filter(item => item.includes('/proxy/'));

        const directQuality = patternSize.map(patternItem => {
          try {
            const sizeQuality = getSizeQuality(patternItem);
            let dURL = `${DOMAIN}${patternItem}`;
            dURL = dURL.replace(".png", ".m3u8");
            return { file: dURL, type: 'hls', quality: `${sizeQuality}p`, lang: 'en' };
          } catch (e) {
            console.warn(`Failed to process quality for pattern: ${patternItem}`, e);
            return null;
          }
        }).filter(item => item !== null);

        if (!directQuality.length) {
          console.warn(`No valid qualities found for source ${dataDirect.source}`);
          continue;
        }

        return {
            source: {
                provider: "EmbedSu",
                files: directQuality,
                subtitles: tracks,
                headers: {
                    "Referer": DOMAIN,
                    "User-Agent": headers['User-Agent'],
                    "Origin": DOMAIN
                }
            }
        };
      } catch (e) {
        console.error(`Error processing item ${item.hash}:`, e);
        // Continue to next item instead of failing entire request
      }
    }

    if (sources.length === 0) {
      return { sources: [createErrorObject("No valid sources found after processing all items")] };
    }

    return { sources };
  } catch (e) {
    return { sources: [createErrorObject(`Unexpected error: ${e.message}`)] };
  }
}

function getSizeQuality(url) {
  try {
    const parts = url.split('/');
    const base64Part = parts[parts.length - 2];
    const decodedPart = atob(base64Part);
    return Number(decodedPart) || 1080;
  } catch (e) {
    console.warn(`Failed to get size quality for URL ${url}:`, e);
    return 720; // Default quality if parsing fails
  }
}

async function stringAtob(input) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let str = input.replace(/=+$/, '');
  let output = '';

  if (str.length % 4 === 1) {
    throw new Error("'atob' failed: The string to be decoded is not correctly encoded.");
  }

  for (let bc = 0, bs = 0, buffer, i = 0; buffer = str.charAt(i++); ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer, bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0) {
    buffer = chars.indexOf(buffer);
  }

  return output;
}

async function requestGet(url, headers = {}) {
  try {
    const response = await fetch(url, { method: 'GET', headers });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Request failed for ${url}:`, error);
    return null;
  }
}