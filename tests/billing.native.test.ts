import {describe,it,expect,vi,beforeEach} from 'vitest';
const store=vi.hoisted(()=>({owned:false,offeringsFail:false,packages:[] as any[],infoFail:false,listener:null as null|((info:any)=>void),configure:vi.fn(),purchase:vi.fn(),restore:vi.fn()}));
const info=()=>({entitlements:{active:store.owned?{legends:{}}:{}}});
vi.mock('react-native',()=>({Platform:{OS:'android'}}));
vi.mock('expo-constants',()=>({default:{appOwnership:'standalone'}}));
vi.mock('../src/content/editorial-status.json',()=>({default:{independentEditorialApproval:true}}));
vi.mock('react-native-purchases',async()=>({default:{PURCHASES_ERROR_CODE:(await import('@revenuecat/purchases-typescript-internal')).PURCHASES_ERROR_CODE,configure:store.configure,addCustomerInfoUpdateListener:(listener:any)=>{store.listener=listener;},getCustomerInfo:async()=>{if(store.infoFail)throw Error("offline");return info();},getOfferings:async()=>{if(store.offeringsFail)throw new Error('offline');return {current:{availablePackages:store.packages}};},purchasePackage:store.purchase,restorePurchases:store.restore}}));
let {buy,loadShop,restore,observeOwnership,refreshOwnership}=await import('../src/services/billing');
const pkg={product:{identifier:'leoqo_legends_lifetime',priceString:'£2.99'}} as any;
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
