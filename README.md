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

## Usage
```bash
bun install
bun run start
```

> [!WARNING]
> **The bot may not work properly on servers with anti-cheat enabled. Use at your own risk.**
> All modules are toggleable by not loading them in the config file.

## License
MIT