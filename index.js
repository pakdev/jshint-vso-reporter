/* jshint node: true */
'use strict';

function createIssue(type, path, attributes) {
    const attributeString = Array.from(attributes)
        .filter(([key, val]) => val !== undefined)
        .filter(([key, val]) => key !== 'message') // jshint ignore:line
        .map(([key, val]) => `${key}=${val}`)
        .join(';');

    let log = `###vso[task.logissue type=${type};sourcepath=${path}`;
    if (attributeString.length > 0) {
        log = `${log};${attributeString}`;
    }

    const message = attributes.get('message');

    return `${log}]${message ? message : ''}`;
}

module.exports = {
    reporter: function(results, data, opts) {
        var out = [];
        var files = new Map();

        opts = Object.assign({}, { severity: 'warning' }, opts);

        results.forEach(result => {
            result.file = result.file.replace(/^[\.\/\\]*/, '');

            if (!files.has(result.file)) {
                files.set(result.file, []);
            }

            files.get(result.file).push(result.error);
        });

        files.forEach((errors, path) => {
            errors.forEach(error => {
                let issue = createIssue(opts.severity, path, new Map([
                    [ 'linenumber', error.line ],
                    [ 'columnnumber', error.character ],
                    [ 'code', error.code ],
                    [ 'message', error.reason ]
                ]));

                out.push(issue);
            });
        });

        console.log(out.join('\n'));
    }
};