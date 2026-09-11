import {describe,it,expect,vi,beforeEach} from 'vitest';
const store=vi.hoisted(()=>({owned:false,offeringsFail:false,packages:[] as any[],infoFail:false,listener:null as null|((info:any)=>void),configure:vi.fn()}));
const info=()=>({entitlements:{active:store.owned?{legends:{}}:{}}});
vi.mock('react-native',()=>({Platform:{OS:'android'}}));
vi.mock('expo-constants',()=>({default:{appOwnership:'standalone'}}));
vi.mock('../src/content/editorial-status.json',()=>({default:{independentEditorialApproval:true}}));
vi.mock('react-native-purchases',()=>({default:{configure:store.configure,addCustomerInfoUpdateListener:(listener:any)=>{store.listener=listener;},getCustomerInfo:async()=>{if(store.infoFail)throw Error("offline");return info();},getOfferings:async()=>{if(store.offeringsFail)throw new Error('offline');return {current:{availablePackages:store.packages}};},purchasePackage:async()=>({customerInfo:info()}),restorePurchases:async()=>info()}}));
import {buy,loadShop,restore,observeOwnership,refreshOwnership} from '../src/services/billing';
const pkg={product:{identifier:'leoqo_legends_lifetime',priceString:'£2.99'}} as any;
beforeEach(()=>{store.owned=false;store.infoFail=false;store.offeringsFail=false;store.packages=[];vi.stubEnv('EXPO_PUBLIC_COMMERCE_READY','true');vi.stubEnv('EXPO_PUBLIC_REVENUECAT_ANDROID_KEY','goog_live_key');});
describe('store build purchase path',()=>{
it('stays closed until the commerce flag is set, even with editorial approval',async()=>{vi.stubEnv('EXPO_PUBLIC_COMMERCE_READY','false');const shop=await loadShop();expect(shop.available).toBe(false);expect(shop.message).toContain('not open');});
it('refuses test_ keys so a sandbox key never ships',async()=>{vi.stubEnv('EXPO_PUBLIC_REVENUECAT_ANDROID_KEY','test_abc');const shop=await loadShop();expect(shop.available).toBe(false);expect(shop.message).toContain('not open');});
it('configures the SDK with the platform key and reports a missing offering without inventing a price',async()=>{const shop=await loadShop();expect(store.configure).toHaveBeenCalledWith({apiKey:'goog_live_key'});expect(shop.available).toBe(false);expect(shop.product).toBeNull();expect(shop.message).toContain('not available from your store yet');});
it('exposes the real package and ownership when the store answers',async()=>{store.packages=[pkg];const shop=await loadShop();expect(shop.available).toBe(true);expect(shop.product).toBe(pkg);expect(shop.owned).toBe(false);expect(shop.message).toBe('');});
it('does not report success when the store has not granted the entitlement',async()=>{await expect(buy(pkg)).rejects.toThrow('still being confirmed');});
it('returns true only once the entitlement is active, for buy and restore',async()=>{store.owned=true;expect(await buy(pkg)).toBe(true);expect(await restore()).toBe(true);});
it('never reconfigures the SDK once it is set up',async()=>{store.configure.mockClear();await loadShop();await restore();expect(store.configure).not.toHaveBeenCalled();});
it('preserves verified ownership when the offering service is unavailable',async()=>{store.owned=true;store.offeringsFail=true;const shop=await loadShop();expect(shop.owned).toBe(true);expect(shop.available).toBe(false);expect(shop.product).toBeNull();});
it('does not grant ownership to a guest when offerings fail',async()=>{store.offeringsFail=true;expect((await loadShop()).owned).toBe(false);});
});

it('updates access after a refund and removes UI observers on cleanup',async()=>{await loadShop();const listener=vi.fn();const stop=observeOwnership(listener);store.owned=true;store.listener!(info());expect(listener).toHaveBeenLastCalledWith(true);store.owned=false;store.listener!(info());expect(listener).toHaveBeenLastCalledWith(false);stop();store.listener!(info());expect(listener).toHaveBeenCalledTimes(2);});
it('keeps verified access on a network failure but removes it after a confirmed revocation',async()=>{store.owned=true;await loadShop();store.infoFail=true;expect((await loadShop()).owned).toBe(true);const listener=vi.fn();const stop=observeOwnership(listener);await refreshOwnership();expect(listener).not.toHaveBeenCalled();store.infoFail=false;store.owned=false;await refreshOwnership();expect(listener).toHaveBeenLastCalledWith(false);expect((await loadShop()).owned).toBe(false);stop();});
