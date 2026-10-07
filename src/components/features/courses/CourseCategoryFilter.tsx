export function CourseCategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelectCategory(cat)}
          className={`px-6 py-2 rounded-full border text-sm font-semibold transition-all ${
            selectedCategory === cat
              ? "bg-gold-primary border-gold-primary text-space-dark shadow-gold-glow"
              : "bg-transparent border-space-border text-gray-400 hover:border-gold-primary/50 hover:text-white"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
