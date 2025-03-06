const _ = require('lodash');

const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    const likeSum = (sum, blog) => {
        return sum + blog.likes
    }

    return blogs.reduce(likeSum, 0)
}

const favouriteBlog = (blogs) => {
    const favourite = blogs.reduce((max, blog) => {
        return (max.likes || 0) < blog.likes ? blog : max;
    }, {})

    return favourite
}

const mostBlogs = (blogs) => {
    return _.flow(
        _.partial(_.groupBy, _, "author"),
        (grouped) => _.mapValues(grouped, (blogs) => blogs.length),
        (counts) => _.maxBy(_.entries(counts), ([, count]) => count),
        (result) => (result ? { author: result[0], blogs: result[1] } : {}) // Handle undefined case
    )(blogs);
}

const mostLikes = (blogs) => {
    return _(blogs)
        .groupBy('author')
        .map((blogs, author) => ({
            author,
            likes: _.sumBy(blogs, 'likes') // Sum likes for each author
        }))
        .maxBy('likes') || {}
}

module.exports = {
    dummy,
    totalLikes,
    favouriteBlog,
    mostBlogs,
    mostLikes
}
