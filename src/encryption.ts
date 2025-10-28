import crypto from "crypto";
import { env } from "process";
import { Vec3 } from "vec3";
import { db } from ".";
import { config } from "../config";

const SECRET = env.DB_SECRET!;

function getKey(): Buffer {
  return crypto.createHash("sha256").update(SECRET).digest();
}

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decrypt(encrypted: string): string {
  const parts = encrypted.split(":");
  if (parts.length !== 2) throw new Error(`Invalid encrypted data: ${encrypted}`);

  const [ivHex, dataHex] = parts as [string, string];
  const iv = Buffer.from(ivHex ?? "", "hex");
  const encryptedText = Buffer.from(dataHex ?? "", "hex");

  const decipher = crypto.createDecipheriv("aes-256-cbc", getKey(), iv);
  const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
  return decrypted.toString("utf8");
}

export function encryptCoords(v: Vec3 | { x: number; y: number; z: number }): string {
  const data = `${v.x},${v.y},${v.z}`;
  return encrypt(data);
}

export function decryptCoords(data: string): { x: number; y: number; z: number } {
  const decrypted = decrypt(data);
  const [xStr, yStr, zStr] = decrypted.split(",");
  const x = Number(xStr);
  const y = Number(yStr);
  const z = Number(zStr);

  if ([x, y, z].some((n) => Number.isNaN(n))) {
    throw new Error(`Invalid decrypted coordinate data: ${decrypted}`);
  }

  return { x, y, z };
}

export function decryptCoordsAsVec3(data: string): Vec3 {
  const { x, y, z } = decryptCoords(data);
  return new Vec3(x, y, z);
}

export async function migrateChambersFormat() {
  let changed = false;
  for (const c of db.data.chambers) {
    const isEncrypted = typeof c.trapdoorLocation === "string";

    if (config.encryptCoordinates && !isEncrypted) {
      const loc = c.trapdoorLocation;
      if (loc && typeof loc !== "string") {
        c.trapdoorLocation = encryptCoords(loc);
        changed = true;
      }
    }

    else if (!config.encryptCoordinates && isEncrypted) {
      const loc = decryptCoords(c.trapdoorLocation as string);
      c.trapdoorLocation = { x: loc.x, y: loc.y, z: loc.z };
      changed = true;
    }
  }

  if (changed) {
    await db.write();
    console.log("[encryption] Chambers auto-migrated to match encryption setting.");
  }
}