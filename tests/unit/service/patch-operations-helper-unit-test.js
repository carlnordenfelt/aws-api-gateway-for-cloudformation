'use strict';

var expect = require('chai').expect;

var testSubject = require('../../../lib/service/patchOperationsHelper.js');

describe('patchOperationsHelper', function () {
    describe('getAllowedModifications', function () {
        it('should get modifications', function (done) {
            var newConfig = {
                'new': 'test',
                'existing': 'test2'
            };
            var oldConfig = {
                'existing': 'test3',
                'removed': 'test4'
            };
            var allowed = {
                add: ['new'],
                replace: ['existing'],
                remove: ['removed']
            };
            var modifications = testSubject.getAllowedModifications(newConfig, oldConfig, allowed);
            expect(modifications.add.length).to.equal(1);
            expect(modifications.remove.length).to.equal(1);
            expect(modifications.replace.length).to.equal(1);
            done();
        });

        it('should yield replaceForAdd as replace modifications', function (done) {
            var newConfig = {
                'new': 'test',
                'existing': 'test2'
            };
            var oldConfig = {
                'existing': 'test3',
                'removed': 'test4'
            };
            var allowed = {
                add: [],
                addForReplace: ['new'],
                replace: ['existing'],
                remove: ['removed']
            };
            var modifications = testSubject.getAllowedModifications(newConfig, oldConfig, allowed);
            expect(modifications.add.length).to.equal(0);
            expect(modifications.remove.length).to.equal(1);
            expect(modifications.remove[0]).to.equal('removed');

            expect(modifications.replace.length).to.equal(2);
            expect(modifications.replace[0]).to.equal('existing');
            expect(modifications.replace[1]).to.equal('new');
            done();
        });

        it('should get modifications on deep diff', function (done) {
            var newConfig = {
                'existing': {
                    'test': {
                        diff: 'test1'
                    }
                }
            };
            var oldConfig = {
                'existing': {
                    'test': {
                        diff: 'test2'
                    }
                }
            };
            var allowed = {
                add: ['new'],
                replace: ['existing'],
                remove: ['removed']
            };
            var modifications = testSubject.getAllowedModifications(newConfig, oldConfig, allowed);
            expect(modifications.add.length).to.equal(0);
            expect(modifications.remove.length).to.equal(0);
            expect(modifications.replace.length).to.equal(1);
            done();
        });

        it('should get no modifications', function (done) {
            var newConfig = {
                'existing': 'test2'
            };
            var oldConfig = {
                'existing': 'test2'
            };
            var allowed = {
                replace: ['existing']
            };
            var modifications = testSubject.getAllowedModifications(newConfig, oldConfig, allowed);
            expect(modifications.add.length).to.equal(0);
            expect(modifications.remove.length).to.equal(0);
            expect(modifications.replace.length).to.equal(0);
            done();
        });

        it('should get no modifications', function (done) {
            var newConfig = {
                'existing': 'test1'
            };
            var oldConfig = {
                'existing': 'test2'
            };
            var allowed = {};
            var modifications = testSubject.getAllowedModifications(newConfig, oldConfig, allowed);
            expect(modifications.add.length).to.equal(0);
            expect(modifications.remove.length).to.equal(0);
            expect(modifications.replace.length).to.equal(0);
            done();
        });
        it('should allow anything if allowed is not provided', function (done) {
            var newConfig = {
                existing: 'test1',
                new: 'new1'
            };
            var oldConfig = {
                existing: 'test2',
                old: 'old'
            };
            var modifications = testSubject.getAllowedModifications(newConfig, oldConfig);
            expect(modifications.add.length).to.equal(1);
            expect(modifications.remove.length).to.equal(1);
            expect(modifications.replace.length).to.equal(1);
            done();
        });
    });

    describe('getOperations', function () {
        it('should get no invalid modification', function (done) {
            var newConfig = {
                'new': 'test',
                'existing': 'test2'
            };
            var oldConfig = {
                'existing': 'test3',
                'removed': 'test4'
            };
            var allowed = {
                add: ['new'],
                replace: ['existing'],
                remove: ['removed']
            };
            var modifications = testSubject.getAllowedModifications(newConfig, oldConfig, allowed);
            var operations = testSubject.getOperations(newConfig, modifications);
            expect(operations.length).to.equal(3);
            expect(operations[0].op).to.equal('add');
            expect(operations[0].path).to.equal('/new');
            expect(operations[0].value).to.equal('test');
            done();
        });

        it('should get not append remove operations', function (done) {
            var newConfig = {
            };
            var modifications = {
                add: ['invalid']
            };
            var operations = testSubject.getOperations(newConfig, modifications);
            expect(operations.length).to.equal(0);
            done();
        });

    });
});