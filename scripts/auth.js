var nameInput = document.getElementById("name-input");
var emailInput = document.getElementById("email-input");
var passwordInput = document.getElementById("password-input");
var emailPublicInput = document.getElementById("email-public-input");

async function login() {
	hideStatus("status");

	var email = emailInput.value;
	var password = passwordInput.value;

	var response = await api("sessions", { email, password }, "POST");

	if (response.error) {
		if (response.status == 401) {
			displayStatus(true, "status", "Invalid login credentials.");
		} else {
			displayStatus(true, "status", response.data);
		}
		return;
	}

	setCookie("blog_id", response.data.blogID);

	displayStatus(false, "status", "Successfully logged in.");
}

async function logout() {
	hideStatus("status");

	var response = await api("sessions", {}, "DELETE");

	if (response.error) {
		displayStatus(true, "status", response.data);
	}

	setCookie("blog_id", "");
	displayStatus(false, "status", "Successfully logged out.");
}

async function register() {
	var name = nameInput.value;
	var email = emailInput.value;
	var password = passwordInput.value;
	var isEmailPublic = emailPublicInput.checked;

	var response = await api("blogs", { name, email, password, isEmailPublic }, "POST");

	if (response.error) {
		if (response.status == 400) {
			displayStatus(true, "status", "Bad registration info: " + response.data);
		} else {
			displayStatus(true, "status", response.data);
		}
		return;
	}

	displayStatus(false, "status", "Successfully registered. Please log in with your new account.");
}