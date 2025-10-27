export type Config = {
  host: string;
  port: number;
  username: string;
  auth: "mojang" | "microsoft" | "offline";
  version: string;
  homePosition: { x: number; y: number; z: number };
  reconnectInterval: number;
  whitelist: string[];
  modules: {
    autoEat: boolean;
    armorManager: boolean;
    velocity: boolean;
    noFall: boolean;
    lookAtPlayers: boolean;
    autoTotem: boolean;
    stasis: boolean;
    autoLog: boolean;
    stayAtHome: boolean;
    killAura: {
      enabled: boolean;
      whitelist?: string[];
    }
  }
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

declare module "mineflayer" {
  interface Bot {
    isWorking: boolean;
  }
}