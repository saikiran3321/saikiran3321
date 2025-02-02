import React, { useEffect, useState } from "react";
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

const skills = () => {
  return (
    <>
      <Layout title="Skills" description="Learn more about my Skills">
        <main>
          <div className="container">
            <div className="text-container">
              <h3 style={{padding: "10px 0px",display:"flex",alignItems:"center"}} className="resume-link"><img src="/img/skill.svg" alt='Hand icon' width={25} height={25} style={{paddingRight: "5px"}}/> My Skills</h3>
              <div style={{display:"flex",flexFlow:"row",justifyContent:"space-between",fontSize: "1rem",marginTop: "15px"}}>
                <div style={{display:"block"}}>
                  <h2>Programming Languages</h2>
                  <div style={{display: "flex",justifyContent: "space-between",alignItems: "center",flexWrap: "wrap"}}>
                    <div className="icon-container">
                      <div className="icon">
                        <img className="icon-3d" src="/img/tech/html5.svg" alt="html" width={40} height={40}/>
                      </div>
                      <span className="icon-text">HTML</span>
                    </div>
                    <div className="icon-container">
                      <div className="icon">
                        <img src="/img/tech/css3.svg" width={40} height={40} alt="CSS" />
                      </div>
                      <span className="icon-text">CSS</span>
                    </div>
                    <div className="icon-container">
                      <div className="icon">
                        <img src="/img/tech/bootstrap.svg" alt="css" width={40} height={40}/>
                      </div>
                      <span className="icon-text">Bootstrap</span>
                    </div>
                    <div className="icon-container">
                      <div className="icon">
                        <img src="/img/tech/javascript.svg" alt="javascript" width={40} height={40}/>
                      </div>
                      <span className="icon-text">Javascript</span>
                    </div>
                    <div className="icon-container">
                      <div className="icon">
                        <img src="/img/tech/typescript.svg" alt="typescript" width={40} height={40}/>
                      </div>
                      <span className="icon-text">Typescript</span>
                    </div>
                    <div className="icon-container">
                      <div className="icon">
                        <img src="/img/tech/php.svg" alt="php" width={40} height={40}/>
                      </div>
                      <span className="icon-text">PHP</span>
                    </div>
                    <div className="icon-container">
                      <div className="icon">
                        <img src="/img/tech/nodejs.svg" alt="node" width={40} height={40} className="icon-change"/>
                      </div>
                      <span className="icon-text">Node js</span>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{display:"flex",flexFlow:"row",justifyContent:"space-between",fontSize: "1rem"}}>
                <div style={{display:"block"}}>
                  <h2>Framework/Libraries</h2>
                  <div style={{display: "flex",justifyContent: "space-between",alignItems: "center",flexWrap: "wrap"}}>
                    <div className="icon-container">
                      <div className="icon">
                        <img src="/img/tech/jquery.svg" alt="JQuery" width={40} height={40}/>
                      </div>
                      <span className="icon-text">JQuery</span>
                    </div>
                    <div className="icon-container">
                      <div className="icon">
                        <img src="/img/tech/vuejs.svg" alt="vue" width={40} height={40}/>
                      </div>
                      <span className="icon-text">Vue js</span>
                    </div>
                    <div className="icon-container">
                      <div className="icon">
                        <img src="/img/tech/nuxtjs.svg" alt="nuxt" width={40} height={40}/>
                      </div>
                      <span className="icon-text">Nuxt js</span>
                    </div>
                    <div className="icon-container">
                      <div className="icon">
                        <img src="/img/tech/react.svg" alt="react" width={40} height={40}/>
                      </div>
                      <span className="icon-text">React</span>
                    </div>
                    <div className="icon-container">
                      <div className="icon">
                        <img src="/img/tech/nextjs.svg" alt="next" width={40} height={40}/>
                      </div>
                      <span className="icon-text">Next js</span>
                    </div>
                    <div className="icon-container">
                      <div className="icon">
                        <img src="/img/tech/express.svg" alt="express" width={40}
                       height={40} className="icon-change"/>
                      </div>
                      <span className="icon-text">Express js</span>
                    </div>
                    <div className="icon-container">
                      <div className="icon">
                        <img src="/img/tech/laravel.svg" alt="Laravel" width={40}
                       height={40}/>
                      </div>
                      <span className="icon-text">Laravel</span>
                    </div>
                    <div className="icon-container">
                      <div className="icon">
                        <img src="/img/tech/codeigniter.svg" alt="codeignitor" width={40} height={40}/>
                      </div>
                      <span className="icon-text">Codeigniter</span>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{display:"flex",flexFlow:"row",justifyContent:"space-between",fontSize: "1rem"}}>
                <div style={{display:"block"}}>
                  <h2>Database</h2>
                  <div style={{display: "flex",justifyContent: "space-between",alignItems: "center",flexWrap: "wrap"}}>
                    <div className="icon-container">
                      <div className="icon">
                        <img src="/img/tech/mysql.svg" alt="mysql" width={40} height={40}/>
                      </div>
                      <span className="icon-text">Mysql</span>
                    </div>
                    <div className="icon-container">
                      <div className="icon">
                        <img src="/img/tech/mongodb.svg" alt="mongodb" width={40} height={40}/>
                      </div>
                      <span className="icon-text">MongoDB</span>
                    </div>
                    <div className="icon-container">
                      <div className="icon">
                        <img src="/img/tech/redis.svg" alt="redis" width={40} height={40}/>
                      </div>
                      <span className="icon-text">Redis</span>
                    </div>
                    <div className="icon-container">
                      <div className="icon">
                        <img src="/img/tech/firebase.svg" alt="firebase" width={40} height={40}/>
                      </div>
                      <span className="icon-text">Firebase</span>
                    </div>
                    <div className="icon-container">
                      <div className="icon">
                        <img src="/img/tech/postgresql.svg" alt="postgres" width={40} height={40}/>
                      </div>
                      <span className="icon-text">Postgresql</span>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{display:"flex",flexFlow:"row",justifyContent:"space-between",fontSize: "1rem"}}>
                <div style={{display:"block"}}>
                  <h2>Cloud & DevOps</h2>
                  <div style={{display: "flex",justifyContent: "space-between",alignItems: "center",flexWrap: "wrap"}}>
                    <div className="icon-container">
                      <div className="icon">
                        <img src="/img/tech/aws.svg" alt="aws" width={40} height={40}/>
                      </div>
                      <span className="icon-text">AWS</span>
                    </div>
                    <div className="icon-container">
                      <div className="icon">
                        <img src="/img/tech/docker.svg" alt="docker" width={40} height={40}/>
                      </div>
                      <span className="icon-text">Docker</span>
                    </div>
                    <div className="icon-container">
                      <div className="icon">
                        <img src="/img/tech/jenkins.svg" alt="jenkins" width={40} height={40}/>
                      </div>
                      <span className="icon-text">Jenkins</span>
                    </div>
                    <div className="icon-container">
                      <div className="icon">
                        <img src="/img/tech/git.svg" alt="git" width={40} height={40}/>
                      </div>
                      <span className="icon-text">Git</span>
                    </div>
                    <div className="icon-container">
                      <div className="icon">
                        <img src="/img/tech/github.svg" alt="github" width={40} height={40} className="icon-change"/>
                      </div>
                      <span className="icon-text">GitHub</span>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{display:"flex",flexFlow:"row",justifyContent:"space-between",fontSize: "1rem"}}>
                <div style={{display:"block"}}>
                  <h2>Testing & Debugging</h2>
                  <div style={{display: "flex",justifyContent: "space-between",alignItems: "center",flexWrap: "wrap"}}>
                    <div className="icon-container">
                      <div className="icon">
                        <img src="/img/tech/postman.svg" alt="postman" width={40} height={40}/>
                      </div>
                      <span className="icon-text">Postman</span>
                    </div>
                    <div className="icon-container">
                      <div className="icon">
                        <img src="/img/tech/cypress.svg" alt="cypress" width={40} height={40}/>
                      </div>
                      <span className="icon-text">Cypress</span>
                    </div>
                    <div className="icon-container">
                      <div className="icon">
                        <img src="/img/tech/selenium.svg" alt="selenium" width={40} height={40} className="icon-change"/>
                      </div>
                      <span className="icon-text">Selenium</span>
                    </div>
                    <div className="icon-container">
                      <div className="icon">
                        <img src="/img/tech/sonarqube.svg" alt="sonarqube" width={40} height={40} className="icon-change"/>
                      </div>
                      <span className="icon-text">SonarQube</span>
                    </div>
                    <div className="icon-container">
                      <div className="icon">
                        <img src="/img/tech/Burp-suite.svg" alt="burp-suite" width={40} height={40}/>
                      </div>
                      <span className="icon-text">Burp Suite</span>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{display:"flex",flexFlow:"row",justifyContent:"space-between",fontSize: "1rem"}}>
                <div style={{display:"block"}}>
                  <h2>Tools</h2>
                  <div style={{display: "flex",justifyContent: "space-between",alignItems: "center",flexWrap: "wrap"}}>
                    <div className="icon-container">
                      <div className="icon">
                        <img src="/img/tech/vscode.svg" alt="vscode" width={40} height={40}/>
                      </div>
                      <span className="icon-text">VS code</span>
                    </div>
                    <div className="icon-container">
                      <div className="icon">
                        <img src="/img/tech/sublime.svg" alt="sublime" width={40} height={40}/>
                      </div>
                      <span className="icon-text">sublime Text</span>
                    </div>
                    <div className="icon-container">
                      <div className="icon">
                        <img src="/img/tech/draw.svg" alt="draw" width={40} height={40}/>
                      </div>
                      <span className="icon-text">Draw.io</span>
                    </div>
                    <div className="icon-container">
                      <div className="icon">
                        <img src="/img/tech/figma.svg" alt="figma" width={40} height={40}/>
                      </div>
                      <span className="icon-text">Figma</span>
                    </div>
                    <div className="icon-container">
                      <div className="icon">
                        <img src="/img/tech/winscp.svg" alt="winscp" width={40} height={40}/>
                      </div>
                      <span className="icon-text">WinSCP</span>
                    </div>
                    <div className="icon-container">
                      <div className="icon">
                        <img src="/img/tech/filezilla.svg" alt="filezilla" width={40} height={40}/>
                      </div>
                      <span className="icon-text">FileZilla</span>
                    </div>
                    <div className="icon-container">
                      <div className="icon">
                        <img src="/img/tech/mobexterm.svg" alt="mobexterm" width={40} height={40}/>
                      </div>  
                      <span className="icon-text">MobaXterm</span>
                    </div>
                    <div className="icon-container">
                      <div className="icon">
                        <img src="/img/tech/putty.svg" alt="putty" width={40} height={40}/>
                      </div>
                      <span className="icon-text">Putty</span>
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

export default skills;
