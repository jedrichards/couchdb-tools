var uglifyjs = require('uglify-js')
var extend = require('xtend');
var slug = require('slugg');
var shortid = require('shortid');
var _ = require('lodash');

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
exports.ddoc = function (obj,name) {
    obj = JSON.parse(JSON.stringify(obj,function (key,val) {
        if ( typeof val == 'function' ) {
            var res = uglifyjs.minify('('+val.toString()+')();',{
                fromString: true,
                mangle: false,
                compress: false
            });
            return res.code.slice(1,res.code.length-4);
        }
        return val;
    }));
    if ( name ) {
        obj._id = '_design/'+name;
    }
    return obj;
}

/**
 * Normalise a CouchDB result object into a flat array of document objects
 * containing _id and _rev properties.
 *
 * @param {object} CouchDB result object
 *
 * @returns {array} Normalised flat array of documents
 */
module.exports.normalise = function (collection) {
    if ( !_.isArray(collection) ) {
        collection = collection.rows;
    }
    return collection.map(function (obj) {
        if ( typeof obj.doc == 'object' ) {
            return obj.doc;
        } else {
            return {
                _id: obj.id,
                _rev: obj.rev
            }
        }
    });
}

/**
 * Algorithm for comparing two collections of documents. One collection is
 * deemed to be new, the other old. The returned result object categorises
 * the documents into a set of arrays: onlyOld, onlyNew, bothAndEqual and
 * bothAndUnEqual. For example, you may decide that the documents in onlyOld
 * need deleting and those in onlyNew need inserting.
 *
 * @param {array} current Array of up-to-date documents
 * @param {array} old Arrray of out-of-date documents
 */
exports.sync = function (newColl,oldColl) {
    var onlyOld = [];
    var bothAndEqual = [];
    var bothAndUnEqual = [];
    var onlyNew = [];

    oldColl.forEach(function (oldDoc) {
        if ( !exports.find(newColl,oldDoc._id) ) {
            onlyOld.push(oldDoc);
        }
    });
    newColl.forEach(function (newDoc) {
        var oldDoc = exports.find(oldColl,newDoc._id);
        if ( oldDoc ) {
            if ( !exports.equal(oldDoc,newDoc) ) {
                bothAndUnEqual.push({
                    old: oldDoc,
                    new: newDoc
                });
            } else {
                bothAndEqual.push({
                    old: oldDoc,
                    new: newDoc
                });
            }
        } else {
            onlyNew.push(newDoc);
        }
    });
    return {
        onlyOld: onlyOld,
        bothAndEqual: bothAndEqual,
        bothAndUnEqual: bothAndUnEqual,
        onlyNew: onlyNew
    }
}

/**
 * Clone a document. Ensures that any manipulation of complex types (objects and
 * arrays) in the clone will not corrupt data in the source document.
 */
exports.clone = function (obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Find a document by _id in a collection.
 *
 * @param {array} Normalised collection of documents
 * @param {string} The _id to search for
 *
 * @returns {object} The found object or undefined
 */
exports.find = function (collection,id) {
    return _.find(collection,function (item) {
        return item._id === id;
    });
}

/**
 * Compare two documents for equality while ignoring their _rev properties.
 *
 * @param {object} a The first object to compare
 * @param {object} a The second object to compare
 *
 * @returns {boolean} The objects' equality
 */
exports.equal = function (a,b) {
    var aRev = a._rev;
    var bRev = b._rev;
    delete a._rev;
    delete b._rev;
    var equal = _.isEqual(a,b);
    if ( aRev ) a._rev = aRev;
    if ( bRev ) b._rev = bRev;
    return equal;
}

/**
 * Create a new document that is the result of merging the properties of an
 * arbitrary number of documents. Right-most parameters passed to the function
 * gain increasing priority during the merge.
 *
 * @param {object} Any number of documents
 *
 * @returns {object} A new merged document
 */
exports.combine = function () {
    var args = Array.prototype.slice.call(arguments);
    return extend.apply(null,args);
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
exports.shortid = function (seed) {
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
exports.slug = function (text) {
    return slug(text);
}
