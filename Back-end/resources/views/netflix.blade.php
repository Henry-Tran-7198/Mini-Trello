<h1>Account</h1>
<form action="/netflix" method="post">
    @csrf
    <label>Name: </label>
    <input type="text" name="fullname"/>
    <br/>
    <br/>
    <label>Email: </label>
    <input type="text" name="email"/>
    <br/>
    <br/>
    <button type="submit" name='btn'>Submit</button>
</form>