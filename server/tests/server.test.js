const expect = require('expect');
const request = require('supertest');
const {
    ObjectID
} = require('mongodb');
const {
    app
} = require('./../server');
const {
    Todo
} = require('./../models/todo');
const {
    User
} = require('./../models/user');
const {
    Todos,
    populateTodos,
    Users,
    populateUsers
} = require('./seed/seed');

beforeEach(populateTodos);
beforeEach(populateUsers);

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
                    expect(todos.length).toBe(Todos.length + 1);
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

describe('GET /todos', () => {
    it('should get todos', (done) => {

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


describe('GET /todos/:id', () => {
    it('should return  todo', (done) => {

        request(app)
            .get(`/todos/${Todos[0]._id.toHexString()}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(Todos[0].text);
            })
            .end(done);
    });


    it('should return 404 for nonobject id', (done) => {

        request(app)
            .get(`/todos/123`)
            .expect(404)

            .end(done);
    });

    it('should return 404 if todo not found', (done) => {

        request(app)
            .get(`/todos/${Todos[0]._id.toHexString() - 1}`)
            .expect(404)
            .end(done);
    })
});




describe('DELETE /todos/:id', () => {
    it('should delete  todo', (done) => {
        const id = Todos[0]._id.toHexString();

        request(app)
            .delete(`/todos/${id}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo._id).toBe(id);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.findById(id).then((todo) => {
                    expect(todo).toBeFalsy()
                    done();
                }).catch((err) => {
                    done(err);
                })

            });
    });


    it('should return 404 for nonobject id', (done) => {

        request(app)
            .delete(`/todos/123`)
            .expect(404)

            .end(done);
    });

    it('should return 404 if todo not found', (done) => {

        request(app)
            .delete(`/todos/${Todos[0]._id.toHexString() - 1}`)
            .expect(404)
            .end(done);
    })
});



describe('PATCH /todos/:id', () => {

    it('should update todo', (done) => {

        var text = 'updated';

        var id = Todos[0]._id.toHexString();
        request(app)
            .patch(`/todos/${id}`)
            .send({
                completed: true,
                text
            })
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.completed).toBe(true);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.findById(id).then((todo) => {
                    expect(res.body.todo.completed).toBe(true);
                    expect(res.body.todo.text).toBe(text);
                    expect(typeof res.body.todo.completedAt).toBe('number');
                    done();
                }).catch((err) => {
                    done(err);
                })

            });
    });

    it('should clear completedAt when todo is not completed', (done) => {

        var id = Todos[0]._id.toHexString();
        var text = 'updated'
        request(app)
            .patch(`/todos/${id}`)
            .send({
                completed: false,
                text
            })
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.completed).toBe(false);
                expect(res.body.todo.text).toBe(text);
                expect(res.body.todo.completedAt).toBeNull();

            })
            .end(done);
    });

})

describe('POST /users', () => {

    it('should create user', (done) => {
        var email = 'yilmazyu@gmail.com';
        var password = '123abc';

        request(app)
            .post('/users')
            .send({
                email,
                password
            })
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth']).toBeTruthy();
                expect(res.body._id).toBeTruthy();
                expect(res.body.email).toEqual(email);
            })
            .end((err) => {
                if (err) {
                    return done(err);
                }

                User.findOne({
                    email
                }).then((user) => {
                    expect(user).toBeTruthy();
                    expect(user.password).not.toBe(password);
                    return done();
                }).catch(err => {
                    return done(err);
                })
            });
    });

    it('should return validation error if invalid request', (done) => {
        request(app)
            .post('/users')
            .send({
                email:  'email',
                password: '123'
            })
            .expect(400)
            .end(done);
    })

    it('should not create if email is used', (done) => {
        request(app)
            .post('/users')
            .send({
                email: Users[0].email,
                password: '123'
            })
            .expect(400)
            .end(done);
    });



})



describe('POST /users/login', () => {
  it('should login user and return auth token', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: Users[1].email,
        password: Users[1].password
      })
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeTruthy();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(Users[1]._id).then((user) => {
          expect(user.tokens[0]).toMatchObject({
            access: 'auth',
            token: res.headers['x-auth']
          });
          done();
        }).catch((e) => done(e));
      });
  });

  it('should reject invalid login', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: Users[1].email,
        password: Users[1].password + '1'
      })
      .expect(400)
      .expect((res) => {
        expect(res.headers['x-auth']).not.toBeTruthy();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(Users[1]._id).then((user) => {
          expect(user.tokens.length).toBe(0);
          done();
        }).catch((e) => done(e));
      });
  });
});


describe('GET /users/me', () => {
  it('should return user if authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth', Users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toBe(Users[0]._id.toHexString());
        expect(res.body.email).toBe(Users[0].email);
      })
      .end(done);
  });

  it('should return 401 if not authenticated', (done) => {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });
});


describe('DELETE /users/me/token', () => {

    it('should remove auth token on logout', (done) => {

        request(app)
        .delete('/users/me/token')
        .set('x-auth', Users[0].tokens[0].token)
        .expect(200)
        .end((err, res) => {
            if(err) {
                return done(err);
            }

            User.findById(Users[0]._id).then(user => {
                expect(user.tokens.length).toBe(0);
                done();
            }).catch(err =>  done(err));
        })
    } )
})