doc:
	@./node_modules/.bin/docker index.js init.node.js nodeGame.js lib/ -o docs/

test:
	@./node_modules/.bin/mocha

.PHONY: test
