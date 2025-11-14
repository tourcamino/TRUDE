import { env } from "./env";
import { PrismaClient } from "@prisma/client";

type AnyRecord = Record<string, any>;

class InMemoryModel<T extends AnyRecord> {
  private data: T[] = [];
  private id = 1;
  private idKey: keyof T;
  constructor(idKey?: keyof T) {
    this.idKey = idKey ?? ("id" as keyof T);
  }
  create({ data }: { data: AnyRecord }): T {
    const record = { ...(data as AnyRecord), [this.idKey]: this.id++ } as T;
    this.data.push(record);
    return record;
  }
  findUnique({ where, include }: { where: AnyRecord; include?: AnyRecord }): any {
    const keys = Object.keys(where || {});
    if (keys.length === 0) return null;
    const key = keys[0];
    const val = key ? (where as AnyRecord)[key] : undefined;
    const found = this.data.find((r) => (r as AnyRecord)[key] === val) || null;
    if (!found) return null;
    if (include) {
      const result: AnyRecord = { ...(found as AnyRecord) };
      if (include.user) result.user = mem.user.findUnique({ where: { id: result.userId } });
      if (include.vault) result.vault = mem.vault.findUnique({ where: { id: result.vaultId } });
      return result;
    }
    return found;
  }
  findFirst(): T | null {
    return this.data[0] || null;
  }
  findMany({ where }: { where: AnyRecord }): T[] {
    const entries = Object.entries(where || {});
    return this.data.filter((r) => entries.every(([k, v]) => (r as AnyRecord)[k] === v));
  }
  update({ where, data }: { where: AnyRecord; data: AnyRecord }): T {
    const keys = Object.keys(where || {});
    if (keys.length === 0) throw new Error("No where condition provided");
    const key = keys[0];
    const val = key ? (where as AnyRecord)[key] : undefined;
    const idx = this.data.findIndex((r) => (r as AnyRecord)[key] === val);
    if (idx < 0) throw new Error("Record not found");
    const merged = { ...(this.data[idx] as AnyRecord), ...(data as AnyRecord) } as T;
    this.data[idx] = merged;
    return merged;
  }
}

class InMemoryDb {
  user = new InMemoryModel<any>();
  vault = new InMemoryModel<any>();
  deposit = new InMemoryModel<any>();
  profit = new InMemoryModel<any>();
  capitalWithdrawal = new InMemoryModel<any>();
  withdrawalRequest = new InMemoryModel<any>();
  affiliate = new InMemoryModel<any>();
  factorySettings = new InMemoryModel<any>();
  auditLog = new InMemoryModel<any>();
}

const mem = new InMemoryDb();

const createPrismaClient = () => {
  return new PrismaClient({
    log: env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
};

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

// Force in-memory database for deployment
const useMem = true; // process.env.DB_FALLBACK_MEM === "1";
export const db: any = mem; // useMem ? mem : globalForPrisma.prisma ?? createPrismaClient();

if (!useMem && env.NODE_ENV !== "production") globalForPrisma.prisma = db;
