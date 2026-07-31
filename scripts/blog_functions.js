async function addPost() {
	var titleElement = document.getElementById("title-input");
    var contentElement = document.getElementById("content-input");
    var summaryElement = document.getElementById("summary-input");

    var title = titleElement.value;
    var content = contentElement.value;
    var summary = summaryElement.value;

	if (!title || !content) {
		alert("You cannot have a post with an empty title or body.");
		return;
	}

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
    } else {
		displayStatus(true, "post-status", "Failed to display the newly posted post with unknown error: " + newPostResponse.status);
	}

	titleElement.value = "";
	contentElement.value = "";
	summaryElement.value = "";

    updateButton();
}

async function startEditPost(postID, postElement, statusElement) {
	var response = await api("posts", { blogID: blogID, lastPostID: postID + 1, amount: 1 }, "GET");

	if (response.error) {
		displayStatusElement(true, statusElement, "Failed to fetch raw post contents. Please try again.");
		return;
	}

	var headerElement = postElement.querySelector(".blog-header");
	var titleElement = headerElement.querySelector(".blog-title");
	var bodyElement = postElement.querySelector(".blog-body");
	var detailsElement = postElement.querySelector(".blog-summary");
	var summaryElement = detailsElement.querySelector(".blog-summary-content");
	var actionsElement = postElement.querySelector(".blog-actions");
	var editButton = actionsElement.querySelector(".actions-edit");
	var deleteButton = actionsElement.querySelector(".actions-delete");

	var titleInput = document.createElement("input");
	titleInput.value = titleElement.textContent;

	var bodyInput = document.createElement("textarea");
	bodyInput.rows = 10;
	bodyInput.value = response.data[0].postRawContent;

	var summaryInput = document.createElement("textarea");
	summaryInput.rows = 2;
	summaryInput.value = summaryElement.textContent;

	var post = {
		header: headerElement,
		title: titleInput,
		body: bodyInput,
		summary: summaryInput,
		actions: actionsElement,
		postID: postID,
		originalTitle: titleElement.textContent,
        originalHTML: bodyElement.innerHTML,
		originalSummary: summaryElement.textContent
	}

	var submitButton = document.createElement("button");
	submitButton.classList.add("actions-edit-submit");
	submitButton.textContent = "Submit";
	submitButton.onclick = function() {
		finishEdit(post, postElement, statusElement);
	}

	var cancelButton = document.createElement("button");
	cancelButton.classList.add("actions-edit-cancel");
	cancelButton.textContent = "Cancel";
	cancelButton.onclick = function() {
		cancelEdit(post, postElement, statusElement);
	}

	titleElement.replaceWith(titleInput);
	bodyElement.replaceWith(bodyInput);
	detailsElement.replaceWith(summaryInput);
	editButton.replaceWith(submitButton);
	deleteButton.replaceWith(cancelButton);
}

async function finishEdit(post, postElement, statusElement) {
	if (!confirm("Are you sure you want to submit the edit? You won't be able to recover the original contents of the post.")) {
		return;
	}

	if (!post.title.value || !post.body.value) {
		alert("You cannot have a post with an empty title or body.");
		return;
	}

	var response = await api("posts/" + post.postID, { title: post.title.value, content: post.body.value, summary: post.summary.value }, "PUT");

	if (response.error) {
		displayStatusElement(true, statusElement, "Failed to edit post.");
		return;
	}

	var formattedHtml = response.data.formattedContent;
	var editDate = response.data.postEditDate;
    
    restorePost(post, postElement, statusElement, post.title.value, formattedHtml, post.summary.value, editDate);
}

async function cancelEdit(post, postElement, statusElement) {
	restorePost(post, postElement, statusElement, post.originalTitle, post.originalHTML, post.originalSummary, null);
}

function restorePost(post, postElement, statusElement, finalTitle, finalHTML, finalSummary, newEditDate) {
    var titleElement = document.createElement("p");
    titleElement.classList.add("blog-title");
    titleElement.textContent = finalTitle;
	if (newEditDate) {
        var dateElement = post.header.querySelector(".blog-date");
        var creationText = dateElement.innerHTML.split("<br>")[0]; 
        var editText = formatTimestamp(newEditDate);
        dateElement.innerHTML = creationText + "<br>" + editText;
    }

    var contentElement = document.createElement("div");
    contentElement.classList.add("blog-body");
    contentElement.innerHTML = finalHTML;

	var detailsElement = document.createElement("details");
	detailsElement.classList.add("blog-summary");
	var summaryLabelElement = document.createElement("summary");
	summaryLabelElement.textContent = "Summary";
	summaryLabelElement.classList.add("blog-summary-label");
	var summaryElement = document.createElement("p");
	summaryElement.textContent = finalSummary;
	summaryElement.classList.add("blog-summary-content");

	detailsElement.appendChild(summaryLabelElement);
	detailsElement.appendChild(summaryElement);
	if (!finalSummary) {
		detailsElement.style.display = "none";
	}

    var editButton = document.createElement("button");
    editButton.classList.add("actions-edit");
    editButton.textContent = "Edit";
    editButton.onclick = function() {
        startEditPost(post.postID, postElement, statusElement); 
    };

    var deleteButton = document.createElement("button");
    deleteButton.classList.add("actions-delete");
    deleteButton.textContent = "Delete";
    deleteButton.onclick = function() {
        deletePost(post.postID, postElement, statusElement);
    };

    post.title.replaceWith(titleElement);
    post.body.replaceWith(contentElement);
    post.actions.querySelector(".actions-edit-submit").replaceWith(editButton);
    post.actions.querySelector(".actions-edit-cancel").replaceWith(deleteButton);
	post.summary.replaceWith(detailsElement);
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
		totalBlogPosts--;
		loadedPostsCount--;
		updateButton();
	}
}