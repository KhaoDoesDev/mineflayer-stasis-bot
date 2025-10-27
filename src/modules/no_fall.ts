import type { Bot } from "mineflayer";

export function noFall(bot: Bot) {
  bot.on("physicsTick", () => {
    bot.entity.onGround = true;
  });
}