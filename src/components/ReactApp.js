import { useState, useEffect } from "react";
import { Search, ChevronLeft, Clock, User, Star, Tag } from "lucide-react";
import axios from 'axios';

// Main App Component
export default function RecipeApp() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [activeTag, setActiveTag] = useState(null);

  // Fetch all recipes on initial load
  useEffect(() => {
    fetchRecipes();
  }, []);

  // Fetch recipes from API
  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/recipes");
      setRecipes(response.data);
    } catch (err) {
      setError(err.message || "Failed to fetch recipes");
    } finally {
      setLoading(false);
    }
  };

  // Search recipes
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchRecipes();
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`/api/recipes/search?query=${encodeURIComponent(searchQuery)}`);
      setRecipes(response.data);
      setActiveTag(null);
    } catch (err) {
      setError(err.message || "Failed to search recipes");
    } finally {
      setLoading(false);
    }
  };

  // Fetch recipe by tag
  const fetchRecipesByTag = async (tag) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/recipes/tag/${encodeURIComponent(tag)}`);
      setRecipes(response.data);
      setActiveTag(tag);
      setSearchQuery("");
    } catch (err) {
      setError(err.message || "Failed to fetch recipes by tag");
    } finally {
      setLoading(false);
    }
  };

  // Fetch recipe details
  const fetchRecipeDetails = async (id) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/recipes/${id}`);
      setSelectedRecipe(response.data);
    } catch (err) {
      setError(err.message || "Failed to fetch recipe details");
    } finally {
      setLoading(false);
    }
  };

  // Get popular tags from recipes
  const popularTags = () => {
    const allTags = recipes.flatMap(recipe => recipe.tags || []);
    const tagCounts = allTags.reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([tag]) => tag);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-center text-gray-800">Recipe Finder</h1>
        <p className="text-center text-gray-600 mt-2">Discover delicious recipes for any occasion</p>

        <div className="mt-6 flex gap-2">
          <div className="relative flex-grow">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
              placeholder="Search for recipes..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <button
              onClick={handleSearch}
              className="absolute right-2 top-2 text-gray-500"
            >
              <Search size={20} />
            </button>
          </div>
        </div>

        {recipes.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {popularTags().map((tag) => (
              <button
                key={tag}
                onClick={() => fetchRecipesByTag(tag)}
                className={`px-3 py-1 rounded-full text-sm ${activeTag === tag
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </header>

      {error && (
        <div className="p-4 mb-6 bg-red-100 text-red-700 rounded">
          Error: {error}
        </div>
      )}

      {loading && !selectedRecipe ? (
        <div className="flex justify-center">
          <div className="animate-pulse text-gray-500">Loading recipes...</div>
        </div>
      ) : selectedRecipe ? (
        <RecipeDetail
          recipe={selectedRecipe}
          onBack={() => setSelectedRecipe(null)}
        />
      ) : (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onClick={() => fetchRecipeDetails(recipe.id)}
              />
            ))}
          </div>

          {recipes.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-500">No recipes found. Try another search.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Recipe Card Component
function RecipeCard({ recipe, onClick }) {
  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <div className="h-48 bg-gray-200 relative">
        {recipe.image ? (
          <img
            src={recipe.image}
            alt={recipe.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No image available
          </div>
        )}
        {recipe.rating && (
          <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-800 rounded-full px-2 py-1 text-xs font-bold flex items-center">
            <Star size={12} className="mr-1" />
            {recipe.rating.toFixed(1)}
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-bold text-lg mb-2 text-gray-800">{recipe.name}</h3>

        <div className="flex items-center text-sm mb-2">
          <span className="flex items-center text-gray-600 mr-4">
            <Clock size={14} className="mr-1" />
            {recipe.prepTimeMinutes + recipe.cookTimeMinutes} min
          </span>
          <span className="flex items-center text-gray-600">
            <User size={14} className="mr-1" />
            {recipe.servings} servings
          </span>
        </div>

        <div className="flex flex-wrap gap-1 mt-3">
          {recipe.tags && recipe.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="px-2 py-1 bg-gray-100 text-xs rounded-full text-gray-600">
              {tag}
            </span>
          ))}
          {recipe.tags && recipe.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-xs rounded-full text-gray-600">
              +{recipe.tags.length - 3}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Recipe Detail Component
function RecipeDetail({ recipe, onBack }) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <button
        onClick={onBack}
        className="flex items-center text-blue-600 p-4 hover:text-blue-800"
      >
        <ChevronLeft size={20} className="mr-1" />
        Back to recipes
      </button>

      <div className="md:flex">
        <div className="md:w-1/2">
          {recipe.image ? (
            <img
              src={recipe.image}
              alt={recipe.name}
              className="w-full h-64 md:h-full object-cover"
            />
          ) : (
            <div className="w-full h-64 md:h-full bg-gray-200 flex items-center justify-center text-gray-400">
              No image available
            </div>
          )}
        </div>

        <div className="p-6 md:w-1/2">
          <div className="flex justify-between items-start">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{recipe.name}</h1>
            {recipe.rating && (
              <div className="flex items-center bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
                <Star size={16} className="mr-1 fill-yellow-500 text-yellow-500" />
                <span className="font-bold">{recipe.rating.toFixed(1)}</span>
                <span className="text-xs text-gray-600 ml-1">({recipe.reviewCount} reviews)</span>
              </div>
            )}
          </div>

          <p className="text-gray-600 mb-4">{recipe.cuisine} cuisine • {recipe.difficulty} difficulty</p>

          <div className="flex flex-wrap gap-3 mb-6">
            <div className="flex flex-col items-center bg-gray-100 rounded-lg px-4 py-2">
              <span className="text-sm text-gray-500">Prep</span>
              <span className="font-medium">{recipe.prepTimeMinutes} min</span>
            </div>
            <div className="flex flex-col items-center bg-gray-100 rounded-lg px-4 py-2">
              <span className="text-sm text-gray-500">Cook</span>
              <span className="font-medium">{recipe.cookTimeMinutes} min</span>
            </div>
            <div className="flex flex-col items-center bg-gray-100 rounded-lg px-4 py-2">
              <span className="text-sm text-gray-500">Serves</span>
              <span className="font-medium">{recipe.servings}</span>
            </div>
            <div className="flex flex-col items-center bg-gray-100 rounded-lg px-4 py-2">
              <span className="text-sm text-gray-500">Calories</span>
              <span className="font-medium">{recipe.caloriesPerServing}</span>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2 flex items-center">
              <Tag size={16} className="mr-2" />
              Tags
            </h2>
            <div className="flex flex-wrap gap-2">
              {recipe.tags && recipe.tags.map((tag, index) => (
                <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  {tag}
                </span>
              ))}
              {recipe.mealType && recipe.mealType.map((type, index) => (
                <span key={`meal-${index}`} className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                  {type}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 border-t">
        <div className="md:flex gap-8">
          <div className="md:w-1/2 mb-6 md:mb-0">
            <h2 className="text-xl font-semibold mb-4">Ingredients</h2>
            <ul className="space-y-2">
              {recipe.ingredients && recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-start">
                  <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2"></span>
                  <span>{ingredient}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:w-1/2">
            <h2 className="text-xl font-semibold mb-4">Instructions</h2>
            <ol className="space-y-4">
              {recipe.instructions && recipe.instructions.map((step, index) => (
                <li key={index} className="flex">
                  <span className="flex-shrink-0 flex items-center justify-center bg-blue-500 text-white rounded-full w-6 h-6 mr-3 text-sm font-medium">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}