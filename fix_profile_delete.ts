import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `{userPosts.map((post, idx) => (
              <PostItem
                key={post.id}
                post={post}
                currentUser={currentUser}
                onPostClick={() => setActiveProfilePostIndex(idx)}
                onReelClick={() => setActiveProfilePostIndex(idx)}
              />
            ))}`;

const replacementStr = `{userPosts.map((post, idx) => (
              <PostItem
                key={post.id}
                post={post}
                currentUser={currentUser}
                onPostDeleted={(id) => {
                  setUserPosts(prev => prev.filter(p => String(p.id) !== String(id)));
                  setSavedPosts(prev => prev.filter(p => String(p.id) !== String(id)));
                }}
                onPostClick={() => setActiveProfilePostIndex(idx)}
                onReelClick={() => setActiveProfilePostIndex(idx)}
              />
            ))}`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync('src/App.tsx', content);
