// Types for saved anime in My List
export interface SavedAnime {
  link: string;
  img: string;
  alt: string;
  title: string;
  episode?: string;
  released?: string;
  type?: string;
  score?: number;
  addedAt: number; // timestamp when added
}

const MY_LIST_KEY = 'AniStream_mylist';

// Get all items from My List
export function getMyList(): SavedAnime[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = localStorage.getItem(MY_LIST_KEY);
    if (!data) return [];
    return JSON.parse(data) as SavedAnime[];
  } catch {
    return [];
  }
}

// Check if an anime is in My List (by link)
export function isInMyList(link: string): boolean {
  const list = getMyList();
  return list.some(item => item.link === link);
}

// Add anime to My List
export function addToMyList(anime: Omit<SavedAnime, 'addedAt'>): boolean {
  try {
    const list = getMyList();
    
    // Check if already exists
    if (list.some(item => item.link === anime.link)) {
      return false;
    }
    
    const newItem: SavedAnime = {
      ...anime,
      addedAt: Date.now(),
    };
    
    list.unshift(newItem); // Add to beginning
    localStorage.setItem(MY_LIST_KEY, JSON.stringify(list));
    
    // Dispatch custom event for real-time updates
    window.dispatchEvent(new CustomEvent('mylist-updated', { detail: list }));
    
    return true;
  } catch {
    return false;
  }
}

// Remove anime from My List
export function removeFromMyList(link: string): boolean {
  try {
    const list = getMyList();
    const newList = list.filter(item => item.link !== link);
    
    if (newList.length === list.length) {
      return false; // Item not found
    }
    
    localStorage.setItem(MY_LIST_KEY, JSON.stringify(newList));
    
    // Dispatch custom event for real-time updates
    window.dispatchEvent(new CustomEvent('mylist-updated', { detail: newList }));
    
    return true;
  } catch {
    return false;
  }
}

// Toggle anime in My List (add if not exists, remove if exists)
export function toggleMyList(anime: Omit<SavedAnime, 'addedAt'>): { added: boolean; inList: boolean } {
  if (isInMyList(anime.link)) {
    removeFromMyList(anime.link);
    return { added: false, inList: false };
  } else {
    addToMyList(anime);
    return { added: true, inList: true };
  }
}

// Clear entire My List
export function clearMyList(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(MY_LIST_KEY);
  window.dispatchEvent(new CustomEvent('mylist-updated', { detail: [] }));
}

// Get My List count
export function getMyListCount(): number {
  return getMyList().length;
}

// ============ LIKED ANIME FUNCTIONS ============

const LIKED_KEY = 'AniStream_liked';

// Get all liked anime links
export function getLikedAnime(): string[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = localStorage.getItem(LIKED_KEY);
    if (!data) return [];
    return JSON.parse(data) as string[];
  } catch {
    return [];
  }
}

// Check if anime is liked
export function isAnimeLiked(link: string): boolean {
  const liked = getLikedAnime();
  return liked.includes(link);
}

// Toggle like status
export function toggleLikeAnime(link: string): { liked: boolean } {
  try {
    const liked = getLikedAnime();
    const index = liked.indexOf(link);
    
    if (index > -1) {
      // Remove from liked
      liked.splice(index, 1);
      localStorage.setItem(LIKED_KEY, JSON.stringify(liked));
      window.dispatchEvent(new CustomEvent('liked-updated', { detail: liked }));
      return { liked: false };
    } else {
      // Add to liked
      liked.unshift(link);
      localStorage.setItem(LIKED_KEY, JSON.stringify(liked));
      window.dispatchEvent(new CustomEvent('liked-updated', { detail: liked }));
      return { liked: true };
    }
  } catch {
    return { liked: false };
  }
}
