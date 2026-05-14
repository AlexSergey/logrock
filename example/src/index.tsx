import 'bootstrap/dist/css/bootstrap.css';
import { createRoot } from 'react-dom/client';
import './assets/example.css';
import Examples from './Examples';
import Approach from './sections/Approach';
import BrowserCompatibility from './sections/BrowserCompatibility';
import Description from './sections/Description';
import License from './sections/License';
import Props from './sections/Props';
import Title from './sections/Title';
import Usage from './sections/Usage';
import WhatIsIt from './sections/What_is_is';

const container = document.getElementById('root');

if (!container) throw new Error('Root element not found');

const root = createRoot(container);

root.render(
  <>
    <div className="py-5 bg-light">
      <div className="container text-center">
        <Title />
        <Description />
        <p>
          <a
            className="btn btn-primary btn-lg"
            href="https://github.com/AlexSergey/logrock"
            role="button"
            target="_blank"
            rel="noreferrer"
          >
            Github
          </a>
        </p>
      </div>
    </div>
    <div id="wrapper">
      <WhatIsIt />
      <hr />
      <Approach />
      <hr />
      <Usage />
      <hr />
      <Props />
      <hr />
      <Examples />
      <hr />
      <BrowserCompatibility />
      <hr />
      <License />
    </div>
  </>,
);
