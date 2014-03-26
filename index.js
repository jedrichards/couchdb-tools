var uglifyjs = require('uglify-js')
var extend = require('xtend');
var slug = require('slugg');
var shortid = require('shortid');

/**
 * Build a JSON/CouchDB compatible design document from a native JavaScript
 * object. The main utility of this function is to translate any map/reduce
 * functions encountered in the design document into tidy JSON-safe strings.
 *
 * @param {object} ddoc Native JS object representing the design document
 * @param {string} name Design document name (optional)
 *
 * @return {object} A new design document object suitable for adding to a db
 */
module.exports.ddoc = function (obj,name) {
    function r (o) {
        Object.keys(o).forEach(function (key) {
            var value = o[key];
            var type = typeof value;
            if ( type === 'object' ) {
                r(value);
                return;
            }
            if ( type === 'function' ) {
                value.toJSON = function () {
                    var res = uglifyjs.minify('('+this.toString()+')();',{
                        fromString: true,
                        mangle: false,
                        compress: false
                    });
                    return res.code.slice(1,res.code.length-4);
                };
            }
        });
        return o;
    }
    obj = JSON.parse(JSON.stringify(r(obj)));
    if ( name ) {
        obj._id = '_design/'+name;
    }
    return obj;
}

/**
 * Create a new object that is the result of copying the properties of the
 * second parameter into the first.
 *
 * @param {object} a First parameter
 * @param {object} b Second parameter
 *
 * @returns {object} A new object, a combination of a and b
 */
module.exports.combine = function (a,b) {
    return extend(a,b);
}

/**
 * Generate URI-safe, short, non-sequential unqiue ids. Optionally pass in a
 * unique-for-your-app random number seed which will make your ids more secure.
 * Passing the seed only needs to be done once at the start.
 *
 * @param {number} seed Random number seed (optional)
 *
 * @returns {string} A short unique id.
 */
module.exports.shortid = function (seed) {
    if ( typeof seed != 'undefined' ) {
        shortid.seed(seed);
    }
    return shortid.generate()
}

/**
 * Converts a string into a URI-safe slug. Symbols are removed and foreign
 * characters are coerced into to their English equivalent.
 *
 * @param {string} text The text to slugify.
 *
 * @returns {string} A URI-safe slug.
 */
module.exports.slug = function (text) {
    return slug(text);
}
