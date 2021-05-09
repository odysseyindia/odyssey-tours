requirejs.config({
	baseUrl: '/js',
	paths: {
		// cookie: "https://cdnjs.cloudflare.com/ajax/libs/cookieconsent2/3.1.1/cookieconsent.min.js",
		jquery: '//code.jquery.com/jquery-3.5.1.slim.min.js',
		bootstrap: '//cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/js/bootstrap.bundle.min.js'
	},
	attributes: {
		jquery: {
			crossorigin: "anonymous"
		},
		bootstrap: {
			crossorigin: "anonymous"
		}
	},
	onNodeCreated: function(node, config, name, url){
	    if(config.attributes && config.attributes[name]){
	      Object.keys(config.attributes[name]).forEach(attribute => {
	        node.setAttribute(attribute, config.attributes[name][attribute]);
	      });
	    }
	}
});

requirejs(["app/main"]);