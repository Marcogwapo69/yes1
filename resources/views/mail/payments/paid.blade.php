<x-mail::message>
# Payment Received

Natanggap na ang kayamanan! Naway yumaman ka ng husto!

Agent name: {{ $transaction->agent_name }} <br/>
Customer name: {{ $transaction->name }} <br/>
Amount: {{ $transaction->amount }}

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
