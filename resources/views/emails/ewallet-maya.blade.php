<x-mail::message>
# {{ config('app.name')}} Payment Link

Here's the link to settle your payment.<br /><br />

<x-mail::button url="{{ $payment->actions->desktop_web_checkout_url }}">
    Pay Now
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
