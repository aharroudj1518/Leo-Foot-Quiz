import { Platform } from 'react-native';
import Constants from 'expo-constants';
import type { CustomerInfo, PurchasesPackage } from 'react-native-purchases';
import editorial from '../content/editorial-status.json';
import {readPurchaseRecovery,writePurchaseRecovery} from './storage';

export const ENTITLEMENT = 'legends';
export const LEGENDS_PRODUCT = 'leoqo_legends_lifetime';
function isLegendsLifetime(product:PurchasesPackage) {
  const item=product.product;
  return item.identifier===LEGENDS_PRODUCT
    && item.productCategory==='NON_SUBSCRIPTION'
    && item.subscriptionPeriod===null
    && ['NON_CONSUMABLE','UNKNOWN'].includes(item.productType)
    && ['LIFETIME','CUSTOM'].includes(product.packageType);
}
export type Shop = { available: boolean; owned: boolean; pending: boolean; needsRestore: boolean; product: PurchasesPackage | null; message: string };
export class BillingFailure extends Error {
  constructor(public kind:'pending'|'cancelled'|'restore'|'unavailable',message:string){super(message);this.name='BillingFailure';}
  get userCancelled(){return this.kind==='cancelled';}
}
const pendingMessage='Your purchase is waiting for confirmation. Follow the instructions from Apple or Google, then check your purchase status. You can keep playing free.';
let configured = false;
let lastOwnership = false;
let pending = false;
let buying = false;
let needsRestore = false;
let recoveryReady:Promise<void>|undefined;
let recoveryWrites:Promise<void>=Promise.resolve();
function persistRecovery(unresolved:boolean|'pending') {
  const next=recoveryWrites.catch(()=>{}).then(()=>writePurchaseRecovery(unresolved==='pending'?'pending':unresolved?'1':'0'));
  recoveryWrites=next;
  return next;
}
async function loadRecovery() {
  if(!recoveryReady)recoveryReady=readPurchaseRecovery().then(value=>{if(value==='pending')pending=true;else if(value!==null&&value!=='0')needsRestore=true;}).catch(()=>{
    recoveryReady=undefined;
    throw new BillingFailure('unavailable','Purchase recovery could not be read. Restart the app and try again. No new payment was started.');
  });
  await recoveryReady;
}
const restoreMessage='The store could not confirm your purchase. Use Restore purchases to check its status before trying to buy again.';
const ownershipListeners = new Set<(value: boolean) => void>();
function receiveInfo(info: CustomerInfo) {
  lastOwnership = owned(info);
  if(lastOwnership){pending=false;needsRestore=false;void persistRecovery(false).catch(()=>{});}
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
  if (!editorial.independentEditorialApproval || process.env.EXPO_PUBLIC_COMMERCE_READY !== 'true') throw new BillingFailure('unavailable','The shop is not open in this build. No payment has been taken. Try the free preview below.');
  if (Platform.OS === 'web' || Constants.appOwnership === 'expo') throw new BillingFailure('unavailable','Purchases are available in the Android and iPhone store builds. You can keep playing free here.');
  const key = Platform.OS === 'ios' ? process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY : process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;
  if (!key || key.startsWith('test_')) throw new BillingFailure('unavailable','The shop is not open in this build. No payment has been taken.');
  await loadRecovery();
  try {
    const { default: Purchases } = await import('react-native-purchases');
    if (!configured) {
      Purchases.configure({ apiKey: key }); configured = true;
      Purchases.addCustomerInfoUpdateListener(receiveInfo);
    }
    return Purchases;
  }catch{throw new BillingFailure('unavailable','The store could not be opened. Please try again later.');}
}
function owned(info: CustomerInfo) { return !!info.entitlements.active[ENTITLEMENT]; }
function shopState(product:PurchasesPackage|null,message=''):Shop {
  return {available:!!product&&!pending&&!needsRestore,owned:lastOwnership,pending,needsRestore,product,message:pending?pendingMessage:needsRestore?restoreMessage:message};
}
function storeFailure(error:unknown,codes:typeof import('react-native-purchases').PURCHASES_ERROR_CODE):BillingFailure {
  if(error instanceof BillingFailure)return error;
  const code=typeof error==='object'&&error!==null&&'code' in error?String(error.code):'';
  if(code===codes.PURCHASE_CANCELLED_ERROR)return new BillingFailure('cancelled','Purchase cancelled. No pack was unlocked.');
  if(code===codes.PAYMENT_PENDING_ERROR){pending=true;return new BillingFailure('pending',pendingMessage);}
  if(code===codes.PRODUCT_ALREADY_PURCHASED_ERROR||code===codes.RECEIPT_ALREADY_IN_USE_ERROR||code===codes.RECEIPT_IN_USE_BY_OTHER_SUBSCRIBER_ERROR)return new BillingFailure('restore','This purchase is linked to a store account already. Use Restore purchases with the account that bought the pack.');
  if(code===codes.PURCHASE_NOT_ALLOWED_ERROR||code===codes.INSUFFICIENT_PERMISSIONS_ERROR)return new BillingFailure('unavailable','Purchases are not allowed on this device. Check your Apple or Google account settings.');
  if(code===codes.OPERATION_ALREADY_IN_PROGRESS_ERROR)return new BillingFailure('unavailable','A store request is already running. Wait for it to finish.');
  return new BillingFailure('restore','The store could not confirm this request. Check your connection and use Restore purchases before trying to buy again.');
}
export async function loadShop(): Promise<Shop> {
  try {
    const purchases = await sdk();
    let info: CustomerInfo;
    try { info = await purchases.getCustomerInfo(); receiveInfo(info); }
    catch { return shopState(null,'Purchase status could not be refreshed. Your last verified access is unchanged. Try again when connected.'); }
    // Ownership does not depend on the catalogue being reachable.
    let offerings;
    try { offerings = await purchases.getOfferings(); }
    catch { return shopState(null,'The store catalogue could not be reached. Your verified pack access is unchanged. Try again later.'); }
    const candidate = offerings.current?.availablePackages.find(p => p.product.identifier === LEGENDS_PRODUCT) ?? null;
    if(candidate&&!isLegendsLifetime(candidate))return shopState(null,'The store listing does not match this one-time pack. Checkout is unavailable while it is corrected. No payment has been taken.');
    const product=candidate;
    return shopState(product,product ? '' : 'The Legends Pack is not available from your store yet. No payment has been taken.');
  } catch (error) { return {available:false,owned:false,pending:false,needsRestore:false,product:null,message:error instanceof BillingFailure?error.message:'The store could not be reached. Please try again.'}; }
}
export async function buy(product: PurchasesPackage): Promise<boolean> {
  if(!isLegendsLifetime(product))throw new BillingFailure('unavailable','This store listing does not match the one-time Legends Pack. No payment was started.');
  if(buying)throw new BillingFailure('unavailable','A store request is already running. Wait for it to finish.');
  if(pending)throw new BillingFailure('pending',pendingMessage);
  if(needsRestore)throw new BillingFailure('restore',restoreMessage);
  buying=true;
  try {
    const purchases = await sdk();
    // A cold-start call must also honour the marker loaded by sdk().
    if(pending)throw new BillingFailure('pending',pendingMessage);
    if(needsRestore)throw new BillingFailure('restore',restoreMessage);
    try{await persistRecovery(true);}
    catch{needsRestore=true;throw new BillingFailure('unavailable','Purchase recovery could not be saved. No payment was started. Use Restore purchases before trying again.');}
    try {
      const result = await purchases.purchasePackage(product);
      if (!receiveInfo(result.customerInfo)){pending=true;throw new BillingFailure('pending',pendingMessage);}
      return true;
    }catch(error){
      const failure=storeFailure(error,purchases.PURCHASES_ERROR_CODE);
      if(failure.kind==='pending')await persistRecovery('pending').catch(()=>{});
      if(failure.kind==='restore')needsRestore=true;
      if(failure.kind==='cancelled'){
        try{await persistRecovery(false);}catch{needsRestore=true;}
      }else if(failure.kind==='unavailable')needsRestore=true;
      throw failure;
    }
  }finally{buying=false;}
}
export async function restore(): Promise<boolean> {
  const purchases = await sdk();
  try{
    const info=await purchases.restorePurchases();
    // A confirmed empty restore resolves an uncertain checkout. A known pending
    // payment still waits for store approval, including after another restart.
    if(!pending||owned(info))await persistRecovery(false);
    needsRestore=false;
    return receiveInfo(info);
  }
  catch(error){throw storeFailure(error,purchases.PURCHASES_ERROR_CODE);}
}
