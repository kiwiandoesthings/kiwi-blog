const isDevelopment = window.location.hostname.includes("test");
const apiString = isDevelopment ? "https://api.test.kiwiandoesthings.place/blog/" : "https://api.kiwiandoesthings.place/blog/";


const links = ["/", "/pages/blog", "/pages/account", "/pages/login", "/pages/register"];
const names = ["Home", "Blog", "Account", "Login", "Register"];
const linkIndices = [[0, 3, 4], [0, 1, 2]];
addFooter();

function setCookie(key, value) {
  var expiry = new Date();
  expiry.setDate(expiry.getDate() + 365);
  document.cookie = encodeURIComponent(key) + "=" + encodeURIComponent(value) + 
    "; expires=" + expiry.toUTCString() + 
    "; domain=.kiwiandoesthings.place" + 
    "; path=/" + 
    "; Secure" + 
    "; SameSite=Lax";
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
            var unknownErrorMessage = await response.text();
            console.log(unknownErrorMessage);
            return apiResponse(true, response.status, "Error " + response.status + ": " + unknownErrorMessage);
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
        return apiResponse(true, 0, netErrorMessage);
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
	if (statusElement == null) {
		console.log("Couldn't show status element \"" + statusID + "\" because it doesn't exist.");
	}

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

	if (statusElement == null) {
		console.log("Couldn't hide status element \"" + statusID + "\" because it doesn't exist.");
	} else {
		statusElement.style.display = "none";
	}
}

function displayStatusElement(isError, statusElement, message) {
	statusElement.style.display = "inherit";
	statusElement.innerHTML = message;

	var color = "rgb(0, 255, 0)";
	if (isError) {
		color = "rgb(255, 0, 0)";
	}
	statusElement.style.color = color;
}

function hideStatusElement(statusElement) {
	statusElement.style.display = "none";
}

function addFooter() {
	var body = document.body;

	var footer = document.createElement("footer");

	var loggedIn = getCookie("blog_id") == "" ? 0 : 1;
	for (var i = 0; i < linkIndices[0].length; i++) {
		var linkIndex = linkIndices[loggedIn][i];

		var link = document.createElement("a");
		link.textContent = names[linkIndex];
		link.href = links[linkIndex];
		link.classList.add("footer-link");
		footer.appendChild(link);
	}

	var version = document.createElement("div");
	version.id = "footer-version";
	version.textContent = "KiwiBlog v1.1";

	body.appendChild(footer);
	body.appendChild(version);
}

function redirect(path) {
	window.location = "/" + path;
}