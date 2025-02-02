import React, { useEffect, useState } from "react";
import Layout from '@theme/Layout';

const projects = () => {
  return (
    <>
      <Layout title="Projects" description="Learn more projects">
        <main>
          <div className="container">
            <div className="text-container">
              <h1>Projects Me</h1>
              <p>This is the Projects page of my portfolio.</p>
            </div>
          </div>
        </main>
      </Layout>
    </>
  );
};

export default projects;
