'use strict';

module.exports = {
    reporter: function(results, data, opts) {
        var out = [];
        var files = {};

        opts = opts || {};

        var type = 'warning';
        if (opts.type && opts.type == 'error') {
            type = opts.type;
        }

        results.forEach(result => {
            result.file = result.file.replace(/^[\.\/\\]*/, '');

            if (!files[result.file]) {
                files[result.file] = [];
            }

            files[result.file].push(result.error);
        });

        Object.keys(files).forEach(path => {
            const error = files[path];
            out.push(`###vso[task.logissue type=${type};sourcepath=${path};linenumber=${error.line};columnnumber=${error.character};code=${error.code}]${error.reason}`);
        });

        console.log(out.join('\n'));
    }
}