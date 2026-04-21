const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'src/pages/Home.tsx',
  'src/pages/Dashboard.tsx',
  'src/pages/PlannerApp.tsx',
  'src/pages/Checkout.tsx',
  'src/App.tsx'
];

filesToUpdate.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Substitui bg-white por bg-sidebar
    content = content.replace(/\bbg-white\b/g, 'bg-sidebar');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
