const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({})
    if(blogs){
        response.json(blogs)
    } else {
        response.status(404).end()
    }
})

blogsRouter.post('/', async (request, response) => {
    const { author, title, url, likes } = request.body

    if(!title){
        return response.status(400).json({ error: 'Title is required' })
    }

    if(!url) {
        return response.status(400).json({ error: 'URL is required' })
    }

    const blog = new Blog({
        author,
        title,
        url,
        likes: likes || 0

    })

    const savedBlog = await blog.save()
    if(savedBlog){
        response.status(201).json(savedBlog)
    } else{
        response.status(404).end()
    }
        
})


blogsRouter.delete('/:id', async (request, response) => {
    await Blog.findByIdAndDelete(request.params.id)
    response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
    const { title, author,url,likes } = request.body

    const updatedBlog = await Blog.findByIdAndUpdate(
        request.params.id,
        { title, author, url, likes },
        { new: true, runValidators: true, context: 'query' }
    );
    response.status(200).json(updatedBlog);
})

module.exports = blogsRouter