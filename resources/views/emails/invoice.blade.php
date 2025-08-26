<x-mail::message>
# Invoice

Here's the link to settle your payment.

<x-mail::button :url="$invoice_url">
Settle your payment
</x-mail::button>

If you can't click the checkout button, you can visit this link:

<a href="{{ $invoice_url }}" style="color: blue; text-decoration: underline;">
    {{ $invoice_url }}
</a><br /><br />

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
