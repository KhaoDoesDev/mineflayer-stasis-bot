import type { Bot } from "mineflayer";
import { Vec3 } from "vec3";

export function velocity(bot: Bot) {
  bot.on("physicsTick", () => {
    if (bot.pathfinder.isMoving()) return;
    bot.entity.velocity = new Vec3(0, 0, 0);
    bot.entity.onGround = true;
  });
}