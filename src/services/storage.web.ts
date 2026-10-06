// Web preview uses localStorage. Native builds resolve storage.ts and use SQLite.
const KEY='leoqo.profile.v1';
export async function readProfile():Promise<string|null>{return globalThis.localStorage.getItem(KEY);}
export async function writeProfile(value:string):Promise<void>{globalThis.localStorage.setItem(KEY,value);}
export async function readNewsCache():Promise<string|null>{return globalThis.localStorage.getItem('leoqo.news.v1');}
export async function writeNewsCache(value:string):Promise<void>{globalThis.localStorage.setItem('leoqo.news.v1',value);}
