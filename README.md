# Unoffical vidsrc API! 👋
## Current Embed Providers:

1. embedsu
2. 2embed

<br>

Hello! I'm Inside4ndroid, a passionate Software Developer.

- 🐛 Bugs will be found and squashed as soon as possible please report any isues.
- 🌱 Currently in a state that works and is recieving updates.

---

<br>

## Sponsorship / Donations

Your sponsorship is vital in helping me achieve this mission. With your support, I can:

Dedicate more time to developing and improving my projects
Cover costs for essential tools, services and premium hosting to run public projects
Provide detailed documentation and support for users
Every contribution, no matter the size, makes a significant impact.

[Sponsor Me!](https://github.com/sponsors/Inside4ndroid)

Thank you for considering supporting my work!

<br>

### USAGE:

This is an api for id's provided at [TMDB](https://www.themoviedb.org/).

you must use the ID from the tmdb url like this :

so 
```
MOVIES:

https://www.themoviedb.org/movie/1034541-terrifier-3?language=en-GB

TV SHOWS:

https://www.themoviedb.org/tv/124364-from?language=en-GB
```
would be 
```
MOVIES:

`/{provider}/1034541`

TVSHOWS :

`/{provider}/124364?s=1&e=1` (s - Season / e - Episode)
```

## Providers

The providers are currently :

```
embedsu
2embed
combined (use this as provider to return results for all providers)
```

## Example Movie
```
https://your-domain/embedsu/916224
```

## Example Show
```
https://your-domain/embedsu/1429?s=1&e=1
```

## Example JSON Response

<details>
  <summary>Click me</summary>
  
```Json
{
  "embedsu": {
    "sources": [
      {
        "provider": "EmbedSu",
        "files": [
          {
            "file": "https://embed.su/api/proxy/viper/mistydawn62.pro/file2/dCjXQHTrXL5VWmkFvGEEIrCyskIr6MZERXLYef0sUKuY12Ey+dX5hLYObC78qdmoop2iV8+MYm5wcOiFtAuZbcsp46BsOa1q5in7CNuEv70H5ZNZ34kEPH5I9FpN3v6qN7WhRBXq0ThSHefHVb94rMFoirhHjC4o2LRkwXoAiTA=/MTA4MA==/aW5kZXgubTN1OA==.m3u8",
            "type": "hls",
            "quality": "1080p",
            "lang": "en"
          },
          {
            "file": "https://embed.su/api/proxy/viper/mistydawn62.pro/file2/dCjXQHTrXL5VWmkFvGEEIrCyskIr6MZERXLYef0sUKuY12Ey+dX5hLYObC78qdmoop2iV8+MYm5wcOiFtAuZbcsp46BsOa1q5in7CNuEv70H5ZNZ34kEPH5I9FpN3v6qN7WhRBXq0ThSHefHVb94rMFoirhHjC4o2LRkwXoAiTA=/NzIw/aW5kZXgubTN1OA==.m3u8",
            "type": "hls",
            "quality": "720p",
            "lang": "en"
          },
          {
            "file": "https://embed.su/api/proxy/viper/mistydawn62.pro/file2/dCjXQHTrXL5VWmkFvGEEIrCyskIr6MZERXLYef0sUKuY12Ey+dX5hLYObC78qdmoop2iV8+MYm5wcOiFtAuZbcsp46BsOa1q5in7CNuEv70H5ZNZ34kEPH5I9FpN3v6qN7WhRBXq0ThSHefHVb94rMFoirhHjC4o2LRkwXoAiTA=/MzYw/aW5kZXgubTN1OA==.m3u8",
            "type": "hls",
            "quality": "360p",
            "lang": "en"
          }
        ],
        "subtitles": [
          {
            "url": "https://cca.megafiles.store/1c/9e/1c9eb9aeb90915a2786400a748c8b6a4/eng-2.vtt",
            "lang": "English"
          },
          {
            "url": "https://cca.megafiles.store/1c/9e/1c9eb9aeb90915a2786400a748c8b6a4/eng-3.vtt",
            "lang": "English"
          },
          {
            "url": "https://cca.megafiles.store/1c/9e/1c9eb9aeb90915a2786400a748c8b6a4/fre-4.vtt",
            "lang": "French"
          },
          {
            "url": "https://cca.megafiles.store/1c/9e/1c9eb9aeb90915a2786400a748c8b6a4/spa-5.vtt",
            "lang": "Spanish"
          }
        ],
        "headers": {
          "Referer": "https://embed.su",
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          "Origin": "https://embed.su"
        }
      }
    ]
  },
  "twoembed": {
    "sources": {
      "sources": [
        {
          "provider": "2Embed/Swish",
          "files": [
            {
              "file": "https://j7fqjm25xt.premilkyway.com/hls2/01/05031/6z843r5do14n_,l,n,h,.urlset/index-f3-v1-a1.m3u8?t=T98eEbm347MS_kxTv3tPxGucVi-ZnV6omagdGNf-ZiA&s=1743805861&e=129600&f=25158304&srv=3FjgDmcnea8S35m&i=0.4&sp=500&p1=3FjgDmcnea8S35m&p2=3FjgDmcnea8S35m&asn=5378",
              "type": "hls",
              "quality": "1080p",
              "lang": "en"
            },
            {
              "file": "https://j7fqjm25xt.premilkyway.com/hls2/01/05031/6z843r5do14n_,l,n,h,.urlset/index-f2-v1-a1.m3u8?t=T98eEbm347MS_kxTv3tPxGucVi-ZnV6omagdGNf-ZiA&s=1743805861&e=129600&f=25158304&srv=3FjgDmcnea8S35m&i=0.4&sp=500&p1=3FjgDmcnea8S35m&p2=3FjgDmcnea8S35m&asn=5378",
              "type": "hls",
              "quality": "720p",
              "lang": "en"
            },
            {
              "file": "https://j7fqjm25xt.premilkyway.com/hls2/01/05031/6z843r5do14n_,l,n,h,.urlset/index-f1-v1-a1.m3u8?t=T98eEbm347MS_kxTv3tPxGucVi-ZnV6omagdGNf-ZiA&s=1743805861&e=129600&f=25158304&srv=3FjgDmcnea8S35m&i=0.4&sp=500&p1=3FjgDmcnea8S35m&p2=3FjgDmcnea8S35m&asn=5378",
              "type": "hls",
              "quality": "480p",
              "lang": "en"
            }
          ],
          "subtitles": [
            {
              "url": "https://3FjgDmcnea8S35m.premilkyway.com/vtt/01/05031/6z843r5do14n_fre.vtt",
              "lang": "French"
            },
            {
              "url": "https://3FjgDmcnea8S35m.premilkyway.com/vtt/01/05031/6z843r5do14n_spa.vtt",
              "lang": "Argentina"
            },
            {
              "url": "https://3FjgDmcnea8S35m.premilkyway.com/vtt/01/05031/6z843r5do14n_eng.vtt",
              "lang": "English"
            }
          ],
          "headers": {
            "Referer": "https://uqloads.xyz",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "Origin": "https://uqloads.xyz"
          }
        }
      ]
    }
  }
}
```
</details>

## Deployment

You can self host by doing the following :

1. `git clone https://github.com/Inside4ndroid/vidsrc-api-js.git`
2. `cd vidsrc-api-js`
3. `npm install`
4. `npm run main`

"This no longer works on vercel due to the source blocking vercel requests but will work on your own server self hosted."

## WARNING

Using this without a proxy may lead to your server ip being banned there are 3 ways to get around this :

1. Use a proxy : [Find One Here](https://github.com/search?q=m3u8+proxy&type=repositories).
2. Get a server with rotating ip addresses or dynamic ip adresses and use the ips at random.
3. use a cloudflare proxy worker.