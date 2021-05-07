function init()
{
    var req = chrome.extension.getBackgroundPage().Request.request;
    req.nameE = document.getElementById("header_name");
    req.valueE = document.getElementById("header_value");
    req.nameE.value = req.hname;
    req.valueE.value = req.hvalue;
    document.getElementById("url").value = req.url;
    document.getElementById("content_body").value = req.body;
    var list = document.getElementById("header_list");
    list.innerHTML = renderHeaders()

    document.getElementById("url").addEventListener("keyup", onUrlChanged);
    document.getElementById("url").addEventListener("blur", onUrlChanged);

    document.getElementById("header_name").addEventListener("keyup", onHeaderChanged);
    document.getElementById("header_name").addEventListener("blur", onHeaderChanged);

    document.getElementById("header_value").addEventListener("keyup", onHeaderChanged);
    document.getElementById("header_value").addEventListener("blur", onHeaderChanged);

    document.getElementById("add_header_button").addEventListener("click", onAddChangeHeader);
    document.getElementById("add_jwt_button").addEventListener("click", onAddChangeJwt);

    document.getElementById("content_body").addEventListener("keyup", onBodyChanged);
    document.getElementById("content_body").addEventListener("blur", onBodyChanged);

    var methods = ["GET", "POST", "DELETE", "HEAD", "PUT"];
    for (var i=0; i<methods.length;i++) {
        (function(index){
            var button = document.getElementById(methods[i].toLowerCase() + "_request_button");
            button.addEventListener("click", function () {
                doRequest(methods[index]);
            });
        })(i);
    }
}

function onHeaderChanged()
{
    var req = chrome.extension.getBackgroundPage().Request.request;
    req.hname = req.nameE.value;
    req.hvalue = req.valueE.value;
}

function onUrlChanged()
{
    var req = chrome.extension.getBackgroundPage().Request.request;
    req.url = document.getElementById("url").value;;
}

function renderHeaders()
{
    var req = chrome.extension.getBackgroundPage().Request.request;
	var html = "<div class='header'>Name</div><div class='header'>Value</div>";
    for (var i in req.headers) {
	html += "<div class='headerList'>";
        html += "<div class='headerName'>" + i + "</div><div class='headerVal'>" + req.headers[i] + "</div>";
    html += "</div>"
    }
    return html;
}

function onAddChangeHeader()
{
    var req = chrome.extension.getBackgroundPage().Request.request;
    var name = req.nameE.value;
    if (!name) {
        return;
    }
    var value = req.valueE.value;
    if (value == "##") {
        delete req.headers[name];
    } else {
        req.headers[name] = value;
    }
    req.nameE.value = req.valueE.value = "";
    onHeaderChanged();
    var list = document.getElementById("header_list");
    list.innerHTML = renderHeaders()
}

function onAddChangeJwt()
{
    var req = chrome.extension.getBackgroundPage().Request.request;
	var jwt = document.getElementById("jwt_val").value;
	
	if (!jwt) {
		return;
	}
	
	req.nameE.value = "Authorization"
	req.valueE.value = "Bearer " + jwt.trim();
	
	document.getElementById("jwt_val").value = "";
	
	onAddChangeHeader();
}

function onBodyChanged()
{
    var req = chrome.extension.getBackgroundPage().Request.request;
    req.body = document.getElementById("content_body").value;
}

function doRequest(method)
{
    var req = chrome.extension.getBackgroundPage().Request.request;
    req.method = method;
    req.url = document.getElementById("url").value;
    if (req.method == "POST" || req.method == "PUT") {
        req.body = document.getElementById("content_body").value;
    }

    var xhr = new XMLHttpRequest();
    xhr.open(
        req.method,
        req.url,
        false);

    console.log(method + " " + req.url);
    for (var i in req.headers) {
        xhr.setRequestHeader(i, req.headers[i]);
        console.log(i + " " + req.headers[i]);
    }

    xhr.onload = function() {
        var result = "status: " + xhr.status + " " + xhr.statusText + "<br />";
        var header = xhr.getAllResponseHeaders();
        var all = header.split("\r\n");
        for (var i = 0; i < all.length; i++) {
            if (all[i] != "")
                result += ("<li>" + all[i] + "</li>");
        }

        document.getElementById("response_header").innerHTML = result;
        document.getElementById("response_body").innerText = xhr.responseText;
    }
    xhr.send(req.body);
}

init();
