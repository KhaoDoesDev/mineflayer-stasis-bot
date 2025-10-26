import type { Bot } from "mineflayer";

export function autoLog(bot: Bot) {
  bot._client.on("packet", (packet, packetMeta) => {
    switch (packetMeta.name) {
      case "entity_status":
        if (packet.entityId !== bot.entity.id || packet.entityStatus !== 35)
          return;
        bot.end();
        console.warn("[AutoLog] Disconnected due to totem pop.");
        process.exit(0);
      case "update_health":
        if (packet.health >= 8) return;
        bot.end();
        console.warn(`[AutoLog] Disconnected due to low health ${packet.health.toFixed(2)}.`);  
        process.exit(0);
    }
  });
}
