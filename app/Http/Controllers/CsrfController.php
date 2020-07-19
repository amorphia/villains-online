<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class CsrfController extends Controller
{
    public function csrf()
    {
        return csrf_token();
    }
}
