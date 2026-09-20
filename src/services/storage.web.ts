// Web preview uses localStorage. Native builds resolve storage.ts and use SQLite.
const KEY='leoqo.profile.v1';
export async function readProfile():Promise<string|null>{return globalThis.localStorage.getItem(KEY);}
export async function writeProfile(value:string):Promise<void>{globalThis.localStorage.setItem(KEY,value);}
const RECOVERY_KEY='leoqo.purchase-recovery.v1';
export async function readPurchaseRecovery():Promise<string|null>{return globalThis.localStorage.getItem(RECOVERY_KEY);}
export async function writePurchaseRecovery(value:string):Promise<void>{globalThis.localStorage.setItem(RECOVERY_KEY,value);}
