import './App.css'
import AuthorList from './components/AuthorList'
import BookList from './components/BookList'

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>GraphQL Books Library</h1>
      </header>
      <main>
        <BookList />
        <AuthorList/>
      </main>
    </div>
  )
}

export default App