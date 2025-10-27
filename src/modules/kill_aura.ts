import type { Bot } from "mineflayer";
import type { Entity } from "prismarine-entity";
import { config } from "../../config";

export function killAura(bot: Bot) {
  bot.on("entityMoved", (e: Entity) => {
    if (config.modules.killAura.whitelist?.includes(e.type)) return;
    if (e.position.distanceTo(bot.entity.position) <= 3) return;
    // todo: get best weapon
    bot.attack(e);
  });
}
