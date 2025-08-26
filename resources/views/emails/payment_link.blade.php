<x-mail::message>
# Payment

Hello {{ $payment_link->name }}, you can pay your dues by clicking the button below. <br /><br />

Amount due  : <br />
**PHP{{ number_format($payment_link->amount, 2) }}**<br /><br />

<x-mail::button url="{{ config('app.url') }}/pay?auth={{ $payment_link->unique_code }}">
    Pay Now
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
