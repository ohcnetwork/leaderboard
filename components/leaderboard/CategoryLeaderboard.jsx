import TopContributor from "../contributors/TopContributor";

export default function CategoryLeaderboard({
  durationType,
  categoryLeaderboard,
}) {
  return (
    <div className="lg:col-span-5 2xl:col-span-4">
      <div>
        <div className="mx-auto py-12 px-4 max-w-6xl sm:px-6 lg:px-8 lg:py-24">
          <div className="space-y-12">
            <div className="space-y-5 sm:space-y-4 md:max-w-xl lg:max-w-3xl xl:max-w-none">
              <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
                Top Contributors of the {durationType}
              </h2>
              <p className="text-xl text-gray-300">
                Our top contributers across different metrics
              </p>
            </div>
            <ul
              role="list"
              className="space-y-4 sm:grid sm:grid-cols-1 sm:gap-6 sm:space-y-0 lg:grid-cols-1 lg:gap-8"
            >
              {categoryLeaderboard.map((category, index) => {
                return (
                  <TopContributor
                    key={index}
                    contributor={category.contributor}
                    category={category}
                    minimal={true}
                  />
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
