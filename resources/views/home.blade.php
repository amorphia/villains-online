@extends( 'layouts.layout' )

@push( 'header-scripts' )
    <script>
        App.user = {
            'name' : '{{ $user->name }}',
            'uuid' : '{{ $user->uuid }}',
            'admin' : {{ $user->admin }}
        };
        App.server = '{{ $game_server }}';
    </script>
@endpush

@section( 'page', 'home' )

@section( 'content' )

    <villains-online></villains-online>
@endsection

@push( 'scripts' )
    <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.3.0/socket.io.slim.js"></script>
@endpush
