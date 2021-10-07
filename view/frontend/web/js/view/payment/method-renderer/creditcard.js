/*
 * Copyright © CM.com. All rights reserved.
 * See LICENSE.txt for license details.
 */

define([
    'Magento_Checkout/js/view/payment/default',
    'Magento_Checkout/js/action/redirect-on-success',
    'Magento_Checkout/js/model/full-screen-loader',
    'Magento_Payment/js/model/credit-card-validation/credit-card-data',
    'CM_Payments/js/model/validators/creditcard/card-number-validator',
    'CM_Payments/js/action/creditcard/init-payment-information',
    'CM_Payments/js/model/validators/creditcard/3dsv2-validator',
    'CM_Payments/js/model/validators/creditcard/3dsv1-validator',
    'jquery',
    'underscore',
    'mage/url',
    'CM_Payments/js/action/creditcard/get-payment-status'
], function (
    Component,
    redirectOnSuccessAction,
    loader,
    creditCardData,
    cardNumberValidator,
    initCCPaymentAction,
    cc3DSv2Validator,
    cc3DSv1Validator,
    $,
    _,
    url,
    paymentStatus
) {
    'use strict';
    return Component.extend({
        defaults: {
            template: 'CM_Payments/payment/creditcard',
            encryptedData: null,
            cardType: null,
            cardHolder: null,
            cardNumber: null,
            cvv: null,
            selectedMonth: null,
            selectedYear: null,
            paymentConfig: ''
        },

        /**
         * Init observable
         *
         * @returns {*}
         */
        initObservable: function () {
            this._super()
                .observe([
                    'cardType',
                    'cardHolder',
                    'cardNumber',
                    'cvv',
                    'selectedMonth',
                    'selectedYear'
                ]);

            this.paymentConfig = window.checkoutConfig.payment[this.item.method];

            this.loadEncryptionLibrary();
            this.loadNsa3DsLibrary();

            return this;
        },

        /**
         * Init component
         */
        initialize: function () {
            let self = this;

            this._super();
            this.cardNumber.subscribe(function (value) {
                let result,
                    ccNumberField = self.getCreditCardNumberField();

                self.cardType(null);

                if (value === '' || value === null) {
                    ccNumberField.removeClass().addClass('input-cc');

                    return false;
                }
                result = cardNumberValidator(value, self.getCreditCardAllowedTypes());

                if (!result.isPotentiallyValid && !result.isValid) {
                    ccNumberField.removeClass().addClass('input-cc');

                    return false;
                }

                if (result.card !== null) {
                    self.cardType(result.card.type);
                    creditCardData.creditCard = result.card;
                }

                if (result.isValid) {
                    creditCardData.creditCardNumber = value;
                    self.cardType(result.card.type);
                }

                if (self.isCreditCardTypeAllowed(self.cardType())) {
                    ccNumberField.removeClass().addClass('input-' + self.cardType().toLowerCase());
                }
            });

            //Set expiration year to credit card data object
            this.selectedYear.subscribe(function (value) {
                creditCardData.expirationYear = value;
            });

            //Set expiration month to credit card data object
            this.selectedMonth.subscribe(function (value) {
                creditCardData.expirationMonth = value;
            });

            //Set cvv code to credit card data object
            this.cvv.subscribe(function (value) {
                creditCardData.cvvCode = value;
            });
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
         * Get CC number field
         *
         * @returns {*|define.amd.jQuery|HTMLElement}
         */
        getCreditCardNumberField: function () {
            return $('#' + this.item.method + '-form').find('input[name="payment[cc_number]"]');
        },

        /**
         * Get the gateway image
         *
         * @returns {String}
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
                    'data': this.data,
                    'cc_type': this.getCardType()
                }
            };
        },

        /**
         * Load Encryption library
         *
         * @param callback
         */
        loadEncryptionLibrary: function (callback) {
            $.getScript(this.paymentConfig.encryption_library, callback);
        },

        /**
         * Load Nsa3Ds library
         *
         * @param callback
         */
        loadNsa3DsLibrary: function (callback) {
            $.getScript(this.paymentConfig.nsa3ds_library, callback);
        },

        /**
         *
         * @return {boolean|*}
         */
        encryptCreditCardFields: function () {
            if (typeof window.cseEncrypt === 'undefined') {
                console.error('CM.com encryption library is not loaded');
                return false;
            }

            return window.cseEncrypt(
                this.getCardHolder(),
                this.getCardNumber(),
                this.getSelectedMonth(),
                this.getSelectedYear(),
                this.getCvv()
            );
        },

        /**
         * Checks if creditcard mode is set to 'direct'
         *
         * @returns {boolean}
         */
        isDirect: function () {
            return this.paymentConfig.is_direct;
        },

        /**
         * Get allowed CC types icons
         *
         * @returns {Boolean}
         */
        getCreditCardAllowedTypesIcons: function () {
            return this.paymentConfig.allowedTypesIcons;
        },

        /**
         * Get list of allowed credit card types
         *
         * @returns {Object}
         */
        getCreditCardAllowedTypes: function () {
            let configuredAllowedTypes = this.paymentConfig.allowedTypes,
                allowedTypes = [];


            for (let i = 0; i < configuredAllowedTypes.length; i++) {
                allowedTypes.push(configuredAllowedTypes[i].value);
            }

            return allowedTypes;
        },

        /**
         * Get list of allowed credit card types
         *
         * @param {String} cardType
         * @returns {Boolean}
         */
        isCreditCardTypeAllowed: function (cardType) {
            if (cardType) {
                for (let i = 0; i < this.paymentConfig.allowedTypes.length; i++) {
                    if (this.paymentConfig.allowedTypes[i].value == cardType) {
                        return true;
                    }
                }
            }

            return false;
        },

        /**
         * Get array of months
         *
         * @returns {String[]}
         */
        getMonths: function () {
            let months =  ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

            return _.map(months, function (value) {
                return {
                    'value': value,
                    'month': value
                };
            });
        },

        /**
         * Get array of years
         *
         * @returns {String[]}
         */
        getYears: function () {
            let currentYear = new Date().getFullYear(),
                years = [],
                endYear = currentYear + 20;
            while (currentYear <= endYear) {
                years.push(currentYear++);
            }

            return _.map(years, function (value) {
                return {
                    'value': value,
                    'year': value
                };
            });
        },

        /**
         * Get Card Type
         *
         * @returns {String}
         */
        getCardType: function () {
            return this.cardType();
        },

        /**
         * Get Card Holder
         *
         * @returns {String}
         */
        getCardHolder: function () {
            return this.cardHolder();
        },

        /**
         * Get Card Number
         *
         * @returns {String}
         */
        getCardNumber: function () {
            return this.cardNumber();
        },

        /**
         * Get Cvv
         *
         * @returns {String}
         */
        getCvv: function () {
            return this.cvv();
        },

        /**
         * Get selected year
         *
         * @returns {String}
         */
        getSelectedYear: function () {
            let selectedYear = this.selectedYear();

            if (typeof selectedYear !== 'undefined') {
                selectedYear = selectedYear.toString().substr(-2);
            }
            return selectedYear;
        },

        /**
         * Get selected month
         *
         * @returns {String}
         */
        getSelectedMonth: function () {
            return this.selectedMonth();
        },

        /**
         * Get encrypted credit card data
         *
         * @returns {Object}
         */
        getEncryptedCreditCardData: function () {
            return {
                "data": this.encryptCreditCardFields()
            };
        },

        /**
         * Validate form
         *
         * @returns {*}
         */
        validate: function () {
            let $form = this.getForm().validation();
            this.data = this.encryptCreditCardFields();

            return this.data && $form.validation() && $form.validation('isValid');
        },

        /**
         * Place order function
         *
         * @return {boolean}
         */
        placeOrder: function () {
            let self = this;
            if (!this.validate() ||
                this.isPlaceOrderActionAllowed() !== true
            ) {
                return false;
            }

            self.getPlaceOrderDeferredObject().fail(
                function () {
                    loader.stopLoader();
                    self.isPlaceOrderActionAllowed(true);
                }
            ).done(
                function (orderId) {
                    $.when(
                        initCCPaymentAction(self.messageContainer, self.getData(), orderId)
                    ).done(
                        function (payment) {
                            if (!payment) {
                                console.error('No response');
                                return self.redirectToCart('error');
                            }

                            if (payment.status === 'AUTHORIZED') {
                                return this.afterPlaceOrder();
                            }

                            if (payment.status === 'CANCELED') {
                                return self.redirectToCart('canceled');
                            }

                            if (payment.status === 'REDIRECTED_FOR_AUTHENTICATION') {
                                // Check if we got an 3dsv1 or 3dsv2 response based on 'REDIRECT' type in url model.
                                const url = cc3DSv2Validator.findUrlWithPurpose(payment.url, 'REDIRECT');
                                if (payment.redirect_url && url) {
                                    return cc3DSv1Validator.redirectForAuthentication(payment.redirect_url, url)
                                }
                            }

                            const threeDSecureValidation = cc3DSv2Validator.perform3DsSteps(payment);

                            threeDSecureValidation.subscribe(function(validation) {
                                console.log(validation);
                                if (validation.status === 'CHALLENGE') {
                                    if (validation.action === 'REDIRECT') {
                                        return;
                                    }
                                    if (validation.action === 'AUTHENTICATE') {
                                        return self.pollingStatus(payment.id);
                                    }

                                    if (validation.action === 'CLOSE_MODAL') {
                                        loader.startLoader();
                                        return paymentStatus.get(payment.id).then(function(response) {
                                            self.handleOrderStatusResponse(response);
                                        });
                                    }
                                }

                                if (validation.status === 'AUTHORIZED') {
                                    return self.afterPlaceOrder();
                                }

                                if (validation.status === 'ERROR' || validation.status === 'CANCELED') {
                                    return paymentStatus.get(payment.id).then(function(response) {
                                        self.handleOrderStatusResponse(response);
                                    });
                                }
                            })
                        }
                    )
                }
            );

            return false;
        },

        /**
         * Handle order status response
         * @param response
         * @returns {*}
         */
        handleOrderStatusResponse: function(response) {
            if (response.status === 'processing') {
                return this.afterPlaceOrder();
            }

            return this.redirectToCart(response.status, response.order_id);
        },

        /**
         * Redirect to cart
         * @param {string} status
         * @param {string|null} orderId
         */
        redirectToCart: function(status, orderId= null) {
            let redirectUrl = '/cmpayments/payment/result?status='+ status;
            if (orderId) {
                redirectUrl += '&order_reference='+ orderId;
            }
            window.location.replace(
                url.build(redirectUrl)
            );
        },

        /**
         * Polling order status
         * @param paymentId
         */
        pollingStatus: function(paymentId) {
            if (this.startPolling === true) {
                return;
            }
            this.startPolling = true;
            const self = this;
            paymentStatus.pollingStatus(paymentId).then(function(response) {
                self.handleOrderStatusResponse(response);
            }).catch(function(error) {
                return self.redirectToCart('error');
            })
        },

        /**
         * Redirect to controller for payment confirmation after place order
         */
        afterPlaceOrder: function () {
            this.redirectAfterPlaceOrder = true;
            window.location.replace(this.paymentConfig.successPage);
        }
    });
});
