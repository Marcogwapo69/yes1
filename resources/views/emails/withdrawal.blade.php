<x-mail::message>
# Withdrawal {{ $withdrawal['event'] === 'payout.failed' ? 'Failed' : 'Successful'}}

@if ($withdrawal['event'] === 'payout.succeeded')
You have successfully withdrawn funds amounting to **Php{{ number_format($withdrawal['data']['amount'], 2) }}** from you Xendit Account with a business ID of **{{$withdrawal['business_id']}}**.
@else
@if ($withdrawal['data']['failure_code'] === 'TEMPORARY_TRANSFER_ERROR')
Switching network is experiencing downtime. Kindly try again later. We apologize for the inconvenience.
@elseif ($withdrawal['data']['failure_code'] === 'REJECTED_BY_CHANNEL')
Bank networks have rejected the transaction due to maintenance or unknown reason.
@elseif ($withdrawal['data']['failure_code'] === 'INVALID_DESTINATION')
Destination account does not exist or is invalid.
@elseif ($withdrawal['data']['failure_code'] === 'INSUFFICIENT_BALANCE')
Your Xendit account doesn't have enough balance to proceed with the withdrawal.
@else
A problem with API key permission is detected. Try an API key without the right permissions to perform the request.
@endif
@endif

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
