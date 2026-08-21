import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
`                onClick={(e) => {
                  e.stopPropagation();
                  playEnquirySound();
                  if (post.userId === currentUser?.id) {
                    toast('This is your own post.', { icon: 'ℹ️' });
                    return;
                  }
                  if (currentUser?.role === 'customer' && !currentUser?.isVerified) {
                    if (post.user?.role === 'factory') {
                      toast.error('Only Verified (Paid) Customers can contact Factories directly. Please upgrade your account to Premium.');
                      return;
                    }
                  }
                  navigate('/chat'); 
                }}`,
`                onClick={(e) => {
                  e.stopPropagation();
                  playEnquirySound();
                  if (!currentUser) {
                    window.dispatchEvent(new CustomEvent('openAuthModal'));
                    return;
                  }
                  if (post.userId === currentUser?.id) {
                    toast('This is your own post.', { icon: 'ℹ️' });
                    return;
                  }
                  if (currentUser?.role === 'customer' && !currentUser?.isVerified) {
                    if (post.user?.role === 'factory') {
                      toast.error('Only Verified (Paid) Customers can contact Factories directly. Please upgrade your account to Premium.');
                      return;
                    }
                  }
                  navigate('/chat'); 
                }}`
);

fs.writeFileSync('src/App.tsx', content);
