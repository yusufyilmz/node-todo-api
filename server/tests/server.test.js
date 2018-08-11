const expect = require('expect');
const request = require('supertest');
const { ObjectID} =  require('mongodb');
const { app } = require('./../server');
const { Todo } = require('./../models/todo');

const Todos =  [{
    _id:  new ObjectID(),
    text: 'first test todo'
},
{
    _id:  new ObjectID(),
    text: 'second test todo'
}];

beforeEach((done) => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(Todos);
    }).then(() =>  done())
});

describe('POST /todos', () => {

    it('should create a todo', (done) => {
        var text = 'test todo text';

        request(app)
            .post('/todos')
            .send({
                text
            })
            .expect(200)
            .expect((res) => {
                expect(res.body.text).toBe(text);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find().then((todos) => {
                    expect(todos.length).toBe(Todos.length +1);
                    expect(todos[Todos.length].text).toBe(text);
                    done();
                }).catch((err) => {
                    done(err);
                })
            });
    });


       it('should not create a todo with invalid body', (done) => {
        var text = 'test todo text';

        request(app)
            .post('/todos')
            .send({})
            .expect(400)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                Todo.find().then((todos) => {
                    expect(todos.length).toBe(Todos.length);
                    done();
                }).catch((err) => {
                    done(err);
                })
            });
    });

});

describe ('GET /todos', ()=> {
    it('should get todos', (done) =>{

        request(app)
            .get('/todos')
            .expect(200)
            .expect((res) => {
                console.log(res.body)
                expect(res.body.todos.length).toBe(Todos.length);
            })           
            .end(done);
    });
});


describe ('GET /todos/:id', ()=> {
    it('should return  todo', (done) =>{

        request(app)
            .get(`/todos/${Todos[0]._id.toHexString()}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(Todos[0].text);
            })           
            .end(done);
    });


    it('should return 404 for nonobject id', (done) =>{

        request(app)
            .get(`/todos/123`)
            .expect(404)
                   
            .end(done);
    });

    it('should return 404 if todo not found', (done) =>{

        request(app)
            .get(`/todos/${Todos[0]._id.toHexString() - 1}`)
            .expect(404)
            .end(done);
    })
});