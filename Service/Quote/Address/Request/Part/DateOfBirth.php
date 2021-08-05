<?php
/**
 * Copyright © CM.com. All rights reserved.
 * See LICENSE.txt for license details.
 */

declare(strict_types=1);

namespace CM\Payments\Service\Quote\Address\Request\Part;

use CM\Payments\Api\Service\Shopper\Request\RequestPartByQuoteAddressInterface;
use CM\Payments\Client\Model\Request\ShopperCreate;
use Magento\Customer\Api\CustomerRepositoryInterface;
use Magento\Framework\Exception\LocalizedException;
use Magento\Framework\Exception\NoSuchEntityException;
use Magento\Quote\Api\Data\AddressInterface;

class DateOfBirth implements RequestPartByQuoteAddressInterface
{
    /**
     * @var CustomerRepositoryInterface
     */
    private $customerRepository;

    /**
     * DateOfBirth constructor
     *
     * @param CustomerRepositoryInterface $customerRepository
     */
    public function __construct(
        CustomerRepositoryInterface $customerRepository
    ) {
        $this->customerRepository = $customerRepository;
    }

    /**
     * @inheritDoc
     */
    public function process(AddressInterface $quoteAddress, ShopperCreate $shopperCreate): ShopperCreate
    {
        $shopperCreate->setDateOfBirth('');
        if ($quoteAddress->getCustomerId()) {
            try {
                $customer = $this->customerRepository->getById($quoteAddress->getCustomerId());
                $shopperCreate->setDateOfBirth($customer->getDob());
            } catch (LocalizedException | NoSuchEntityException $e) {
                $shopperCreate->setDateOfBirth('');
            }
        }

        return $shopperCreate;
    }
}
