var tools = require('./index');

console.log('\n>>> ddoc\n');

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

console.log('\n>>> extend\n');

var a = {foo:'bar',baz:'qux'};
var b = {foo:'quux',qux:'quuux'};
var c = {quuuux:'quuuuux'};

console.log(tools.extend(a,b,c));

console.log('\n>>> shortid\n');

tools.shortid(343983);
console.log(tools.shortid());
console.log(tools.shortid());
console.log(tools.shortid());

console.log('\n>>> slug\n');

console.log(tools.slug('Hello world'));
console.log(tools.slug('A test with symbols £'));

console.log('\n>>> sync\n');

var current = [
    {
        _id: '1'
    },
    {
        _id: '2',
        foo: 'bar'
    },
    {
        _id: '3'
    }
];

var old = [
    {
        _id: '1'
    },
    {
        _id: '2'
    },
    {
        _id: '4'
    }
]

var synced = tools.sync(current,old);
console.log(synced);

var equalityA = {
    foo: 'bar',
    baz: [1,2,3],
    qux: {
        quux: 'quuux'
    }
}

var equalityB = {
    foo: 'bar',
    baz: [1,2,3],
    qux: {
        quux: 'quuux'
    }
}

console.log('\n>>> equal\n');

console.log(tools.equal(equalityA,equalityB));
