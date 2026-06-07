const { google } = require("googleapis");
const http = require("http");
const url = require("url");

// Hardcoded directly — delete after getting your token
const CLIENT_ID     = "11307123523-4gq7eem5084mbnb57ufi4s7udfo7dgo6.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REDIRECT_URI  = "http://localhost:3001/callback";

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  prompt: "consent",
  scope: ["https://www.googleapis.com/auth/gmail.modify"],
});

console.log("\n📬 Open this URL in your browser:\n");
console.log(authUrl);
console.log("\nWaiting for callback...\n");

const server = http.createServer(async (req, res) => {
  const { query } = url.parse(req.url, true);
  if (query.code) {
    try {
      const { tokens } = await oauth2Client.getToken(query.code);
      console.log("\n✅ SUCCESS! Add this to your .env.local:\n");
      console.log(`GMAIL_REFRESH_TOKEN=${tokens.refresh_token}\n`);
      res.end("<h2>✅ Done! Copy the token from your terminal.</h2>");
    } catch (e) {
      console.error("Error:", e.message);
      res.end("<h2>Error: " + e.message + "</h2>");
    }
    server.close();
  } else {
    res.end("<h2>Waiting...</h2>");
  }
});

server.listen(3001, () => console.log("Listening on http://localhost:3001"));
