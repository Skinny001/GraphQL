const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { 
  GraphQLSchema, 
  GraphQLObjectType, 
  GraphQLString, 
  GraphQLList, 
  GraphQLInt, 
  GraphQLNonNull, 
  GraphQLID 
} = require('graphql');

// Initialize Express
const app = express();

// Add CORS middleware here
const cors = require('cors');
app.use(cors());

// Sample data (in a real app, this would be a database)
// In-memory array of authors
let authors = [
  { id: '1', name: 'J.K. Rowling', age: 55 },
  { id: '2', name: 'George R.R. Martin', age: 72 },
  { id: '3', name: 'Stephen King', age: 73 }
];

// In-memory array of books
let books = [
  { id: '1', name: 'Harry Potter', authorId: '1', genre: 'Fantasy' },
  { id: '2', name: 'A Game of Thrones', authorId: '2', genre: 'Fantasy' },
  { id: '3', name: 'The Shining', authorId: '3', genre: 'Horror' },
  { id: '4', name: 'The Stand', authorId: '3', genre: 'Horror' },
  { id: '5', name: 'A Clash of Kings', authorId: '2', genre: 'Fantasy' },
  { id: '6', name: 'web3', authorId: '4', genre: 'Horror' }
];

// Define Book Type (forward declaration to handle circular dependency)
const BookType = new GraphQLObjectType({
  name: 'Book',
  description: 'This represents a book written by an author',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    genre: { type: new GraphQLNonNull(GraphQLString) },
    authorId: { type: new GraphQLNonNull(GraphQLID) },
    // This field allows us to get the author of this book
    author: {
      type: AuthorType,
      resolve: (book) => {
        // Find the author with the matching id
        return authors.find(author => author.id === book.authorId);
      }
    }
  })
});

// Define Author Type
// This defines the structure and fields of an Author in our GraphQL schema
const AuthorType = new GraphQLObjectType({
  name: 'Author',
  description: 'This represents an author of a book',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    age: { type: new GraphQLNonNull(GraphQLInt) },
    // This field allows us to get all books by this author
    books: {
      type: new GraphQLList(BookType),
      resolve: (author) => {
        // Filter books array to find books with matching authorId
        return books.filter(book => book.authorId === author.id);
      }
    }
  })
});

// Define Root Query
// This defines all the queries we can perform on our data
const RootQueryType = new GraphQLObjectType({
  name: 'Query',
  description: 'Root Query',
  fields: () => ({
    // Query a single book by id
    book: {
      type: BookType,
      description: 'A single book',
      args: {
        id: { type: GraphQLID }
      },
      resolve: (parent, args) => {
        // Find the book with matching id
        return books.find(book => book.id === args.id);
      }
    },
    // Query all books
    books: {
      type: new GraphQLList(BookType),
      description: 'List of all books',
      resolve: () => books
    },
    // Query a single author by id
    author: {
      type: AuthorType,
      description: 'A single author',
      args: {
        id: { type: GraphQLID }
      },
      resolve: (parent, args) => {
        // Find the author with matching id
        return authors.find(author => author.id === args.id);
      }
    },
    // Query all authors
    authors: {
      type: new GraphQLList(AuthorType),
      description: 'List of all authors',
      resolve: () => authors
    }
  })
});

// Define Mutations
// This defines all the operations that can modify our data
const RootMutationType = new GraphQLObjectType({
  name: 'Mutation',
  description: 'Root Mutation',
  fields: () => ({
    // Add a new book
    addBook: {
      type: BookType,
      description: 'Add a book',
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        genre: { type: new GraphQLNonNull(GraphQLString) },
        authorId: { type: new GraphQLNonNull(GraphQLID) }
      },
      resolve: (parent, args) => {
        // Create a new book with the passed args
        const book = {
          id: String(books.length + 1),
          name: args.name,
          genre: args.genre,
          authorId: args.authorId
        };
        // Add to books array
        books.push(book);
        return book;
      }
    },
    // Update an existing book
    updateBook: {
      type: BookType,
      description: 'Update a book',
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        name: { type: GraphQLString },
        genre: { type: GraphQLString },
        authorId: { type: GraphQLID }
      },
      resolve: (parent, args) => {
        // Find the book to update
        const bookIndex = books.findIndex(book => book.id === args.id);
        if (bookIndex === -1) {
          throw new Error('Book not found');
        }
        
        // Update the book with any provided fields
        if (args.name) books[bookIndex].name = args.name;
        if (args.genre) books[bookIndex].genre = args.genre;
        if (args.authorId) books[bookIndex].authorId = args.authorId;
        
        return books[bookIndex];
      }
    },
    // Delete a book
    deleteBook: {
      type: BookType,
      description: 'Delete a book',
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) }
      },
      resolve: (parent, args) => {
        // Find the book to delete
        const bookIndex = books.findIndex(book => book.id === args.id);
        if (bookIndex === -1) {
          throw new Error('Book not found');
        }
        
        // Remove the book from the array
        const deletedBook = books[bookIndex];
        books = books.filter(book => book.id !== args.id);
        
        return deletedBook;
      }
    },
    // Add a new author
    addAuthor: {
      type: AuthorType,
      description: 'Add an author',
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: new GraphQLNonNull(GraphQLInt) }
      },
      resolve: (parent, args) => {
        // Create a new author with the passed args
        const author = {
          id: String(authors.length + 1),
          name: args.name,
          age: args.age
        };
        // Add to authors array
        authors.push(author);
        return author;
      }
    },
    // Update an existing author
    updateAuthor: {
      type: AuthorType,
      description: 'Update an author',
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        name: { type: GraphQLString },
        age: { type: GraphQLInt }
      },
      resolve: (parent, args) => {
        // Find the author to update
        const authorIndex = authors.findIndex(author => author.id === args.id);
        if (authorIndex === -1) {
          throw new Error('Author not found');
        }
        
        // Update the author with any provided fields
        if (args.name) authors[authorIndex].name = args.name;
        if (args.age) authors[authorIndex].age = args.age;
        
        return authors[authorIndex];
      }
    },
    // Delete an author
    deleteAuthor: {
      type: AuthorType,
      description: 'Delete an author',
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) }
      },
      resolve: (parent, args) => {
        // Find the author to delete
        const authorIndex = authors.findIndex(author => author.id === args.id);
        if (authorIndex === -1) {
          throw new Error('Author not found');
        }
        
        // Remove the author from the array
        const deletedAuthor = authors[authorIndex];
        authors = authors.filter(author => author.id !== args.id);
        
        return deletedAuthor;
      }
    }
  })
});

// Create the GraphQL schema with our query and mutation types
const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType
});

// Set up the GraphQL endpoint with GraphiQL interface enabled
app.use('/graphql', graphqlHTTP({
  schema: schema,
  graphiql: true // This enables the GraphiQL interface for testing
}));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`GraphiQL interface available at http://localhost:${PORT}/graphql`);
});