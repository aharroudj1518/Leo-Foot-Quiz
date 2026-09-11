# Purchase ownership lifecycle

The native store adapter now listens to RevenueCat CustomerInfo changes. Active Legends entitlements update the UI after purchases, restores and SDK-delivered ownership changes, including revocations. Returning to the foreground requests CustomerInfo again after the SDK has been configured. RevenueCat caching and refresh timing apply; this does not claim instant refund delivery.

A failed CustomerInfo request disables purchasing and retains only ownership already verified in the current process. It does not convert a network error into a revocation. A successful response without the entitlement removes access. No ownership flag is persisted in the editable quiz profile. After a fresh launch the adult store step is still required to configure the SDK and retrieve its customer information.

UI observation and foreground events before store configuration do not initialize RevenueCat. The preview commerce flag and independent editorial release gate remain closed. No real charge has been tested or enabled.

Validation: native SDK mocks cover a grant followed by revocation, observer cleanup, offline status refresh, and later successful revocation. Store sandbox purchase/refund/restore validation on Android and iOS is still required once accounts and products are configured.

Reference: https://www.revenuecat.com/docs/customers/customer-info
