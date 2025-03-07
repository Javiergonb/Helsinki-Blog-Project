const Blog = require('../models/blog')
const User = require('../models/user')

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

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

module.exports = {
  initialBlogs,
  nonExistingId,
  blogsInDb,
  usersInDb
}