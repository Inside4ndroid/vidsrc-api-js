# 🍿🎥✮⋆˙ TMDB Embed API! 🍿🎥✮⋆˙

Hello! I'm Inside4ndroid, a passionate Software Developer.

- 🐛 Bugs will be found and squashed as soon as possible please report any isues.
- 🌱 Currently in a state that works and is recieving updates.

---

## ℹ️ Current Embed Providers ℹ️

1. embedsu
2. 2embed
3. autoembed
4. vidsrcsu

## 🤝 Sponsorship / Donations 🤝

Your sponsorship is vital in helping me achieve this mission. With your support, I can:

Dedicate more time to developing and improving my projects
Cover costs for essential tools, services and premium hosting to run public projects
Provide detailed documentation and support for users
Every contribution, no matter the size, makes a significant impact.

[Sponsor Me!](https://github.com/sponsors/Inside4ndroid)

Thank you for considering supporting my work!

### ✨ Usage ✨

This is an api for id's provided at [TMDB](https://www.themoviedb.org/).

you must use the ID from the tmdb url like this :

```
🎬 MOVIES:

single provider - localhost:PORT/movie/{PROVIDER}/{TMDBID}
all providers - localhost:PORT/movie/{TMDBID}

📺 TV SHOWS:

single provider - localhost:PORT/tv/{PROVIDER}/{TMDBID}?s={SEASON}&e={EPISODE}
all providers - localhost:PORT/tv/{TMDBID}?s={SEASON}&e={EPISODE}
```

## 📋 Providers 📋

The providers are currently :

```
embedsu
2embed
autoembed
vidsrcsu
```

## 🚀 Deployment 🚀

You can self host by doing the following :

1. `git clone https://github.com/Inside4ndroid/TMDB-Embed-API.git`
2. `cd TMDB-Embed-API`
3. `rename .env_example to .env`
4. `edit .env and insert your preferred port and your tmdb api key`  
5. `npm install`
6. `npm run start`

## Contribute

If you know how to code then please dont hesitate to conribute to this project by forking and making pull requests with your new providers or edits etc.

## <span style="color:red">⚠️ WARNING ⚠️</span>

Using this without a proxy may lead to your server ip being banned there are 3 ways to get around this :

1. Use a proxy : [Find One Here](https://github.com/search?q=m3u8+proxy&type=repositories).
2. Get a server with rotating ip addresses or dynamic ip adresses and use the ips at random.
3. use a cloudflare proxy worker.

Some providers need cloudflare resolving and i am working on a method for this. but using correct headers etc in your network request when playing the media urls should suffice for now.