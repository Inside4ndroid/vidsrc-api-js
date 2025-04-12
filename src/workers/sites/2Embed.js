import fetch from "node-fetch";
import JsUnpacker from '../utils/jsunpack.js';
import * as cheerio from 'cheerio';

const DOMAIN = "https://www.2embed.cc";
const PLAYER_URL = "https://uqloads.xyz";

let subtitles = [];
let sources = [];

const headers = {
    'User-Agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    'Referer': DOMAIN,
    'Origin': DOMAIN,
};

function parseQuality(qualityString) {
    if (!qualityString) return 0;
    const q = qualityString.toUpperCase();
    if (q === '4K') return 4000;
    if (q.includes('1080P')) return 1080;
    if (q.includes('720P')) return 720;
    const numMatch = q.match(/(\d+)/);
    return numMatch ? parseInt(numMatch[1], 10) : 0;
}

function createErrorObject(errorMessage) {
    return {
        provider: "2Embed",
        ERROR: [{
            error: `ERROR`,
            what_happened: errorMessage,
            report_issue: 'https://github.com/Inside4ndroid/TMDB-Embed-API/issues'
        }]
    };
}

export async function getTwoEmbed(tmdb_id, s, e) {
    subtitles = [];
    sources = [];

    const tmdbId = tmdb_id;
    const initialReferer = s && e ? `${DOMAIN}/embedtv/${tmdbId}&s=${s}&e=${e}` : `${DOMAIN}/embed/${tmdbId}`;
    const url = initialReferer;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                Referer: url,
                "Content-Type": "application/x-www-form-urlencoded",
                "User-Agent": headers['User-Agent'],
            },
            body: "pls=pls"
        });

        if (!response.ok) {
            return { sources: createErrorObject(`HTTP error fetching initial URL! Status: ${response.status}`) };
        }

        const data = await response.text();
        let extractedValue = null;
        let isSwishId = false;

        let match = data.match(/swish\?id=(?<id>[\w\d]+)/);

        if (match && match.groups && match.groups.id) {
            extractedValue = match.groups.id;
            isSwishId = true;
        } else {
            match = data.match(/'(.*?player4u.*?)'/);
            if (match && match[1]) {
                extractedValue = match[1];
            } else {
                return { sources: createErrorObject("No relevant swish ID or player4u URL found in initial data.") };
            }
        }

        if (extractedValue) {
            if (isSwishId) {
                const streamUrl = await resolve(`${PLAYER_URL}/e/${extractedValue}`, DOMAIN);
                if (!streamUrl) {
                    return { sources: createErrorObject(`Could not resolve stream URL for swish ID: ${extractedValue}`) };
                }

                const parsedSources = await parseM3U8(streamUrl, PLAYER_URL);

                if (parsedSources.length > 0) {
                    return {
                        source: {
                            provider: "2Embed/Swish",
                            files: parsedSources,
                            subtitles: subtitles,
                            headers: {
                                "Referer": PLAYER_URL,
                                "User-Agent": headers['User-Agent'],
                                "Origin": PLAYER_URL
                            }
                        }
                    };
                } else {
                    return { sources: createErrorObject("No valid sources found in M3U8 for swish ID") };
                }
            } else {
                const listPageResponse = await fetch(extractedValue, {
                    headers: {
                        Referer: url,
                        "User-Agent": headers['User-Agent']
                    }
                });

                if (!listPageResponse.ok) {
                    return { sources: createErrorObject(`Failed to fetch player4u list page (${extractedValue}): ${listPageResponse.status}`) };
                }

                const listPageHtml = await listPageResponse.text();

                const $ = cheerio.load(listPageHtml);
                let highestQuality = -1;
                let bestPartialUrl = null;

                $('li.slide-toggle a.playbtnx').each((index, element) => {
                    const linkText = $(element).text();
                    const onclickAttr = $(element).attr('onclick');

                    if (!linkText || !onclickAttr) return;

                    const qualityMatch = linkText.match(/\s*(\d+p|4K)\s*/i);
                    const qualityString = qualityMatch ? qualityMatch[1].toUpperCase() : null;

                    const urlMatch = onclickAttr.match(/go\('([^']+)'\)/);
                    const partialUrl = urlMatch ? urlMatch[1] : null;

                    if (!qualityString || !partialUrl) return;

                    const qualityValue = parseQuality(qualityString);

                    if (qualityValue > highestQuality) {
                        highestQuality = qualityValue;
                        bestPartialUrl = partialUrl;
                    }
                });

                if (bestPartialUrl) {
                    const idMatch = bestPartialUrl.match(/\?id=([\w\d]+)/);
                    if (idMatch && idMatch[1]) {
                        const player4uId = idMatch[1];
                        const resolveUrl = `${PLAYER_URL}/e/${player4uId}`;

                        const streamUrl = await resolve(resolveUrl, extractedValue);
                        if (!streamUrl) {
                            return { sources: createErrorObject(`Could not resolve stream URL for player4u ID: ${player4uId}`) };
                        }

                        const parsedSources = await parseM3U8(streamUrl, PLAYER_URL);

                        if (parsedSources.length > 0) {
                            return {
                                source: {
                                    provider: "2Embed/Player4u",
                                    files: parsedSources,
                                    subtitles: subtitles,
                                    headers: {
                                        "Referer": PLAYER_URL,
                                        "User-Agent": headers['User-Agent'],
                                        "Origin": PLAYER_URL
                                    }
                                }
                            };
                        } else {
                            return { sources: createErrorObject("No valid sources found in M3U8 for player4u ID") };
                        }
                    } else {
                        return { sources: createErrorObject("Could not extract player4u ID from best quality URL") };
                    }
                } else {
                    return { sources: createErrorObject("No valid quality options found on player4u page") };
                }
            }
        }
        return { sources: createErrorObject("No sources found after processing") };

    } catch (error) {
        return { sources: createErrorObject(`Unexpected error: ${error.message}`) };
    }
}

