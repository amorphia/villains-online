<!doctype html>

<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>

    <!-- Metadata -->
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
    <meta name="robots" content="index, follow">
    <meta name="referrer" content="always">
    <meta name="description" content="Jeremy Kalgreen's Villains Online">
    <title>{{ config( 'app.name' ) }}</title>

    <!-- Icons -->
    <link rel="apple-touch-icon" href="/favicons/apple-touch-icon.png">

    <!-- Scripts -->
    <script>
        window.App = window.App || {};
    </script>

    @stack('header-scripts')

    <script src="{{ mix('js/client.js') }}" defer></script>

    <!-- CSS -->
    <link href="{{ mix('css/app.css') }}" rel="stylesheet">

    <!-- FONTS -->
    <link rel="dns-prefetch" href="//fonts.gstatic.com">
    <link href='https://fonts.googleapis.com/css?family=Abel|Teko|Oswald?subsets=latin' rel='stylesheet' type='text/css'>

</head>
<body id="top" class="@yield( 'page' )">
<div id="app">

    <vue-csrf></vue-csrf>
    @include( 'partials.mobile_warning' )

    <div class="main tablet-up-only">
        @yield( 'content' )
    </div>
</div>

@stack('scripts')

</body>
</html>
