const fs = require('fs');
const data = JSON.parse(fs.readFileSync('riftbound-debug.json'));

let foundFoilKeys = new Set();

data.forEach(card => {
  // Check top-level keys
  Object.keys(card).forEach(key => {
    if (key.toLowerCase().includes('foil') || key.toLowerCase().includes('variant') || key.toLowerCase().includes('print')) {
      foundFoilKeys.add(key);
    }
  });

  // Check metadata
  if (card.metadata) {
    Object.keys(card.metadata).forEach(key => {
      if (key.toLowerCase().includes('foil') || key.toLowerCase().includes('variant') || key.toLowerCase().includes('print')) {
        foundFoilKeys.add(`metadata.${key}`);
      }
    });
  }
  
  // Check classification
  if (card.classification) {
    Object.keys(card.classification).forEach(key => {
      if (key.toLowerCase().includes('foil') || key.toLowerCase().includes('variant') || key.toLowerCase().includes('print')) {
        foundFoilKeys.add(`classification.${key}`);
      }
    });
  }
});

console.log("Found keys related to foil/variant/print:", Array.from(foundFoilKeys));
