import fetch from "node-fetch";

const DOMAIN = "https://autoembed.cc/";

const headers = {
    'User-Agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    'Referer': DOMAIN,
    'Origin': DOMAIN,
};

function createErrorObject(errorMessage) {
    return {
        provider: "AutoEmbed",
        ERROR: [{
            error: `ERROR`,
            what_happened: errorMessage,
            report_issue: 'https://github.com/Inside4ndroid/vidsrc-api-js/issues'
        }]
    };
};

export async function getAutoembed(tmdb_id, s, e) {
    const providerName = "AutoEmbed";
    const url = s && e
        ? `https://tom.autoembed.cc/api/getVideoSource?type=tv&id=${tmdb_id}/${s}/${e}`
        : `https://tom.autoembed.cc/api/getVideoSource?type=movie&id=${tmdb_id}`;

    try {
        const response = await fetch(url, {
            headers: {
                'Referer': DOMAIN,
                'User-Agent': headers['User-Agent']
            }
        });

        if (!response.ok) {
            return createErrorObject(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
            return createErrorObject(data.error || "No stream with ID found");
        }

        if (!data.videoSource) {
            return createErrorObject("No video source found in response");
        }

        const m3u8Url = data.videoSource;

        try {
            const m3u8Response = await fetch(m3u8Url);
            if (!m3u8Response.ok) {
                return createErrorObject(`Failed to fetch m3u8: HTTP ${m3u8Response.status}`);
            }

            const m3u8Content = await m3u8Response.text();
            const sources = parseM3U8(m3u8Content);

            if (!sources || sources.length === 0) {
                return createErrorObject("No valid streams found in m3u8 file");
            }

            const formattedSources = sources.map(source => ({
                file: source.url,
                type: "hls",
                quality: source.quality || 'unknown',
                lang: 'en'
            }));

            const subs = data.subtitles ? mapSubtitles(data.subtitles) : [];

            return {
                source: {
                    provider: providerName,
                    files: formattedSources,
                    subtitles: subs,
                    headers: {
                        "Referer": DOMAIN,
                        "User-Agent": headers['User-Agent'],
                        "Origin": DOMAIN
                    }
                }
            };

        } catch (m3u8Error) {
            return createErrorObject(`Failed to process m3u8: ${m3u8Error.message}`);
        }

    } catch (error) {
        return createErrorObject(`Network/API error: ${error.message}`);
    }
}

function parseM3U8(m3u8Content) {
    try {
        const lines = m3u8Content.split('\n');
        const sources = [];
        let currentSource = {};

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            if (line.startsWith('#EXT-X-STREAM-INF:')) {
                const resolutionMatch = line.match(/RESOLUTION=(\d+x\d+)/);
                if (resolutionMatch) {
                    const resolution = resolutionMatch[1];
                    const quality = resolution.split('x')[1];
                    currentSource.quality = quality + 'p';
                }
            } else if (line.startsWith('http')) {
                currentSource.url = line;
                sources.push({ ...currentSource });
                currentSource = {};
            }
        }

        return sources;
    } catch (error) {
        console.error('Error parsing m3u8:', error);
        return [];
    }
}

function mapSubtitles(subtitles) {
    try {
        return subtitles.map(subtitle => {
            const lang = (subtitle.label || 'unknown').split(' ')[0].toLowerCase();
            const fileUrl = subtitle.file || '';
            const fileExtension = fileUrl.split('.').pop().toLowerCase();
            const type = fileExtension === 'vtt' ? 'vtt' : 'srt';

            return {
                url: fileUrl,
                lang: lang,
                type: type
            };
        }).filter(sub => sub.url);
    } catch (error) {
        console.error('Error mapping subtitles:', error);
        return [];
    }
}