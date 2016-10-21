multibuild:
	@./bin/make.js multibuild

build:
	@./bin/make.js build

doc:
	@./node_modules/.bin/docker index.js init.node.js nodeGame.js lib/ addons/ examples/ -o docs/

publish:
	node bin/make.js build -a -o nodegame-full && npm publish

test:
	@./node_modules/.bin/mocha

.PHONY: test build
