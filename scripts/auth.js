async function login() {
	hideError("error");

	var email = document.getElementById("email").value;
	var password = document.getElementById("password").value;

	var response = await api("login_blog", { email, password });

	if (response.error) {
		if (response.status == 400) {
			displayError("error", "Invalid login credentials.");
		} else {
			displayError("error", response.data);
		}
		return;
	}

	setCookie("blog_id", response.data.blogID);
}

async function logout() {
	var response = await api("logout_blog");

	if (response.error) {
		displayError("error", response.data);
	}
}