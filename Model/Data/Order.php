<?php
/**
 * Copyright © 2021 cm.com. All rights reserved.
 * See LICENSE.txt for license details.
 */

declare(strict_types=1);

namespace CM\Payments\Model\Data;

use CM\Payments\Api\Model\Data\OrderInterface;
use Magento\Framework\Model\AbstractExtensibleModel;

class Order extends AbstractExtensibleModel implements OrderInterface
{
    protected $_eventPrefix = 'cm_payments_order';

    /**
     * @inheritDoc
     */
    public function getOrderId(): int
    {
        return $this->getData(self::ORDER_ID);
    }

    /**
     * @inheritDoc
     */
    public function setOrderId(int $orderId): OrderInterface
    {
        return $this->setData(self::ORDER_ID, $orderId);
    }

    /**
     * @inheritDoc
     */
    public function getOrderKey(): string
    {
        return $this->getData(self::ORDER_KEY);
    }

    /**
     * @inheritDoc
     */
    public function setOrderKey(string $orderKey): OrderInterface
    {
        return $this->setData(self::ORDER_KEY, $orderKey);
    }
}
