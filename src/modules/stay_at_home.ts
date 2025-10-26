import type { Bot } from "mineflayer";
import { goHome } from "../utils";

export function stayAtHome(bot: Bot) {
  bot.on("move", async () => {
    if (bot.pathfinder.isMoving()) return;
    await goHome();
  });
}
