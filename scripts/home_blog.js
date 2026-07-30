var blogID;
var postsContainerElement;
var loadButtonElement;
var loading = false;
var lastLoadedPostID = 0;
var loadedPostsCount = 0;
var totalBlogPosts = 0;
var isEditable = false;

async function setup(tryBlogID) {
	var shadowRoot = document.getElementById("blog-viewer").shadowRoot;
    postsContainerElement = shadowRoot.getElementById("posts-container");
    loadButtonElement = shadowRoot.getElementById("load-posts-button");

	if (tryBlogID == "") {
		displayStatus(true, "view-status", "You are not logged in.");
		updateButton();
		return;
	}
	blogID = tryBlogID;

	await getBlogInfo();
	loadPosts();
	updateButton();
}

async function getBlogInfo() {
	var infoResponse = await api("blogs/" + blogID, {}, "GET");

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
    var response = await api("posts", { blogID: blogID, lastPostID: lastLoadedPostID, amount: 10 }, "GET");

    if (response.error) {
        console.log("Error loading posts: " + response.data);
        loading = false;
        return;
    }

    for (let post of response.data) {
        var postElement = createPostElement(post);
        postsContainerElement.appendChild(postElement);
        lastLoadedPostID = post.postID;
    }

    loadedPostsCount += response.data.length;
    loading = false;
    updateButton();
}

function createPostElement(post) {
    var postElement = document.createElement("div");
    postElement.classList.add("blog-post");

    var headerElement = document.createElement("div");
    headerElement.classList.add("blog-header");

    var titleElement = document.createElement("p");
    titleElement.textContent = post.postTitle;
    var dateElement = document.createElement("p");
    dateElement.textContent = formatTimestamp(post.postCreationDate);

    headerElement.appendChild(titleElement);
    headerElement.appendChild(dateElement);

    var contentElement = document.createElement("div");
    contentElement.innerHTML = post.postFormattedContent;
    contentElement.classList.add("blog-body");

    postElement.appendChild(headerElement);
    postElement.appendChild(contentElement);

	if (post.postSummary != "") {
		var detailsElement = document.createElement("details");
		var summaryLabelElement = document.createElement("summary");
		summaryLabelElement.textContent = "Summary";
		var summaryElement = document.createElement("p");
		summaryElement.textContent = post.postSummary;

		detailsElement.appendChild(summaryLabelElement);
		detailsElement.appendChild(summaryElement);
		
		postElement.appendChild(detailsElement);
	}

    if (isEditable) {
		var separator = document.createElement("hr");

        var actionContainer = document.createElement("div");
        actionContainer.classList.add("blog-actions");

        var statusElement = document.createElement("span");
        statusElement.id = "post-status-" + post.postID;
        statusElement.style.display = "none";

        var editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.onclick = function() {
            startEditPost(post.postID, postElement, statusElement); 
        };

        var deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.onclick = function() {
            deletePost(post.postID, postElement, statusElement);
        };

		postElement.appendChild(separator);
        actionContainer.appendChild(editButton);
        actionContainer.appendChild(deleteButton);
        actionContainer.appendChild(statusElement);
        postElement.appendChild(actionContainer);
    }
    
    return postElement;
}

function updateButton() {
    if (loadedPostsCount >= totalBlogPosts) {
        loadButtonElement.style.display = "none";
    }
    
    var nextStart = loadedPostsCount + 1;
    var nextEnd = Math.min(loadedPostsCount + 10, totalBlogPosts);

    loadButtonElement.textContent = "Load " + nextStart + "-" + nextEnd + "/" + totalBlogPosts + " posts";
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