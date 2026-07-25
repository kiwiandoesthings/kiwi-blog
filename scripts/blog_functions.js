async function postBlog() {
	var title = document.getElementById("title-input").value;
	var content = document.getElementById("content-input").value;
	var summary = document.getElementById("summary-input").value;

	var response = await api("add", { title, content, summary }, "POST");

	if (response.error) {
		if (response.status == 401) {
			displayStatus(true, "status", "Authentication error. Please log out and log in again.");
		} else {
			displayStatus(true, "status", response.data);
		}

		return;
	}

	//todo
}