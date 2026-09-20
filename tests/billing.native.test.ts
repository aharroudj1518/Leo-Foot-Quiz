import {describe,it,expect,vi,beforeEach} from 'vitest';
const recovery=vi.hoisted(()=>({value:null as string|null,readFail:false,writeFail:false,writes:[] as string[]}));
vi.mock('../src/services/storage',()=>({
 readPurchaseRecovery:async()=>{if(recovery.readFail)throw Error('storage read failed');return recovery.value;},
 writePurchaseRecovery:async(value:string)=>{if(recovery.writeFail)throw Error('storage write failed');recovery.value=value;recovery.writes.push(value);},
}));
beforeEach(()=>{recovery.value=null;recovery.readFail=false;recovery.writeFail=false;recovery.writes=[];});
const store=vi.hoisted(()=>({owned:false,offeringsFail:false,packages:[] as any[],infoFail:false,listener:null as null|((info:any)=>void),configure:vi.fn(),purchase:vi.fn(),restore:vi.fn()}));
const info=()=>({entitlements:{active:store.owned?{legends:{}}:{}}});
vi.mock('react-native',()=>({Platform:{OS:'android'}}));
vi.mock('expo-constants',()=>({default:{appOwnership:'standalone'}}));
vi.mock('../src/content/editorial-status.json',()=>({default:{independentEditorialApproval:true}}));
vi.mock('react-native-purchases',async()=>({default:{PURCHASES_ERROR_CODE:(await import('@revenuecat/purchases-typescript-internal')).PURCHASES_ERROR_CODE,configure:store.configure,addCustomerInfoUpdateListener:(listener:any)=>{store.listener=listener;},getCustomerInfo:async()=>{if(store.infoFail)throw Error("offline");return info();},getOfferings:async()=>{if(store.offeringsFail)throw new Error('offline');return {current:{availablePackages:store.packages}};},purchasePackage:store.purchase,restorePurchases:store.restore}}));
let {buy,loadShop,restore,observeOwnership,refreshOwnership}=await import('../src/services/billing');
const pkg={packageType:'LIFETIME',product:{identifier:'leoqo_legends_lifetime',priceString:'£2.99',productCategory:'NON_SUBSCRIPTION',productType:'UNKNOWN',subscriptionPeriod:null}} as any;
beforeEach(async()=>{vi.resetModules();({buy,loadShop,restore,observeOwnership,refreshOwnership}=await import('../src/services/billing'));store.configure.mockClear();store.purchase.mockReset().mockImplementation(async()=>({customerInfo:info()}));store.restore.mockReset().mockImplementation(async()=>info());store.listener=null;store.owned=false;store.infoFail=false;store.offeringsFail=false;store.packages=[];vi.stubEnv('EXPO_PUBLIC_COMMERCE_READY','true');vi.stubEnv('EXPO_PUBLIC_REVENUECAT_ANDROID_KEY','goog_live_key');});
describe('store build purchase path',()=>{
it('stays closed until the commerce flag is set, even with editorial approval',async()=>{vi.stubEnv('EXPO_PUBLIC_COMMERCE_READY','false');const shop=await loadShop();expect(shop.available).toBe(false);expect(shop.message).toContain('not open');});
it('refuses test_ keys so a sandbox key never ships',async()=>{vi.stubEnv('EXPO_PUBLIC_REVENUECAT_ANDROID_KEY','test_abc');const shop=await loadShop();expect(shop.available).toBe(false);expect(shop.message).toContain('not open');});
it('configures the SDK with the platform key and reports a missing offering without inventing a price',async()=>{const shop=await loadShop();expect(store.configure).toHaveBeenCalledWith({apiKey:'goog_live_key'});expect(shop.available).toBe(false);expect(shop.product).toBeNull();expect(shop.message).toContain('not available from your store yet');});
it('exposes the real package and ownership when the store answers',async()=>{store.packages=[pkg];const shop=await loadShop();expect(shop.available).toBe(true);expect(shop.product).toBe(pkg);expect(shop.owned).toBe(false);expect(shop.message).toBe('');});
it('does not report success when the store has not granted the entitlement',async()=>{await expect(buy(pkg)).rejects.toThrow('waiting for confirmation');});
it('returns true only once the entitlement is active, for buy and restore',async()=>{store.owned=true;expect(await buy(pkg)).toBe(true);expect(await restore()).toBe(true);});
it('never reconfigures the SDK once it is set up',async()=>{await loadShop();store.configure.mockClear();await loadShop();await restore();expect(store.configure).not.toHaveBeenCalled();});
it('preserves verified ownership when the offering service is unavailable',async()=>{store.owned=true;store.offeringsFail=true;const shop=await loadShop();expect(shop.owned).toBe(true);expect(shop.available).toBe(false);expect(shop.product).toBeNull();});
it('does not grant ownership to a guest when offerings fail',async()=>{store.offeringsFail=true;expect((await loadShop()).owned).toBe(false);});
});

