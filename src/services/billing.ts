import { Platform } from 'react-native';
import Constants from 'expo-constants';
import type { CustomerInfo, PurchasesPackage } from 'react-native-purchases';
import editorial from '../content/editorial-status.json';

export const ENTITLEMENT = 'legends';
export type Shop = { available: boolean; owned: boolean; product: PurchasesPackage | null; message: string };
let configured = false;
let lastOwnership = false;
const ownershipListeners = new Set<(value: boolean) => void>();
function receiveInfo(info: CustomerInfo) {
  lastOwnership = owned(info);
  ownershipListeners.forEach(listener => listener(lastOwnership));
  return lastOwnership;
}
// Registering UI observers does not configure or contact the store.
export function observeOwnership(listener: (value: boolean) => void) {
  ownershipListeners.add(listener);
  return () => { ownershipListeners.delete(listener); };
}
export async function refreshOwnership() {
  if (!configured) return;
  try { receiveInfo(await (await sdk()).getCustomerInfo()); }
  catch { /* A transport failure is not evidence of a refund. */ }
}
// Called only after the adult purchase step, never on child/guest app startup.
async function sdk() {
  if (!editorial.independentEditorialApproval || process.env.EXPO_PUBLIC_COMMERCE_READY !== 'true') throw new Error('The shop is not open in this build. No payment has been taken. Try the free preview below.');
  if (Platform.OS === 'web' || Constants.appOwnership === 'expo') throw new Error('Purchases are available in the Android and iPhone store builds. You can keep playing free here.');
  const key = Platform.OS === 'ios' ? process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY : process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;
  if (!key || key.startsWith('test_')) throw new Error('The shop is not open in this build. No payment has been taken.');
  const { default: Purchases } = await import('react-native-purchases');
  if (!configured) {
    Purchases.configure({ apiKey: key }); configured = true;
    Purchases.addCustomerInfoUpdateListener(receiveInfo);
  }
  return Purchases;
}
function owned(info: CustomerInfo) { return !!info.entitlements.active[ENTITLEMENT]; }
export async function loadShop(): Promise<Shop> {
  try {
    const purchases = await sdk();
    let info: CustomerInfo;
    try { info = await purchases.getCustomerInfo(); receiveInfo(info); }
    catch { return {available:false,owned:lastOwnership,product:null,message:'Purchase status could not be refreshed. Your last verified access is unchanged. Try again when connected.'}; }
    // Ownership does not depend on the catalogue being reachable.
    let offerings;
    try { offerings = await purchases.getOfferings(); }
    catch { return { available: false, owned: owned(info), product: null, message: 'The store catalogue could not be reached. Your verified pack access is unchanged. Try again later.' }; }
    const product = offerings.current?.availablePackages.find(p => p.product.identifier === 'leoqo_legends_lifetime') ?? null;
    return { available: !!product, owned: owned(info), product, message: product ? '' : 'The Legends Pack is not available from your store yet. No payment has been taken.' };
  } catch (error) { return { available: false, owned: false, product: null, message: error instanceof Error ? error.message : 'The store could not be reached. Please try again.' }; }
}
export async function buy(product: PurchasesPackage): Promise<boolean> {
  const purchases = await sdk();
  const result = await purchases.purchasePackage(product);
  if (!receiveInfo(result.customerInfo)) throw new Error('Your purchase is still being confirmed. Use Restore purchases before trying to pay again.');
  return true;
}
export async function restore(): Promise<boolean> {
  const purchases = await sdk();
  return receiveInfo(await purchases.restorePurchases());
}
