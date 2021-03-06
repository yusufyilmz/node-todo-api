const config = require('./config/config');
const express = require('express');
const _ = require('lodash');
const bodyParser = require('body-parser');
const {
    ObjectID
} = require('mongodb');

var {
    mongoose
} = require('./db/mongoose');
var {
    Todo
} = require('./models/todo');
var {
    User
} = require('./models/user');
var {
    authenticate
} = require('./middleware/authenticate');

var app = express();
const port = process.env.PORT || 4000;

app.use(bodyParser.json());


app.post('/todos', authenticate, (req, res) => {
    var todo = new Todo({
        text: req.body.text,
        _creator: req.user._id
    });
    todo.save().then((doc) => {
        res.send(doc);
    }, (err) => {
        res.status(400).send(err);
    })
});

app.get('/todos', authenticate, (req, res) => {
    Todo.find({
        _creator: req.user._id
    }).then((todos) => {
        res.send({
            todos
        });
    }).catch((err) => {
        res.status(400).send(err);
    })
});

app.get('/todos/:id', authenticate, (req, res) => {

    if (!ObjectID.isValid(req.params.id)) {
        return res.status(404).send();
    }

    console.log("requ")
    console.log(req.user)

    Todo.findOne({
        _id: req.params.id,
        _creator: req.user._id
    }).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }

        res.send({
            todo
        });

    }).catch((err) => {
        res.status(400).send();
    })
});

app.delete('/todos/:id', authenticate, (req, res) => {

    if (!ObjectID.isValid(req.params.id)) {
        return res.status(404).send();
    }

    try {


        const todo = await Todo.findOneAndRemove({
            _id: req.params.id,
            _creator: req.user._id
        });

        if (!todo) {
            return res.status(404).send();
        }

        res.send({
            todo
        });

    } catch (e) {
        res.status(400).send();

    }


});

app.patch('/todos/:id', authenticate, (req, res) => {

    var id = req.params.id;
    var body = _.pick(req.body, ['text', 'completed']);


    if (!ObjectID.isValid(req.params.id)) {
        return res.status(404).send();
    }

    if (_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime();
    } else {
        body.completedAt = null;
        body.completed = false;
    }

    Todo.findOneAndUpdate({
        _id: id,
        _creator: req.user._id
    }, {
        $set: body
    }, {
        new: true
    }).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }

        res.send({
            todo
        });
    }).catch(err => {
        res.status(404).send();
    });


});



app.post('/users', (req, res) => {

    try {
        const body = _.pick(req.body, ['password', 'email']);
        const user = new User(body);
        await user.save();
        const token = await user.generateAuthToken();
        res.header('x-auth', token).send(user);
    } catch (e) {
        res.status(400).send(err);
    }

});

app.post('/users/login', async (req, res) => {

    try {
        var body = _.pick(req.body, ['password', 'email']);
        const user = await User.findByCredentials(body.email, body.password);
        const token = await user.generateAuthToken();
        res.header('x-auth', token).send(user);

    } catch (e) {
        res.status(400).send();

    }
});


app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});


app.delete('/users/me/token', authenticate, async (req, res) => {
    try {
        await req.user.removeToken(req.token);
        res.status(200).send();
    } catch (e) {
        res.status(400).send();

    }
})



app.listen(port, () => {
    console.log('Started on port', port);
});

module.exports = {
    app
};