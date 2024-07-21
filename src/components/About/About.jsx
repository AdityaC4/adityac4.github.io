import "./About.css";

const About = () => {
    return (
        <div id="about" className="section section__about">
            <div className="about__content">
                <blockquote className="about__quote">
                    "The doer alone learneth" - Friedrich Nietzsche
                </blockquote>
                <p className="about__text">
                    I am Aditya Chaudhari, a programmer who loves simple code and
                    is currently obsessed with programming languages and compilers.
                    I love reverse engineering and networks. I love nature, pizza, and art.
                </p>
            </div>
        </div>
    );
};

export default About;
