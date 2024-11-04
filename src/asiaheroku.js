export async function getasiaheroku(tmdb_id, s, e) {
    const DOMAIN = "https://asia.heroku.uk/";
    const headers = {
        'user-agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        'Referer': `${DOMAIN}`,
        'Origin': `${DOMAIN}`,
    };

    try {
        let urlSearch = '';

        if(s && e){
            urlSearch = `${DOMAIN}/embed/tv/${tmdb_id}/${s}/${e}`;
          } else {
            urlSearch = `${DOMAIN}/embed/movie/${tmdb_id}`;
          }

          const htmlSearch = await fetch(urlSearch, {
            method: 'GET',
            headers: headers,
          });
          const textSearch = await htmlSearch.text();
          const sourceMatch = textSearch.match(/<source.?src="(.*?)".?type/);
          const source = sourceMatch ? sourceMatch[1] : "";
          const results = {
            headers: {
              "Referer": `${DOMAIN}`,
              "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
              "Accept": "*/*"
            },
            sources: source,
            subtitles: 'unsupported'
          };
    
          return results;
    } catch (e) {
        const results = {
            headers: {},
            sources: '',
            subtitles: ''
          };
          return results;
    }
}