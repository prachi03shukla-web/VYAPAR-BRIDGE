import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  /import {([^}]*)savePostInFirestore([^}]*)} from '\.\/services\/firebaseDataSync';/,
  "import {$1savePostInFirestore, recordEnquiryInFirestore$2} from './services/firebaseDataSync';"
);

// PostItem replacement
content = content.replace(
`                // Increment enquiry count locally
                if (post.id) {
                  setEnquiriesCount(prev => prev + 1);
                  // Fire and forget fetch request
                  fetch(\`/api/posts/\${post.id}/enquiry\`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: currentUser?.id, userName: currentUser?.name || 'A user', postId: post.id })
                  }).catch(()=>{});
                }`,
`                // Increment enquiry count locally & on Firestore
                if (post.id) {
                  setEnquiriesCount(prev => prev + 1);
                  recordEnquiryInFirestore(post.id, currentUser?.id || 'anonymous', currentUser?.name || 'A user').catch(()=>{});
                }`
);

// ReelCard replacement
content = content.replace(
`            if (reel.id) {
              setEnquiriesCount(prev => prev + 1);
              fetch(\`/api/posts/\${reel.id}/enquiry\`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser?.id, userName: currentUser?.name || 'A user', postId: reel.id })
              }).catch(()=>{});
            }`,
`            if (reel.id) {
              setEnquiriesCount(prev => prev + 1);
              recordEnquiryInFirestore(reel.id, currentUser?.id || 'anonymous', currentUser?.name || 'A user').catch(()=>{});
            }`
);

fs.writeFileSync('src/App.tsx', content);
