# couchdb-tools

`npm install coucbdb-tools --save`

A Node.js library of handy functions for use when working with CouchDB documents. All functions are database adapter agnostic.

Some functions are unique to this library, others are just wrappers around some of the best packages for the job from the Node.JS community - and in which case thanks for your hard work :)

#### `ddoc(obj[,name])`

Build a JSON/CouchDB compatible design document from a native JavaScript object. The main utility of this function is to translate any functions encountered in the design document into tidy JSON-safe strings. Design documents stored as valid JavaScript objects alongside your app source code rather than as raw JSON can benefit properly from version control and linting.

The `name` parameter is optional, and only required if you wish to create the design document's id too.

##### Example

```javascript
var tools = require('couchdb-tools');

var projects = {
    views: {
        projectsById: {
            map: function (doc) {
                if ( doc.type == "project") {
                    emit(doc._id,doc);
                }
            }
        }
    }
}

var projectsDesignDoc = tools.ddoc(projects,'projects');

console.log(projectsDesignDoc);
```

The following will be output to the console:

```javascript
{
    _id: '_design/projects',
    views: {
        projectsById: {
            map: 'function(doc){if(doc.type=="project"){emit(doc._id,doc)}}'
        }
    }
}

```

#### `normalise(res)`

Normalise a CouchDB result set into a flat array of document objects containing `_id` and `_rev` properties. The function will try to intelligently deal with the presence or lack of actual documents in the result as defined by the `include_docs` parameter.

##### Example

Given a raw CouchDB result set object similar to,

```javascript
{
    total_rows: 10,
    offset: 0,
    rows: [
        {
            id: '...',
            key: '...',
            value: {...},
            doc: {...}
        },
        { ... },
        { ... },
        etc.
    ]
}
```

and invoking `normalise` on this object,

```javascript
var tools = require('couchdb-tools');

res = tools.normalise(res);

console.log(res);
```

will produce the following output:

```javascript
[
    {
        _id: '...',
        _rev: '...',
        propA: '...',
        propB: '...'
    },
    { ... },
    { ... },
    etc.
]
```

You can now inspect or manipulate this array of documents freely and save back to CouchDB in a bulk operation.

#### `clone(obj)`

Returns a deep clone of a document. Use it when you need to copy and manipulate a document without fear of corrupting the original data set.

#### `find(collection,id)`

Find a document by `_id` in an array.

#### `setEach(collection,key,value)`

Set a key to a certain value in every document in a collection.

#### `equal(a,b)`

Compares two documents for deep equality. Document `_rev` values are ignored and can differ while their parent documents are still considered equal.

#### `extend(obj,obj[,obj,...])`

Create a new document that is the result of copying the properties of an arbitrary number of documents into it. Documents at the right end of the parameter list are given precedent.

##### Example

```javascript
var tools = require('couchdb-tools');
var a = {foo:'bar',baz:'qux'};
var b = {foo:'quux',qux:'quuux'};
var combination = tools.combine(a,b);
console.log(combination);
```

The following will be output to the console:

```javascript
{
    foo: 'quux',
    baz: 'qux',
    qux: 'quuux'
}
```

#### `shortid([seed])`

Generate URI-safe, short, non-sequential unique ids. Optionally pass in a unique-for-your-app random number seed which will make your ids more secure. Passing the seed only needs to be done once at the start.

##### Example

```javascript
var tools = require('couchdb-tools');
tools.shortid(343983);
console.log(tools.shortid());
console.log(tools.shortid());
console.log(tools.shortid());
```

Output similar to the following will be generated:

```
FG2Ws27qck
dGEEs27X15
oHeEydIXck
```

#### `slug(text)`

Converts a string into a URI-safe slug. Symbols are removed and foreign characters are coerced into their English equivalent.

##### Example

```javascript
var tools = require('couchdb-tools');
console.log(tools.slug('Hello $$$ world'));
```

The following will be output to the console:

```
hello-world
```

#### `sync(newColl,oldColl)`

Algorithm for synchronising two collections of documents by `_id`. Useful for synchronising a local data set with the db (for example design documents or static app config data etc.).

The algorithm will compare the two sets of documents and determine which documents,

- only exist in the old set
- only exist in the new set
- exist in both and are identical
- exist in both and are different

It is left to your app code to determine how to handle each set. The results are exposed in the returned object, which has the following structure:

```javascript
{
    onlyOld: [ ... ],
    onlyNew: [ ... ],
    bothAndEqual: [
        {
            old: {},
            new: {}
        },
        { ... }
    ],
    bothAndUnEqual: [
        {
            old: {},
            new: {}
        },
        { ... }
    ]
}
```