it('updates access after a refund and removes UI observers on cleanup',async()=>{await loadShop();const listener=vi.fn();const stop=observeOwnership(listener);store.owned=true;store.listener!(info());expect(listener).toHaveBeenLastCalledWith(true);store.owned=false;store.listener!(info());expect(listener).toHaveBeenLastCalledWith(false);stop();store.listener!(info());expect(listener).toHaveBeenCalledTimes(2);});
it('keeps verified access on a network failure but removes it after a confirmed revocation',async()=>{store.owned=true;await loadShop();store.infoFail=true;expect((await loadShop()).owned).toBe(true);const listener=vi.fn();const stop=observeOwnership(listener);await refreshOwnership();expect(listener).not.toHaveBeenCalled();store.infoFail=false;store.owned=false;await refreshOwnership();expect(listener).toHaveBeenLastCalledWith(false);expect((await loadShop()).owned).toBe(false);stop();});

it('holds a pending payment without retrying checkout and unlocks only after store confirmation',async()=>{
 store.packages=[pkg];
 store.purchase.mockRejectedValue({code:'20',message:'internal native diagnostics'});
 await expect(buy(pkg)).rejects.toMatchObject({kind:'pending'});
 const waiting=await loadShop();
 expect(waiting).toMatchObject({pending:true,owned:false,available:false});
 expect(waiting.message).not.toContain('internal native');
 await expect(buy(pkg)).rejects.toMatchObject({kind:'pending'});
 expect(store.purchase).toHaveBeenCalledTimes(1);
 expect(await restore()).toBe(false);
 expect((await loadShop()).pending).toBe(true);
 store.owned=true;store.listener!(info());
 expect(await loadShop()).toMatchObject({pending:false,owned:true});
});

it('treats an accepted checkout without an entitlement as awaiting confirmation',async()=>{
 await expect(buy(pkg)).rejects.toMatchObject({kind:'pending'});
 await expect(buy(pkg)).rejects.toMatchObject({kind:'pending'});
 expect(store.purchase).toHaveBeenCalledTimes(1);
 store.owned=true;
 expect(await restore()).toBe(true);
 expect((await loadShop()).pending).toBe(false);
});

it('rejects a second checkout while the first store request is still running',async()=>{
 let finish!:(value:any)=>void;
 store.purchase.mockImplementationOnce(()=>new Promise(resolve=>{finish=resolve;}));
 const first=buy(pkg);
 await vi.waitFor(()=>expect(store.purchase).toHaveBeenCalledTimes(1));
 await expect(buy(pkg)).rejects.toThrow('already running');
 expect(store.purchase).toHaveBeenCalledTimes(1);
 store.owned=true;finish({customerInfo:info()});expect(await first).toBe(true);
});

it.each([['1','cancelled'],['6','restore'],['2','restore'],['10','restore'],['3','unavailable']])('maps store error %s to a readable %s result',async(code,kind)=>{
 store.purchase.mockRejectedValue({code,message:'SDK_INTERNAL receipt payload'});
 const failure=await buy(pkg).catch(e=>e);
 expect(failure.kind).toBe(kind);
 expect(failure.message).not.toContain('SDK_INTERNAL');
 expect((await loadShop()).pending).toBe(false);
});

it('sanitizes restore failures and keeps previously verified access',async()=>{
 store.owned=true;await loadShop();
 store.restore.mockRejectedValue({code:'2',message:'SDK_INTERNAL store transport'});
 const failure=await restore().catch(e=>e);
 expect(failure.kind).toBe('restore');expect(failure.message).not.toContain('SDK_INTERNAL');
 store.infoFail=true;expect((await loadShop()).owned).toBe(true);
});

it('requires an explicit successful restore before retrying an uncertain purchase',async()=>{
 store.packages=[pkg];store.purchase.mockRejectedValue({code:'2'});
 await expect(buy(pkg)).rejects.toMatchObject({kind:'restore'});
 expect(await loadShop()).toMatchObject({available:false,owned:false,pending:false,needsRestore:true});
 await expect(buy(pkg)).rejects.toMatchObject({kind:'restore'});
 expect(store.purchase).toHaveBeenCalledTimes(1);
 store.restore.mockRejectedValueOnce({code:'10'});
 await expect(restore()).rejects.toMatchObject({kind:'restore'});
 expect((await loadShop()).needsRestore).toBe(true);
 expect(await restore()).toBe(false);
 expect(await loadShop()).toMatchObject({available:true,needsRestore:false});
 store.owned=true;
 store.purchase.mockResolvedValueOnce({customerInfo:info()});
 expect(await buy(pkg)).toBe(true);
});

