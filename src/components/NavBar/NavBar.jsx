import React, { useEffect } from "react";
import "./NavBar.css";
import gsap from "gsap";

const NavBar = () => {
  useEffect(() => {
    const t1 = gsap.timeline({ paused: true });

    const navBtn = document.getElementById("menu-toggle-btn");

    const openNav = () => {
      navBtn.classList.toggle("active");
      t1.reversed(!t1.reversed());
    };

    const animateOpenNav = () => {
      t1.to(".nav-container", 0.2, {
        autoAlpha: 1,
        delay: 0.1,
      })
        .to(
          ".site-logo",
          0.2,
          {
            color: "#fff",
          },
          "-=0.1"
        )
        .from(".flex > div", 0.4, {
          opacity: 0,
          y: 10,
          stagger: {
            amount: 0.04,
          },
        })
        .to(
          ".nav-link > a",
          0.8,
          {
            top: 0,
            ease: "power2.inOut",
            stagger: {
              amount: 0.1,
            },
          },
          "-=0.4"
        )
        .from(".nav-footer", 0.3, { opacity: 0 }, "-=0.5")
        .reverse();
    };

    navBtn.addEventListener("click", openNav);
    animateOpenNav();

    return () => {
      navBtn.removeEventListener("click", openNav);
    };
  }, []);

  return (
    <header className="header">
      <nav className="navbar">
        <div className="site-logo">AC</div>
        <div className="menu-toggle">
          <div id="menu-toggle-btn">
            <span></span>
          </div>
        </div>
      </nav>
      <div className="nav-container">
        <div className="nav">
          <div className="col flex">
            <div className="nav-logo">C/</div>
            <div className="nav-socials">
              <a href="#">Behance</a>
              <a href="#">Twitter</a>
              <a href="#">Instagram</a>
              <a href="#">LinkedIn</a>
              <a href="#">Medium</a>
            </div>
          </div>
          <div className="col">
            <div className="nav-link">
              <a href="#">Work</a>
              <div className="nav-item-wrapper"></div>
            </div>
            <div className="nav-link">
              <a href="#">Services</a>
              <div className="nav-item-wrapper"></div>
            </div>
            <div className="nav-link">
              <a href="#">About</a>
              <div className="nav-item-wrapper"></div>
            </div>
            <div className="nav-link">
              <a href="#">Manifesto</a>
              <div className="nav-item-wrapper"></div>
            </div>
            <div className="nav-link">
              <a href="#">Contact</a>
              <div className="nav-item-wrapper"></div>
            </div>
          </div>
        </div>
        <div className="nav-footer">
          <div className="links">
            <a href="#">Privacy policy</a>
            <a href="#">Cookie policy</a>
          </div>
          <div className="contact">
            <a href="#">chaud105@msu.edu</a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
