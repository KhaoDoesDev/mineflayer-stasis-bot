import { Vec3 } from "vec3";
import type { Entity } from "prismarine-entity";
import { bot } from ".";
import { goals } from "mineflayer-pathfinder";
import { config } from "../config";

export function sameXZ(a: { x: number; z: number }, b: { x: number; z: number }) {
  return a.x === b.x && a.z === b.z;
}

export function dist2D(a: Vec3, b: Vec3) {
  const dx = a.x - b.x;
  const dz = a.z - b.z;
  return Math.hypot(dx, dz);
}

export function centerOf(pos: Vec3) {
  return pos.floored().offset(0.5, 0.5, 0.5);
}

export function nearestPlayerTo(pos: Vec3, maxDist: number): Entity | undefined {
  let best: Entity | undefined;
  let bestD = Infinity;
  for (const name in bot.players) {
    const p = bot.players[name]?.entity;
    if (!p?.position) continue;
    const d = p.position.distanceTo(pos);
    if (d < bestD && d <= maxDist) {
      best = p;
      bestD = d;
    }
  }
  return best;
}

export async function goNearBlock(bp: Vec3, range: number): Promise<void> {
  if (bot.pathfinder.isMoving()) bot.pathfinder.stop();
  const goal = new goals.GoalNear(bp.x, bp.y, bp.z, range);
  await bot.pathfinder.goto(goal);
}

export async function goToBlock(bp: Vec3): Promise<void> {
  if (bot.pathfinder.isMoving()) bot.pathfinder.stop();
  const goal = new goals.GoalBlock(bp.x, bp.y, bp.z);
  await bot.pathfinder.goto(goal);
}

export function toVec3({ x, y, z }: { x: number; y: number; z: number }): Vec3 {
  return new Vec3(x, y, z);
}

export function whisper(username: string, message: string) {
  bot.chat(`/msg ${username} ${message}`);
}

export async function goHome() {
  const homeVec = toVec3(config.homePosition);
  if (homeVec.distanceTo(bot.entity.position) > 0.5) {
    await goToBlock(homeVec).catch((err) => {
      console.error("Failed to go to home position:", err);
    });
  }
}