couchdb-tools
=============

`npm install coucbdb-tools --save`

A library of handy functions for use when working with CouchDB documents. All functions are database adapter agnostic.

Some functions are unique to this library, others are just wrappers around some of the best packages for the job from the Node.JS community - and which case thanks for your hard work :)

#### `ddoc(obj[,name])`

Build a JSON/CouchDB compatible design document from a native JavaScript object. The main utility of this function is to translate any map/reduce functions encountered in the design document into tidy JSON-safe strings.

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

#### `combine(a,b)`

Create a new object that is the result of copying the properties of the second parameter into the first.

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

Similar contents to the following will be output to the console:

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
