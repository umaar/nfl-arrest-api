# The default target must be at the top
.DEFAULT_GOAL := start

install:
	npm install

update-deps:
	ncu -u

start:
	node server.js

lint:
	./node_modules/.bin/xo

test: lint

