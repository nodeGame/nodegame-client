build:	
	@./bin/nodegame-client

doc:
	@./node_modules/.bin/docker index.js init.node.js nodeGame.js lib/ addons/ -o docs/

test:
	@./node_modules/.bin/mocha

.PHONY: test
