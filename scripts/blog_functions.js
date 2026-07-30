async function addPost() {
    var title = document.getElementById("title-input").value;
    var content = document.getElementById("content-input").value;
    var summary = document.getElementById("summary-input").value;

    var response = await api("posts", { title, content, summary }, "POST");

    if (response.error) {
        if (response.status == 401) {
            displayStatus(true, "post-status", "Authentication error. Please log out and log in again.");
        } else {
            displayStatus(true, "post-status", response.data);
        }
        return;
    }

    var newPostResponse = await api("posts", { blogID: blogID, lastPostID: 0, amount: 1 }, "GET");
    
    if (!newPostResponse.error && newPostResponse.data.length > 0) {
        let post = newPostResponse.data[0];
        var postElement = createPostElement(post);
        postsContainerElement.prepend(postElement);
        
        totalBlogPosts++;
        loadedPostsCount++;
        
        if (lastLoadedPostID === 0) {
            lastLoadedPostID = post.postID;
        }
    }

    updateButton();
}

async function startEditPost(postID, postElement, statusElement) {
	var response = await api("posts", { blogID: blogID, lastPostID: postID, amount: 1 }, "GET");

	if (response.error) {
		displayStatusElement(true, statusElement, "Failed to fetch raw post contents. Please try again.");
	}

	var headerElement = postElement.querySelector(".blog-header");
	var titleElement = headerElement.querySelector("p:first-child");
	var bodyElement = postElement.querySelector(".blog-body");
	var bodyContent = bodyElement.querySelector("p:first-child");

	var titleInput = document.createElement("input");
	titleInput.value = titleElement.textContent;

	var bodyInput = document.createElement("textarea");
	bodyInput.value = response.data[0].postRawContent;

	console.log(titleElement);
	console.log(bodyContent);

	titleElement.replaceWith(titleInput);
	bodyElement.replaceWith(bodyInput);
}

async function deletePost(postID, postElement, statusElement) {
	if (!confirm("Are you really sure you want to delete this post? You won't be able to restore it.")) {
		return;
	}

	var response = await api("posts/" + postID, {}, "DELETE");

	if (response.error) {
		if (response.status == 401) {
			displayStatusElement(true, statusElement, "Authentication error. Please log out and log in again.");
		} else {
			displayStatusElement(true, statusElement, "Failed to delete post. Please try again");
		}
	} else {
		postElement.remove();
	}
}