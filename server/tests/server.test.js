const expect = require('expect');
const request = require('supertest');
const { app } = require('./../server');
const { Todo } = require('./../models/todo');

const Todos =  [{
    text: 'first test todo'
},
{
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
                    console.log(todos);
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
                    console.log(todos);
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
                expect(res.body.text).toBe(text);
            })           
            .end(done());
    })
})