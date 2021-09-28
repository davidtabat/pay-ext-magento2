# CM.com Payments Magento 2 module

1. [Get started](#get-started)
2. [Installation & Update the CM.com Payments Magento 2 plugin](#installation--update-the-cmcom-payments-magento-2-plugin)
2. [About CM.com Payments](#about-cmcom-payments)
3. [Supported CM.com Payments Methods](#supported-cmcom-payments-methods)
4. [Requirements](#requirements)
5. [Setup local development environment](#setup-local-development-environment)
5. [Payment methods](#payment-methods)

## Get started

Before you begin to integrate Magento with the CM.com payments platform, make sure that you have performed the following steps: 

1. Sign up for a test account with CM.com Payments at https://www.cm.com/register/?app=81e52ab7-4cfc-4b89-8ae8-f5be73bab15d&product=PAYMENTMETHODS
2. Create a payment method profile in the CM Portal
3. Install and configure the magento module

## Installation & Update the CM.com Payments Magento 2 plugin

1. Installation by Composer

```
composer require cmdotcom/payments
```

```
php bin/magento module:enable CM_Payments
php bin/magento setup:upgrade
php bin/magento cache:clean
```

If Magento® is running in production mode, deploy the static content:

```
php bin/magento setup:static-content:deploy
```

2. Update by Composer

```
composer update cmdotcom/payments
```

```
php bin/magento setup:upgrade
php bin/magento cache:clean
```

If Magento® is running in production mode, deploy the static content:

```
php bin/magento setup:static-content:deploy
```

3. Configuration
   To configure the CM.com Payments extension you can go to your Magento® 2 admin portal, to **Stores** > **Configuration** > **CM.com Payments**
   1. **General settings:** Set ‘Enabled’ to ‘Yes’
   2. **General settings:**  Enter the Test and/or API key of your webshop. You received the API credentials by email from CM.com Payments (register link).
   3. **General settings:** set payment method profile that is configured in the CM Portal 
   4. **Payment methods:** Configure each payment method you would like to offer in your webshop
   5. **Magento:** refresh the caches after saving the configuration

## About CM.com Payments

https://www.cm.com/payments

## Supported CM.com Payments Methods

Payments via Menu

- iDEAL, iDEAL QR
- Banktransfer
- Credit Cards (American Express, Mastercard, Maestro, Visa, V-Pay)
- Bancontact, Bancontact Mobile
- Sofortüberweisung, EBanking
- Paysafecard
- ELV
- Giropay
- KBC, CBC
- Belfius Pay Button
- ING Home Pay
- Giftcards
- Point of Sale
- Apple Pay, Apple Business Chat
- Google Pay
- PayPal
- Sepa Direct Debit
- Afterpay
- Klarna
- Przelewy24, BLIK

## Requirements

- Magento Open Source version 2.3.x & 2.4.x
- PHP 7.3+

## Setup local development environment

Setup local development environment with installed extension

```
mkdir extensions
git clone git@github.com:cmdotcom/pay-ext-magento2.git
composer config repositories.dev-extensions path extensions/* 
composer require cmdotcom/payments:@dev
bin/magento module:enable CM_Payments
bin/magento setup:upgrade
```

**Docker setup**
https://github.com/markshust/docker-magento

## Payment methods
### Fetch payment methods by order
CM.com api requires an order to retrieve all the payment methods, to accomplish this in the Magento checkout this module creates a temporary order based on the Magento quote. These temporary orders will always have a 'Q_' prefix. 

## Payment method configuration
### General
Each payment method is configurable in Magento. There are a few default settings: 
- Enabled
- Title
- Applicable countries
- Applicable currencies
- Minimum order total
- Maximum order total
- Sort order

**Note** The payment methods will only visible if they enabled in both Magento as CM.com portal. 

### CM.com redirect to Menu
This payment method redirects to the CM.com payment menu.

### Ideal
This method shows the bank issuers in the Magento checkout and redirects directly to the selected issuer. 

### Paypal
This method directly redirects to the Paypal payment page.

### Creditcard
All the 'Creditcard' payment methods are mapped under one Magento payment method called `cm_payments_creditcard`
This includes the following CM.com payment methods:
`VISA`
`MASTERCARD`
`MAESTRO`

**Configuration**\
The creditcard payment redirects to the CM.com payment menu. It's recommended to create a separate 'Creditcard' payment profile in the CM.com portal to show only the credit card methods in the CM.com payment menu.

### BanContact
The BanContact payment redirects to the CM.com payment menu. It's recommended to create a separate 'BanContact' payment profile in the CM.com portal to show only the BanContact method in the CM.com payment menu.
