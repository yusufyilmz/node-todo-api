const {
    MongoClient,
    ObjectID
} = require('mongodb');

var obj = new ObjectID();
console.log(obj);

MongoClient.connect('mongodb://localhost:27017/TodoApp', {
    useNewUrlParser: true
}, (err, client) => {
    if (err) {
        return console.log('Unable to connect database', err)
    }

    console.log('Connected to MongoDB server');
    const db = client.db('TodoApp');

    db.collection('Todos').find({
        completed: true,
        _id : new ObjectID('5b6c84db74b116049fd7917f')
    }).toArray().then((docs) => {
        console.log(JSON.stringify(docs, undefined, 2));
    }, (err) => {
            console.log('unable to insert todo');
    });


    db.collection('Todos').find().count().then((count) => {
        console.log('Count', count);
    }, (err) => {
            console.log('unable to insert todo');
    });

    client.close();
});