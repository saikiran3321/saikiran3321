import React, { useEffect, useState } from "react";
import Layout from '@theme/Layout';

const projects = () => {
  return (
    <>
      <Layout title="Projects" description="Learn more projects">
        <main>
          <div className="container">
            <div className="text-container">
              <h3 style={{padding: "10px 0px",display:"flex",alignItems:"center"}} className="resume-link"><img src="/img/project.svg" alt='Project icon' width={25} height={25} style={{paddingRight: "5px"}}/> My Projects</h3>
              <p style={{whiteSpace:"normal",fontSize: "1rem"}}>I love building cool projects! Here, you'll find a curated collection of my creative and technical endeavors. Each project reflects my journey of <b>innovation</b>, <b>problem-solving</b>, and <b>continuous learning</b>.</p>
              <p style={{whiteSpace:"normal",fontSize: "1rem"}}>Feel free to explore this showcase of my <b>passion</b>, <b>expertise</b>, and <b>dedication</b> in action!</p>
              <div className="steps-container">
                <div class="step">
                  <div class="circle">01</div>
                  <div className="step-content">
                    <div class="title">CarTrade Exchange</div>
                    <div className="icon-tech">
                      <img src="/img/tech/html5.svg" alt="html" width={30} height={30}/>
                      <img src="/img/tech/css3.svg" width={40} height={40} alt="CSS" />
                      <img src="/img/tech/bootstrap.svg" alt="bootstrap" width={40} height={40}/>
                      <img src="/img/tech/javascript.svg" alt="javascript" width={40} height={40}/>
                      <img src="/img/tech/jquery.svg" alt="JQuery" width={40} height={40}/>
                      <img src="/img/tech/vuejs.svg" alt="vue" width={30} height={30}/>
                      <img src="/img/tech/php.svg" alt="php" width={30} height={30}/>
                      <img src="/img/tech/mongodb.svg" alt="mongodb" width={30} height={30}/>
                      <img src="/img/tech/redis.svg" alt="redis" width={40} height={40}/>
                      <img src="/img/tech/aws.svg" alt="aws" width={30} height={30}/>
                      <img src="/img/tech/docker.svg" alt="docker" width={40} height={40}/>
                      <img src="/img/tech/git.svg" alt="git" width={40} height={40}/>
                      <img src="/img/tech/postman.svg" alt="postman" width={40} height={40}/>
                      <img src="/img/tech/cypress.svg" alt="cypress" width={40} height={40}/>
                      <img src="/img/tech/sonarqube.svg" alt="sonarqube" width={40} height={40} className="icon-change"/>
                    </div>
                    <ul class="caption">
                      <li style={{whiteSpace:"normal",fontSize: "1rem"}}><b>Objective:</b> Developed a vehicle loan facilitation platform for CarTrade, CarWale, and BikeWale, connecting customers with multiple financial institutions to provide secure and competitive loan offers.</li>
                      <li style={{whiteSpace:"normal",fontSize: "1rem"}}><b>Key Contributions:</b> Architected and developed the entire system from front-end to back-end, implementing a dynamic customer portal where users could securely submit their vehicle and personal details to receive instant loan eligibility results.</li>
                      <li style={{whiteSpace:"normal",fontSize: "1rem"}}><b>Security & Data Privacy:</b> Played a pivotal role in encrypting sensitive customer information using advanced cryptographic techniques, ensuring secure data transmission between CarTrade and partnering banks.</li>
                      <li style={{whiteSpace:"normal",fontSize: "1rem"}}><b>Admin & CRM Modules:</b> Created an admin dashboard to manage user data and track loan applications, enabling CarTrade staff to efficiently monitor transactions and generate detailed reports for business analytics.</li>
                      <li style={{whiteSpace:"normal",fontSize: "1rem"}}><b>Impact:</b> The platform streamlined the loan application process, reducing the turnaround time for loan approvals by 30%, and improved customer engagement through real-time feedback on loan status.</li>
                    </ul>
                  </div>
                </div>
                <div class="step">
                  <div class="circle">02</div>
                  <div className="step-content">
                    <div class="title">Bajaj Auto Finance</div>
                    <div className="icon-tech">
                      <img src="/img/tech/html5.svg" alt="html" width={30} height={30}/>
                      <img src="/img/tech/css3.svg" width={40} height={40} alt="CSS" />
                      <img src="/img/tech/bootstrap.svg" alt="bootstrap" width={40} height={40}/>
                      <img src="/img/tech/javascript.svg" alt="javascript" width={40} height={40}/>
                      <img src="/img/tech/jquery.svg" alt="JQuery" width={40} height={40}/>
                      <img src="/img/tech/vuejs.svg" alt="vue" width={30} height={30}/>
                      <img src="/img/tech/php.svg" alt="php" width={30} height={30}/>
                      <img src="/img/tech/mongodb.svg" alt="mongodb" width={30} height={30}/>
                      <img src="/img/tech/redis.svg" alt="redis" width={40} height={40}/>
                      <img src="/img/tech/aws.svg" alt="aws" width={30} height={30}/>
                      <img src="/img/tech/docker.svg" alt="docker" width={40} height={40}/>
                      <img src="/img/tech/git.svg" alt="git" width={40} height={40}/>
                      <img src="/img/tech/postman.svg" alt="postman" width={40} height={40}/>
                      <img src="/img/tech/cypress.svg" alt="cypress" width={40} height={40}/>
                      <img src="/img/tech/sonarqube.svg" alt="sonarqube" width={40} height={40} className="icon-change"/>
                    </div>
                    <ul class="caption">
                      <li style={{whiteSpace:"normal",fontSize: "1rem"}}><b>Objective:</b> Built a seamless vehicle financing system for Bajaj Auto Finance, offering customers and dealers a fast and efficient way to secure loans for new bikes and commercial vehicles.</li>
                      <li style={{whiteSpace:"normal",fontSize: "1rem"}}><b>Key Contributions:</b> Designed and implemented two workflows – Dealer Sales Executive (DSE) and Direct Customer Flow (D2C). In the DSE flow, dealers submitted customer information, and in the D2C flow, customers independently checked available loan offers based on their profiles.</li>
                      <li style={{whiteSpace:"normal",fontSize: "1rem"}}><b>API Integration:</b> Integrated multiple banking APIs to fetch real-time loan offers, ensuring that the customer received the best possible financing options. Successfully tackled challenges related to encryption algorithms specific to each bank, ensuring smooth and secure API communication.</li>
                      <li style={{whiteSpace:"normal",fontSize: "1rem"}}><b>Impact:</b> Enhanced the loan processing system, increasing loan application efficiency by 25% and providing customers with a smoother and faster experience when applying for vehicle financing.</li>
                    </ul>
                  </div>
                </div>
                <div class="step">
                  <div class="circle">03</div>
                  <div className="step-content">
                    <div class="title">Mahindra Auto Finance</div>
                    <div className="icon-tech">
                      <img src="/img/tech/html5.svg" alt="html" width={30} height={30}/>
                      <img src="/img/tech/css3.svg" width={40} height={40} alt="CSS" />
                      <img src="/img/tech/bootstrap.svg" alt="bootstrap" width={40} height={40}/>
                      <img src="/img/tech/javascript.svg" alt="javascript" width={40} height={40}/>
                      <img src="/img/tech/jquery.svg" alt="JQuery" width={40} height={40}/>
                      <img src="/img/tech/vuejs.svg" alt="vue" width={30} height={30}/>
                      <img src="/img/tech/php.svg" alt="php" width={30} height={30}/>
                      <img src="/img/tech/mongodb.svg" alt="mongodb" width={30} height={30}/>
                      <img src="/img/tech/redis.svg" alt="redis" width={40} height={40}/>
                      <img src="/img/tech/aws.svg" alt="aws" width={30} height={30}/>
                      <img src="/img/tech/docker.svg" alt="docker" width={40} height={40}/>
                      <img src="/img/tech/git.svg" alt="git" width={40} height={40}/>
                      <img src="/img/tech/postman.svg" alt="postman" width={40} height={40}/>
                      <img src="/img/tech/cypress.svg" alt="cypress" width={40} height={40}/>
                      <img src="/img/tech/sonarqube.svg" alt="sonarqube" width={40} height={40} className="icon-change"/>
                    </div>
                    <ul class="caption">
                      <li style={{whiteSpace:"normal",fontSize: "1rem"}}><b>Objective:</b> Delivered a comprehensive vehicle financing platform for Mahindra Auto Finance, managing end-to-end workflows from lead generation to disbursal of loans for new car purchases.</li>
                      <li style={{whiteSpace:"normal",fontSize: "1rem"}}><b>Key Contributions:</b> Developed an application allowing sales executives to post customer leads, which were then matched with loan offers from banks based on the customer’s profile and selected vehicle.The platform simplified the decision-making process for both sales executives and customers by presenting personalized loan offers.</li>
                      <li style={{whiteSpace:"normal",fontSize: "1rem"}}><b>Challenges:</b> Overcame complex challenges in integrating APIs from various financial institutions, each with unique encryption and authentication protocols, ensuring secure and reliable communication.</li>
                      <li style={{whiteSpace:"normal",fontSize: "1rem"}}><b>Impact:</b> Reduced the lead-to-loan disbursal time by 20%, increasing customer satisfaction and improving overall loan approval rates.</li>
                    </ul>
                  </div>
                </div>
                <div class="step">
                  <div class="circle">04</div>
                  <div className="step-content">
                    <div class="title">OLX Vehicle Finance</div>
                    <div className="icon-tech">
                      <img src="/img/tech/html5.svg" alt="html" width={30} height={30}/>
                      <img src="/img/tech/css3.svg" width={40} height={40} alt="CSS" />
                      <img src="/img/tech/bootstrap.svg" alt="bootstrap" width={40} height={40}/>
                      <img src="/img/tech/javascript.svg" alt="javascript" width={40} height={40}/>
                      <img src="/img/tech/jquery.svg" alt="JQuery" width={40} height={40}/>
                      <img src="/img/tech/vuejs.svg" alt="vue" width={30} height={30}/>
                      <img src="/img/tech/php.svg" alt="php" width={30} height={30}/>
                      <img src="/img/tech/mongodb.svg" alt="mongodb" width={30} height={30}/>
                      <img src="/img/tech/redis.svg" alt="redis" width={40} height={40}/>
                      <img src="/img/tech/aws.svg" alt="aws" width={30} height={30}/>
                      <img src="/img/tech/docker.svg" alt="docker" width={40} height={40}/>
                      <img src="/img/tech/git.svg" alt="git" width={40} height={40}/>
                      <img src="/img/tech/postman.svg" alt="postman" width={40} height={40}/>
                      <img src="/img/tech/cypress.svg" alt="cypress" width={40} height={40}/>
                      <img src="/img/tech/sonarqube.svg" alt="sonarqube" width={40} height={40} className="icon-change"/>
                    </div>
                    <ul class="caption">
                      <li style={{whiteSpace:"normal",fontSize: "1rem"}}><b>Objective:</b> Recently worked on OLX where customers could apply for financing directly through the platform for the vehicle they selected, simplifying the process of securing funds for used vehicles listed on OLX.</li>
                      <li style={{whiteSpace:"normal",fontSize: "1rem"}}><b>Key Contributions:</b> Developed the customer-facing interface where users could select a vehicle and view personalized loan offers based on the vehicle’s value and their financial profile. The platform connected users with a range of financial institutions, making the financing process more transparent and user-friendly.</li>
                      <li style={{whiteSpace:"normal",fontSize: "1rem"}}><b>User Experience:</b> Focused on improving the user journey by creating an intuitive application form that guided customers through the process of submitting personal and financial details, with real-time updates on their financing options.</li>
                      <li style={{whiteSpace:"normal",fontSize: "1rem"}}><b>Impact:</b> The solution improved customer engagement on OLX, with an increase in loan applications for vehicles by 15%. By integrating multiple banks, it provided users with flexible financing options, leading to higher vehicle sales on the platform</li>
                    </ul>
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

export default projects;
