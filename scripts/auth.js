var nameInput = document.getElementById("name-input");
var emailInput = document.getElementById("email-input");
var passwordInput = document.getElementById("password-input");
var emailPublicInput = document.getElementById("email-public-input");

async function login() {
	hideStatus("status");

	var email = emailInput.value;
	var password = passwordInput.value;

	var response = await api("sessions", { email: email, password: password }, "POST");

	if (response.error) {
		if (response.status == 401) {
			displayStatus(true, "status", "Invalid login credentials.");
		} else {
			displayStatus(true, "status", response.data);
		}
		return;
	}

	setCookie("blog_id", response.data.blogID);
	redirect("pages/blog");
}

async function logout() {
	hideStatus("status");

	var response = await api("sessions", {}, "DELETE");

	if (response.error) {
		if (response.status == 401) {
			displayStatus(true, "status", "You are not currently logged in!");
		} else {
			displayStatus(true, "status", response.data);
		}
	}

	setCookie("blog_id", "");
	redirect("");
}

async function register() {
	var name = nameInput.value;
	var email = emailInput.value;
	var password = passwordInput.value;
	var isEmailPublic = emailPublicInput.checked;

	var response = await api("blogs", { name: name, email: email, password: password, isEmailPublic: isEmailPublic }, "POST");

	if (response.error) {
		if (response.status == 400) {
			displayStatus(true, "status", "Bad registration info: " + response.data);
		} else {
			displayStatus(true, "status", response.data);
		}
		return;
	}

	setCookie("blog_id", response.data.blogID);
	redirect("pages/blog");
}

async function deregister() {
	if (!confirm("Are you really sure you want to delete your blog? All of your posts will be IMMEDIATELY and PERMANENTLY deleted.")) {
		return;
	}

	var response = await api("blogs", {}, "DELETE");

	if (response.error) {
		if (response.status == 401) {
			// Shouldn't be possible to reach, page redirects you immediately if you're not logged in
			displayStatus(true, "status", "You aren't logged in!");
		} else {
			displayStatus(true, "status", "Unknown error deregistering blog: " + response.data)
		}
		return;
	} 

	setCookie("blog_id", "");
	redirect("");
}