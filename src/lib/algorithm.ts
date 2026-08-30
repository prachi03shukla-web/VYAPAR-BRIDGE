/**
 * Vyapar Bridge - Recommendation & Feed Ranking Engine
 * 
 * Designed by: Principal Software Architect & Recommendation Systems Expert
 * 
 * This engine implements a multi-objective scoring function optimized for local commerce.
 * It ranks listings, products, and commercial updates by combining:
 * 1. Deep engagement and interaction velocity (YouTube/Instagram style)
 * 2. Social graph and brand/category affinity (Facebook style)
 * 3. Hyper-local physical proximity via Geofencing with customizable decay curves
 * 4. Logarithmic/Exponential temporal decay with a temporary cold-start recency boost
 */

// ==========================================
// 1. Interfaces & Domain Models
// ==========================================

export interface Location {
  lat: number;
  lng: number;
}

export interface Listing {
  id: string;
  businessId: string;
  businessName: string;
  category: string;
  title: string;
  createdAt: string | number | Date; // ISO string or timestamp
  location?: Location;
  
  // Aggregate Metrics (historical data)
  impressionsCount: number;
  clicksCount: number;
  profileClicksCount: number;
  chatsInitiatedCount: number;
  sharesCount: number;
  savesCount: number;
  avgDwellTimeSeconds: number; // Avg time user spent reading/viewing this item
  
  // Recent Velocity tracking (e.g., within last 24 hours)
  recentClicks: number;
  recentChats: number;
  recentShares: number;

  // Star Rating reputation metrics (contributes to feed ranking)
  ratingAverage?: number;
  ratingCount?: number;
}

export interface UserContext {
  id: string;
  location?: Location;
  
  // User Affinity Graphs
  interactedBusinessIds: Record<string, number>; // businessId -> interactionCount / weight
  preferredCategories: Record<string, number>;    // category -> weight (e.g., 0 to 1.0)
  followedBusinessIds: Set<string> | string[];   // Brands or companies followed
}

/**
 * Live interaction data from the active session.
 * Used to immediately update feed weights.
 */
export interface InteractionSignals {
  dwellTimeSeconds: number;
  hasClickedProfile: boolean;
  hasInitiatedChat: boolean;
  hasShared: boolean;
  hasSaved: boolean;
}

// ==========================================
// 2. Default Configuration Hyperparameters
// ==========================================

export interface RankingWeights {
  weightEngagement: number;  // Overall impact of behavioral metrics
  weightAffinity: number;    // Impact of social graph and preference match
  weightProximity: number;   // Impact of local distance
  weightRecency: number;     // Impact of time decay

  // Proximity Tuning Parameters
  proximityMaxDistanceKm: number; // Cutoff for hyper-local focus
  proximityDecayBeta: number;     // Exponential decay steepness (larger = steeper decay)

  // Temporal Decay Parameters (Half-life in hours)
  recencyHalfLifeHours: number;
  recencyBoostDurationHours: number; // Cold-start window for new items
  recencyBoostMultiplier: number;    // Multiplier for very fresh listings
}

export const DEFAULT_RANKING_WEIGHTS: RankingWeights = {
  weightEngagement: 0.35,   // Dominates organic interest
  weightAffinity: 0.25,     // Tailors to personal alignment
  weightProximity: 0.25,    // Essential for local transactions/delivery
  weightRecency: 0.15,      // Prevents stagnation of content

  proximityMaxDistanceKm: 50,  // Local trade zone
  proximityDecayBeta: 0.1,     // Graceful decay curve

  recencyHalfLifeHours: 48,    // Medium decay (decent stability)
  recencyBoostDurationHours: 6, // First 6 hours get a heavy exploration push
  recencyBoostMultiplier: 1.5, // 50% score boost in early lifecycle
};

// ==========================================
// 3. Mathematical Foundations
// ==========================================

/**
 * 1. Haversine Formula for Geodesic Distance (Sphere Proximity)
 * Calculates the great-circle distance between two GPS coordinates in kilometers.
 */
