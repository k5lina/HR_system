const fs = require('fs');
const content = fs.readFileSync('src/components/Requests/RequestForm.tsx', 'utf8');
console.log(content.includes('next = [...prev, newReq as any]'));
