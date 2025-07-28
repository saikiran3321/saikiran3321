import React, { useEffect, useState } from "react";
import Layout from '@theme/Layout';

const contact = () => {
  return (
    <>
      <Layout title="Contact" description="Get in touch with me">
        <main>
          <div className="container">
            <div className="text-container">
              <h3 style={{padding: "10px 0px", display:"flex", alignItems:"center"}} className="resume-link">
                <img src="/img/contact.svg" alt='Contact icon' width={25} height={25} style={{paddingRight: "5px"}}/> 
                Contact Me
              </h3>
              <h1 style={{whiteSpace:"normal"}}>
                <span className='highlight'>Let's Connect!</span><br/>
                I'd Love to Hear From You
              </h1>
              <p style={{whiteSpace:"normal", fontSize: "1.25rem", marginBottom: "40px"}}>
                Whether you have a project in mind, want to discuss opportunities, or just want to say hello, 
                I'm always excited to connect with fellow developers and potential collaborators.
              </p>

              {/* Contact Information Cards */}
              <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "30px", marginBottom: "40px"}}>
                
                {/* Personal Info Card */}
                <div className="step-content" style={{padding: "30px", borderRadius: "15px"}}>
                  <div className="title" style={{display: "flex", alignItems: "center", marginBottom: "20px"}}>
                    <img src="/img/about.svg" alt="person" width={30} height={30} className="icon-change" style={{marginRight: "10px"}}/>
                    Personal Information
                  </div>
                  <div style={{fontSize: "1.1rem", lineHeight: "1.8"}}>
                    <div style={{display: "flex", alignItems: "center", marginBottom: "15px"}}>
                      <img src="/img/dot.svg" alt="dot" width={8} className="icon-change" style={{marginRight: "10px"}}/>
                      <strong>Name:</strong>&nbsp;Sai Kiran Malladi
                    </div>
                    <div style={{display: "flex", alignItems: "center", marginBottom: "15px"}}>
                      <img src="/img/dot.svg" alt="dot" width={8} className="icon-change" style={{marginRight: "10px"}}/>
                      <strong>Role:</strong>&nbsp;Full Stack Developer
                    </div>
                    <div style={{display: "flex", alignItems: "center"}}>
                      <img src="/img/dot.svg" alt="dot" width={8} className="icon-change" style={{marginRight: "10px"}}/>
                      <strong>Location:</strong>&nbsp;India
                    </div>
                  </div>
                </div>

                {/* Contact Details Card */}
                <div className="step-content" style={{padding: "30px", borderRadius: "15px"}}>
                  <div className="title" style={{display: "flex", alignItems: "center", marginBottom: "20px"}}>
                    <img src="/img/contact.svg" alt="contact" width={30} height={30} className="icon-change" style={{marginRight: "10px"}}/>
                    Contact Details
                  </div>
                  <div style={{fontSize: "1.1rem", lineHeight: "1.8"}}>
                    <div style={{display: "flex", alignItems: "center", marginBottom: "15px"}}>
                      <img src="/img/dot.svg" alt="dot" width={8} className="icon-change" style={{marginRight: "10px"}}/>
                      <strong>Mobile:</strong>&nbsp;
                      <a href="tel:+917730066959" style={{color: "rgba(0, 119, 255, 0.7)", textDecoration: "none"}}>
                        +91 7730066959
                      </a>
                    </div>
                    <div style={{display: "flex", alignItems: "center"}}>
                      <img src="/img/dot.svg" alt="dot" width={8} className="icon-change" style={{marginRight: "10px"}}/>
                      <strong>Email:</strong>&nbsp;
                      <a href="mailto:kiransaikiran057@gmail.com" style={{color: "rgba(0, 119, 255, 0.7)", textDecoration: "none"}}>
                        kiransaikiran057@gmail.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Contact Actions */}
              <div style={{marginBottom: "40px"}}>
                <h2 style={{marginBottom: "20px", textAlign: "center"}}>Quick Contact</h2>
                <div style={{display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap"}}>
                  <a 
                    href="tel:+917730066959" 
                    style={{
                      display: "flex", 
                      alignItems: "center", 
                      padding: "15px 25px", 
                      backgroundColor: "rgba(0, 119, 255, 0.1)", 
                      border: "2px solid rgba(0, 119, 255, 0.7)", 
                      borderRadius: "10px", 
                      textDecoration: "none", 
                      color: "inherit",
                      transition: "all 0.3s ease"
                    }}
                    onMouseOver={(e) => {
                      e.target.style.backgroundColor = "rgba(0, 119, 255, 0.2)";
                      e.target.style.transform = "translateY(-2px)";
                    }}
                    onMouseOut={(e) => {
                      e.target.style.backgroundColor = "rgba(0, 119, 255, 0.1)";
                      e.target.style.transform = "translateY(0)";
                    }}
                  >
                    📱 Call Me
                  </a>
                  <a 
                    href="mailto:kiransaikiran057@gmail.com" 
                    style={{
                      display: "flex", 
                      alignItems: "center", 
                      padding: "15px 25px", 
                      backgroundColor: "rgba(0, 119, 255, 0.1)", 
                      border: "2px solid rgba(0, 119, 255, 0.7)", 
                      borderRadius: "10px", 
                      textDecoration: "none", 
                      color: "inherit",
                      transition: "all 0.3s ease"
                    }}
                    onMouseOver={(e) => {
                      e.target.style.backgroundColor = "rgba(0, 119, 255, 0.2)";
                      e.target.style.transform = "translateY(-2px)";
                    }}
                    onMouseOut={(e) => {
                      e.target.style.backgroundColor = "rgba(0, 119, 255, 0.1)";
                      e.target.style.transform = "translateY(0)";
                    }}
                  >
                    ✉️ Email Me
                  </a>
                  <a 
                    href="https://wa.me/917730066959" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{
                      display: "flex", 
                      alignItems: "center", 
                      padding: "15px 25px", 
                      backgroundColor: "rgba(0, 119, 255, 0.1)", 
                      border: "2px solid rgba(0, 119, 255, 0.7)", 
                      borderRadius: "10px", 
                      textDecoration: "none", 
                      color: "inherit",
                      transition: "all 0.3s ease"
                    }}
                    onMouseOver={(e) => {
                      e.target.style.backgroundColor = "rgba(0, 119, 255, 0.2)";
                      e.target.style.transform = "translateY(-2px)";
                    }}
                    onMouseOut={(e) => {
                      e.target.style.backgroundColor = "rgba(0, 119, 255, 0.1)";
                      e.target.style.transform = "translateY(0)";
                    }}
                  >
                    💬 WhatsApp
                  </a>
                </div>
              </div>

              {/* Social Media Links */}
              <div style={{marginBottom: "40px"}}>
                <h2 style={{marginBottom: "20px", textAlign: "center"}}>Connect on Social Media</h2>
                <div className='inline-buttons' style={{justifyContent: "center"}}>
                  <a href='https://github.com/saikiran3321' target="_blank" rel="noopener noreferrer" alt="github">
                    <button className='icon-buttons'>
                      <img src='/img/github.svg' alt='github' />
                    </button>
                  </a>
                  <a href='https://codepen.io/kiransai' target="_blank" rel="noopener noreferrer" alt="codepen">
                    <button className='icon-buttons'>
                      <img src='/img/codepen.svg' alt='codepen' />
                    </button>
                  </a>
                  <a href='https://www.facebook.com/share/1KYFjFoPqv/' target="_blank" rel="noopener noreferrer" alt="facebook">
                    <button className='icon-buttons'>
                      <img src='/img/facebook.svg' alt='facebook' />
                    </button>
                  </a>
                  <a href='https://www.linkedin.com/in/sai-kiran-malladi' target="_blank" rel="noopener noreferrer" alt="LinkedIn">
                    <button className='icon-buttons'>
                      <img src='/img/linkined.svg' alt='LinkedIn' />
                    </button>
                  </a>
                </div>
              </div>

              {/* Availability Status */}
              <div className="step-content" style={{padding: "30px", borderRadius: "15px", textAlign: "center", marginBottom: "40px"}}>
                <div style={{display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "15px"}}>
                  <div style={{
                    width: "12px", 
                    height: "12px", 
                    backgroundColor: "#4CAF50", 
                    borderRadius: "50%", 
                    marginRight: "10px",
                    animation: "pulse 2s infinite"
                  }}></div>
                  <h3 style={{margin: 0, color: "#4CAF50"}}>Available for New Opportunities</h3>
                </div>
                <p style={{fontSize: "1.1rem", margin: 0}}>
                  I'm currently open to discussing new projects, collaborations, and full-time opportunities. 
                  Let's build something amazing together!
                </p>
              </div>

              {/* Response Time */}
              <div style={{textAlign: "center", fontSize: "1rem", color: "var(--ifm-color-emphasis-600)"}}>
                <p>📧 I typically respond to emails within 24 hours</p>
                <p>📱 For urgent matters, feel free to call or WhatsApp</p>
              </div>
            </div>
          </div>
        </main>
      </Layout>
    </>
  );
};

export default contact;