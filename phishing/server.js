const http = require('http');
const querystring = require('querystring');

const server = http.createServer((req, res) => {
  const header = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>My Node Website</title>
      <style>
        body { font-family: Arial, sans-serif; margin:0; padding:0; background:#f4f4f4; }
        nav { background: #333; padding: 10px; text-align: center; }
        nav a { color: white; margin: 0 15px; text-decoration: none; font-weight: bold; }
        nav a:hover { text-decoration: underline; }
        .content { padding: 30px; text-align: center; background:white; margin: 20px auto; max-width: 600px; border-radius:10px; box-shadow:0 0 10px rgba(0,0,0,0.1);}
        input, textarea { width: 90%; padding: 10px; margin:10px 0; border-radius:5px; border:1px solid #ccc; }
        button { padding: 10px 20px; border:none; border-radius:5px; background:#333; color:white; cursor:pointer; }
        button:hover { background:#555; }
        footer { text-align:center; padding:10px; background:#eee; margin-top:20px; }
      </style>
    </head>
    <body>
      <nav>
        <a href="/">Home</a>
        <a href="/about">About</a>
        <a href="/services">Services</a>
        <a href="/contact">Contact</a>
      </nav>
      <div class="content">
  `;

  const footer = `
      </div>
      <footer>&copy; 2025 My Node Website</footer>
    </body>
    </html>
  `;

  // Routing
  if (req.method === 'GET') {
    if (req.url === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(header + '<h1>Welcome to Our Website</h1><p>This is the Home Page.</p>' + footer);
    } else if (req.url === '/about') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(header + '<h1>About Us</h1><p>We are building impressive Node.js servers!</p>' + footer);
    } else if (req.url === '/services') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(header + '<h1>Services</h1><p>Web Development, Node.js Training, and more!</p>' + footer);
    } else if (req.url === '/contact') {
      // Display contact form
      const form = `
        <h1>Contact Us</h1>
        <form method="POST" action="/contact">
          <input type="text" name="name" placeholder="Your Name" required /><br/>
          <input type="email" name="email" placeholder="Your Email" required /><br/>
          <textarea name="message" placeholder="Your Message" rows="5" required></textarea><br/>
          <button type="submit">Send Message</button>
        </form>
      `;
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(header + form + footer);
    } else {
      // 404 page
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end(header + '<h1>404 Not Found</h1><p>The page you are looking for does not exist.</p>' + footer);
    }
  } else if (req.method === 'POST') {
    if (req.url === '/contact') {
      // Handle contact form submission
      let body = '';
      req.on('data', chunk => { body += chunk.toString(); });
      req.on('end', () => {
        const data = querystring.parse(body); // parse form data
        const responseMessage = `
          <h1>Thank You, ${data.name}!</h1>
          <p>We have received your message:</p>
          <blockquote>${data.message}</blockquote>
          <p>We will contact you at <strong>${data.email}</strong> soon.</p>
        `;
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(header + responseMessage + footer);
      });
    } else {
      // Any other POST request
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end(header + '<h1>404 Not Found</h1><p>Cannot POST to this URL.</p>' + footer);
    }
  } else {
    // Method not allowed
    res.writeHead(405, { 'Content-Type': 'text/html' });
    res.end(header + `<h1>405 Method Not Allowed</h1><p>${req.method} not supported.</p>` + footer);
  }
});

// Start server
server.listen(3000, () => {
  console.log('✅ Impressive Node.js server running at http://localhost:3000/');
});
