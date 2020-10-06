import request from 'supertest';
import {app} from '../../app';

it('Returns a 201 on successful singup', async () => {
return request(app)
    .post('/api/users/signup')
    .send({email: 'test@test.com',
           password: 'Password' 
          })
    .expect(201);
});

it('Returns a 400 with an invalidEmail', async () => {
    return request(app)
        .post('/api/users/signup')
        .send({email: 'testtest.com',
               password: 'Password' 
              })
        .expect(400);
    });
    it('Returns a 400 with an invalidpassword', async () => {
        return request(app)
            .post('/api/users/signup')
            .send({email: 'testtest.com',
                   password: 'Pas' 
                  })
            .expect(400);
        });
    it('Returns a 400 with an missing Email and Password', async () => {
            await request(app)
                .post('/api/users/signup')
                .send({email: '',
                       password: '21124' 
                      })
                .expect(400);
            await request(app)
                .post('/api/users/signup')
                .send({email: 'fasf@gmai.com',
                       password: '' 
                      })
                .expect(400);
        });       
    it('disallow duplicate Emails', async () => {
            await request(app)
                    .post('/api/users/signup')
                    .send({email: 'test@test.com',
                           password: 'Password' 
                          })
                    .expect(201);
            await request(app)
                    .post('/api/users/signup')
                    .send({email: 'test@test.com',
                           password: 'Password' 
                          })
                    .expect(400);
    });

    it('It sets a cookiee after successful signup', async () => {
        const response = await request(app)
            .post('/api/users/signup')
            .send({email: 'fasf@gmai.com',
                   password: '12345' 
                  })
            .expect(201);
        expect (response.get("Set-Cookie")).toBeDefined();
    
    }); 