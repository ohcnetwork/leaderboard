/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
export default function InfoCard({ contributor, minimal = false, category }) {
  return (
    <div className="py-6 px-2 bg-gray-800 text-center rounded-lg xl:px-10 xl:text-left">
      <span className="text-white text-sm font-sans">
        Most number of {category.title}
      </span>
      <div className="mt-2 flex items-center gap-2">
        <img
          className="mx-auto h-12 w-12 rounded-full"
          src={`https://github.com/${contributor.github}.png`}
          alt={contributor.github}
        />
        <div className={minimal ? "text-center" : "space-y-2"}>
          <div className="font-medium text-lg leading-6 space-y-1">
            <Link href={`/contributors/${contributor.github}`} className="">
              <h3 className="text-white hover:text-gray-900 hover:bg-primary-300 cursor-pointer">
                {/* {category.title} */}
              </h3>
            </Link>
            <p className="text-primary-400">{contributor.name}</p>
          </div>

          <ul
            role="list"
            className={
              minimal
                ? "flex items-center space-x-2 justify-center mt-2"
                : "space-y-2"
            }
          ></ul>
        </div>
      </div>
    </div>
  );
}
