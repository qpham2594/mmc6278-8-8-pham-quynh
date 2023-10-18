const { Post, Tag } = require('../models')
const { post } = require('../models/Comment');
const { findByIdAndDelete } = require('../models/Post');

async function create(req, res, next) {
  const {title, body, tags} = req.body
  // TODO: create a new post
  // if there is no title or body, return a 400 status
  // omitting tags is OK
  // create a new post using title, body, and tags
  // return the new post as json and a 200 status
  // should render HTML

  try {
    if (!title || !body) {
      return res.status(400).json({ message:'Need both title and body.'});
    }

    const newPost = new Post ({
      title,
      body,
      tags: tags
    });

    const postSaved = await newPost.save();
    res.status(200).json(postSaved);

    res.send(`
      <html>
        <head>
          <title>New Post</title>
        </head>
        <body>
          <h1>New Post Created</h1>
          <p>Title: ${savedPost.title}</p>
          <p>Body: ${savedPost.body}</p>
          <p>Tags: ${savedPost.tags.join(', ')}</p>
        </body>
      </html>
    `);

  } catch (err) {
    res.status(500).send(err.message)
  }
}


async function get(req, res) {
  try {
    const slug = req.params.slug
    // TODO: Find a single post
    // find a single post by slug and populate 'tags'
    // you will need to use .lean() or .toObject()
    // should render HTML

    const post = await Post.findOne({slug}).populate('tags').lean();

    if (!post) {
      return res.status(400).json({message: 'Post not found to delete'})
    }

    
    post.createdAt = new Date(post.createdAt).toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    })
    post.comments.map(comment => {
      comment.createdAt = new Date(comment.createdAt).toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      })
      return comment
    })
    res.render('view-post', {post, isLoggedIn: req.session.isLoggedIn})
  } catch(err) {
    res.status(500).send(err.message)
  }
}


async function getAll(req, res) {
  try {
    // get by single tag id if included
    const mongoQuery = {}
    if (req.query.tag) {
      const tagDoc =  await Tag.findOne({name: req.query.tag}).lean()
      if (tagDoc)
        mongoQuery.tags = {_id: tagDoc._id }
    }
    const postDocs = await Post
      .find(mongoQuery)
      .populate({
        path: 'tags'
      })
      .sort({createdAt: 'DESC'})
    const posts = postDocs.map(post => {
      post = post.toObject()
      post.createdAt = new Date(post.createdAt).toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
      return post
    })
    res.render('index', {
      posts,
      isLoggedIn: req.session.isLoggedIn,
      tag: req.query.tag
    })
  } catch(err) {
    res.status(500).send(err.message)
  }
}

async function update(req, res) {
  try {
    const {title, body, tags} = req.body
    const postId = req.params.id
    // TODO: update a post
    // if there is no title or body, return a 400 status
    // omitting tags is OK
    // find and update the post with the title, body, and tags
    // return the updated post as json

    if (!title || !body) {
      return res.status(400).json({ message:'Need both title and body.'});
    }

    const postUpdate = await Post.findByIdAndUpdate(
      postId,
      { title, body, tags },
      { new: true}
    );

    if (!postUpdate) {
      return res.status(400).json({ message: ' Unable to locate post! '});
    }

    res.status(200).json(postUpdate);

  } catch(err) {
    res.status(500).send(err.message)
  }
}

async function remove(req, res, next) {
  const postId = req.params.id
  // TODO: Delete a post
  // delete post by id, return a 200 status
  try {
    const deletePost = await Post.findByIdAndDelete(postId);

    if (!deletePost) {
      return res.status(400).json({message: ' Post not found to delete.'});
    }
    res.status(200).json({message: 'Deleted post successully.'})
  
  } catch (err) {
    res.status(500).json({message: err.message});
  }
}

module.exports = {
  get,
  getAll,
  create,
  update,
  remove
}
