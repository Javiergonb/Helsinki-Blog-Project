const Blog = require('../models/blog')

const initialBlogs = [
    {
        title: 'How to be happy',
        author: 'Javier Gonzalez',
        url: 'https://www.howtobehappy.com',
        likes: 13
    },
    {
        title: 'Hello',
        author: 'me',
        url: 'https://www.Hello.com',
        likes: 0
    },
]
const nonExistingId = async () => {
  const note = new Blog({ title: 'willremovethissoon',author: 'me',url:'www.deleted.com'})
  await note.save()
  await note.deleteOne()

  return note._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(note => note.toJSON())
}

module.exports = {
  initialBlogs, nonExistingId, blogsInDb
}