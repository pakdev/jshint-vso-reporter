var chai = require('chai');
var stdout = require('test-console').stdout;
var reporter = require('./index.js').reporter;

chai.should();

describe('Tests', () => {
    var restore,
        output;

    beforeEach(() => {
        ({ restore, output } = stdout.inspect());
    });

    afterEach(() => {
        restore();
    });

    it('should log nothing with no results', () => {
        const results = [];

        reporter(results);

        output[0].should.equal('\n');
    });

    it('should allow severity to be set', () => {
        const results = [{ file: 'a.txt', error: {} }];

        reporter(results, null, { type: 'error' });

        output[0].should.contain('type=error');
        output[0].should.not.contain('type=warning');
    });

    it('should group results by file', () => {
        const results = [
            { file: 'a.txt', error: {} },
            { file: 'b.txt', error: {} },
            { file: 'a.txt', error: {} },
            { file: 'c.txt', error: {} }
        ];

        reporter(results);

        let expectedOutput = [];
        for (var path of ['a.txt', 'a.txt', 'b.txt', 'c.txt']) {
            expectedOutput.push(`###vso[task.logissue type=warning;sourcepath=${path}]`);
        }

        expectedOutput.push('');
        output[0].split('\n').should.deep.equal(expectedOutput);
    });

    it('should not log undefined attributes', () => {
        const results = [{
            file: 'a.txt',
            error: {
                line: 5,
                character: undefined,
                code: 'red',
                reason: 'message'
            }
        }];

        reporter(results);

        output[0].should.not.contain('undefined');
        output[0].should.contain('line=5;code=red]message');
    });

    it('should not log undefined messages', () => {
        const results = [{
            file: 'a.txt',
            error: {
                line: 5,
                character: 1,
                code: 'blue',
                reason: undefined
            }
        }];

        reporter(results);

        output[0].should.not.contain('undefined');
        output[0].should.match(/line=5;column=1;code=blue]\n$/);
    })
});