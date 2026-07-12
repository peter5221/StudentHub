import { Users, Listings, Referrals, Messages, genId } from './database.js';

console.log('🧪 Starting StudentHub API & DB Integration Tests...');

try {
  // 1. Create referrer
  const refId = genId();
  const referrer = Users.create({
    id: refId,
    name: 'Referrer Bob',
    email: 'bob@university.edu',
    password_hash: 'hashed_password_123',
    referral_code: 'BOB12345',
    state: 'Lagos',
    city: 'Yaba',
  });
  console.log('✅ Created Referrer User:', referrer.name);

  // 2. Create referred user using Bob's referral code
  const referredId = genId();
  const referred = Users.create({
    id: referredId,
    name: 'Referred Alice',
    email: 'alice@university.edu',
    password_hash: 'hashed_password_456',
    referral_code: 'ALICE987',
    state: 'Lagos',
    city: 'Surulere',
  });
  console.log('✅ Created Referred User:', referred.name);

  // Link referral
  const referral = Referrals.create({
    id: genId(),
    referrer_id: refId,
    referred_id: referredId,
  });
  console.log('✅ Created pending Referral link:', referral.id);

  // Verify referral stats before listing
  let myRefs = Referrals.findByReferrer(refId);
  console.log('📊 Bob\'s referrals (pending):', myRefs.length, '(Status:', myRefs[0].status, ')');

  // 3. Create listing for Alice (first listing -> triggers referral paid status)
  const listing = Listings.create({
    id: genId(),
    user_id: referredId,
    type: 'marketplace',
    title: 'Chemistry textbook',
    description: 'Slightly used organic chemistry textbook',
    price: 3500,
    category: 'Books',
    state: 'Lagos',
    city: 'Surulere',
  });
  console.log('✅ Created Listing for Alice:', listing.title);

  // Trigger referral Paid status
  if (Listings.countByUser(referredId) === 1) {
    Referrals.markPaidByReferred(referredId);
    console.log('⚡ First listing detected. Referral marked as PAID.');
  }

  // Verify referral status is now paid
  myRefs = Referrals.findByReferrer(refId);
  console.log('📊 Bob\'s referrals (after Alice listed):', myRefs.length, '(Status:', myRefs[0].status, ')');
  if (myRefs[0].status !== 'paid') {
    throw new Error('Referral status should be paid!');
  }

  // 4. Test live chat message persistence
  const msg = Messages.create({
    id: genId(),
    sender_id: refId,
    receiver_id: referredId,
    body: 'Hi Alice! Is the chemistry book still available?',
    listing_id: listing.id,
  });
  console.log('📩 Message sent by Bob:', msg.body);

  const conv = Messages.findConversation(refId, referredId);
  console.log('💬 Conversation history length:', conv.length);
  if (conv.length !== 1 || conv[0].body !== msg.body) {
    throw new Error('Message thread verification failed');
  }

  // 5. Test Listing search filtering
  const searchResults = Listings.findAll({ q: 'chemistry', state: 'Lagos' });
  console.log('🔍 Search results for "chemistry" in "Lagos":', searchResults.length);
  if (searchResults.length !== 1) {
    throw new Error('Listing search verification failed');
  }

  // 6. Test Admin stats aggregation
  const totalUsers = Users.count();
  const activeListings = Listings.countActive();
  console.log(`📈 Admin overview: Users = ${totalUsers}, Listings = ${activeListings}`);

  // 7. Cleanup test data
  Users.delete(refId);
  Users.delete(referredId);
  console.log('🧹 Cleaned up test database records.');

  console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! Database models and triggers working perfectly.');
  process.exit(0);
} catch (error) {
  console.error('\n❌ TEST FAILED:', error.message);
  process.exit(1);
}
