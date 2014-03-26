var tools = require('./index');

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

var ddoc = tools.ddoc(projects,'projects');

console.log(ddoc);

var a = {foo:'bar',baz:'qux'};
var b = {foo:'quux',qux:'quuux'};

console.log(tools.combine(a,b));

tools.shortid(343983);
console.log(tools.shortid());
console.log(tools.shortid());
console.log(tools.shortid());

console.log(tools.slug('Hello world'));
console.log(tools.slug('A test with symbols £'));
