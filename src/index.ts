import mineflayer, { type Bot } from "mineflayer";
import { pathfinder, Movements } from "mineflayer-pathfinder";
import { JSONFilePreset } from "lowdb/node";
import { config } from "../config";
import type { StasisDatabase } from "./types";
import { goHome, toVec3, whisper } from "./utils";
import { loader as autoEat } from "mineflayer-auto-eat";
import armorManager from "mineflayer-armor-manager";
import {
  autoLog,
  autoTotem,
  latestChamberFor,
  lookAtPlayers,
  statis,
  stayAtHome,
  triggerChamber,
  velocity,
} from "./modules";

export const db = await JSONFilePreset<StasisDatabase>("db.json", {
  chambers: [],
});
await db.read();

export let bot: Bot;
export let isWorking: boolean = false;
function createBot() {
  bot = mineflayer.createBot({
    host: config.host,
    port: config.port,
    username: config.username,
    auth: config.auth,
    version: config.version,
  });

  bot.once("inject_allowed", () => {
    bot.loadPlugins([
      pathfinder,
      autoEat,
      armorManager,
      velocity,
      lookAtPlayers,
      autoTotem,
      statis,
      autoLog,
      stayAtHome
    ]);
    bot.autoEat.enableAuto();

    const movements = new Movements(bot);
    movements.canDig = false;
    bot.pathfinder.setMovements(movements);
  });

  bot.once("spawn", async () => {
    console.info("Spawned");
    await goHome();
  });

  bot.on("kicked", (reason) => {
    console.warn("Kicked:", reason);
    reconnect();
  });

  bot.on("end", (reason) => {
    console.warn("Bot disconnected:", reason);
    reconnect();
  });

  bot.on("error", (err) => {
    console.error("Bot error:", err);
    reconnect();
  });

  bot.on("whisper", async (username, message) => {
    if (username === bot.username) return;
    if (!config.whitelist.includes(username)) return;

    switch (message.trim().toLowerCase()) {
      case "!tp":
        await db.read();
        const player = bot.players[username];
        if (!player?.uuid) {
          whisper(username, "I can't see you online.");
          return;
        }

        const chamber = latestChamberFor(player.uuid);
        if (!chamber) {
          whisper(username, "No chamber found for you.");
          return;
        }

        try {
          whisper(username, `Walking to your chamber...`);
          isWorking = true;
          await triggerChamber(toVec3(chamber.trapdoorLocation));
          isWorking = false;
          whisper(username, `Welcome back, ${username}!`);
        } catch (err: any) {
          whisper(username, `Failed to trigger: ${err?.message ?? err}`);
        }
        return;

      case "!home":
        whisper(username, "Going home.");
        await goHome();
        whisper(username, "Arrived home.");
        return;

      case "!printinv":
        whisper(
          username,
          "Inventory: " +
            bot.inventory
              .items()
              .map((i) => `${i.name} x${i.count}`)
              .join(", ")
        );
        return;

      case "!nearby":
        const nearby = Object.values(bot.players).filter(
          (p) => p.entity?.position?.distanceTo(bot.entity.position) < 10
        );
        whisper(
          username,
          `Nearby players: ${nearby.map((p) => p.username).join(", ")}`
        );
        return;
    }
  });
}

let reconnectTimeout: NodeJS.Timeout | null = null;
function reconnect() {
  if (reconnectTimeout) return;
  console.info(`Reconnecting in ${config.reconnectInterval} seconds...`);
  reconnectTimeout = setTimeout(() => {
    reconnectTimeout = null;
    createBot();
  }, config.reconnectInterval * 1000);
}

createBot();