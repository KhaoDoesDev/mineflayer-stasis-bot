import type { Bot } from "mineflayer";
import { goHome } from "../utils";
import { state } from "..";

export function stayAtHome(bot: Bot) {
  bot.on("move", async () => {
    if (bot.pathfinder.isMoving() || state.isWorking) return;
    await goHome();
  });
}
