const apiString = "https://api.kiwiandoesthings.place/blog/";

addFooter();

function setCookie(key, value) {
  var expiry = new Date();
  expiry.setDate(expiry.getDate() + 365);
  document.cookie = encodeURIComponent(key) + "=" + encodeURIComponent(value) + 
    "; expires=" + expiry.toUTCString() + 
    "; domain=.kiwiandoesthings.place" + 
    "; path=/" + 
    "; Secure" + 
    "; SameSite=Strict";
}

function getCookie(cookieKey) {
  var cookies = document.cookie.split("; ");
  for (var cookie of cookies) {
    var [key, value] = cookie.split("=");
    if (decodeURIComponent(key) === cookieKey) {
        return decodeURIComponent(value);
    }
  }
  return "";
}

const serverErrorMessage = "Server is down currently. Please try again later.";
const netErrorMessage = "Encountered a network error. Please try again.";
async function api(route, body, method) {
    try {
        var fetchOptions = {
            method: method,
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include"
        };

        var url = apiString + route;

        if (method.toUpperCase() === "GET") {
            if (body && Object.keys(body).length > 0) {
                var params = new URLSearchParams(body);
                url += "?" + params.toString();
            }
        } else {
            fetchOptions.body = JSON.stringify(body);
        }

        var response = await fetch(url, fetchOptions);

        if (response.status == 500) {
            return apiResponse(true, 500, serverErrorMessage);
        } else if (!response.ok) {
            var unknownErrorMessage = "Unknown error: " + response.status + ". Please report if the problem persists.";
            console.log(unknownErrorMessage);
            return apiResponse(true, response.status, unknownErrorMessage);
        }

		var data = null;
		var contentType = response.headers.get("content-type");
        var text = await response.text();

        if (text && contentType && contentType.includes("application/json")) {
            data = JSON.parse(text);
        } else if (text) {
            data = text;
        }

        return apiResponse(!response.ok, response.status, data);
    } catch (error) {
        console.error(error); 
        console.log(netErrorMessage);
        return apiResponse(false, 0, netErrorMessage);
    }
}

function apiResponse(error, errorCode, message) {
	return {
		error: error,
		status: errorCode,
		data: message
	};
}

function displayStatus(isError, statusID, message) {
	var statusElement = document.getElementById(statusID);
	statusElement.style.display = "inherit";
	statusElement.innerHTML = message;

	var color = "rgb(0, 255, 0)";
	if (isError) {
		color = "rgb(255, 0, 0)";
	}
	statusElement.style.color = color;
}

function hideStatus(statusID) {
	var statusElement = document.getElementById(statusID);
	statusElement.style.display = "none";
}

function addFooter() {
	var body = document.body;

	var footer = document.createElement("footer");
	
	var links = ["/index", "/pages/blog", "/pages/account", "/pages/login", "/pages/register"];
	var names = ["Home", "Blog", "Account", "Login", "Register"];

	for (var i = 0; i < links.length; i++) {
		var link = document.createElement("a");
		link.href = links[i];
		link.textContent = names[i];
		link.classList.add("footer-link");
		footer.appendChild(link);
	}

	body.appendChild(footer);
}