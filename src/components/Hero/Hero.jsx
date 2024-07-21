import "./Hero.css";
import gif1 from "../../assets/gifs/8ball.gif";
import gif2 from "../../assets/gifs/glasses.gif";

const Hero = () => {
  return (
    <div id="hero" className="section__hero section">
      <div className="hero__overlay">
        <img src={gif1} alt="Overlay 1" className="hero__image img1" />
        <img src={gif2} alt="Overlay 2" className="hero__image img2" />
      </div>
      <div className="hero__content">
        <h1 className="hero__name hero__first-name">Aditya</h1>
        <h1 className="hero__name hero__last-name">Chaudhari</h1>
      </div>
    </div>
  );
};

export default Hero;
