<?php
return [

    'paths' => ['api/*'],   // Cho phép tất cả API routes

    'allowed_methods' => ['*'],  // GET, POST, PUT, DELETE,...

    'allowed_origins' => ['http://localhost:5173', 'http://localhost:5174', 'http://192.168.100.124:5173', 'http://192.168.100.124:5174'], // frontend Vite

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];
