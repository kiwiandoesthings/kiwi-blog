var blogID;
var postsContainerElement;
var loadButtonElement;
var loading = false;
var lastLoadedPostID = 0;
var totalBlogPosts = 0;

async function setup(defaultBlogID = undefined) {
	var shadowRoot = document.getElementById("blog-viewer").shadowRoot;
    postsContainerElement = shadowRoot.getElementById("posts-container");
    loadButtonElement = shadowRoot.getElementById("load-posts-button");

	if (defaultBlogID == undefined) {
		if (getCookie("blog_id") == "") {
			displayStatus(true, "view-status", "You are not logged in.");
			updateButton();
			return;
		}
		blogID = getCookie("blog_id");
	}

	await getBlogInfo();
	loadPosts();
	updateButton();
}

async function getBlogInfo() {
	var infoResponse = await api("info", { blogID }, "GET");

	if (!infoResponse.error) {
		totalBlogPosts = infoResponse.data.totalPosts;
	} else {
		displayStatus(true, "view-status", "Could not get your blog info.");
	}
}

async function loadPosts() {
	if (loading) {
		return;
	}

	loading = true;
	var response = await api("get", { blogID: blogID, startPostID: lastLoadedPostID, amount: 10 }, "GET");

	if (response.error) {
		console.log("Error loading posts: " + response.data);
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
		dateElement.textContent = formatTimestamp(post.postCreationDate);

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
	if (lastLoadedPostID == totalBlogPosts) {
		loadButtonElement.style.display = "none";
	}
	loadButtonElement.textContent = "Load " + Math.min(lastLoadedPostID + 1, totalBlogPosts) + "-" + Math.min(lastLoadedPostID + 10, totalBlogPosts) + "/" + totalBlogPosts + " posts"; 
}

function formatTimestamp(timestamp) {
    var date = new Date(timestamp.replace(" ", "T"));


    var year = date.getFullYear();
    var month = date.toLocaleString('en-US', { month: 'long' });
    var day = date.getDate();
    
    var suffix = "th";
    if (day === 1 || day === 21 || day === 31) {
		suffix = "st";
	} else if (day === 2 || day === 22) {
		suffix = "nd";
	} else if (day === 3 || day === 23) {
		suffix = "rd";
	}

    var time = date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
    });

    return `${month} ${day}${suffix}, ${year} ${time}`;
}