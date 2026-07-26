async function initialize(options) {
	var viewer = document.createElement("div");
	viewer.id = "blog-viewer";

	var shadowDOM = viewer.attachShadow({ mode: "open" });

	var styleLink = document.createElement("link");
	styleLink.rel = "stylesheet";
	styleLink.href = options.stylesheet;
	shadowDOM.append(styleLink);

	var container = document.createElement("div");
	container.id = "posts-container";

	var buttonContainer = document.createElement("div");
	buttonContainer.id = "load-posts-button-container";

	var loadPostsButton = document.createElement("button");
	loadPostsButton.id = "load-posts-button";
	loadPostsButton.onclick=loadPosts();
	loadPostsButton.textContent = "Load Posts";

	buttonContainer.appendChild(loadPostsButton);
	container.appendChild(buttonContainer);
	shadowDOM.appendChild(container);

	setup();
	await getBlogInfo();
	await loadPosts();
}

