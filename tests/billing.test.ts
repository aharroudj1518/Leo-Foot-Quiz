import {describe,it,expect,vi} from 'vitest';
vi.mock('react-native',()=>({Platform:{OS:'web'}}));
vi.mock('expo-constants',()=>({default:{appOwnership:'expo'}}));
import {getPurchaseSupport,loadShop,restore} from '../src/services/billing';
describe('commerce release guard',()=>{
it('never fabricates a successful purchase or price in an unconfigured build',async()=>{const shop=await loadShop();expect(shop.available).toBe(false);expect(shop.owned).toBe(false);expect(shop.product).toBeNull();expect(shop.message).toContain('No payment');});
it('does not pretend restore succeeded',async()=>{await expect(restore()).rejects.toThrow('shop is not open');});
it('has no purchase support ID in the free web preview',async()=>{expect(await getPurchaseSupport()).toBeNull();await loadShop();expect(await getPurchaseSupport()).toBeNull();});
});
