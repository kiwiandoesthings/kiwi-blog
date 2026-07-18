const apiString = "127.0.0.1/blog/";

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

async function api(route, body) {
	try {
		var response = await fetch(apiString + route, {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(body),
			credentials: "include"
		});

		if (response.status == 500) {
			return apiResponse(true, 500, "Server is down currently. Please try again later.");
		} else if (!response.ok) {
			return apiResponse(true, response.status, "Unknown error: " + response.status + ". Please report if the problem persists.");
		}

		var data = await response.json();

		return apiResponse(!response.ok, response.status, data);
	} catch (error) {
		return apiResponse(false, 0, "Encountered a network error. Please try again.");
	}
}

function apiResponse(error, errorCode, message) {
	return {
		error: error,
		status: errorCode,
		data: message
	};
}

function displayError(errorID, error) {
	var errorElement = document.getElementById(errorID);
	errorElement.style.display = "inherit";
	errorElement.innerHTML = error;
}

function hideError(errorID) {
	var errorElement = document.getElementById(errorID);
	errorElement.style.display = "none";
}