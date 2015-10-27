# AwesometableJs

create an awesome Table from raw JSON , which this Awesomeness has  sorting ability , searching and filtering , pagination and so ....
  - create full table includes thead and tbody
  - create SearchBox and filtering
  - create Pagination
  - click an header to SortBy that column(or sortby multiple column)
  - create select box for changing table page size
  - a beautiful example that you can use 
  
  ![alt tag](http://farshadjahanmanesh.ir/WATCHME.png "Screenshot")


# how to use
> you can let me to create all html elements for you  , but its better to create your container  elements and put them where you want and style them like a charm , so  
create your html like this :
```sh
<!-- container for SearchBox  -->
<div class="searchContainer"> </div>
<!--container for page size selectbox --> 
<div class="pageSizeContainer"></div>
<!--container for pagination -->
<div class="paginationContainer "></div>
<!--container for awesomeTable -->
 <div class="awesomeTableContiner"> </div>
```
its done , then put this before End tag for body , like this :
```sh
<!-- including lib script  -->
<script src="awesomeTableJs.js"></script>
<script>
//initial table
var aweTbl = new awesomeTableJs({
// a json file or an websrvice that return JSON as its results
// url : 'http://yourUrl/webserviceOrPageOrFileThatReturnJSON' 
url:'example.json',
//how many records should display per table page 
  pageSize:10,
// table container div 
  tableWrapper:".awesomeTableContiner",
// pagination container div
  paginationWrapper:".paginationContainer",
// searchbox container div
  searchboxWrapper:".searchContainer",
// pagesize selectbox div
  pageSizeWrapper:".pageSizeContainer"
});
// then call Awesomeness and wait for it ...
aweTbl.createTable();
</script>
```

here is an expected JSON (your json should looklike this):
```sh
[ 
    ...
    ...
    { 
      "index": 0,
      "isActive": false,
      "picture": "http://placehold.it/32x32",
      "age": 24,
      "name": "Rosalinda Monroe",
      "gender": "female",
      "email": "rosalindamonroe@equitax.com",
      "registered": "2014-02-07",
      .. (more)
    },
      "index": 1,
      "isActive": true,
      "picture": "http://placehold.it/32x32",
      "age": 35,
      "name": "Sharon Schwartz",
      "gender": "female",
      "email": "sharonschwartz@equitax.com",
      "registered": "2015-07-14",
      .. (more)
    }

    ...(more)
]
```
### Version
0.1.0

### Tech

Only Javascript

### Development
Want to contribute? Great!
help me to make it even better

### Contributors
* [farshadjahanmanesh] 

> This is a open-source project. Fork the project, complete the code and send pull request.

License
----
> Copyright (C) 2015 farshad jahanmanesh (farshadjahanmanesh@gmail.com)

>Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated 
documentation files (the "Software"), to deal in the Software without restriction, including without limitation 
the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, 
and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions 
of the Software.

>THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED 
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL 
THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF 
CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS 
IN THE SOFTWARE.

[farshadjahanmanesh]: <https://github.com/farshadjahanmanesh>
