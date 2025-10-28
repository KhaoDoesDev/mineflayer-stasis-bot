import mineflayer, { type Bot, type Plugin } from "mineflayer";
import { pathfinder, Movements } from "mineflayer-pathfinder";
import { JSONFilePreset } from "lowdb/node";
import { config } from "../config";
import type { StasisDatabase } from "./types";
import { goHome, whisper } from "./utils";
import { loader as autoEat } from "mineflayer-auto-eat";
import armorManager from "mineflayer-armor-manager";
import {
  autoLog,
  autoTotem,
  killAura,
  latestChamberFor,
  lookAtPlayers,
  noFall,
  stasis,
  stayAtHome,
  triggerChamber,
  velocity,
} from "./modules";
import { env } from "bun";

if (config.encryptCoordinates && !env.DB_SECRET) {
  throw new Error("DB_SECRET environment variable is required for encrypted coordinates.");
}

export const db = await JSONFilePreset<StasisDatabase>("db.json", {
  chambers: [],
});
await db.read();

const modules: Plugin[] = [];
if (config.modules.autoEat) modules.push(autoEat);
if (config.modules.armorManager) modules.push(armorManager);
if (config.modules.velocity) modules.push(velocity);
if (config.modules.noFall) modules.push(noFall);
if (config.modules.lookAtPlayers) modules.push(lookAtPlayers);
if (config.modules.autoTotem) modules.push(autoTotem);
if (config.modules.stasis) modules.push(stasis);
if (config.modules.autoLog) modules.push(autoLog);
if (config.modules.stayAtHome) modules.push(stayAtHome);
if (config.modules.killAura.enabled) modules.push(killAura);

const messagesFile = Bun.file("./messages.txt");
let messages = ["Glad to see you again, %player%!", "Welcome back, %player%!"];
if (await messagesFile.exists()) messages = (await messagesFile.text()).split("\n");

export let state = {
  isWorking: false
};
export let bot: Bot
function createBot() {
  bot = mineflayer.createBot({
    host: config.host,
    port: config.port,
    username: config.username,
    auth: config.auth,
    version: config.version,
  });

  bot.once("inject_allowed", () => {
    bot.loadPlugins([pathfinder, ...modules]);
    if (config.modules.autoEat) bot.autoEat.enableAuto();

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
    if (config.whitelist.enabled && !config.whitelist.players.includes(username)) return; 
    if (!message.startsWith("!")) return;

    const command = message.split(" ")[0]!.slice(1).toLowerCase();
    const args = message.split(" ").slice(1);

    switch (command) {
      case "tp":
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
          whisper(username, `Walking to your stasis chamber...`);
          state.isWorking = true;
          const result = await triggerChamber(chamber);
          state.isWorking = false;
          whisper(username, result ? messages[Math.floor(Math.random() * messages.length)]!.replace("%player%", username) : "Stasis failed!"); 
        } catch (err: any) {
          whisper(username, `Failed to trigger: ${err?.message ?? err}`);
        }
        return;

      case "home":
        if (!config.authorizedPlayers.includes(username)) return;
        whisper(username, "Going home.");
        await goHome();
        whisper(username, "Arrived home.");
        return;

      case "printinv":
        if (!config.authorizedPlayers.includes(username)) return;
        whisper(
          username,
          "Inventory: " +
            bot.inventory
              .items()
              .map((i) => `${i.name} x${i.count}`)
              .join(", ")
        );
        return;

      case "nearby":
        if (!config.authorizedPlayers.includes(username)) return;
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
