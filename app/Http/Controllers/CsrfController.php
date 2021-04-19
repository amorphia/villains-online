<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class CsrfController extends Controller
{

    /**
     * Returns the session's CSRF token
     *
     * @return string
     */
    public function csrf()
    {
        return csrf_token();
    }
}
