import React, { useEffect, useState } from "react";
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

const about = () => {
  return (
    <>
      <Layout title="About" description="Learn more about me">
        <main>
          <div className="container">
            <div className="text-container">
              <h3 style={{padding: "10px 0px",display:"flex",alignItems:"center"}} className="resume-link"><img src="/img/about.svg" alt='Hand icon' width={25} height={25} style={{paddingRight: "5px"}}/> About Me</h3>
              <h1 style={{whiteSpace:"normal"}}><span className='highlight'>Software Engineer And Web Developer,</span><br></br> Based In India.</h1>
              <p style={{whiteSpace:"normal",fontSize: "1.25rem"}}>I am a <span className='highlight'>Full Stack Web Developer</span> at <span className='highlight'>CarTrade Tech</span>, Mumbai, Maharashtra, India. With 3+ years of experiences in building scalable applications.</p>
              <p style={{whiteSpace:"normal",fontSize: "1.25rem"}}>I'm passionate about crafting web projects and contributing to open-source communities. I specialize in modern JavaScript frameworks and responsive CSS design, focusing on creating pixel-perfect, user-friendly interfaces.</p>
              <p style={{whiteSpace:"normal",fontSize: "1.25rem"}}>With a strong focus on security, performance, and API integrations, I deliver high-performance, user-centric solutions. Additionally, I excel at enhancing workflows through automation, testing, and CI/CD pipelines to streamline development processes.</p>
              <div style={{display:"flex",flexFlow:"row",justifyContent:"space-between",fontSize: "1rem",flexWrap:"wrap"}}>
                <div style={{display:"block"}}>
                  <h2><img src="/img/language.svg" alt="language" className="icon-change" />&nbsp;Language</h2>
                  <div style={{display: "flex",justifyContent: "center",alignItems: "center"}}>
                    <img src="/img/dot.svg" alt="dot" width={10} className="icon-change"/>&nbsp;English
                  </div>
                </div>
                <div style={{display:"block"}}>
                  <h2><img src="/img/nation.svg" alt="language" className="icon-change"/>&nbsp;Nationality</h2>
                  <div style={{display: "flex",justifyContent: "center",alignItems: "center"}}>
                    <img src="/img/dot.svg" alt="dot" width={10} className="icon-change"/>&nbsp;India
                  </div>
                </div>
                <div style={{display:"block"}}>
                  <h2><img src="/img/gender.svg" alt="language" className="icon-change"/>&nbsp;Gender</h2>
                  <div style={{display: "flex",justifyContent: "center",alignItems: "center"}}>
                    <img src="/img/dot.svg" alt="dot" width={10} className="icon-change"/>&nbsp;Male
                  </div>
                </div>
              </div>
              <div style={{display:"flex",flexFlow:"row",justifyContent:"space-between",fontSize: "1rem",marginTop: "15px",flexWrap:"wrap"}}>
                <div style={{display:"block"}}>
                  <h2><img src="/img/hobbie.svg" alt="language" className="icon-change"/>&nbsp;Hobbies</h2>
                  <div style={{display: "flex",justifyContent: "center",alignItems: "center",flexFlow:"row",flexWrap:"wrap"}}>
                    <div style={{display:"flex",justifyContent:"space-between",flexFlow:"row",flexWrap:"wrap"}}>
                      <div style={{padding:"0px 10px"}}>
                        <img src="/img/dot.svg" alt="dot" width={10} className="icon-change"/>&nbsp;Coding
                      </div>
                      <div style={{padding:"0px 10px"}}>
                        <img src="/img/dot.svg" alt="dot" width={10} className="icon-change"/>&nbsp;Playing Games
                      </div>
                      <div style={{padding:"0px 10px"}}>
                        <img src="/img/dot.svg" alt="dot" width={10} className="icon-change"/>&nbsp;Watching Anime
                      </div>
                      <div style={{padding:"0px 10px"}}>
                        <img src="/img/dot.svg" alt="dot" width={10} className="icon-change"/>&nbsp;Tech Blog Writing
                      </div>
                      <div style={{padding:"0px 10px"}}>
                        <img src="/img/dot.svg" alt="dot" width={10} className="icon-change"/>&nbsp;Creating Cool Projects
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </Layout>
    </>
  );
};

export default about;
