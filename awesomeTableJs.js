(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['awesomeTableJs'], factory);
    } else {
        // Browser globals
        root.awesomeTableJs = factory(root.awesomeTableJs);
    }
}(this, function() {
    var VERSION = "0.1.7";

    //Acceppted data :
    //var array=[{"Total":"34","Version":"1.0.4","Office":"New York"},{"Total":"67","Version":"1.1.0","Office":"Paris"}];
    //Or Use an url that return a Standard Json
    //functions that contain 'create' in their name , are which export to outside
    //and functiins tha contains 'make' are internal an private
    function AwesomeTableJs(options) {
        //check if a parameter pass to function
        this.globalOptions = {
            url: "",
            data: "",
            pageSize: 15,
            //wrapper: "",
            tableWrapper: "",
            paginationWrapper: "",
            searchboxWrapper: "",
            pageSizeWrapper: "",
            buildSearch: true,
            buildPagination: true,
            buildPageSize: true,
            buildSorting: true,
            columnsTypes: ""
        };
        for (var key in this.globalOptions) {
            if (options.hasOwnProperty(key)) {
                this.globalOptions[key] = options[key];
            }
        }
        if (this.globalOptions.tableWrapper) {
            this.tableWrapper = document.querySelector(this.globalOptions.tableWrapper)
        };

        if (this.globalOptions.searchboxWrapper) {
            this.searchboxWrapper = document.querySelector(this.globalOptions.searchboxWrapper)
        };
        if (this.globalOptions.paginationWrapper) {
            this.paginationWrapper = document.querySelector(this.globalOptions.paginationWrapper)
        };
        if (this.globalOptions.pageSizeWrapper) {
            this.pageSizeWrapper = document.querySelector(this.globalOptions.pageSizeWrapper)
        };
        if (!this.tableWrapper) {
            var divWrapper = create(null, {
                class: "aweTbl-table-wrapper"
            });
            var table = create('table', {
                class: "aweTbl-table",
            });
            this.tableElement = table;
            divWrapper.appendChild(table);
            document.body.appendChild(divWrapper);
        } else {
            var table = create('table', {
                class: "aweTbl-table",
            });
            this.tableElement = table;
            this.tableWrapper.appendChild(table);
        }
        if (!this.paginationWrapper) {
            var divWrapper = create(null, {
                class: "aweTbl-pagination-wrapper"
            });
            this.paginationWrapper = divWrapper;
            document.body.appendChild(divWrapper);
        }
        if (!this.pageSizeWrapper) {
            var divWrapper = create(null, {
                class: "aweTbl-pageCount-wrapper"
            });
            this.pageSizeWrapper = divWrapper;
            document.body.appendChild(divWrapper);
        }

        if (!this.searchboxWrapper) {
            var divWrapper = create(null, {
                class: "aweTbl-searchBox-wrapper"
            });
            this.searchboxWrapper = divWrapper;
            document.body.appendChild(divWrapper);
        }
        //set some variables to use for filtering
        //does user search for somthing in results?
        this.isFiltered=false;
        //using a counter for saveing filteredData
        this.typingCount=null;
        this.jsonKeys = [];
    }
    //Get A WebService Address for Using Its JSon Result
    //options = url,data
    AwesomeTableJs.prototype.createTable = function() {
        if (this.globalOptions.data) {
            findOutDataType.call(this, this.globalOptions.data);
        } else if (this.globalOptions.url) {
            var self = this;
            var httpRequest = new XMLHttpRequest();
            console.log(self, " self");
            var loadingDiv = create(null, {
                innerHTML: "   Loading Json file with 10000 ...  ",
                class : "aweTbl-loading"
            })
            document.createElement('div');
            this.tableWrapper.appendChild(loadingDiv);
            httpRequest.addEventListener("load", getXhrResponse.bind(self,
                httpRequest));
            httpRequest.addEventListener("error", function() {
                throw "requesting that url come with an error \n" + this.responseText;
            });

            httpRequest.addEventListener("abort", function() {
                throw "request canceled by you";
            });

            httpRequest.open("GET", this.globalOptions.url);
            httpRequest.send();
        } else {
            throw "please pass an url ,becuase i want to create table from its json result,or data like an array";
        }
    }

    //Create Pagination
    AwesomeTableJs.prototype.paging = function(inCurrentPage) {
            if (inCurrentPage) {
                var currentPage = parseInt(inCurrentPage)
                console.log(inCurrentPage);
            } else {
                var currentPage = 1;
            };
            if (sessionStorage.awesomeTabledata || sessionStorage.awesomeTableFiltereddata) {
                var result = JSON.parse(this.isFiltered?sessionStorage.awesomeTableFiltereddata:sessionStorage.awesomeTabledata);
                var pageCount = result.length;
                var skip = (currentPage - 1) * this.globalOptions.pageSize;
                var paged = result.splice(skip, this.globalOptions.pageSize);
                makePagination.call(this, pageCount, currentPage);
                changeTableBody.call(this, paged);

            } else {

                this.createTable();
            }
        }
        //its hard to save filtered data, for each key up,so i decide to save data after 2sec on last key up
        //Filter Table
    AwesomeTableJs.prototype.filter = function(inputElement) {
        var filterText = inputElement.value;
        if (sessionStorage.awesomeTabledata) {
            var result = JSON.parse(sessionStorage.awesomeTabledata);
            var filteredArray = [];
            console.log(filterText);
            for (var i = 0, reslen = result.length; i < reslen; i++) {
                for (var j = 0, objLen = this.jsonKeys.length; j < objLen; j++) {
                    if (result[i][this.jsonKeys[j]].toString().match(filterText)) {
                        filteredArray.push(result[i]);
                        break;
                    }
                }
            }
            this.isFiltered=true
            saveFilteredData(filteredArray)
            changeTableBody.call(this, filteredArray);
            makePagination.call(this, filteredArray.length, 1);

        } else {
            this.isFiltered=false
            this.createTable();
        }
    }
    function saveFilteredData(filteredArray){
      console.log(JSON.stringify('start saveing filtered array'));
          this.typingTimer = setTimeout(function(){
            sessionStorage.awesomeTableFiltereddata = JSON.stringify(filteredArray);
          },1000);
    }
    //Sorting
    AwesomeTableJs.prototype.sort = function(headerElement) {
        var key = headerElement.getAttribute('data-sortkey');
        key = key || this.jsonKeys[0];
        var direction = headerElement.getAttribute('data-sortDirection');
        direction = direction || "asc";
        console.log("dirextion : ", direction, " key : ", key);

        if (sessionStorage.awesomeTabledata || sessionStorage.awesomeTableFiltereddata) {
            var result = JSON.parse(this.isFiltered?sessionStorage.awesomeTableFiltereddata:sessionStorage.awesomeTabledata);
            result.sort(makeSort_by(key, direction == "asc", null));
            if(this.isFiltered){
              sessionStorage.awesomeTableFiltereddata = JSON.stringify(result);
            }else {
              sessionStorage.awesomeTabledata = JSON.stringify(result);
            }

            changeTableBody.call(this, result);
            //makePagination.call(this, result.length);

            //remove asc from other
            for (var i = 0, len = this.jsonKeys.length; i < len; i++) {
                headerElement.parentNode.parentNode.childNodes[i].childNodes[0].setAttribute(
                    'data-sortDirection', "asc");
            }
            headerElement.setAttribute('data-sortDirection', direction == "asc" ?
                "desc" : "asc");

        } else {
            this.createTable();
        }
    }

    //Change Page Size
    AwesomeTableJs.prototype.changePageSize = function(pageSize) {
        console.log(pageSize);
        var size = parseInt(pageSize, 10);
        if (size > 0) {
            this.globalOptions.pageSize = size;
        } else {
            var dropDown = document.querySelector('.aweTbl-pageSize');
            if (dropDown) {
                this.globalOptions.pageSize = parseInt(dropDown.value, 10);
            } else {
                this.globalOptions.pageSize = 15;
            }
        }
        this.paging(1);
    }

    function findOutDataType(data) {
        switch (typeof(data)) {
            case "object":
                {
                    if (Array.isArray(data)) {
                        //check for header
                        if (data[0]) {
                            sessionStorage.awesomeTabledata = JSON.stringify(data);
                            makeTable.call(this, data);
                            makeOtherstuff.call(this, data.length);
                        }
                    } else {
                        throw "pass an array with this format : [{'Name':'ronaldo',...},{'Name':'sarah'}]";
                    }
                    break;
                }
            case "string":
                {
                    //check for Json
                    if (/^[\],:{}\s]*$/.test(data.replace(/\\["\\\/bfnrtu]/g, '@').replace(
                            /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
                            ']').replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

                        //the json is ok

                    } else {

                        //the json is not ok

                    }
                    break;
                }
            default:

        }
    }

    function makeSort_by(field, reverse, primer) {
        var key = primer ?
            function(x) {
                return primer(x[field])
            } :
            function(x) {
                return x[field]
            };

        reverse = !reverse ? 1 : -1;

        return function(a, b) {
            return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
        }
    }
    //A lot of HardCode For Creating Pagination -_- ^_^
    function makePagination(resultLeng, currentPage) {
        //find how many page do we need
        var pageCount = Math.ceil(resultLeng / this.globalOptions.pageSize);

        //if there is any pagination,find and remove it
        var prevPagination = document.querySelector(".aweTbl-pagination");
        if (prevPagination) {
            prevPagination.innerHTML = "";
        }
        //create new pagination wrapper element
        var paginationWrapper = prevPagination || document.createElement('Div');
        paginationWrapper.className = "aweTbl-pagination";
        //this object is somthing like 1 2 3 .. 10 12 13 .. 18 19
        //                             first ..  middle  .. last
        var pagingConfig = {
                first: {
                    'start': null,
                    'end': null,
                    'showDot': null
                },
                middle: {
                    'start': null,
                    'end': null,
                },
                last: {
                    'start': null,
                    'end': null,
                    'showDot': null
                }
            }
            // hard code to have a nice pagination
        if (pageCount > 10) {
            if (currentPage <= 3) {
                pagingConfig.first.start = "1";
                pagingConfig.first.end = "5";
                pagingConfig.last.start = pageCount - 1;
                pagingConfig.last.end = pageCount;
                pagingConfig.last.showDot = true;
            } else if (currentPage == 4) {
                pagingConfig.first.start = "1";
                pagingConfig.first.end = "6";
                pagingConfig.last.start = pageCount - 1;
                pagingConfig.last.end = pageCount;
                pagingConfig.last.showDot = true;
            } else if (currentPage == 5) {
                pagingConfig.first.start = "1";
                pagingConfig.first.end = "7";
                pagingConfig.last.start = pageCount - 1;
                pagingConfig.last.end = pageCount;
                pagingConfig.last.showDot = true;
            } else if (currentPage > 5 && pageCount - currentPage > 3) {
                pagingConfig.first.start = "1";
                pagingConfig.first.end = "2";
                pagingConfig.first.showDot = true;
                pagingConfig.middle.start = currentPage - 2;
                pagingConfig.middle.end = currentPage + 2;
                pagingConfig.last.start = pageCount - 1;
                pagingConfig.last.end = pageCount;
                pagingConfig.last.showDot = true;
            } else if (pageCount - currentPage <= 3) {
                pagingConfig.first.start = "1";
                pagingConfig.first.end = "2";
                pagingConfig.first.showDot = true;
                pagingConfig.last.start = currentPage - 5;
                pagingConfig.last.end = pageCount;
            }

            //fisrtPart
            for (var i = pagingConfig.first.start; i <= pagingConfig.first.end; i++) {
                var label = create('a', {
                    class: "aweTbl-pagination-label".concat(i ==
                        currentPage ?
                        " currentPage " : ""),
                    innerHTML: i,
                    href: "javascript:void(0);"
                });
                label.addEventListener("click", this.paging.bind(this, i), false);
                paginationWrapper.appendChild(label);
            }
            if (pagingConfig.first.showDot) {
                // create ..
                var label = create('a', {
                    class: "aweTbl-pagination-label",
                    innerHTML: "..",
                    href: "javascript:void(0);"
                });
                paginationWrapper.appendChild(label);
            }
            //middlePart
            if (pagingConfig.middle.start) {
                for (var i = pagingConfig.middle.start; i <= pagingConfig.middle.end; i++) {
                    var label = create('a', {
                        class: "aweTbl-pagination-label".concat(i ==
                            currentPage ?
                            " currentPage " : ""),
                        innerHTML: i,
                        href: "javascript:void(0);"
                    });
                    label.addEventListener("click", this.paging.bind(this, i), false);
                    paginationWrapper.appendChild(label);
                }
            }
            //LastPart
            if (pagingConfig.last.showDot) {
                // create ..
                var label = create('a', {
                    class: "aweTbl-pagination-label",
                    innerHTML: "..",
                    href: "javascript:void(0);"
                });
                paginationWrapper.appendChild(label);
            }
            for (var i = pagingConfig.last.start; i <= pagingConfig.last.end; i++) {
                var label = create('a', {
                    class: "aweTbl-pagination-label".concat(i == currentPage ?
                        " currentPage " : ""),
                    innerHTML: i,
                    href: "javascript:void(0);"
                });
                label.addEventListener("click", this.paging.bind(this, i), false);
                paginationWrapper.appendChild(label);
            }
        } else if (true) {
            for (var i = 1; i <= pageCount; i++) {
                var label = create("a", {
                    class: "aweTbl-pagination-label",
                    innerHTML: i,
                    href: "javascript:void(0);"
                });
                label.addEventListener("click", this.paging.bind(this, i), false);
                paginationWrapper.appendChild(label);
            }
        }
        this.paginationWrapper.appendChild(paginationWrapper);
    }

    function makeSearchBox() {
        var divWrapper = create(null, {
            class: "aweTbl-searchBox"
        });

        var input = create('input', {
            type: "text",
            class: "aweTbl-searchBox-input",
            placeholder: "write + ENTER"
        });

        input.addEventListener("keyup", this.filter.bind(this, input), false);
        input.addEventListener("keydown", function(){clearTimeout(this.typingTimer)}, false);
        divWrapper.appendChild(input);
        this.searchboxWrapper.appendChild(divWrapper);
    }
    //internalFunction that create a table from json result
    function getXhrResponse(xhr) {

        if (xhr.status === 200) {
            var loadingDiv = document.querySelector('.aweTbl-loading');
            if (loadingDiv) {
                this.tableWrapper.removeChild(loadingDiv);
            }
            var result = JSON.parse(xhr.responseText);
            //console.log("these are what i had recievd from that url \n", result);
            if (result.Length == 0) {
                throw "There is now recorde ro make a table with";
            }
            //SaveResult in webStorage
            sessionStorage.awesomeTabledata = xhr.responseText;
            makeTable.call(this, result);
            makeOtherstuff.call(this, result.length);
        } else {
            throw "i cant use url response as json,check url and make sure that it will respond as json";
        }
    }

    function makeOtherstuff(resultLength) {
        //check global options for Pagination user privilege
        if (this.globalOptions.buildPagination) {
            makePagination.call(this, resultLength, 1);
        }
        //check global options for search user privilege
        if (this.globalOptions.buildSearch) {
            makeSearchBox.call(this);
        }
        //check global options for pageSize Selectbox user privilege
        if (this.globalOptions.buildPageSize) {
            makePageSize.call(this);
        }
    }

    function makePageSize() {
        var dropDown = document.createElement('select');
        dropDown.className = "aweTbl-pageSize";
        //  var self = this;
        for (var i = 1; i <= 5; i++) {
            var option = document.createElement('option');
            option.innerHTML = i * 15;
            dropDown.appendChild(option);
        }
        dropDown.addEventListener('change', this.changePageSize.bind(this,
            ''), false);
        this.pageSizeWrapper.appendChild(dropDown);
    }
    //thanks to    PM_ME_INSIDER_INFO from reddit
    //create a html tag
    function create(tag, obj) {
        var node = document.createElement(tag || "div");
        obj = obj || {};
        for (var x in obj) {
            if (obj.hasOwnProperty(x)) {
                if (x == "html" || x == "innerHTML") {
                    node.innerHTML = obj[x];
                } else if (x !== "tag") {
                    node.setAttribute(x, obj[x]);
                }
            }
        }
        return node;
    }

    function changeTableBody(result) {
        var tbdy = document.createElement('tbody');
        //get Object Array Length
        var trlen = result.length;
        //check If json data is object or string
        if (typeof(result[0]) == "object") {
            //Create Table With TR and TD
            var keyLen = this.jsonKeys.length;
            var take = this.globalOptions.pageSize < trlen ? this.globalOptions.pageSize :
                trlen;
            if (this.globalOptions.columnsTypes) {
                for (var i = 0; i < take; i++) {
                    var tr = document.createElement("tr");
                    for (j = 0; j < keyLen; j++) {
                        var td = document.createElement("td");
                        if (Object.keys(this.globalOptions.columnsTypes).indexOf(this.jsonKeys[
                                j]) > -1) {
                            switch (this.globalOptions.columnsTypes[this.jsonKeys[j]]) {
                                case "image":
                                    {
                                        var img = create('img', {
                                            src: result[i][this.jsonKeys[j]],
                                            alt: result[i][this.jsonKeys[j]],
                                            class: "aweTbl-img-".concat(this.jsonKeys[j])
                                        });
                                        td.appendChild(img);
                                        break;
                                    }
                                case "link":
                                    {
                                        var anchor = create('a', {
                                            href: result[i][this.jsonKeys[j]],
                                            target: "_blank",
                                            class: "aweTbl-link-".concat(this.jsonKeys[
                                                j]),
                                            innerHTML : result[i][this.jsonKeys[j]]

                                        });
                                        td.appendChild(anchor);
                                        break;
                                    }
                                default:
                                    {
                                        td.className = "aweTbl-text-".concat(this.jsonKeys[j]);
                                        td.innerHTML = result[i][this.jsonKeys[j]];
                                    }
                            }
                        } else {
                            td.className = "aweTbl-text-".concat(this.jsonKeys[j]);
                            td.innerHTML = result[i][this.jsonKeys[j]];
                        }

                        tr.appendChild(td);
                    }
                    tbdy.appendChild(tr);
                }
            } else {
                for (var i = 0; i < take; i++) {
                    var tr = document.createElement("tr");
                    for (j = 0; j < keyLen; j++) {
                        var td = create('td', {
                            class: "aweTbl-text-".concat(this.jsonKeys[j]),
                            innerHTML: result[i][this.jsonKeys[j]]
                        });
                        tr.appendChild(td);
                    }
                    tbdy.appendChild(tr);
                }
            }
            var prevTbody = this.tableElement.querySelector("tbody");
            if (prevTbody) {
                this.tableElement.removeChild(prevTbody);
            }
            this.tableElement.appendChild(tbdy);
        } else {
            var tr = document.createElement("tr");
            var td = create('td', {
                colSpan: 1000,
                innerHTML: "Nothing found :("
            });
            tr.appendChild(td);
            tbdy.appendChild(tr);
            var prevTbody = this.tableElement.querySelector("tbody");
            if (prevTbody) {
                this.tableElement.removeChild(prevTbody);
            }
            this.tableElement.appendChild(tbdy);
        }
    }

    function makeTable(result) {
        // TBODY
        var tbdy = document.createElement('tbody');
        //get Object Array Length
        var trlen = result.length;
        //check If json data is object or string
        if (typeof(result[0]) == "object") {
            //automatic create header
            var header = document.createElement("thead");
            for (var key in result[0]) {
                var th = document.createElement("th");
                var a = create('a', {
                    innerHTML: key,
                    href: "javascript:void(0);",
                    'data-sortKey': key,
                    'data-sortDirection': "asc"
                });
                //check global options for sorting user privilege
                if (this.globalOptions.buildSorting) {
                    a.addEventListener("click", this.sort.bind(this, a));
                }
                th.appendChild(a);
                this.jsonKeys.push(key);
                header.appendChild(th);
            }
            //Create Table With TR and TD
            var keyLen = this.jsonKeys.length;
            var take = this.globalOptions.pageSize < trlen ? this.globalOptions.pageSize :
                trlen;
            if (this.globalOptions.columnsTypes) {
                for (var i = 0; i < take; i++) {
                    var tr = document.createElement("tr");
                    for (j = 0; j < keyLen; j++) {
                        var td = document.createElement("td");
                        if (Object.keys(this.globalOptions.columnsTypes).indexOf(this.jsonKeys[
                                j]) > -1) {
                            switch (this.globalOptions.columnsTypes[this.jsonKeys[j]]) {
                                case "image":
                                    {
                                        var img = create('img', {
                                            src: result[i][this.jsonKeys[j]],
                                            alt: result[i][this.jsonKeys[j]],
                                            class: "aweTbl-img-".concat(this.jsonKeys[j])
                                        });
                                        td.appendChild(img);
                                        break;
                                    }
                                case "link":
                                    {
                                        var anchor = create('a', {
                                            href: result[i][this.jsonKeys[j]],
                                            target: "_blank",
                                            class: "aweTbl-link-".concat(this.jsonKeys[
                                                j]),
                                            innerHTML: result[i][this.jsonKeys[j]]
                                        });
                                        td.appendChild(anchor);
                                        break;
                                    }
                                default:
                                    {
                                        td.className = "aweTbl-text-".concat(this.jsonKeys[j]);
                                        td.innerHTML = result[i][this.jsonKeys[j]];
                                    }
                            }
                        } else {
                            td.className = "aweTbl-text-".concat(this.jsonKeys[j]);
                            td.innerHTML = result[i][this.jsonKeys[j]];
                        }

                        tr.appendChild(td);
                    }
                    tbdy.appendChild(tr);
                }
            } else {
                for (var i = 0; i < take; i++) {
                    var tr = document.createElement("tr");
                    for (j = 0; j < keyLen; j++) {
                        var td = create('td', {
                            class: "aweTbl-text-".concat(this.jsonKeys[j]),
                            innerHTML: result[i][this.jsonKeys[j]]
                        });
                        tr.appendChild(td);
                    }
                    tbdy.appendChild(tr);
                }
            }

            var prevTbody = this.tableElement.querySelector("tbody");
            if (prevTbody) {
                this.tableElement.removeChild(prevTbody);
            }
            this.tableElement.appendChild(header);
            this.tableElement.appendChild(tbdy);
        } else {
            console.log("string");
        }
    }
    return AwesomeTableJs;
}));
