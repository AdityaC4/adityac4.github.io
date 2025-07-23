const fs = require("fs");
const glob = require("glob");
const path = require("path");

const files = glob.sync("_blogs/??-??-??_*.html");
const posts = files.map((f) => {
  const fn = path.basename(f);
  const [, mm, dd, yy, slug] = fn.match(/^(\d{2})-(\d{2})-(\d{2})_(.+)\.html$/);
  const year = 2000 + Number(yy);
  const date = new Date(year, mm - 1, dd).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return {
    url: f.replace(/\\/g, "/"),
    title: slug.replace(/[-_]/g, " "),
    date,
  };
});

posts.sort((a, b) => {
  return new Date(b.date) - new Date(a.date);
});

fs.writeFileSync("blogs.json", JSON.stringify(posts, null, 2));
console.log(`✅ Generated blogs.json (${posts.length} posts)`);
