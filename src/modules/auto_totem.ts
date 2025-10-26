import type { Bot } from "mineflayer";

export function autoTotem(bot: Bot) {
  bot.on("physicsTick", () => {
    if (bot.inventory.slots[45]?.name === "totem_of_undying") return;
    const totem = bot.inventory.items().find(i => i.name === "totem_of_undying");
    if (totem) {
      bot.inventory.requiresConfirmation = false;
      bot.equip(totem, "off-hand");
    }
  });
}