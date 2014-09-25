build: index.js
	@browserify --standalone WDWSClient -o dist/wdws-client.js index.js
	@uglifyjs -o dist/wdws-client.min.js dist/wdws-client.js