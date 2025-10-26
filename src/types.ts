export type Config = {
  host: string;
  port: number;
  username: string;
  auth: "mojang" | "microsoft" | "offline";
  version: string;
  homePosition: { x: number; y: number; z: number };
  whitelist: string[];
}

export type ChamberEntry = {
  ownerUuid: string;
  lastPearlUuid?: string;
  lastThrownAt?: number;
  trapdoorLocation: { x: number; y: number; z: number };
};

export type StasisDatabase = {
  chambers: ChamberEntry[];
};