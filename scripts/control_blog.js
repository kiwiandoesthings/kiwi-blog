const blogID = getCookie("blog_id");
var stylesheetInput;
var containerInput;
var embedScriptElement;

loadContent();

async function loadContent() {
	if (!blogID) {
		redirect("");
	}

	embedScriptElement = document.getElementById("blog-embed-script");
	stylesheetInput = document.getElementById("stylesheet-input");
	containerInput = document.getElementById("container-id-input");
}

async function getScript() {
	if (!stylesheetInput.value || stylesheetInput.value.trim() == ""){
		embedScriptElement.textContent = "You must enter a stylesheet path.";
		return;
	}

	var scriptResponse = await api("blogs/" + blogID + "/script", { blogID: blogID, stylesheetName: stylesheetInput.value, containerID: containerInput.value }, "GET");

	if (!scriptResponse.error) {
		embedScriptElement.textContent = scriptResponse.data.blogScript;
	} else {
		embedScriptElement.textContent = "Could not fetch blog embed script. Please reload the page.";
	}
}