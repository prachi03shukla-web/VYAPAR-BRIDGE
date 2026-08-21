import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
`              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  
                  // Distance Check for Local Customer Members
                  if (currentUser?.role === 'customer' && currentUser?.membershipType === 'local') {
                    const targetCoords = post?.user?.gpsCoords || post?.gpsCoords;
                    if (userLocation && targetCoords) {
                      const dist = calculateDistance(userLocation.lat, userLocation.lng, targetCoords.lat, targetCoords.lng);
                      if (dist > 100) {
                        toast.error(\`📍 Distance Restriction: As a Local Member, you can only inquire with dealers within 100km. This business is \${Math.round(dist)}km away. Upgrade to 'Direct Company' plan for nationwide access!\`);
                        return;
                      }
                    } else if (!userLocation) {
                      toast.error("📍 Please enable GPS/Location to verify distance for Local Membership.");
                      return;
                    }
                  }
                  navigate('/chat'); 
                }}`,
`              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (!currentUser) {
                    window.dispatchEvent(new CustomEvent('openAuthModal'));
                    return;
                  }
                  if (post.userId === currentUser?.id) {
                    toast('This is your own post.', { icon: 'ℹ️' });
                    return;
                  }
                  // Distance Check for Local Customer Members
                  if (currentUser?.role === 'customer' && currentUser?.membershipType === 'local') {
                    const targetCoords = post?.user?.gpsCoords || post?.gpsCoords;
                    if (userLocation && targetCoords) {
                      const dist = calculateDistance(userLocation.lat, userLocation.lng, targetCoords.lat, targetCoords.lng);
                      if (dist > 100) {
                        toast.error(\`📍 Distance Restriction: As a Local Member, you can only inquire with dealers within 100km. This business is \${Math.round(dist)}km away. Upgrade to 'Direct Company' plan for nationwide access!\`);
                        return;
                      }
                    } else if (!userLocation) {
                      toast.error("📍 Please enable GPS/Location to verify distance for Local Membership.");
                      return;
                    }
                  }
                  navigate('/chat'); 
                }}`
);

fs.writeFileSync('src/App.tsx', content);
