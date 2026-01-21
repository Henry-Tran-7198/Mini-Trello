<?php
return [

    'paths' => ['api/*'],   // Cho phép tất cả API routes

    'allowed_methods' => ['*'],  // GET, POST, PUT, DELETE,...

    'allowed_origins' => ['http://localhost:5173'], // frontend Vite

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,
];
