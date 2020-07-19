@extends('layouts.landing')

@section('main')

<form class="splash__buttons p-5 width-40 pull-center" method="POST" action="{{ route('password.update') }}">
    @csrf
    <input type="hidden" name="token" value="{{ $token }}">

    <div class="form-group">
        <label for="email" class="form-label">{{ __('E-Mail Address') }}</label>
        <input id="email" type="email" class="form-control @error('email') is-invalid @enderror" name="email" value="{{ $email ?? old('email') }}" required autocomplete="email" autofocus>
        @error('email')
            <span class="invalid-feedback" role="alert">{{ $message }}</span>
        @enderror
    </div>

    <div class="form-group row">
        <label for="password" class="form-label">{{ __('Password') }}</label>
        <input id="password" type="password" class="form-control @error('password') is-invalid @enderror" name="password" required autocomplete="new-password">
        @error('password')
            <span class="invalid-feedback" role="alert">{{ $message }}</span>
        @enderror
    </div>

    <div class="form-group row">
        <label for="password-confirm" class="form-label">{{ __('Confirm Password') }}</label>
        <input id="password-confirm" type="password" class="form-control" name="password_confirmation" required autocomplete="new-password">
    </div>

    <div class="form-group">
        <button type="submit" class="btn btn-primary">{{ __('Reset Password') }}</button>
    </div>
</form>

@endsection
