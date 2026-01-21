<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;

class TestController extends Controller{
    public function test01(Request $request){
        // $request->validate(): kiểm tra điều kiên data input
        $validated = $request->validate([
            'fullname' => 'required|min:5',
            'email' => 'required|email'
        ]);
        return "Valid data!!!";
    }
    public function test02(){
        return view('netflix');
    }
    public function test03(){
        return 'Test-03';
    }
}