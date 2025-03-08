const { test, after, beforeEach,describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const bcrypt = require('bcrypt')
const User = require('../models/user')
const Blog = require('../models/blog')
const app = require('../app')

const api = supertest(app)

beforeEach(async () => {
    await Blog.deleteMany({})
    
    let blogObject = new Blog(helper.initialBlogs[0])
    await blogObject.save()
    
    blogObject = new Blog(helper.initialBlogs[1])
    await blogObject.save()
})

test('there are 2 blogs', async () => {
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, helper.initialBlogs.length)
})

test('id is returned instead of _id', async () => {
    const response = await api.get('/api/blogs')


    response.body.forEach(blog => {
        assert.strictEqual(blog.hasOwnProperty('id'), true)
        assert.strictEqual(blog.hasOwnProperty('_id'), false)
    })
})


test('adding a blog is possible', async () => {
    const newBlog = {
        author: 'Sonic',
        title: 'How to go fast',
        url: 'www.howtogofast.com',
        likes: 50
    }

    await api.post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

    const contents = blogsAtEnd.map(n => n.title)
    assert(contents.includes('How to go fast'))

})

test('likes default to 0', async () => {
    const newBlog = {
        author: 'Knuckles',
        title: 'The art of punching stuff',
        url: 'www.knuckles.com',
    }

    const response = await api.post('/api/blogs')
        .send(newBlog)
        .expect(201)

    assert.strictEqual(response.body.likes, 0)

    const savedBlog = await mongoose.model('Blog').findById(response.body.id)
    assert.strictEqual(savedBlog.likes, 0)

})

test('title must be included', async () => {
    const newBlog = {
        author: 'Tails',
        url: 'www.hello.com',
        likes: 2
    }

    await api.post('/api/blogs')
    .send(newBlog)
    .expect(400)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)

})

test('url must be included', async () => {
    const newBlog = {
        author: 'Tails',
        title: 'how to fly',
        likes: 2
    }

    await api.post('/api/blogs')
    .send(newBlog)
    .expect(400)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)

})

test('can delete a particular blog', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .expect(204)

    const blogsAtEnd = await helper.blogsInDb()
    
    const titles = blogsAtEnd.map(r => r.title)
    
    assert(!titles.includes(blogToDelete.title))
    
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)
})

test('can update a blog', async() => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]

    const updatedBlog = {
        title: blogToUpdate.title, 
        author: blogToUpdate.author,
        url: blogToUpdate.url,
        likes: 50
    };
    
    
    const response = await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .send(updatedBlog)
    .expect(200)
    .expect('Content-Type', /application\/json/);

    assert.strictEqual(response.body.likes, updatedBlog.likes);

    const blogsAtEnd = await helper.blogsInDb();
    const updatedFromDb = blogsAtEnd.find(blog => blog.id === blogToUpdate.id);
    assert(updatedFromDb);
    assert.strictEqual(updatedFromDb.title, updatedBlog.title);
    assert.strictEqual(updatedFromDb.author, updatedBlog.author);
    assert.strictEqual(updatedFromDb.url, updatedBlog.url);
})

describe('when there is initially one user in db', () => {
    beforeEach(async () => {
      await User.deleteMany({})
  
      const passwordHash = await bcrypt.hash('sekret', 10)
      const user = new User({ username: 'root', passwordHash })
  
      await user.save()
    })
  
    test('creation succeeds with a fresh username', async () => {
      const usersAtStart = await helper.usersInDb()
  
      const newUser = {
        username: 'mluukkai',
        name: 'Matti Luukkainen',
        password: 'salainen',
      }
  
      await api
        .post('/api/users')
        .send(newUser)
        .expect(201)
        .expect('Content-Type', /application\/json/)
  
      const usersAtEnd = await helper.usersInDb()
      assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)
  
      const usernames = usersAtEnd.map(u => u.username)
      assert(usernames.includes(newUser.username))
    })
    test('creation fails with proper statuscode and message if username already taken', async () => {
        const usersAtStart = await helper.usersInDb()
    
        const newUser = {
          username: 'root',
          name: 'Superuser',
          password: 'salainen',
        }
    
        const result = await api
          .post('/api/users')
          .send(newUser)
          .expect(400)
          .expect('Content-Type', /application\/json/)
    
        const usersAtEnd = await helper.usersInDb()
        assert(result.body.error.includes('expected `username` to be unique'))
    
        assert.strictEqual(usersAtEnd.length, usersAtStart.length)
      })

      test('creation fails if username is not at least 3 characters long', async () => {
        const usersAtStart = await helper.usersInDb()
        const newUser = {
            username: 'ro',
            name: 'hello',
            password: 'salainen',
          }

          const result = await api
          .post('/api/users')
          .send(newUser)
          .expect(400)
          .expect('Content-Type', /application\/json/)

          const usersAtEnd = await helper.usersInDb()
          assert(result.body.error.includes('is shorter than the minimum allowed length'))

          assert.strictEqual(usersAtEnd.length, usersAtStart.length)
      })

      test('creation fails if username is not given ', async () => {
        const usersAtStart = await helper.usersInDb()
        const newUser = {
            name: 'hello',
            password: 'salainen',
          }
        const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        assert(result.body.error.includes('Path `username` is required'))

        assert.strictEqual(usersAtEnd.length, usersAtStart.length)


      })

      test('creation fails if password is not at least 3 characters long', async () => {
        const usersAtStart = await helper.usersInDb()
        const newUser = {
            username: 'root',
            name: 'hello',
            password: 'sa',
          }

          const result = await api
          .post('/api/users')
          .send(newUser)
          .expect(400)
          .expect('Content-Type', /application\/json/)

          const usersAtEnd = await helper.usersInDb()
          assert(result.body.error.includes('Password must be at least 3 characters long'))

          assert.strictEqual(usersAtEnd.length, usersAtStart.length)
      })

      test('creation fails if password is not given ', async () => {
        const usersAtStart = await helper.usersInDb()
        const newUser = {
            username: 'root',
            name: 'hello',
          }
        const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        assert(result.body.error.includes('Password is required'))
       

        assert.strictEqual(usersAtEnd.length, usersAtStart.length)
      })
      
  })



after(async () => {
    await mongoose.connection.close()
})