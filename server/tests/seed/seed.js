const {
    ObjectID
} = require('mongodb');
const {
    Todo
} = require('./../../models/todo');
const {
    User
} = require('./../../models/user');
const jwt = require('jsonwebtoken');

const Todos = [{
        _id: new ObjectID(),
        text: 'first test todo'
    },
    {
        _id: new ObjectID(),
        text: 'second test todo',
        completed: true,
        completedAt: 333
    }
];

const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const Users = [{
        _id: userOneId,
        email: 'yilmaz@gmail.com',
        password: '123456',
        tokens: [{
            access: 'auth',
            token: jwt.sign({
                _id: userOneId,
                access: 'auth'
            }, 'abc123').toString()
        }]
    },
    {
        _id: userTwoId,
        email: 'yilmazfail@gmail.com',
        password: '123457'
    }
];

const populateTodos = (done) => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(Todos);
    }).then(() => done())
};

const populateUsers = (done) => {
    User.remove({}).then(() => {
        var userOne = new User(Users[0]).save();
        var userTwo = new User(Users[1]).save();
        return Promise.all([userOne, userTwo]);
    }).then(() => done())
};
module.exports = {
    Todos,
    Users,
    populateTodos,
    populateUsers
};