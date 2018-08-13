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


app.post('/todos', (req, res) => {
    var todo = new Todo({
        text: req.body.text,
    });
    todo.save().then((doc) => {
        res.send(doc);
    }, (err) => {
        res.status(400).send(err);
    })
});

app.get('/todos', (req, res) => {
    Todo.find().then((todos) => {
        res.send({
            todos
        });
    }).catch((err) => {
        res.status(400).send(err);
    })
});

app.get('/todos/:id', (req, res) => {

    if (!ObjectID.isValid(req.params.id)) {
        return res.status(404).send();
    }
    Todo.findById({
        _id: req.params.id
    }).then((todo) => {
        if (!todo) {
            return res.status(404);
        }
        res.send({
            todo
        });

    }).catch((err) => {
        res.status(400).send();
    })
});

app.delete('/todos/:id', (req, res) => {

    if (!ObjectID.isValid(req.params.id)) {
        return res.status(404).send();
    }
    Todo.findByIdAndRemove(req.params.id).then((todo) => {
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

app.patch('/todos/:id', (req, res) => {

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

    Todo.findByIdAndUpdate(id, {
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

    var body = _.pick(req.body, ['password', 'email']);

    var user = new User(body);

    user.save().then(() => {
            return user.generateAuthToken();
        }).then(token => {
            res.header('x-auth', token).send(user);
        })
        .catch(err => {
            return res.status(400).send(err);
        })

});



app.post('/users/login', (req, res) => {

    var body = _.pick(req.body, ['password', 'email']);

    User.findByCredentials(body.email, body.password).then((user) => {
        return user.generateAuthToken().then(token => {
            res.header('x-auth', token).send(user);
        })
    }).catch(err => {
        res.status(400).send();
    })
});


app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});


app.delete('/users/me/token', authenticate, (req, res) => {
    req.user.removeToken(req.token).then(() => {
        res.status(200).send();
    }).catch(err => {
        res.status(400).send();
    })
})


app.listen(port, () => {
    console.log('Started on port', port);
});

module.exports = {
    app
};