<x-mail::message>
# {{ config('app.name') }} Payout Status

@if ($payout['event'] === 'payout.succeeded')
## Payout Sent!

Your payout has been credited to your bank account.

<x-mail::panel>
Account Holder: **{{ $payout['data']['account_holder_name'] }}**<br />
Bank: **{{ $payout['data']['channel_code'] }}**<br />
Amount: **{{ number_format($payout['data']['amount'], 2) }}**<br />
</x-mail::panel>

@elseif ($payout['event'] === 'payout.failed' && $payout['data']['failure_code'] === 'INVALID_DESTINATION')
## Payout Failed!

The destination bank account doesn't exists, please make sure you have entered the correct account number, and try again.

<x-mail::panel>
Account Holder: **{{ $payout['data']['account_holder_name'] }}**<br />
Bank: **{{ $payout['data']['channel_code'] }}**<br />
Account #: **{{ $payout['data']['account_number'] }}**<br />
Amount: **{{ number_format($payout['data']['amount'], 2) }}**<br />
</x-mail::panel>

Please contact **{{config('app.name')}}** for more details.

@elseif ($payout['event'] === 'payout.failed' && $payout['data']['failure_code'] === 'REJECTED_BY_CHANNEL')
## Payout Failed!

The Bank networks have rejected the transaction due to maintenance or unknown reason.

<x-mail::panel>
Account Holder: **{{ $payout['data']['account_holder_name'] }}**<br />
Bank: **{{ $payout['data']['channel_code'] }}**<br />
Account #: **{{ $payout['data']['account_number'] }}**<br />
Amount: **{{ number_format($payout['data']['amount'], 2) }}**<br />
</x-mail::panel>

Please contact **{{config('app.name')}}** for more details.

@elseif ($payout['event'] === 'payout.failed' && $payout['data']['failure_code'] === 'INSUFFICIENT_BALANCE')
## Payout Failed!

There's not enough balance to {{ config('app.name') }}'s account to proceed with the payout. Please contact the admin for more details.

<x-mail::panel>
Account Holder: **{{ $payout['data']['account_holder_name'] }}**<br />
Bank: **{{ $payout['data']['channel_code'] }}**<br />
Account #: **{{ $payout['data']['account_number'] }}**<br />
Amount: **{{ number_format($payout['data']['amount'], 2) }}**<br />
</x-mail::panel>

Please contact **{{config('app.name')}}** for more details.

@elseif ($payout['event'] === 'payout.failed')
## Payout Failed!

The payout system encountered an error. Either the bank network is experiencing downtime issues or your payout has expired. Please contact the admin for more information.

<x-mail::panel>
Account Holder: **{{ $payout['data']['account_holder_name'] }}**<br />
Bank: **{{ $payout['data']['channel_code'] }}**<br />
Account #: **{{ $payout['data']['account_number'] }}**<br />
Amount: **{{ number_format($payout['data']['amount'], 2) }}**<br />
</x-mail::panel>

Please contact **{{config('app.name')}}** for more details.
@endif

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
