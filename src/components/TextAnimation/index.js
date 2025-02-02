import React, { useEffect, useState } from "react";
import Heading from '@theme/Heading';

const TextAnimation = () => {
  return (
    <>
      <div className="text-container">
        <Heading as="h1" className="hero__title">
          <span>I'm &nbsp;</span> <span className="highlight underline">Sai Kiran</span>
        </Heading>
      </div>
    </>
  );
};

export default TextAnimation;
