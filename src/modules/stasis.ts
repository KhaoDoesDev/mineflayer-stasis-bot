import type { Bot } from "mineflayer";
import { Entity } from "prismarine-entity";
import { centerOf, dist2D, goHome, goNearBlock, nearestPlayerTo, sameXZ, whisper } from "../utils";
import { bot, db } from "..";
import type { ChamberEntry } from "../types";
import { Vec3 } from "vec3";

const lastPearlByPlayer = new Map<string, number>();

export function stasis(bot: Bot) {
  bot.on("entitySpawn", async (e: Entity) => {
    if (e.name !== "ender_pearl") return;

    await db.read();
    if (db.data.chambers.some(c => c.lastPearlUuid === e.uuid)) return;
  
    const nearestPlayer = nearestPlayerTo(e.position, 5);
    if (!nearestPlayer?.uuid) return;
  
    const ownerUuid = nearestPlayer.uuid;
    const now = Date.now();
    const last = lastPearlByPlayer.get(ownerUuid) ?? 0;
    if (now - last < 1000) return; // debounce 1s
    lastPearlByPlayer.set(ownerUuid, now);
  
    const pPos = nearestPlayer.position;
    if (Math.abs(pPos.y - e.position.y) > 5 || dist2D(pPos, e.position) > 3)
      return;
  
    const pearlBlock = e.position.floored();
    const trapdoorPos = findNearbyTrapdoor(pearlBlock, 4);
    if (!trapdoorPos) return;
  
    const existing = db.data.chambers.find(
      (c) => c.ownerUuid === ownerUuid && sameXZ(c.trapdoorLocation, trapdoorPos)
    );
  
    if (existing) {
      existing.lastPearlUuid = e.uuid;
      existing.lastThrownAt = now;
      existing.trapdoorLocation = trapdoorPos;
    } else {
      db.data.chambers.push({
        ownerUuid,
        lastPearlUuid: e.uuid,
        lastThrownAt: now,
        trapdoorLocation: trapdoorPos,
      });
    }
  
    await db.write();
    if (nearestPlayer.username)
      whisper(
        nearestPlayer.username,
        "Saved your chamber. Type !tp to trigger it."
      );
  });
  
  bot.on("entityGone", async (e: Entity) => {
    if (e.name !== "ender_pearl") return;
  
    await db.read();
    let changed = false;
  
    for (const c of db.data.chambers) {
      if (c.lastPearlUuid === e.uuid) {
        c.lastPearlUuid = undefined;
        changed = true;
      }
    }
  
    if (changed) await db.write();
  });
}

export function latestChamberFor(uuid: string): ChamberEntry | undefined {
  const list = db.data.chambers.filter((x) => x.ownerUuid === uuid);
  list.sort((a, b) => (b.lastThrownAt ?? 0) - (a.lastThrownAt ?? 0));
  return list[0];
}

function findNearbyTrapdoor(
  around: Vec3,
  verticalRange: number
): Vec3 | undefined {
  for (let dy = -verticalRange; dy <= verticalRange; dy++) {
    const p = new Vec3(around.x, around.y + dy, around.z);
    const block = bot.blockAt(p, false);
    if (block && isLikelyTrapdoor(block.name)) {
      return new Vec3(p.x, p.y, p.z);
    }
  }
  return undefined;
}

function isLikelyTrapdoor(blockName?: string) {
  return !!blockName && blockName.endsWith("_trapdoor") && !blockName.includes("iron");
}

export async function triggerChamber(playerUuid: string, targetPos: Vec3) {
  await goNearBlock(targetPos, 3);
  const look = centerOf(targetPos);
  await bot.lookAt(look, true);
  const block = bot.blockAt(new Vec3(targetPos.x, targetPos.y, targetPos.z));
  if (!block) return console.warn("Trigger block not found or not loaded.");
  await bot.activateBlock(block);
  await new Promise<void>((resolve) => {
    const entitySpawnHandler = (e: Entity) => {
      if (e.type === "player" && e.uuid! === playerUuid) {
        bot.removeListener("entitySpawn", entitySpawnHandler);
        resolve();
      }
    };
    bot.on("entitySpawn", entitySpawnHandler);
  });
  await bot.activateBlock(block);
  await goHome();
}