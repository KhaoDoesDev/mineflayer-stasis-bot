import type { Bot } from "mineflayer";
import { state } from "..";

export function lookAtPlayers(bot: Bot) {
  bot.on("physicsTick", async () => {
    if (bot.pathfinder.isMoving() || state.isWorking) return;
    const nearestPlayer = bot.nearestEntity(e => e.type === "player" && e.position.distanceTo(bot.entity.position) < 10);
    if (!nearestPlayer) return;
    await bot.lookAt(nearestPlayer.position.offset(0, nearestPlayer.height, 0), false); 
  });
}