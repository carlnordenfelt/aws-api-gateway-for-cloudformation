SHELL=/bin/bash

clean:
	npm run clean

test: clean
	npm test

build: test
	npm run build

setup: build
	npm run setup

install: setup
	npm run deploy
	rm -rf package.zip

teardown:
	npm run teardown
