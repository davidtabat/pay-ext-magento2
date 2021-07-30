/*
 * Copyright © CM.com. All rights reserved.
 * See LICENSE.txt for license details.
 */

define([
    'Magento_Checkout/js/view/payment/default',
    'Magento_Checkout/js/action/redirect-on-success',
    'mage/url',
    'jquery'
], function (
    Component,
    redirectOnSuccessAction,
    url,
    $
) {
    'use strict';
    return Component.extend({
        defaults: {
            template: 'CM_Payments/payment/elv',
            iban: null,
            paymentConfig: ''
        },

        /**
         * Init observable
         *
         * @returns {*}
         */
        initObservable: function () {
            this._super();
            this.paymentConfig = window.checkoutConfig.payment[this.item.method];

            return this;
        },

        /**
         * Get payment method form
         *
         * @returns {*|define.amd.jQuery|HTMLElement}
         */
        getForm: function () {
            return $('#' + this.item.method + '-form');
        },

        /**
         * Get the gateway image
         *
         * @returns {string}
         */
        getImage: function () {
            return this.paymentConfig.image;
        },

        /**
         * Add extra data to request payload paymentInformation
         *
         * @returns {{additional_data: {iban: *}, method}}
         */
        getData: function () {
            return {
                'method': this.item.method,
                'additional_data': {
                    "iban": this.iban
                }
            };
        },

        /**
         * Validate form
         *
         * @returns {*}
         */
        validate: function () {
            let $form = this.getForm().validation()
            return $form.validation() && $form.validation('isValid');
        },

        /**
         * Redirect to controller after place order
         */
        afterPlaceOrder: function () {
            redirectOnSuccessAction.redirectUrl = url.build('cmpayments/payment/elvredirect');
            this.redirectAfterPlaceOrder = true;
        }
    });
});
