const path = require('path');
const fs = require('fs');

// Attempt to resolve React and ReactDOMServer from client/node_modules or standard node_modules
let React = null;
let ReactDOMServer = null;

try {
  React = require('react');
  ReactDOMServer = require('react-dom/server');
} catch {
  const candidatePaths = [
    path.resolve(__dirname, '../../../../client/node_modules'),
    path.resolve(__dirname, '../../../client/node_modules'),
    path.resolve(process.cwd(), '../client/node_modules'),
    path.resolve(process.cwd(), 'client/node_modules'),
  ];

  for (const cPath of candidatePaths) {
    try {
      if (fs.existsSync(path.join(cPath, 'react')) && fs.existsSync(path.join(cPath, 'react-dom/server.js'))) {
        React = require(path.join(cPath, 'react'));
        ReactDOMServer = require(path.join(cPath, 'react-dom/server'));
        break;
      }
    } catch {}
  }
}

/**
 * Fallback Virtual DOM to HTML serializer
 */
function vdomToHtml(node) {
  if (!node && node !== 0) return '';
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
  if (Array.isArray(node)) {
    return node.map(vdomToHtml).join('');
  }
  const { tag, type, props = {}, children = [] } = node;
  const tagName = tag || type;
  if (!tagName) return '';
  if (typeof tagName === 'function') {
    return vdomToHtml(tagName(props));
  }

  let attrs = '';
  if (props) {
    for (const [key, val] of Object.entries(props)) {
      if (val === false || val === null || val === undefined || key === 'children') continue;
      const attrName = key === 'className' ? 'class' : key === 'charSet' ? 'charset' : key;
      if (val === true) {
        attrs += ` ${attrName}`;
      } else {
        attrs += ` ${attrName}="${String(val).replace(/"/g, '&quot;')}"`;
      }
    }
  }

  const isSelfClosing = ['meta', 'link', 'img', 'input', 'br', 'hr'].includes(tagName);
  if (isSelfClosing) {
    return `<${tagName}${attrs} />`;
  }

  const allChildren = children && children.length > 0 ? children : (props && props.children ? (Array.isArray(props.children) ? props.children : [props.children]) : []);
  const childHtml = allChildren.map(vdomToHtml).join('');
  return `<${tagName}${attrs}>${childHtml}</${tagName}>`;
}

/**
 * Creates an Express-compatible React View Engine.
 * Supports rendering React components (.js/.jsx) with props to clean HTML markup.
 */
function createReactEngine(options = {}) {
  const doctype = options.doctype || '<!DOCTYPE html>';

  return function reactViewEngine(filePath, renderOptions, callback) {
    try {
      // Clear require cache in development for instant live reload
      if (process.env.NODE_ENV !== 'production') {
        delete require.cache[require.resolve(filePath)];
      }

      // Load component
      let Component = require(filePath);
      if (Component && Component.default) {
        Component = Component.default;
      }

      if (typeof Component !== 'function') {
        return callback(new Error(`React view at "${filePath}" did not export a valid React component function.`));
      }

      if (React && ReactDOMServer) {
        try {
          const element = React.createElement(Component, renderOptions);
          const markup = ReactDOMServer.renderToStaticMarkup(element);
          const fullHtml = markup.startsWith('<html') ? `${doctype}\n${markup}` : markup;
          return callback(null, fullHtml);
        } catch (renderErr) {
          console.warn('[React View Engine] SSR error, attempting vdom fallback:', renderErr.message);
        }
      }

      // Safe virtual DOM to HTML fallback
      try {
        const vdom = Component(renderOptions);
        const fallbackMarkup = vdomToHtml(vdom);
        const fullHtml = fallbackMarkup.startsWith('<html') ? `${doctype}\n${fallbackMarkup}` : fallbackMarkup;
        return callback(null, fullHtml);
      } catch (fallbackErr) {
        return callback(fallbackErr);
      }
    } catch (err) {
      return callback(err);
    }
  };
}

module.exports = {
  createReactEngine,
  React,
  ReactDOMServer,
};

