# Purchase ownership lifecycle

The native store adapter now listens to RevenueCat CustomerInfo changes. Active Legends entitlements update the UI after purchases, restores and SDK-delivered ownership changes, including revocations. Returning to the foreground requests CustomerInfo again after the SDK has been configured. RevenueCat caching and refresh timing apply; this does not claim instant refund delivery.

A failed CustomerInfo request disables purchasing and retains only ownership already verified in the current process. It does not convert a network error into a revocation. A successful response without the entitlement removes access. No ownership flag is persisted in the editable quiz profile. After a fresh launch the adult store step is still required to configure the SDK and retrieve its customer information.

UI observation and foreground events before store configuration do not initialize RevenueCat. The preview commerce flag and independent editorial release gate remain closed. No real charge has been tested or enabled.

Validation: native SDK mocks cover a grant followed by revocation, observer cleanup, offline status refresh, and later successful revocation. Store sandbox purchase/refund/restore validation on Android and iOS is still required once accounts and products are configured.

Reference: https://www.revenuecat.com/docs/customers/customer-info

## Pending payment and error handling — 11 September

Checkout now treats RevenueCat PAYMENT_PENDING_ERROR and a completed purchase callback without an active entitlement as awaiting confirmation. In that state the shop disables another checkout and offers Check purchase status (restore), while the free preview remains available. An empty restore does not falsely report a pending payment as absent. A later active entitlement clears the pending state through restore, customer-info refresh or the SDK listener. Concurrent checkout calls are rejected before invoking the SDK twice.

Pending state is in process memory, not an entitlement or persistent receipt. A restart re-queries the store after the adult step. Cancellation of a deferred payment outside the app, approval after process death and cross-device restores still require real native sandbox acceptance; the current code does not claim those scenarios are verified. Pending access is never granted provisionally.

SDK cancellation, account ownership conflicts, device restrictions and generic store failures now produce controlled user-facing messages. Native diagnostic strings are not rendered as purchase/restore notices. Errors concerning potentially completed payments direct the player to restore without claiming that no charge occurred. Build-closed messages still truthfully state that no checkout was attempted.

Billing tests now isolate module state between cases. Nine new cases cover pending approval, absent entitlement, duplicate checkout, cancellation, existing ownership, store/network failures, permissions and failed restore. All 96 unit tests, TypeScript, Expo web export and the four desktop/phone adult-shop/free-network checks passed. These checks use SDK mocks or the disabled web shop; they are not real transaction evidence.

This change is prepared for the next native release. The running Android 0.5.2 build and completed iOS simulator 0.5.2 artifact use source dbfd4b85a512210e55bd3611b43f6c0252ed0051 and do not contain these later purchase changes.

Error semantics checked against the installed react-native-purchases 10.9 type declarations and https://www.revenuecat.com/docs/test-and-launch/errors.
