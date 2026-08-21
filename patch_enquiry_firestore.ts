import fs from 'fs';

let content = fs.readFileSync('src/services/firebaseDataSync.ts', 'utf8');

// Add a function to track enquiries
const newFunc = `
export async function recordEnquiryInFirestore(postId: string, userId: string, userName: string) {
  if (isFirestoreQuotaExhausted) return null;
  try {
    const postRef = doc(db, 'posts', String(postId));
    
    // Use a transaction or direct update (we will just use setDoc with merge to be safe)
    // Actually just tracking count and saving notification for the user
    // To make it simple we'll just update the enquiriesCount field on the post
    const postDoc = await getDoc(postRef);
    let currentEnquiries = 0;
    if (postDoc.exists()) {
      currentEnquiries = postDoc.data().enquiriesCount || 0;
      await updateDoc(postRef, { enquiriesCount: currentEnquiries + 1 });
      
      // Also notify the post owner (create a notification document)
      const postOwnerId = postDoc.data().userId;
      if (postOwnerId && postOwnerId !== userId) {
        const notifRef = doc(collection(db, 'users', String(postOwnerId), 'notifications'));
        await setDoc(notifRef, {
          type: 'enquiry',
          fromUserId: userId,
          fromUserName: userName,
          postId: postId,
          createdAt: serverTimestamp(),
          read: false,
          message: \`\${userName} inquired about your post.\`
        });
      }
      return currentEnquiries + 1;
    } else {
      await setDoc(postRef, { id: String(postId), enquiriesCount: 1 }, { merge: true });
      return 1;
    }
  } catch (err) {
    handleFirestoreError('recordEnquiryInFirestore', err);
    return null;
  }
}
`;

content = content + '\n' + newFunc;
fs.writeFileSync('src/services/firebaseDataSync.ts', content);
