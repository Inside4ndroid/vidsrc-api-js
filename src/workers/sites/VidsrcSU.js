import fetch from 'node-fetch';

const DOMAIN = "https://vidsrc.su/";

const headers = {
    'User-Agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    'Referer': DOMAIN,
    'Origin': DOMAIN,
};

function createErrorObject(errorMessage) {
    return {
        provider: "EmbedSU",
        ERROR: [{
            error: `ERROR`,
            what_happened: errorMessage,
            report_issue: 'https://github.com/Inside4ndroid/TMDB-Embed-API/issues'
        }]
    };
};

export async function getVidSrcSu(tmdb_id, s, e) {

    const embedUrl = s && e ? `https://vidsrc.su/embed/tv/${tmdb_id}/${s}/${e}` : `https://vidsrc.su/embed/movie/${tmdb_id}`;

    try {
        const response = await fetch(embedUrl, { headers });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const html = await response.text();

        let subtitles = [];

        const servers = [...html.matchAll(/label: 'Server (3|4|5|7|8|9|10|12|13|15|17|18|19)', url: '(https.*)'/g)].map(match => ({
            file: match[2],
            type: "hls",
            lang: "en"
        }));

        const subtitlesMatch = html.match(/const subtitles = \[(.*)\];/g);
        if (subtitlesMatch && subtitlesMatch[0]) {
            try {
                subtitles = JSON.parse(subtitlesMatch[0].replace('const subtitles = ', '').replaceAll(';', ''));
                subtitles.shift();
                subtitles = subtitles.map(subtitle => ({
                    url: subtitle.url,
                    lang: subtitle.language,
                    type: subtitle.format
                }));
            } catch (parseError) {
                console.error("Error parsing subtitles:", parseError);
                subtitles = [];
            }
        }

        try {
            servers.forEach(server => {
                // smth
            });
        } catch (error) {
            return createErrorObject("No valid video streams found after parsing all servers");
        }

        return {
            source: {
                provider: "VidsrcSU",
                files: servers,
                subtitles: subtitles,
                headers: {
                    "Referer": DOMAIN,
                    "User-Agent": headers['User-Agent'],
                    "Origin": DOMAIN
                }
            }
        };
    } catch (error) {
        return createErrorObject(`Unexpected error: ${error.message}`);
    }
}