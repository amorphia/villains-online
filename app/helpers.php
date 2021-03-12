<?php

/*
 *  Shorthand to return the currently authenticated user for the current request
 */
function user()
{
    return request()->user();
}

