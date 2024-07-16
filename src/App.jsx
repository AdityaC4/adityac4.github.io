import "./App.css";
import { Contact, Experience, Hero, Portfolio, NavBar } from "./components";

function App() {
  return (
    <div className="container">
      <div className="content">
        <NavBar />
        <Hero />
        <Experience />
        <Portfolio />
        <Contact />
      </div>
      <div className="fuzzy-overlay"></div>
    </div>
  );
}

export default App;
