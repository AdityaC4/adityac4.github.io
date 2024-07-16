import "./App.css";
import { Contact, Experience, Hero, Portfolio } from "./components";

function App() {
  return (
    <div className="container">
      <div className="content">
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