async function resolve(url, referer) {
    try {
        const response = await fetch(url, {
            headers: {
                Referer: referer,
                "User-Agent": headers['User-Agent']
            }
        });

        if (!response.ok) {
            console.error(`Resolve failed for ${url}: Status ${response.status}`);
            return null;
        }

        const data = await response.text();
        const packedDataRegex = /eval\(function(.*?)split.*\)\)\)/s;
        const packedDataMatch = data.match(packedDataRegex);

        if (packedDataMatch) {
            const packedJS = packedDataMatch[0];
            const unpacker = new JsUnpacker(packedJS);

            if (unpacker.detect()) {
                const unpackedJS = unpacker.unpack();
                if (!unpackedJS) {
                    console.error("JsUnpacker failed to unpack");
                    return null;
                }

                await parseSubs(unpackedJS);

                const docheck = unpackedJS.includes("\"hls2\":\"https");

                if (docheck) {
                    const fileRegex = /links=.*hls2\":\"(.*?)\"};/;

                    const matchUri = unpackedJS.match(fileRegex);

                    if (matchUri && matchUri[1]) {
                        return matchUri[1];
                    } else {
                        console.error("Could not find file URL in unpacked JS");
                        return null;
                    }
                } else {
                    const fileRegex = /sources\s*:\s*\[\s*\{\s*file\s*:\s*"([^"]+)"/;

                    const matchUri = unpackedJS.match(fileRegex);

                    if (matchUri && matchUri[1]) {
                        return matchUri[1];
                    } else {
                        console.error("Could not find file URL in unpacked JS");
                        return null;
                    }
                }


            } else {
                console.error("JsUnpacker could not detect packed data in resolve response");
                return null;
            }
        } else {
            console.error("No packed JS data found in resolve response for:", url);
            if (url.includes('.m3u8')) return url;
            return null;
        }
    } catch (error) {
        console.error(`Error during resolve for ${url}:`, error);
        return null;
    }
}

