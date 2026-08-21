import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
`  const [likesCount, setLikesCount] = useState(() => post.likesCount || post.likes || 0);

  useEffect(() => {
    setIsLiked(isPostLikedByUser(post, activeUserId));
    setIsSaved(isPostSavedByUser(post, activeUserId));
    setLikesCount(post.likesCount || post.likes || 0);
  }, [post.id, post.isLiked, post.isSaved, post.likesCount, post.likes, post.likedBy, activeUserId]);`,
`  const [likesCount, setLikesCount] = useState(() => post.likesCount || post.likes || 0);
  const [savedCount, setSavedCount] = useState(() => post.savedCount || 0);
  const [sharesCount, setSharesCount] = useState(() => post.sharesCount || 0);
  const [commentsCount, setCommentsCount] = useState(() => post.commentsCount || 0);
  const [enquiriesCount, setEnquiriesCount] = useState(() => post.enquiriesCount || 0);

  useEffect(() => {
    setIsLiked(isPostLikedByUser(post, activeUserId));
    setIsSaved(isPostSavedByUser(post, activeUserId));
    setLikesCount(post.likesCount || post.likes || 0);
    setSavedCount(post.savedCount || 0);
    setSharesCount(post.sharesCount || 0);
    setCommentsCount(post.commentsCount || 0);
    setEnquiriesCount(post.enquiriesCount || 0);
  }, [post.id, post.isLiked, post.isSaved, post.likesCount, post.likes, post.likedBy, activeUserId, post.savedCount, post.sharesCount, post.commentsCount, post.enquiriesCount]);`
);

fs.writeFileSync('src/App.tsx', content);
