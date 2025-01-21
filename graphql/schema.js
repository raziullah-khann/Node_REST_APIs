const { buildSchema } = require("graphql");

module.exports = buildSchema(`
    type Post{
        id: ID!
        title: String!
        content: String!
        imageUrl: String!
        creator: User!
        createdAt: String!
        updatedAt: String!
    }

    type User{
        id: ID!
        name: String!
        email: String!
        password: String!
        status: String!
        posts: [Post!]!
    }

    type AuthData{
        token: String!
        userId: String!
    }

    input UserInputData{
        name: String!
        email: String!
        password: String!
    }

    type RootQuery{
        login(email: String!, password: String!): AuthData!
    }

    type RootMutation{
        createUser(userInput: UserInputData): User!
    }

    schema{
        query: RootQuery
        mutation: RootMutation
    }
`);
