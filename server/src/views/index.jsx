const React = require('react');

function Index(props) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{props.title || 'Express React View'}</title>
        <style dangerouslySetInnerHTML={{ __html: `
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f8fafc;
            color: #0f172a;
            margin: 0;
            padding: 40px 20px;
            display: flex;
            justify-content: center;
          }
          .card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 32px;
            max-width: 600px;
            width: 100%;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          }
          h1 {
            color: #2563eb;
            margin-top: 0;
            font-size: 1.8rem;
          }
          p {
            line-height: 1.6;
            color: #475569;
          }
          .badge {
            display: inline-block;
            background: #dbeafe;
            color: #1e40af;
            padding: 4px 10px;
            border-radius: 9999px;
            font-size: 0.85rem;
            font-weight: 600;
            margin-bottom: 16px;
          }
        ` }} />
      </head>
      <body>
        <div className="card">
          <span className="badge">Server-Side JSX Rendered</span>
          <h1>{props.title}</h1>
          <p>
            Welcome! This page was rendered server-side using <strong>express-react-views</strong>.
          </p>
          <p>
            Timestamp: <code>{new Date().toISOString()}</code>
          </p>
        </div>
      </body>
    </html>
  );
}

module.exports = Index;
