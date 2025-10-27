import type { Bot } from "mineflayer";
import type { Entity } from "prismarine-entity";
import { config } from "../../config";

export function killAura(bot: Bot) {
  bot.on("entityMoved", async (e: Entity) => {
    if (config.modules.killAura.whitelist?.includes(e.name!)) return;
    if (e.type !== "hostile") return;
    if (e.position.distanceTo(bot.entity.position) > 3) return;
    // todo: get best weapon
    await bot.lookAt(e.position.offset(0, e.height, 0), true); 
    bot.attack(e);
  });
}
