const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')

const listWithOneBlog = [
  {
    _id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
    likes: 5,
    __v: 0
  }
]

const blogs = [
  {
    _id: "5a422a851b54a676234d17f7",
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
    __v: 0
  },
  {
    _id: "5a422aa71b54a676234d17f8",
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5,
    __v: 0
  },
  {
    _id: "5a422b3a1b54a676234d17f9",
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    likes: 12,
    __v: 0
  },
  {
    _id: "5a422b891b54a676234d17fa",
    title: "First class tests",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
    likes: 10,
    __v: 0
  },
  {
    _id: "5a422ba71b54a676234d17fb",
    title: "TDD harms architecture",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
    likes: 0,
    __v: 0
  },
  {
    _id: "5a422bc61b54a676234d17fc",
    title: "Type wars",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
    likes: 2,
    __v: 0
  }  
]

const emptyBlog = []

test('dummy returns one', () => {


  const result = listHelper.dummy(emptyBlog)
  assert.strictEqual(result, 1)
})

describe('total likes', () => {
  

  test('when list has only one blog, equals the likes of that', () => {
    const result = listHelper.totalLikes(listWithOneBlog)
    assert.strictEqual(result, 5)
  })

  test('when list many blogs it should sum them', () => {
    const result = listHelper.totalLikes(blogs)
    assert.strictEqual(result, 36)
  })


  test('when list is empty it should return 0', () => {
    const result = listHelper.totalLikes([])
    assert.strictEqual(result,0)
  })
})

describe('Fav blog', () => {
  test('when blog is empty just return an empty object', () =>{
    const result = listHelper.favouriteBlog(emptyBlog)
    assert.deepEqual(result,{})
  })

  test('when blog has one just return it', () =>{
    const result = listHelper.favouriteBlog(listWithOneBlog)
    assert.deepEqual(result,listWithOneBlog[0])
  })

  test('when blog has many return the blog with the most likes', () =>{
    const result = listHelper.favouriteBlog(blogs)
    assert.deepEqual(result,blogs[2])
  })
})

describe('Top blogger', () => {
  test('when blog is empty return an empty object', () => {
    const result = listHelper.mostBlogs(emptyBlog)
    assert.deepEqual(result,{})
  })
  test('when there is only one blog return the author with a count of one', () => {
    const result = listHelper.mostBlogs(listWithOneBlog)
    assert.deepEqual(result,{ author: 'Edsger W. Dijkstra', blogs: 1 })
  })
  test('when there is multiple blogs find the one with the most counts and return it', () => {
    const result = listHelper.mostBlogs(blogs)
    assert.deepEqual(result,{
      author: "Robert C. Martin",
      blogs: 3
    })
  })

})

describe('mostLiked blogger', () => {
  test('when the blogs are empty return an empty blog', () => {
    const result = listHelper.mostLikes(emptyBlog)
    assert.deepEqual(result, {})
  })
  test('when there is one blog return the author and its likes', () => {
    const result = listHelper.mostLikes(listWithOneBlog)
    assert.deepEqual(result,{
      author: 'Edsger W. Dijkstra',
      likes: 5
    })
  })
  test('when there are many blogs return the most liked blogger', () => {
    const result = listHelper.mostLikes(blogs)
    assert.deepEqual(result,{
      author: "Edsger W. Dijkstra",
      likes: 17
    })
  })
})