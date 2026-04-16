import { motion } from "framer-motion";

const TemplateSelector = ({
  templates,
  templatesLoading,
  categories,
  selectedCategory,
  handleCategoryChange,
  filteredTemplates,
  canLoadMore,
  handleLoadMore,
  handleTemplateSelect,
  setActiveTab,
  isDarkMode,
  templatesPerPage
}) => {
  return (
    <div className="w-full">
      {/* Categories */}
      <div className="flex flex-wrap gap-3 mb-8 justify-center px-2">
        {categories.map((category) => {
          const categoryCount =
            category === "All"
              ? (templates || []).length
              : (templates || []).filter((t) => t.category === category).length;

          return (
            <motion.button
              key={category}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCategoryChange(category)}
              className={`px-3 md:px-4 py-2 rounded-full font-medium transition-all duration-500 ease-in-out transform hover:scale-105 text-sm md:text-base ${
                selectedCategory === category
                  ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg scale-105"
                  : isDarkMode
                    ? "glass-dark text-gray-300 hover:text-white hover:shadow-md"
                    : "bg-white/80 text-gray-600 hover:text-gray-900 hover:bg-white shadow-sm hover:shadow-md border border-gray-200"
              }`}
            >
              {category}{" "}
              {categoryCount > 0 && (
                <span className="ml-1 text-xs opacity-75">
                  ({categoryCount})
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Templates Grid */}
      {templatesLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 mb-6">
          {Array.from({ length: 10 }).map((_, index) => (
            <div
              key={index}
              className={`aspect-square rounded-lg animate-pulse ${
                isDarkMode ? "bg-gray-700" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 mb-6">
            {filteredTemplates.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="text-6xl mb-4">😅</div>
                <h3 className="text-xl font-bold mb-2">No Templates Found</h3>
                <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                  Try selecting a different category or check your connection
                </p>
              </div>
            ) : (
              filteredTemplates.map((template, index) => (
                <motion.div
                  key={template?.id || index}
                  data-template-index={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.4,
                    delay: (index % templatesPerPage) * 0.05,
                  }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    handleTemplateSelect(template);
                    setActiveTab("customize");
                  }}
                  className={`cursor-pointer rounded-lg overflow-hidden transition-all duration-300 shadow-sm hover:shadow-xl ${
                    isDarkMode ? "glass-dark border border-white/10" : "bg-white border border-gray-100 shadow-md"
                  }`}
                >
                  <div className="aspect-square relative overflow-hidden group">
                    <img
                      src={template.image}
                      alt={template.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="bg-white/90 text-gray-900 text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                        Select ✨
                      </span>
                    </div>
                  </div>
                  <div className="p-2 md:p-3 truncate text-center">
                    <p className="text-[10px] md:text-sm font-semibold truncate capitalize">
                      {template.name}
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Load More Button */}
          {canLoadMore && (
            <div className="flex justify-center mt-8 pb-10">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLoadMore}
                className="group relative px-8 py-3 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-full font-bold text-white shadow-lg overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span>Show More Templates</span>
                  <span className="transition-transform group-hover:translate-y-1">
                    🔽
                  </span>
                </span>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </motion.button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TemplateSelector;
