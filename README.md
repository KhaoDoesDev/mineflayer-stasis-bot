# Mineflayer Stasis Bot
A simple mineflayer bot that can be used to flip trapdoors.

Mostly based off of [EnderKill98's Azalea Stasis Bot](https://github.com/EnderKill98/stasis-bot) 

## Modules
- Stasis: Flips the trapdoor on top of an ender pearl stasis chamber. 
- Auto Log: Terminates when the bot is low on health, when totem popped, or on death.
- Auto Totem: Automatically equips a totem in off-hand.
- Look At Players: Looks at the nearest player in a 10 block radius.
- Stay At Home: Returns to home when the bot is more than 1 block away.
- Velocity*: Tries to stop all movement when not working.
- Kill Aura: Kills all hostile mobs near the bot.

## Usage
```bash
bun install
bun run start
```

## Encryption
The bot can encrypt coordinates to prevent them from being stored in plaintext in the database.
This is disabled by default, but can be enabled by setting the `encryptCoordinates` option to `true` in the config file.

To enable encryption, you must set the `DB_SECRET` environment variable to a secret string.
This secret string will be used to encrypt and decrypt coordinates.

> [!WARNING]
> **The bot may not work properly on servers with anti-cheat enabled. Use at your own risk.**
> All modules are toggleable by not loading them in the config file.

## License
MIT
