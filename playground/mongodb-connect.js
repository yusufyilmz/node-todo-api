const {MongoClient, ObjectID} = require('mongodb');

var obj = new ObjectID();
console.log(obj);

MongoClient.connect('mongodb://localhost:27017/TodoApp', { useNewUrlParser: true }, (err, client) =>{
    if(err) {
       return console.log('Unable to connect database', err)
    }

    console.log('Connected to MongoDB server');
    const db = client.db('TodoApp');

    db.collection('Todos').insertOne({
        text : 'something',
        completed: false
    }, (err, result) => {
        if(err) {
           return  console.log('unable to insert todo');
        }
        
        console.log(JSON.stringify(result.ops, undefined, 2));
        console.log(JSON.stringify(result.ops[0]._id.getTimestamp(), undefined, 2));
        
    })
    client.close();
});