it('a confirmed entitlement clears uncertain checkout recovery without another purchase',async()=>{
 await loadShop();store.purchase.mockRejectedValue({code:'2'});
 await expect(buy(pkg)).rejects.toMatchObject({kind:'restore'});
 store.owned=true;store.listener!(info());
 expect(await loadShop()).toMatchObject({owned:true,needsRestore:false,pending:false});
 expect(store.purchase).toHaveBeenCalledTimes(1);
});

it('cancellation leaves checkout available and does not demand restore',async()=>{
 store.packages=[pkg];store.purchase.mockRejectedValue({code:'1'});
 await expect(buy(pkg)).rejects.toMatchObject({kind:'cancelled'});
 expect(await loadShop()).toMatchObject({available:true,needsRestore:false,pending:false});
});

it('persists an intent before opening checkout and recovers an interrupted process',async()=>{
 store.purchase.mockImplementationOnce(()=>{expect(recovery.value).toBe('1');throw {code:'2'};});
 await expect(buy(pkg)).rejects.toMatchObject({kind:'restore'});
 vi.resetModules();
 const restarted=await import('../src/services/billing');
 await expect(restarted.buy(pkg)).rejects.toMatchObject({kind:'restore'});
 expect(store.purchase).toHaveBeenCalledTimes(1);
 expect(await restarted.restore()).toBe(false);
 expect(recovery.value).toBe('0');
 store.owned=true;
 expect(await restarted.buy(pkg)).toBe(true);
});

it('preserves an approval-pending payment after process restart and empty restore',async()=>{
 store.purchase.mockRejectedValueOnce({code:'20'});
 await expect(buy(pkg)).rejects.toMatchObject({kind:'pending'});
 expect(recovery.value).toBe('pending');
 vi.resetModules();
 const restarted=await import('../src/services/billing');
 await expect(restarted.buy(pkg)).rejects.toMatchObject({kind:'pending'});
 expect(await restarted.restore()).toBe(false);
 expect(recovery.value).toBe('pending');
 await expect(restarted.buy(pkg)).rejects.toMatchObject({kind:'pending'});
 expect(store.purchase).toHaveBeenCalledTimes(1);
 store.owned=true;
 expect(await restarted.restore()).toBe(true);
 expect(recovery.value).toBe('0');
});

it('never opens checkout when the durable intent cannot be saved',async()=>{
 recovery.writeFail=true;
 await expect(buy(pkg)).rejects.toMatchObject({kind:'unavailable'});
 expect(store.purchase).not.toHaveBeenCalled();
});

it('retries a failed recovery read without starting a payment',async()=>{
 recovery.readFail=true;
 await expect(buy(pkg)).rejects.toMatchObject({kind:'unavailable'});
 expect(store.purchase).not.toHaveBeenCalled();
 recovery.readFail=false;store.owned=true;
 expect(await buy(pkg)).toBe(true);
});

it('a stored recovery marker is never treated as a paid entitlement',async()=>{
 recovery.value='1';store.packages=[pkg];
 expect(await loadShop()).toMatchObject({owned:false,available:false,needsRestore:true});
});

it.each([
 {productCategory:'SUBSCRIPTION',productType:'AUTO_RENEWABLE_SUBSCRIPTION',subscriptionPeriod:'P1M'},
 {productType:'CONSUMABLE'},
 {identifier:'different_product'},
 {productCategory:null},
])('rejects a mismatched product before any checkout',async changes=>{
 const wrong={...pkg,product:{...pkg.product,...changes}};
 await expect(buy(wrong)).rejects.toMatchObject({kind:'unavailable'});
 expect(store.purchase).not.toHaveBeenCalled();
 expect(recovery.writes).toEqual([]);
});
it('does not present recurring billing under the one-time pack promise',async()=>{
 store.owned=true;
 store.packages=[{...pkg,packageType:'MONTHLY',product:{...pkg.product,productCategory:'SUBSCRIPTION',subscriptionPeriod:'P1M'}}];
 const shop=await loadShop();
 expect(shop).toMatchObject({available:false,owned:true,product:null});
 expect(shop.message).toContain('one-time pack');
});
it('accepts a non-consumable lifetime item in a custom offering package',async()=>{
 store.packages=[{...pkg,packageType:'CUSTOM',product:{...pkg.product,productType:'NON_CONSUMABLE'}}];
 expect(await loadShop()).toMatchObject({available:true});
});
