const path = require("path");

exports.getPost = (req, res, next) => {
  res.status(200).json({
    posts: [
      {
        _id: '1', 
        title: "First Post",
        content: "This is the first post!",
        imageUrl:"images/duck.jpg",
        creator: {
            name: 'Raziullah'
        },
        createdAt: new Date()
      },
    ],
  });
};

exports.createPost = (req, res, next) => {
  //suppose we get title and content from the body
  const { title, content } = req.body;
  console.log(title, content);
  //create post in db
  res.status(201).json({
    message: "Post created successfully!",
    post: { _id: new Date().toISOString(), title: title, content: content, creator: {name: 'Raziullah'}, createdAt: new Date() },
  });
};
