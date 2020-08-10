@extends( 'layouts.landing' )

@section( 'page', 'landing' )

@section( 'main' )

    <div class="d-flex p-5 align-start justify-center landing">

        <div class="width-30 pt-5 landing__panel">
            <img src="/images/logo-with-blood.png" class="landing__logo width-100 d-block">
        </div>

        <login-register inline-template class="width-30 px-5 landing__panel landing__forms">
            <div>
                <div class="d-flex">
                    <button class="login-button" :class="{ active : mode == 'login' }" @click="mode = 'login'">LOGIN</button>
                    <button class="login-button" :class="{ active : mode == 'register' }" @click="mode = 'register'">REGISTER</button>
                </div>
                <div v-if="mode == 'login'" class="">
                    @include( 'auth.login' )
                </div>
                <div v-if="mode == 'register'" hidden :hidden="mode !== 'register'">
                    @include( 'auth.register' )
                </div>
            </div>
        </login-register>
    </div>
@endsection
