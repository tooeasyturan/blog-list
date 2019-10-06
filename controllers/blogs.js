const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', (request, response) => {
  Blog
    .find({})
    .then(blogs => {
      response.json(blogs)
    })
})

blogsRouter.post('/', async (request, response) => {

  const body = request.body

  if (body.title === undefined) {
    return response.status(400).json({ error: 'title missing' })
  } else if (body.url === undefined) {
    return response.status(400).json({ error: 'url missing' })
  }


  const blog = new Blog(body)

  // const blog = new Blog({
  //   title: body.title,
  //   author: body.author,
  //   url: body.url,
  //   likes: body.likes
  // })


  if (body.likes === undefined) {
    blog.likes = 0
  }

  const savedBlog = await blog.save()
  response.json(savedBlog.toJSON())


  // const blog = new Blog(request.body)

  // blog
  //   .save()
  //   .then(result => {
  //     response.status(201).json(result)
  //   })
})

module.exports = blogsRouter