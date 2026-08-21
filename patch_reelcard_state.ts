import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
`  const [sharesCount, setSharesCount] = useState(reel?.sharesCount || 0);
  const [comments, setComments] = useState<any[]>([]);
  const [commentsCount, setCommentsCount] = useState(reel?.commentsCount || 0);
  const [viewsCount, setViewsCount] = useState(() => reel?.viewsCount || 0);`,
`  const [sharesCount, setSharesCount] = useState(reel?.sharesCount || 0);
  const [comments, setComments] = useState<any[]>([]);
  const [commentsCount, setCommentsCount] = useState(reel?.commentsCount || 0);
  const [enquiriesCount, setEnquiriesCount] = useState(reel?.enquiriesCount || 0);
  const [viewsCount, setViewsCount] = useState(() => reel?.viewsCount || 0);`
);

fs.writeFileSync('src/App.tsx', content);
