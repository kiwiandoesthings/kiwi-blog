async function initialize(options) {
	isEditable = options.isEditable || false;

	var blogContainer = document.getElementById(options.containerID);

	var viewer = document.createElement("div");
	viewer.id = "blog-viewer";

	var shadowDOM = viewer.attachShadow({ mode: "open" });

	var styleLink = document.createElement("link");
	styleLink.rel = "stylesheet";
	styleLink.href = options.stylesheet;
	shadowDOM.append(styleLink);

	var postsArea = document.createElement("div");
	postsArea.id = "posts-area";

	var buttonContainer = document.createElement("div");
	buttonContainer.id = "load-posts-button-container";

	var postsContainer = document.createElement("div");
	postsContainer.id = "posts-container";

	var loadPostsButton = document.createElement("button");
	loadPostsButton.id = "load-posts-button";
	loadPostsButton.onclick=loadPosts;
	loadPostsButton.textContent = "Load Posts";

	buttonContainer.appendChild(loadPostsButton);
	postsArea.appendChild(postsContainer);
	postsArea.appendChild(buttonContainer);
	shadowDOM.appendChild(postsArea);
	blogContainer.appendChild(viewer);

	setup(options.blogID);
}

