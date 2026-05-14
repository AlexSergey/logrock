export default function WhatIsIt() {
  return (
    <>
      <h3>What is it?</h3>
      <p>
        Our application is alive organism. The bug in your application is a kind of disease. Nobody and nothing than
        your application can tell you better what went wrong with it.
      </p>
      <p>
        As developers, we would like to know which actions caused the error, what buttons the user clicked, what device
        and operation system it was. That and much more information could help us to resolve any problems and fix bugs
        more effectively.
      </p>
      <p>
        If our users told us what they do before the bug appears it would be very cool... <strong>LogRock</strong> can
        help you with that!
      </p>
      <p>
        <strong>LogRock</strong> is React.js component with module which can help you to build error tracking &amp;
        crash reporting system.
      </p>
      <p>You can tie it with ElasticSearch or other backend to analyze your bugs.</p>

      <div className="text-center">
        <p style={{ fontSize: '18px' }}>
          <strong>More information in my article:</strong>
        </p>
        <ul className="list-unstyled">
          <li>
            <a
              href="https://dev.to/alexsergey/log-driven-development-3jmf"
              role="button"
              target="_blank"
              rel="noreferrer"
            >
              English
            </a>
          </li>
          <li>
            <a href="https://habr.com/ru/post/453652/" role="button" target="_blank" rel="noreferrer">
              Russian
            </a>
          </li>
        </ul>
      </div>

      <p className="text-end">
        <em>forewarned is forearmed.</em>
      </p>
    </>
  );
}
