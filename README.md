couchdb-tools
=============

A CouchDB database adapter agnostic function library.

Provides a library of handy functions for use when working with CouchDB documents.

Some functions are unique to this library, others are just wrappers around some of the best packages for the job from the Node.JS community.

#### `ddoc(obj[,name])`

Build a JSON/CouchDB compatible design document from a native JavaScript object. The main utility of this function is to translate any map/reduce functions encountered in the design document into tidy JSON-safe strings.
