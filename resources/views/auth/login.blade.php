<form class="glass pull-center" method="POST" action="{{ route('login') }}">
    @csrf

    <div class="form-group">
        <label for="email" class="form-label">{{ __('E-Mail Address') }}</label>
        <input id="email" type="email" class="form-element @error('email') is-invalid @enderror" name="email" value="{{ old('email') }}" required autocomplete="email" autofocus>
        @error('email')
            <span class="form-error" role="alert">{{ $message }}</span>
        @enderror
    </div>

    <div class="form-group">
        <label for="password" class="form-label">{{ __('Password') }}</label>
        <input id="password" type="password" class="form-element @error('password') is-invalid @enderror" name="password" required autocomplete="current-password">
        @error('password')
            <span class="form-error" role="alert">{{ $message }}</span>
        @enderror
    </div>

    <div class="form-group d-flex align-baseline">
        <div class="form-label">{{ __('Remember Me') }}</div>
        <input class="d-none form-checkbox" type="checkbox" name="remember" id="remember" {{ old('remember') ? 'checked' : '' }}>
        <label class="form-label icon-checkbox" for="remember"></label>
    </div>

    <div class="form-group">
        <button type="submit" class="form-submit">{{ __('Login') }}</button>

        @if (Route::has('password.request'))
            <a class="btn" href="{{ route('password.request') }}">
                {{ __('Forgot Your Password?') }}
            </a>
        @endif
    </div>
</form>

