import { Link } from "react-router-dom";
import "./App.css";
import { useAuth } from "./use-auth";

function App() {
  const { account, loading } = useAuth();

  return (
    <div>
      <div className="App">
        <header className="App-header">
          <img
            src="/static/images/logo-ugly.jpeg"
            className="App-logo"
            alt="ugly logo"
          />
          {loading ? (
            <p>Loading...</p>
          ) : account ? (
            <div>
              <p>Hello, {account.email}!</p>
              <Link to={`poll`}>Polls</Link>
            </div>
          ) : (
            <p>
              <a href="/login">Log in</a>
            </p>
          )}
        </header>
      </div>
    </div>
  );
}

export default App;
