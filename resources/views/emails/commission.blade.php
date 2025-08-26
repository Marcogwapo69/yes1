<x-mail::message>
# Commission

@if ($commission['event'] === 'payout.succeeded')
The agent's commission has been sent to their GCash account. <br>

Agent Details: <br />
Name: {{ $commission['data']['metadata']['agent_name'] }}<br />
Phone #: {{ $commission['data']['metadata']['agent_phone'] }}<br /><br />

## Total Commission
Php{{ number_format($commission['data']['amount'], 2) }}
@else
The commission failed to be settled to the destination account.
@endif


Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
