async function postBlog() {
	var title = document.getElementById("title-input").value;
	var content = document.getElementById("content-input").value;

	var response = api("add_post", { title, content	});

	if (response.error) {
		if (response.status == 401) {
			displayError("error", "Authentication error. Please log out and log in again.");
		} else {
			displayError("error", response.data);
		}

		return;
	}

	//todo
}