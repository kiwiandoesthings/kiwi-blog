const blogID = getCookie("blog_id");
var stylesheetInput;
var containerInput;
var embedScriptElement;
var emailInput;
var emailPublicInput;

loadContent();

async function loadContent() {
	if (!blogID) {
		redirect("");
	}

	var response = await api("blogs/account", {}, "GET");

	if (response.error) {
		displayStatus(true, "status", "Failed to get your blog settings. Please reload the page.");
		return;
	}

	embedScriptElement = document.getElementById("blog-embed-script");
	stylesheetInput = document.getElementById("stylesheet-input");
	containerInput = document.getElementById("container-id-input");
	emailInput = document.getElementById("email-input");
	emailPublicInput = document.getElementById("email-public-input");

	emailInput.value = response.data.email;
	emailPublicInput.checked = response.data.isEmailPublic;

	document.getElementById("settings-fieldset").removeAttribute("disabled");
}

async function getScript() {
	if (!stylesheetInput.value || stylesheetInput.value.trim() == ""){
		embedScriptElement.textContent = "You must enter a stylesheet path.";
		return;
	}

	var response = await api("blogs/" + blogID + "/script", { blogID: blogID, stylesheetName: stylesheetInput.value, containerID: containerInput.value }, "GET");

	if (!response.error) {
		embedScriptElement.textContent = response.data.blogScript;
	} else {
		embedScriptElement.textContent = "Could not fetch blog embed script. Please try again.";
	}
}

async function saveBlogSettings() {
	var response = await api("blogs", { email: emailInput.value, isEmailPublic: emailPublicInput.checked }, "PUT");

	if (response.error) {
		if (response.status == 401) {
			displayStatus(true, "status", "Authentication error. Please log out and log in again.");
		} else {
			displayStatus(true, "status", "Failed to update blog settings. Please try again.");
		}
		return;
	}

	displayStatus(false, "status", "Successfully updated blog settings");
}