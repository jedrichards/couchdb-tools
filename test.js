var tools = require('./index');

var ddoc = {
    views: {
        staticData: {
            map: function (doc) {
                if ( doc.type == "feature" || doc.type == "config" ) {
                    emit(doc._id,doc);
                }
            }
        },
        featuresByPos: {
            map: function (doc) {
                if ( doc.type == "feature") {
                    emit(doc.pos,doc);
                }
            }
        }
    }
};

ddoc = tools.ddoc(ddoc,'projects');

console.log(ddoc);

var a = {foo:'bar'};
var b = {foo:'baz',qux:'quux'};

console.log(tools.combine(a,b));

console.log(tools.shortid());
console.log(tools.shortid(334534));

console.log(tools.slug('Hello world'));
console.log(tools.slug('A test with symbols £'));
