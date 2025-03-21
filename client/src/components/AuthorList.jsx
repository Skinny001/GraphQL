import { useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import { motion } from "framer-motion";

const GET_AUTHORS = gql`
  query {
    authors {
      id
      name
      age
    }
  }
`;

const ADD_AUTHOR = gql`
  mutation AddAuthor($name: String!, $age: Int!) {
    addAuthor(name: $name, age: $age) {
      id
      name
      age
    }
  }
`;

const UPDATE_AUTHOR = gql`
  mutation UpdateAuthor($id: ID!, $name: String!, $age: Int!) {
    updateAuthor(id: $id, name: $name, age: $age) {
      id
      name
      age
    }
  }
`;

const DELETE_AUTHOR = gql`
  mutation DeleteAuthor($id: ID!) {
    deleteAuthor(id: $id) {
      id
    }
  }
`;

function AuthorList() {
  const { loading, error, data, refetch } = useQuery(GET_AUTHORS);
  const [addAuthor] = useMutation(ADD_AUTHOR, { onCompleted: refetch });
  const [updateAuthor] = useMutation(UPDATE_AUTHOR, { onCompleted: refetch });
  const [deleteAuthor] = useMutation(DELETE_AUTHOR, { onCompleted: refetch });

  const [authorForm, setAuthorForm] = useState({ id: "", name: "", age: "" });

  if (loading) return <p className="text-gray-500 text-center">Loading authors...</p>;
  if (error) return <p className="text-red-500 text-center">Error loading authors: {error.message}</p>;

  const handleChange = (e) => setAuthorForm({ ...authorForm, [e.target.name]: e.target.value });

  return (
    <div>
      <h2 className="App-header">✍️ Author List</h2>
      <ul className="book-list">
        {data?.authors?.map((author) => (
          <motion.li
            key={author.id}
            className="book-item"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05 }}
          >
            <div className="book-title">{author.name}</div>
            <div className="book-details">
              <p>Age: {author.age}</p>
            </div>
            <div className="button-group">
              <button onClick={() => setAuthorForm(author)} className="edit-btn">✏️ Edit</button>
              <button onClick={() => deleteAuthor({ variables: { id: author.id } })} className="delete-btn">🗑️ Delete</button>
            </div>
          </motion.li>
        ))}
      </ul>

      {/* Author Form */}
      <div className="form-container">
        <h3>{authorForm.id ? "Update Author" : "Add Author"}</h3>
        <input type="text" name="name" placeholder="Author Name" value={authorForm.name} onChange={handleChange} />
        <input type="number" name="age" placeholder="Age" value={authorForm.age} onChange={handleChange} />
        <button
          onClick={() => authorForm.id ? updateAuthor({ variables: authorForm }) : addAuthor({ variables: authorForm })}
          className="submit-btn"
        >
          {authorForm.id ? "Update Author" : "Add Author"}
        </button>
      </div>
    </div>
  );
}

export default AuthorList;
