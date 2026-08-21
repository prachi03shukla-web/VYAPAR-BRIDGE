import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// The Inquiry button
content = content.replace(
`                 navigate('/chat'); 
               }}
               className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 active:scale-95 transition-all duration-700 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-700/60"
               title="Direct Inquiry Message"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase">Inquiry</span>
            </button>`,
`                 navigate('/chat'); 
               }}
               className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 active:scale-95 transition-all duration-700 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-700/60"
               title="Direct Inquiry Message"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase">Inquiry {enquiriesCount > 0 && \`(\${enquiriesCount})\`}</span>
            </button>`
);

// The Send Req button
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
                   
                   // Increment enquiry count locally for Send Req
                   playEnquirySound();
                   if (post.id) {
                     setEnquiriesCount(prev => prev + 1);
                     recordEnquiryInFirestore(post.id, currentUser?.id || 'anonymous', currentUser?.name || 'A user').catch(()=>{});
                   }
                   setIsReqModalOpen(true);
                 }}
                 className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 active:scale-95 transition-all duration-700 flex items-center gap-1 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-700/60"
                 title="Send Requirements to Company"
              >
                <ClipboardList className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase">Send Req</span>
              </button>`,
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
                   
                   // Increment enquiry count locally for Send Req
                   playEnquirySound();
                   if (post.id) {
                     setEnquiriesCount(prev => prev + 1);
                     recordEnquiryInFirestore(post.id, currentUser?.id || 'anonymous', currentUser?.name || 'A user').catch(()=>{});
                   }
                   setIsReqModalOpen(true);
                 }}
                 className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 active:scale-95 transition-all duration-700 flex items-center gap-1 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-700/60"
                 title="Send Requirements to Company"
              >
                <ClipboardList className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase">Send Req {enquiriesCount > 0 && \`(\${enquiriesCount})\`}</span>
              </button>`
);

fs.writeFileSync('src/App.tsx', content);