export function calculateHaversineDistance(loc1: Location, loc2: Location): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((loc2.lat - loc1.lat) * Math.PI) / 180;
  const dLng = ((loc2.lng - loc1.lng) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((loc1.lat * Math.PI) / 180) *
      Math.cos((loc2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Proximity Decay Multiplier (values from 0.0 to 1.0)
 * Uses an exponential decay: S = exp(-beta * distance)
 * Yields ~1.0 for 0km, decays smoothly over distance.
 */
export function computeProximityFactor(
  distanceKm: number,
  maxDistance: number,
  beta: number
): number {
  if (distanceKm <= 1) return 1.0; // Perfect score for hyper-local walking distance
  if (distanceKm > maxDistance) return 0.05; // Base minimum so listings outside bounds aren't completely lost
  return Math.exp(-beta * (distanceKm - 1));
}

/**
 * 2. Interaction & Dwell Value Calculation
 * Quantifies behavioral engagement based on action value.
 */
export function computeEngagementScore(listing: Listing): number {
  // Define relative interaction weights (commercial depth score)
  const WEIGHT_IMPRESSION = 0.01;
  const WEIGHT_CLICK = 0.1;
  const WEIGHT_DWELL_PER_SEC = 0.05; // Up to 1.0 at 20 seconds
  const WEIGHT_SAVE = 1.0;
  const WEIGHT_PROFILE_CLICK = 1.5;
  const WEIGHT_SHARE = 2.0;
  const WEIGHT_CHAT_INQUIRY = 3.5; // Strongest commercial signal of intent

  // Safe Dwell time multiplier (capped to avoid extreme outlier skew)
  const cappedDwell = Math.min(listing.avgDwellTimeSeconds || 0, 30);
  const dwellValue = cappedDwell * WEIGHT_DWELL_PER_SEC;

  const historicScore =
    (listing.impressionsCount * WEIGHT_IMPRESSION) +
    (listing.clicksCount * WEIGHT_CLICK) +
    dwellValue +
    (listing.savesCount * WEIGHT_SAVE) +
    (listing.profileClicksCount * WEIGHT_PROFILE_CLICK) +
    (listing.sharesCount * WEIGHT_SHARE) +
    (listing.chatsInitiatedCount * WEIGHT_CHAT_INQUIRY);

  // Velocity factor: Weighs recent events heavily (e.g. last 24h rapid response)
  const velocityScore =
    (listing.recentClicks * WEIGHT_CLICK * 3.0) + // multiplier for recent urgency
    (listing.recentShares * WEIGHT_SHARE * 3.0) +
    (listing.recentChats * WEIGHT_CHAT_INQUIRY * 4.0);

  // Return non-linear logarithmic scaling of engagement to avoid viral runaway listings drowning everything
  return Math.log1p(historicScore + velocityScore);
}

/**
 * 3. User Affinity Calculation
 * Computes how aligned a listing is with the user's explicit/implicit historical preferences.
 */
export function computeAffinityScore(listing: Listing, context: UserContext): number {
  let score = 0.0;

  // Explicit follow connection (Direct Brand Affinity)
  const followedSet = Array.isArray(context.followedBusinessIds)
    ? new Set(context.followedBusinessIds)
    : (context.followedBusinessIds as Set<string>);

  if (followedSet.has(listing.businessId)) {
    score += 1.5; // High priority direct link
  }

  // Implicit Business interactions
  if (context.interactedBusinessIds[listing.businessId]) {
    const interactionFrequency = context.interactedBusinessIds[listing.businessId];
    score += Math.min(interactionFrequency * 0.3, 1.2); // Cap interaction affinity
  }

  // Explicit/Implicit Category Prefs
  if (context.preferredCategories[listing.category]) {
    score += context.preferredCategories[listing.category]; // Ranges from 0.0 to 1.0
  }

  return score;
}

/**
 * 4. Half-life Recency & Exploration Boost Calculation
 * Calculates the decay multiplier using standard exponential half-life physics.
 */
export function computeRecencyFactor(
  createdAt: string | number | Date,
  weights: RankingWeights
): number {
  const createdTime = new Date(createdAt).getTime();
  const now = Date.now();
  const ageHours = Math.max(0, (now - createdTime) / (1000 * 60 * 60));

  // Half-life Decay: Multiplier = 0.5 ^ (Age / Half-life)
  const decayFactor = Math.pow(0.5, ageHours / weights.recencyHalfLifeHours);

  // Cold Start Exploration Boost
  // Adds a temporary premium to very new listings to gather baseline metadata
  if (ageHours <= weights.recencyBoostDurationHours) {
    const boostRangeRatio = 1.0 - (ageHours / weights.recencyBoostDurationHours); // Decays linearly over the boost duration
    const explorationPremium = boostRangeRatio * (weights.recencyBoostMultiplier - 1.0);
    return Math.min(decayFactor + explorationPremium, weights.recencyBoostMultiplier);
  }

  return decayFactor;
}

// ==========================================
// 4. Integrated Scoring & Sorting Utility
// ==========================================

export interface ScoredListing {
  listing: Listing;
  finalScore: number;
  breakdown: {
    engagement: number;
    affinity: number;
    proximity: number;
    recency: number;
    distanceKm?: number;
  };
}

/**
 * Ranks, scores, and sorts a batch of business listings for a specific user context.
 */
export function rankCommercialFeed(
  listings: Listing[],
  context: UserContext,
  customWeights?: Partial<RankingWeights>
): ScoredListing[] {
  const w = { ...DEFAULT_RANKING_WEIGHTS, ...customWeights };

  const scored: ScoredListing[] = listings.map((listing) => {
    // 1. Compute individual signals
    const rawEngagement = computeEngagementScore(listing);
    const rawAffinity = computeAffinityScore(listing, context);
    const rawRecency = computeRecencyFactor(listing.createdAt, w);

    let rawProximity = 0.5; // Default middle-ground when coordinates are missing
    let distanceKm: number | undefined;

    if (context.location && listing.location) {
      distanceKm = calculateHaversineDistance(context.location, listing.location);
      rawProximity = computeProximityFactor(distanceKm, w.proximityMaxDistanceKm, w.proximityDecayBeta);
    }

    // 2. Normalize and apply weight vector (Linear Scalar Multi-Attribute Utility)
    const normalizedEngagement = Math.min(rawEngagement / 10.0, 1.0) * w.weightEngagement;
    const normalizedAffinity = Math.min(rawAffinity / 3.0, 1.0) * w.weightAffinity;
    const normalizedProximity = rawProximity * w.weightProximity;
    const normalizedRecency = rawRecency * w.weightRecency;

    let baseScore = normalizedEngagement + normalizedAffinity + normalizedProximity + normalizedRecency;

    // 3. Apply Star Rating Reputation Boost (Up to 25% boost for 5-star businesses, scales with ratingCount)
    if (listing.ratingAverage !== undefined && listing.ratingAverage > 0) {
      const countWeight = Math.min(listing.ratingCount || 1, 10) / 10; // confidence scale
      const ratingRatio = listing.ratingAverage / 5.0; // 0.2 to 1.0
      // Boost is up to +0.25 max
      const ratingBoost = 0.25 * ratingRatio * countWeight;
      baseScore = baseScore * (1.0 + ratingBoost);
    }

    const finalScore = baseScore;

    return {
      listing,
      finalScore: parseFloat(finalScore.toFixed(5)),
      breakdown: {
        engagement: parseFloat(normalizedEngagement.toFixed(4)),
        affinity: parseFloat(normalizedAffinity.toFixed(4)),
        proximity: parseFloat(normalizedProximity.toFixed(4)),
        recency: parseFloat(normalizedRecency.toFixed(4)),
        distanceKm: distanceKm !== undefined ? parseFloat(distanceKm.toFixed(2)) : undefined,
      },
    };
  });

  // Sort descending by finalScore
  return scored.sort((a, b) => b.finalScore - a.finalScore);
}
