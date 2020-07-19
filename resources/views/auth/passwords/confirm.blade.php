@extends('layouts.landing')

@section('main')

<form class="splash__buttons p-5 width-40 pull-center" method="POST" action="{{ route('password.confirm') }}">
    @csrf

    <div class="form-group">
        <label for="password" class="form-label">{{ __('Password') }}</label>
        <input id="password" type="password" class="form-element @error('password') is-invalid @enderror" name="password" required autocomplete="current-password">
        @error('password')
            <span class="invalid-feedback" role="alert">{{ $message }}</span>
        @enderror

    </div>

    <div class="form-group">
            <button type="submit" class="btn btn-primary">
                {{ __('Confirm Password') }}
            </button>

            @if (Route::has('password.request'))
                <a class="btn btn-link" href="{{ route('password.request') }}">
                    {{ __('Forgot Your Password?') }}
                </a>
            @endif
    </div>
</form>

@endsection
