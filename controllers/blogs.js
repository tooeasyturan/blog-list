const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs.map(blog => blog.toJSON()))

  // Blog
  //   .find({})
  //   .then(blogs => {
  //     response.json(blogs)
  //   })
})

blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  if (blog) {
    response.json(blog.toJSON())
  } else {
    response.status(404).end()
  }
})

blogsRouter.post('/', async (request, response, next) => {
  const body = request.body

  const token = getTokenFrom(request)

  try {
    const decodedToken = jwt.verify(token, process.env.SECRET)
    if (!token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }

    const user = await User.findById(decodedToken.id)

    if (body.title === undefined) {
      return response.status(400).json({ error: 'title missing' })
    } else if (body.url === undefined) {
      return response.status(400).json({ error: 'url missing' })
    }


    // const blog = new Blog(body)

    const blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes,
      user: user._id
    })


    if (body.likes === undefined) {
      blog.likes = 0
    }

    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()
    response.json(savedBlog.toJSON())
  } catch (exception) {
    next(exception)
  }

  // const blog = new Blog(request.body)

  // blog
  //   .save()
  //   .then(result => {
  //     response.status(201).json(result)
  //   })
})

blogsRouter.delete('/:id', async (request, response, next) => {
  const token = getTokenFrom(request)

  try {
    const decodedToken = jwt.verify(token, process.env.SECRET)
    if (!token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }

    const userId = await User.findById(decodedToken.id)

    const blog = await Blog.findById(request.params.id)
    if (blog.user.toString() === userId._id.toString()) {
      await Blog.findByIdAndRemove(request.params.id)
      response.status(204).end()
    } else {
      console.log(blog.user)
      console.log(userId)
      return response.status(401).json({ error: 'invalid user' })
    }

  } catch (exception) {
    next(exception)
  }
})

blogsRouter.put('/:id', (request, response) => {
  const body = request.body

  const blog = {
    likes: body.likes
  }

  Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    .then(updatedBlog => {
      response.json(updatedBlog.toJSON())
    })
})

module.exports = blogsRouter