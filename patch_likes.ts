import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
`  const handleLike = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!currentUser?.id) {
      toast.error('🔐 Please Login or Register to Like posts!');`,
`  const handleLike = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!isLiked) playLikeSound();
    if (!currentUser?.id) {
      toast.error('🔐 Please Login or Register to Like posts!');`
);

content = content.replace(
`  const handleSave = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!currentUser?.id) {
      toast.error('🔐 Please Login or Register to Save posts!');`,
`  const handleSave = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!isSaved) playSaveSound();
    if (!currentUser?.id) {
      toast.error('🔐 Please Login or Register to Save posts!');`
);

fs.writeFileSync('src/App.tsx', content);
