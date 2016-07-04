GIT_ROOT := $(shell git rev-parse --show-toplevel 2>/dev/null)

PATH := $(GIT_ROOT)/node_modules/.bin:$(PATH)
export PATH

WHICH := 2>/dev/null which
ESLINT = $(shell PATH="$(PATH)" $(WHICH) eslint || echo "ESLINT_NOT_FOUND") --max-warnings 0
ISTANBUL = $(shell PATH="$(PATH)" $(WHICH) istanbul || echo "ISTANBUL_NOT_FOUND")
MOCHA = $(shell PATH="$(PATH)" $(WHICH) _mocha || echo "MOCHA_NOT_FOUND")
AWS_CLI = $(shell PATH="$(PATH)" $(WHICH) aws || echo "AWS_NOT_FOUND")
JSON ?= $(shell PATH="$(PATH)" $(WHICH_Q) json || echo "JSON_NOT_FOUND") -D " " # to allow / or . in a key

COVERAGE_EXCLUDE = "-x _scripts/**/*" -x "web/**/*"
GIT_NUKE_EXCLUDE = -e "/.idea"

.PHONY: default
default: all

.PHONE: deps
deps:
	npm install --global-style json@9.0.3
	npm install

.PHONY: q
q: test

.PHONY: test
test: lint coverage

.PHONY: lint
lint:
	$(ESLINT) lib

.PHONY: unit
unit: test-unit

.PHONY: test-unit
test-unit:
	NODE_ENV=TEST $(MOCHA) ./tests/unit --recursive

.PHONY: ts
ts:
	NODE_ENV=TEST $(MOCHA) $(file) --recursive

.PHONY: coverage
coverage:
	NODE_ENV=TEST $(ISTANBUL) cover --include-all-sources true $(COVERAGE_EXCLUDE) $(MOCHA) ./tests/unit -- --recursive
	NODE_ENV=TEST $(ISTANBUL) check-coverage --statement 100 --branches 100 --functions 100 --lines 100

.PHONY: package
package: clean deps test
	npm prune --production
	if [ -z $(version) ]; then \
		$(eval version=$(shell npm version patch)) \
	fi
	if [ -z $(version) ]; then \
		exit 1; \
	fi
	zip -r source.zip lib/* lib/*/** node_modules/*/** > /dev/null 2>&1

.PHONY: all
all: clean deps test

.PHONY: clean
clean:
	rm -rf node_modules coverage npm-debug.log *.zip

.PHONY: nuke
nuke:
	git clean -xdf $(GIT_NUKE_EXCLUDE) .
	git checkout .
