var uglifyjs = require('uglify-js')
var extend = require('xtend');
var slug = require('slugg');
var shortid = require('shortid');
var _ = require('lodash');

exports.ddoc = (obj, name) => {
    obj = JSON.parse(JSON.stringify(obj,(key, val) => {
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

module.exports.normalise = res => {
    var rows = res.rows;
    if ( !_.isArray(rows) ) {
        return res;
    }
    return rows.map(row => {
        if ( _.isObject(row.doc) && _.isString(row.doc._id) ) {
            return row.doc;
        } else {
            return row.value;
        }
    });
}

exports.clone = obj => JSON.parse(JSON.stringify(obj))

exports.find = (collection, id) => _.find(collection,item => item._id === id)

exports.setEach = (collection, key, value) => {
    collection.forEach(obj => {
        obj[key] = value;
    });
}

exports.equal = (a, b) => {
    var aRev = a._rev;
    var bRev = b._rev;
    delete a._rev;
    delete b._rev;
    var equal = _.isEqual(a,b);
    if ( aRev ) a._rev = aRev;
    if ( bRev ) b._rev = bRev;
    return equal;
}

exports.extend = extend;

exports.shortid = seed => {
    if ( typeof seed != 'undefined' ) {
        shortid.seed(seed);
    }
    return shortid.generate()
}

exports.slug = slug;

exports.sync = (newColl, oldColl) => {
    var onlyOld = [];
    var bothAndEqual = [];
    var bothAndUnEqual = [];
    var onlyNew = [];
    oldColl.forEach(oldDoc => {
        if ( !exports.find(newColl,oldDoc._id) ) {
            onlyOld.push(oldDoc);
        }
    });
    newColl.forEach(newDoc => {
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
        onlyOld,
        bothAndEqual,
        bothAndUnEqual,
        onlyNew
    };
}
