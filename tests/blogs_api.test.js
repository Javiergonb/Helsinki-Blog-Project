const { test, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
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

test.only('there are 2 blogs', async () => {
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, helper.initialBlogs.length)
})

test.only('id is returned instead of _id', async () => {
    const response = await api.get('/api/blogs')


    response.body.forEach(blog => {
        assert.strictEqual(blog.hasOwnProperty('id'), true)
        assert.strictEqual(blog.hasOwnProperty('_id'), false)
    })
})


test.only('adding a blog is possible', async () => {
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

test.only('likes default to 0', async () => {
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

test.only('title must be included', async () => {
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

test.only('url must be included', async () => {
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

test.only('can delete a particular blog', async () => {
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

test.only('can update a blog', async() => {
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

after(async () => {
    await mongoose.connection.close()
})