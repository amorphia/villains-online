@extends('layouts.landing')

@section('main')

<div class="splash__buttons p-5 width-40 pull-center">
    <div class="form-label">{{ __('Verify Your Email Address') }}</div>
    @if (session('resent'))
        <div class="alert alert-success" role="alert">
            {{ __('A fresh verification link has been sent to your email address.') }}
        </div>
    @endif

    {{ __('Before proceeding, please check your email for a verification link.') }}
    {{ __('If you did not receive the email') }},
    <form class="d-inline" method="POST" action="{{ route('verification.resend') }}">
        @csrf
        <button type="submit" class="">{{ __('click here to request another') }}</button>.
    </form>

</div>

@endsection
