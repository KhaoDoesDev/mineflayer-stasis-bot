import type { Bot } from "mineflayer";
import { goHome } from "../utils";
import { isWorking } from "..";

export function stayAtHome(bot: Bot) {
  bot.on("move", async () => {
    if (bot.pathfinder.isMoving() || isWorking) return;
    await goHome();
  });
}
