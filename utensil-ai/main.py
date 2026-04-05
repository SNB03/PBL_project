# main.py
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
from collections import Counter

app = FastAPI()

class ProductInfo(BaseModel):
    id: str
    name: str
    category: str
    season: str 
    price: float
    image: Optional[str] = "📦"
    popularity: Optional[float] = 0.5 # 👉 NEW: Fallback to 0.5 if Spring Boot doesn't send it

class HomeRecommendationRequest(BaseModel):
    user_id: str
    past_purchases: List[str]
    recent_searches: List[str]
    current_month: int
    catalog: List[ProductInfo] 

@app.post("/api/ai/home-recommend")
def get_home_recommendations(req: HomeRecommendationRequest):
    scored_products = []

    # 👉 NEW: Adjusted Weights to accommodate Popularity
    W_BEHAVIOR = 0.35   # Personal history
    W_SEARCH = 0.30     # Current intent
    W_FSDP = 0.25       # Seasonality
    W_POPULARITY = 0.10 # Tie-breaker / Global trending

    is_summer = req.current_month in [3, 4, 5, 6]
    is_winter = req.current_month in [11, 12, 1, 2]
    is_festive = req.current_month in [9, 10, 11]

    # 1. BUILD BEHAVIOR PROFILE (Frequency-based affinity)
    # Get categories of past purchases
    purchased_categories = [p.category for p in req.catalog if p.id in req.past_purchases]
    total_purchases = len(purchased_categories)
    
    # Calculate category affinity (e.g., 3 Cookware / 4 Total = 0.75 Cookware Affinity)
    category_affinity = {}
    if total_purchases > 0:
        counts = Counter(purchased_categories)
        category_affinity = {cat: count / total_purchases for cat, count in counts.items()}

    # Score every product
    for product in req.catalog:
        
        # --- A. BEHAVIOR SCORE (0.0 to 1.0) ---
        # Instead of just 1 or 0, we use their affinity percentage for this category
        behavior_score = category_affinity.get(product.category, 0.0)

        # --- B. SEARCH SCORE (0.0 to 1.0 with Recency & Depth) ---
        search_score = 0.0
        # Reverse searches so the most recent search gets checked first/weighted highest
        for i, search_term in enumerate(reversed(req.recent_searches)):
            term = search_term.lower()
            weight = 1.0 if i == 0 else 0.5 # Most recent search is worth 100%, older ones 50%
            
            if term in product.name.lower():
                search_score += (1.0 * weight) # Direct name match is best
            elif term in product.category.lower():
                search_score += (0.7 * weight) # Category match is good
                
        search_score = min(1.0, search_score) # Cap at 1.0

        # --- C. FSDP SCORE (Seasonality) ---
        fsdp_score = 0.3 # Baseline for all items
        if product.season == "All":
            fsdp_score = 0.6 # Universally good items
        elif (is_summer and product.season == "Summer") or \
             (is_winter and product.season == "Winter") or \
             (is_festive and product.season == "Festive"):
            fsdp_score = 1.0 # Perfect seasonal match
        else:
            fsdp_score = 0.0 # Out of season completely

        # --- D. POPULARITY SCORE ---
        # Ensures that if two items tie on Behavior/Search, the better-selling one wins
        pop_score = product.popularity

        # --- FINAL MATH ---
        total_score = (behavior_score * W_BEHAVIOR) + \
                      (search_score * W_SEARCH) + \
                      (fsdp_score * W_FSDP) + \
                      (pop_score * W_POPULARITY)

        # Smart Tagline Generator based on dominant score
        tagline = "Recommended for You"
        if search_score > 0.7:
            tagline = "Based on your recent search"
        elif fsdp_score == 1.0 and behavior_score > 0.3:
            tagline = f"Top {product.season} pick for your kitchen"
        elif behavior_score > 0.5:
            tagline = f"Because you love {product.category}"
        elif fsdp_score == 1.0:
            tagline = f"Trending this {product.season}"
        elif pop_score > 0.8:
            tagline = "Store Bestseller"

        scored_products.append({
            "id": product.id,
            "name": product.name,
            "category": product.category,
            "price": product.price,
            "img": product.image,
            "score": round(total_score, 3), # Kept to 3 decimal places for ranking depth
            "tagline": tagline,
            "fsdp_score": fsdp_score 
        })

    # Sort descending by precise total score
    scored_products.sort(key=lambda x: x["score"], reverse=True)

    # 1. PERSONALIZED: Top 4 items (excluding already bought items)
    personalized = [p for p in scored_products if p["id"] not in req.past_purchases][:4]

    # 2. TRENDING BY CATEGORY: Exactly 1 top item per category based on FSDP + Popularity
    trending_dict = {}
    fsdp_sorted = sorted(scored_products, key=lambda x: (x["fsdp_score"] * 0.7) + (x["score"] * 0.3), reverse=True)
    
    for p in fsdp_sorted:
        cat = p["category"]
        if cat not in trending_dict:
            p_copy = dict(p)
            p_copy["tagline"] = f"🔥 #1 Trending in {cat}"
            trending_dict[cat] = p_copy

    trending_list = list(trending_dict.values())

    return {
        "personalized": personalized,
        "trending_by_category": trending_list
    }