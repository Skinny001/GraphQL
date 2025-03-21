import { useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import { motion } from "framer-motion";

const GET_BOOKS = gql`
  query {
    books {
      id
      name
      genre
      author {
        id
        name
        age
      }
    }
  }
`;

const ADD_BOOK = gql`
  mutation AddBook($name: String!, $genre: String!, $authorId: ID!) {
    addBook(name: $name, genre: $genre, authorId: $authorId) {
      id
      name
      genre
      author {
        id
        name
      }
    }
  }
`;

const UPDATE_BOOK = gql`
  mutation UpdateBook($id: ID!, $name: String!, $genre: String!) {
    updateBook(id: $id, name: $name, genre: $genre) {
      id
      name
      genre
    }
  }
`;

const DELETE_BOOK = gql`
  mutation DeleteBook($id: ID!) {
    deleteBook(id: $id) {
      id
    }
  }
`;

function BookList() {
  const { loading, error, data, refetch } = useQuery(GET_BOOKS);
  const [addBook] = useMutation(ADD_BOOK, { onCompleted: refetch });
  const [updateBook] = useMutation(UPDATE_BOOK, { onCompleted: refetch });
  const [deleteBook] = useMutation(DELETE_BOOK, { onCompleted: refetch });

  const [bookForm, setBookForm] = useState({ id: "", name: "", genre: "", authorId: "" });

  if (loading) return <p className="text-gray-500 text-center">Loading books...</p>;
  if (error) return <p className="text-red-500 text-center">Error loading books: {error.message}</p>;

  const handleChange = (e) => setBookForm({ ...bookForm, [e.target.name]: e.target.value });

  return (
    <div>
      <h2 className="App-header">📚 Book List</h2>
      <ul className="book-list">
        {data?.books?.map((book) => (
          <motion.li
            key={book.id}
            className="book-item"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05 }}
          >
            <div className="book-title">{book.name}</div>
            <div className="book-details">
              <p>Genre: {book.genre}</p>
              <p>Author: {book.author?.name} (Age: {book.author?.age})</p>
            </div>
            <div className="button-group">
              <button onClick={() => setBookForm(book)} className="edit-btn">✏️ Edit</button>
              <button onClick={() => deleteBook({ variables: { id: book.id } })} className="delete-btn">🗑️ Delete</button>
            </div>
          </motion.li>
        ))}
      </ul>

      {/* Book Form */}
      <div className="form-container">
        <h3>{bookForm.id ? "Update Book" : "Add Book"}</h3>
        <input type="text" name="name" placeholder="Book Name" value={bookForm.name} onChange={handleChange} />
        <input type="text" name="genre" placeholder="Genre" value={bookForm.genre} onChange={handleChange} />
        <input type="text" name="authorId" placeholder="Author ID" value={bookForm.authorId} onChange={handleChange} />
        <button
          onClick={() => bookForm.id ? updateBook({ variables: bookForm }) : addBook({ variables: bookForm })}
          className="submit-btn"
        >
          {bookForm.id ? "Update Book" : "Add Book"}
        </button>
      </div>
    </div>
  );
}

export default BookList;
