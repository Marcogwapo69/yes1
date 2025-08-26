<?php

namespace App\Enums;

enum CardPaymentFailures: string
{
    case EXPIRED_CARD = 'EXPIRED_CARD';
    case ISSUER_SUSPECT_FRAUD = 'ISSUER_SUSPECT_FRAUD';
    case DECLINED_BY_PROCESSOR = 'DECLINED_BY_PROCESSOR';
    case INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE';
    case PROCESSOR_ERROR = 'PROCESSOR_ERROR';
    case STOLEN_CARD = 'STOLEN_CARD';
    case INVALID_CVV = 'INVALID_CVV';
    case DECLINED_BY_ISSUER = 'DECLINED_BY_ISSUER';
    case INACTIVE_OR_UNAUTHORIZED_CARD = 'INACTIVE_OR_UNAUTHORIZED_CARD';

    public function getMessage($networkDescriptor): string
    {
        return match ($this) {
            self::EXPIRED_CARD => 'The card has expired.',
            self::ISSUER_SUSPECT_FRAUD => 'The card has been declined by the issuing bank due to potential fraud suspicion.',
            self::DECLINED_BY_PROCESSOR => 'The card has been declined by the payment processor.',
            self::INSUFFICIENT_BALANCE => 'The card does not have sufficient balance.',
            self::PROCESSOR_ERROR => 'There was an issue between the payment processor and the bank. Please try again later.',
            self::STOLEN_CARD => 'The card has been marked as stolen.',
            self::INVALID_CVV => 'The card was declined due to mismatched CVV.',
            self::DECLINED_BY_ISSUER => 'The card is declined by the issuing bank.',
            self::INACTIVE_OR_UNAUTHORIZED_CARD => 'The card was either inactive or unauthorized to perform the transaction.',
        };
    }
}
