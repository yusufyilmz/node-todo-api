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

const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const Todos = [{
        _id: new ObjectID(),
        text: 'first test todo',
        _creator :  userOneId
    },
    {
        _id: new ObjectID(),
        text: 'second test todo',
        completed: true,
        completedAt: 333,
        _creator :  userTwoId
    }
];


const Users = [{
        _id: userOneId,
        email: 'yilmaz@gmail.com',
        password: '123456',
        tokens: [{
            access: 'auth',
            token: jwt.sign({
                _id: userOneId,
                access: 'auth'
            }, process.env.JWT_SECRET).toString()
        }]
    },
    {
        _id: userTwoId,
        email: 'yilmazfail@gmail.com',
        password: '123457',
          tokens: [{
            access: 'auth',
            token: jwt.sign({
                _id: userTwoId,
                access: 'auth'
            }, process.env.JWT_SECRET).toString()
        }]
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