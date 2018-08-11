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

    db.collection('Todos').deleteMany({
        text: 'something 2',
    }).then((result) => {
        console.log(result);
    });

    db.collection('Todos').deleteOne({
        text: 'something 2',
    }).then((result) => {
        console.log(result);
    });


   db.collection('Todos').findOneAndDelete({
        completed: false,
    }).then((result) => {
        console.log(result);
    });

 db.collection('Todos').findOneAndDelete({
        _id: new ObjectID('1232'),
    }).then((result) => {
        console.log(result);
    });
    client.close();
});