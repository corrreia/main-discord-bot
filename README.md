<!-- code block with config.json -->

`configs/config.json`

```json
{
	"token": "token",
	"log_channel": "611610044387033109",
	"guild_id": "435388803134390272",
	"new_role": "611270390211411971",
	"avaliable_roles": [
		"602249481492103199",
		"440210657540046859",
		"440212114716491787",
		"611270390211411971"
	]
}
```

`docker-compose.yml`

```yml
version: "3.8"

services:
    main-discord-bot:
        image: ghcr.io/corrreia/main-discord-bot:latest
        volumes:
            - type: bind
              source: ./configs
              target: /app/configs
        environment:
            TZ: Europe/Lisbon # default timezone for crontab and other date related stuff
        restart: unless-stopped
```