async function parseM3U8(m3u8Url, referer) {
    const parsedSources = [];
    try {
        const response = await fetch(m3u8Url, {
            headers: {
                "User-Agent": headers['User-Agent'],
                "Referer": referer
            }
        });

        if (!response.ok) {
            console.error(`Failed to fetch M3U8 ${m3u8Url}: Status ${response.status}`);
            return [];
        }

        const m3u8Content = await response.text();
        const lines = m3u8Content.split('\n');
        let currentQuality = null;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            if (line.startsWith('#EXT-X-STREAM-INF:')) {
                currentQuality = null;
                const resolutionMatch = line.match(/RESOLUTION=\d+x(\d+)/);
                if (resolutionMatch && resolutionMatch[1]) {
                    currentQuality = resolutionMatch[1] + "p";
                } else {
                    const bwMatch = line.match(/BANDWIDTH=(\d+)/);
                    if (bwMatch) {
                        currentQuality = `bw${bwMatch[1]}`;
                    }
                }
            } else if (currentQuality && (line.startsWith('http') || (line.includes('.m3u8') && !line.startsWith('#')))) {
                let resolvedUrl = line;
                if (!line.startsWith('http')) {
                    const baseUrl = new URL(m3u8Url);
                    resolvedUrl = new URL(line, baseUrl.origin + baseUrl.pathname.substring(0, baseUrl.pathname.lastIndexOf('/') + 1)).href;
                }

                parsedSources.push({
                    file: resolvedUrl,
                    type: 'hls',
                    quality: currentQuality,
                    lang: 'en'
                });
                currentQuality = null;
            }
        }
        parsedSources.sort((a, b) => parseQuality(b.quality) - parseQuality(a.quality));

        return parsedSources;
    } catch (error) {
        console.error(`Error parsing M3U8 ${m3u8Url}:`, error);
        return [];
    }
}

async function parseSubs(scriptstring) {
    if (typeof subtitles === 'undefined') {
        console.error("Subtitles array is not accessible in parseSubs");
        return;
    }

    try {
        const linksMatch = scriptstring.match(/var links\s*=\s*({[^;]*});/);
        if (!linksMatch) {
            console.error("Could not find links object in script");
            return;
        }

        let linksStr = linksMatch[1]
            .replace(/'/g, '"')
            .replace(/([{,]\s*)([a-zA-Z0-9_$]+)(\s*:)/g, '$1"$2"$3');

        const links = JSON.parse(linksStr);
        const videoUrl = links.hls2;

        const setupMatch = scriptstring.match(/jwplayer\(["']vplayer["']\)\.setup\((\{[\s\S]*?\})\);[\s\S]*?$/);
        if (!setupMatch || !setupMatch[1]) {
            console.error("Could not find JWPlayer setup configuration");
            return;
        }

        let setupStr = setupMatch[1];

        setupStr = setupStr.replace(/links\.hls4\s*\|\|\s*links\.hls2/g, `"${videoUrl}"`);

        setupStr = setupStr
            .replace(/\\'/g, "'")
            .replace(/([{,]\s*)([a-zA-Z0-9_$]+)(\s*:)/g, '$1"$2"$3')
            .replace(/'/g, '"')
            .replace(/,\s*([}\]])/g, '$1')
            .replace(/"true"/g, 'true')
            .replace(/"false"/g, 'false')
            .replace(/"null"/g, 'null');

        let setupConfig;
        try {
            setupConfig = JSON.parse(setupStr);
        } catch (err) {
            console.error("JSON parse error:", err, "in string:", setupStr);
            return;
        }

        if (!setupConfig.tracks) {
            return;
        }

        const subtitleTracks = (setupConfig.tracks || []).filter(track =>
            track && (track.kind === "captions" || track.kind === "subtitles") && track.file
        ).map(track => ({
            url: track.file,
            lang: track.label || track.kind
        }));

        subtitleTracks.forEach(newSub => {
            if (!subtitles.some(existingSub => existingSub.url === newSub.url && existingSub.lang === newSub.lang)) {
                subtitles.push(newSub);
            }
        });

    } catch (error) {
        console.error("Error during subtitle parsing:", error);
    }
}