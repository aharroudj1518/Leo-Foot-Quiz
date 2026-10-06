import { Platform } from 'react-native';
import Constants from 'expo-constants';
import type { CustomerInfo, PurchasesPackage } from 'react-native-purchases';
import editorial from '../content/editorial-status.json';

export const ENTITLEMENT = 'legends';
export type Shop = { available: boolean; owned: boolean; product: PurchasesPackage | null; message: string };
export type PurchaseSupport = { appUserId: string | null };
let configured = false;
// Called only after the adult purchase step, never on child/guest app startup.
async function sdk() {
  if (!editorial.independentEditorialApproval || process.env.EXPO_PUBLIC_COMMERCE_READY !== 'true') throw new Error('The shop is not open in this build. No payment has been taken. Try the free preview below.');
  if (Platform.OS === 'web' || Constants.appOwnership === 'expo') throw new Error('Purchases are available in the Android and iPhone store builds. You can keep playing free here.');
  const key = Platform.OS === 'ios' ? process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY : process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;
  const keyPattern = Platform.OS === 'ios' ? /^appl_[A-Za-z0-9_-]+$/ : /^goog_[A-Za-z0-9_-]+$/;
  if (!key || !keyPattern.test(key)) throw new Error('The shop is not open in this build. No payment has been taken.');
  const { default: Purchases } = await import('react-native-purchases');
  if (!configured) { Purchases.configure({ apiKey: key }); configured = true; }
  return Purchases;
}
function owned(info: CustomerInfo) { return !!info.entitlements.active[ENTITLEMENT]; }
// Read an existing anonymous customer only. This must never initialise billing
// from Settings, free play or the privacy screen, or affect a verified purchase.
export async function getPurchaseSupport(): Promise<PurchaseSupport | null> {
  if (!configured) return null;
  try {
    const { default: Purchases } = await import('react-native-purchases');
    const appUserId = await Purchases.getAppUserID();
    return { appUserId: typeof appUserId === 'string' && appUserId.trim() ? appUserId : null };
  } catch { return { appUserId: null }; }
}
export async function loadShop(): Promise<Shop> {
  try {
    const purchases = await sdk();
    const [info, offerings] = await Promise.allSettled([purchases.getCustomerInfo(), purchases.getOfferings()]);
    if (info.status === 'rejected') throw info.reason;
    const hasPack = owned(info.value);
    // Product availability and an existing purchase are independent. An offers
    // outage must never lock a pack whose entitlement was just verified.
    if (offerings.status === 'rejected') {
      return { available: false, owned: hasPack, product: null, message: hasPack
        ? 'Your Legends Pack is unlocked. Store offers could not be loaded, but you can keep playing.'
        : 'The store could not be reached. No payment has been taken. Please try again.' };
    }
    const product = offerings.value.current?.availablePackages.find(p => p.product.identifier === 'leoqo_legends_lifetime') ?? null;
    return { available: !!product, owned: hasPack, product, message: product || hasPack ? '' : 'The Legends Pack is not available from your store yet. No payment has been taken.' };
  } catch (error) { return { available: false, owned: false, product: null, message: error instanceof Error ? error.message : 'The store could not be reached. Please try again.' }; }
}
export async function buy(product: PurchasesPackage): Promise<boolean> {
  const purchases = await sdk();
  const result = await purchases.purchasePackage(product);
  if (!owned(result.customerInfo)) throw new Error('Your purchase is still being confirmed. Use Restore purchases before trying to pay again.');
  return true;
}
export async function restore(): Promise<boolean> {
  const purchases = await sdk();
  return owned(await purchases.restorePurchases());
}
