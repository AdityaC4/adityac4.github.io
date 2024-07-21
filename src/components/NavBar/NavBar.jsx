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
            t1.to(".nav-container", {
                autoAlpha: 1,
                delay: 0.1,
                duration: 0.2,
            })
                .to(
                    ".site-logo",
                    {
                        color: "#fff",
                        duration: 0.2,
                    },
                    "-=0.6"
                )
                .from(".flex > div", {
                    opacity: 0,
                    y: 10,
                    stagger: {
                        amount: 0.03,
                    },
                    duration: 0.3,
                })
                .to(
                    ".nav-link > a",
                    {
                        top: 0,
                        ease: "power2.inOut",
                        stagger: {
                            amount: 0.1,
                        },
                        duration: 0.4,
                    },
                    "-=0.5"
                )
                .from(
                    ".nav-footer",
                    {
                        opacity: 0,
                        duration: 0.3,
                    },
                    "-=0.6"
                )
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
                <div className="site-logo"><a href="/">AC</a></div>
                <div className="menu-toggle">
                    <div id="menu-toggle-btn">
                        <span></span>
                    </div>
                </div>
            </nav>
            <div className="nav-container">
                <div className="nav">
                    <div className="col flex">
                        <div className="nav-logo">~/</div>
                        <div className="nav-socials">
                            <a href="https://www.linkedin.com/in/adityac4/" target="_blank">
                                LinkedIn
                            </a>
                            <a href="https://x.com/aditya_C24" target="_blank">
                                Twitter
                            </a>
                            <a href="https://www.instagram.com/_aditya300/" target="_blank">
                                Instagram
                            </a>
                            <a href="https://github.com/AdityaC4" target="_blank">
                                GitHub
                            </a>
                            <a href="#" target="_blank">
                                Resume
                            </a>
                            <a href="mailto:adityapchaudhari@gmail.com" target="_blank">
                                eMail
                            </a>
                        </div>
                    </div>
                    <div className="col">
                        <div className="nav-link">
                            <a href="#">About</a>
                            <div className="nav-item-wrapper"></div>
                        </div>
                        <div className="nav-link">
                            <a href="#">Blog</a>
                            <div className="nav-item-wrapper"></div>
                        </div>
                        <div className="nav-link">
                            <a href="#">Experience</a>
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
                        {/* <a href="#">Privacy policy</a>
            <a href="#">Cookie policy</a> */}
                    </div>
                    <div className="contact">
                        <a href="#">adityapchaudhari@gmail.com</a>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default NavBar;
