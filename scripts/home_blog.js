var blogID;
var postsContainerElement;
var loadButtonElement;
var embedScriptElement;
var loading = false;
var lastLoadedPostID = 0;
var totalBlogPosts = 0;

function setup(defaultBlogID = undefined) {
	blogID = defaultBlogID === undefined ? getCookie("blog_id") : defaultBlogID;
	postsContainerElement = document.getElementById("posts-container");
	loadButtonElement = document.getElementById("load-posts-button");
	embedScriptElement = document.getElementById("blog-embed-script");
}

async function getBlogInfo() {
	var infoResponse = await api("info", { blogID }, "GET");

	if (!infoResponse.error) {
		totalBlogPosts = infoResponse.data.totalPosts;
		updateButton();
	} else {
		displayStatus(true, "view-status", "Could not get your blog info.");
	}

	var scriptResponse = await api("script", { blogID }, "GET");

	if (!scriptResponse.error) {
		embedScriptElement.textContent = scriptResponse.data.blogScript;
	} else {
		embedScriptElement.textContent = "Could not fetch blog embed script. Please reload the page.";
	}
}

async function loadPosts() {
	if (loading) {
		return;
	}

	loading = true;
	var response = await api("get", { blogID, startPostID: lastLoadedPostID, amount: 10 }, "GET");

	if (response.error) {
		console.log("err " + response.data);
		loading = false;
		return;
	}

	for (var post of response.data) {
		var postElement = document.createElement("div");
		postElement.classList.add("blog-post");

		// Header
		var headerElement = document.createElement("div");
		headerElement.classList.add("blog-header");

		var titleElement = document.createElement("p");
		titleElement.textContent = post.postTitle;
		var dateElement = document.createElement("p");
		dateElement.textContent = post.postCreationDate;

		headerElement.appendChild(titleElement);
		headerElement.appendChild(dateElement);

		// Body
		var contentElement = document.createElement("div");
		contentElement.innerHTML = post.postFormattedContent;
		contentElement.classList.add("blog-body");

		postElement.appendChild(headerElement);
		postElement.appendChild(contentElement);

		postsContainerElement.appendChild(postElement);

		lastLoadedPostID++;
	}
	loading = false;
	updateButton();
}

function updateButton() {
	if (lastLoadedPostID == totalBlogPosts + 1) {
		loadButtonElement.style.display = "none";
	}
	loadButtonElement.textContent = "Load " + Math.min(lastLoadedPostID + 1, totalBlogPosts) + "-" + Math.min(lastLoadedPostID + 10, totalBlogPosts) + "/" + totalBlogPosts + " posts"; 
}