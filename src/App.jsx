import "./App.css";
import { Contact, Experience, Hero, About, NavBar } from "./components";

function App() {
  return (
    <div className="container">
      <div className="content">
        <NavBar />
        <Hero />
        <About />
        <Experience />
        <Contact />
      </div>
      <div className="fuzzy-overlay"></div>
    </div>
  );
}

export default App;
